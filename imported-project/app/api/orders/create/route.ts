import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";
import { expandOrderItemToVariantQuantities } from "@/lib/bundle-stock";
import { sendOrderConfirmationEmail } from "@/lib/notifications";

type OrderItemInput = {
  variantId?: string;
  bundleId?: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  itemType?: string;
};

type CreateOrderBody = {
  customer: { name: string; phone: string; email?: string };
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: OrderItemInput[];
  paymentMethod?: "prepaid" | "cod";
  payment_method?: "prepaid" | "cod";
  coupon_code?: string;
  discount_amount?: number;
  subtotal: number;
  discount: number;
  shippingCharge: number;
  codCharge: number;
  total: number;
};

export async function POST(request: NextRequest) {
  try {
    let supabase;
    try {
      supabase = createSupabaseServiceRoleClient();
    } catch {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const body: CreateOrderBody = await request.json();

    const {
      customer,
      address,
      items,
      paymentMethod: paymentMethodFromBody,
      payment_method,
      coupon_code,
      discount_amount,
      subtotal,
      discount,
      shippingCharge,
      codCharge,
      total,
    } = body;

    const paymentMethod = paymentMethodFromBody || payment_method;

    if (
      !customer?.name ||
      !customer?.phone ||
      !address?.line1 ||
      !address?.city ||
      !address?.state ||
      !address?.pincode ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !paymentMethod ||
      !["prepaid", "cod"].includes(paymentMethod)
    ) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    for (const it of items) {
      if (it.itemType === "bundle") {
        if (!it.bundleId) {
          return NextResponse.json(
            { error: "Invalid bundle line" },
            { status: 400 }
          );
        }
        continue;
      }
      if (
        !it.variantId ||
        String(it.variantId).startsWith("__bundle__")
      ) {
        return NextResponse.json(
          { error: "Invalid order line: missing variant" },
          { status: 400 }
        );
      }
    }

    const phone = customer.phone.replace(/\D/g, "").slice(-10);

    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    let customerId: string;
    if (existingCustomer) {
      await supabase
        .from("customers")
        .update({
          name: customer.name,
          email: customer.email || null,
        })
        .eq("id", existingCustomer.id);
      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer, error: custErr } = await supabase
        .from("customers")
        .insert({
          name: customer.name,
          phone,
          email: customer.email || null,
        })
        .select("id")
        .single();
      if (custErr || !newCustomer) {
        console.error("customers insert error:", custErr);
        return NextResponse.json(
          { error: "Failed to save customer" },
          { status: 500 }
        );
      }
      customerId = newCustomer.id;
    }

    let addressId: string;
    const { data: existingAddresses, error: existingAddrErr } = await supabase
      .from("addresses")
      .select("id")
      .eq("customer_id", customerId)
      .eq("line1", address.line1)
      .eq("pincode", address.pincode)
      .eq("phone", phone)
      .limit(1);

    if (existingAddrErr) {
      console.error("addresses select error:", existingAddrErr?.message ?? existingAddrErr?.code ?? existingAddrErr);
      return NextResponse.json(
        { error: "Failed to save address" },
        { status: 500 }
      );
    }

    if (existingAddresses && existingAddresses.length > 0) {
      addressId = existingAddresses[0].id;
    } else {
      const { data: addressRow, error: addrErr } = await supabase
        .from("addresses")
        .insert({
          customer_id: customerId,
          name: customer.name,
          phone,
          line1: address.line1,
          line2: address.line2 || null,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          label: "Order address",
          is_default: false,
        })
        .select("id")
        .single();

      if (addrErr || !addressRow) {
        console.error("addresses insert error:", addrErr?.message ?? addrErr?.code ?? addrErr);
        return NextResponse.json(
          { error: "Failed to save address" },
          { status: 500 }
        );
      }
      addressId = addressRow.id;
    }

    const orderNumber = "NV" + Math.floor(100000 + Math.random() * 900000).toString();
    const payment_status = "pending";
    const order_status = paymentMethod === "prepaid" ? "pending" : "confirmed";
    const cod_otp_verified = paymentMethod === "cod";

    const { data: orderRow, error: orderErr } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: customerId,
        address_id: addressId,
        payment_method: paymentMethod,
        payment_status,
        order_status,
        cod_otp_verified,
        coupon_code: coupon_code || null,
        discount_amount: discount_amount != null ? Number(discount_amount) : null,
        subtotal,
        discount,
        shipping_charge: shippingCharge,
        cod_charge: codCharge,
        total,
      })
      .select("id")
      .single();

    if (orderErr || !orderRow) {
      console.error("orders insert error:", orderErr);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    const orderId = orderRow.id;

    for (const it of items) {
      const isBundle = it.itemType === "bundle" && !!it.bundleId;
      const { error: itemErr } = await supabase.from("order_items").insert({
        order_id: orderId,
        variant_id: isBundle ? null : it.variantId || null,
        bundle_id: isBundle ? it.bundleId : null,
        name: it.name,
        sku: it.sku,
        quantity: it.quantity,
        unit_price: it.unitPrice,
        total_price: it.totalPrice,
        item_type: isBundle ? "bundle" : "variant",
      });
      if (itemErr) {
        console.error("order_items insert error:", itemErr);
        return NextResponse.json(
          { error: "Failed to save order items" },
          { status: 500 }
        );
      }

      const stockLines = await expandOrderItemToVariantQuantities(supabase, {
        variant_id: isBundle ? null : it.variantId ?? null,
        bundle_id: isBundle ? it.bundleId! : null,
        quantity: it.quantity,
        item_type: isBundle ? "bundle" : "variant",
      });

      for (const line of stockLines) {
        if (!line.variantId || line.quantity <= 0) continue;
        const { data: variant } = await supabase
          .from("product_variants")
          .select("stock_quantity")
          .eq("id", line.variantId)
          .single();

        if (variant) {
          const newStock = Math.max(
            0,
            Number(variant.stock_quantity ?? 0) - line.quantity
          );
          await supabase
            .from("product_variants")
            .update({ stock_quantity: newStock })
            .eq("id", line.variantId);

          await supabase.from("inventory_log").insert({
            variant_id: line.variantId,
            order_id: orderId,
            quantity_change: -line.quantity,
            balance_after: newStock,
            reason: "order",
          });
        }
      }
    }

    if (coupon_code && coupon_code.trim()) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("id, usage_count")
        .eq("code", coupon_code.trim().toUpperCase())
        .maybeSingle();
      if (coupon) {
        const newCount = Number(coupon.usage_count ?? 0) + 1;
        await supabase
          .from("coupons")
          .update({ usage_count: newCount })
          .eq("id", coupon.id);
      }
    }

    if (paymentMethod === "cod") {
      // Fire-and-forget: trigger Shiprocket order creation (do not await)
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof request.url === "string" ? new URL(request.url).origin : null) ||
        "http://localhost:3000";
      if (baseUrl) {
        fetch(`${baseUrl}/api/shiprocket/create-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        }).catch((err) => console.error("Shiprocket create-order trigger:", err));
      }

      // Fire-and-forget: send order confirmation email (does not block order success)
      sendOrderConfirmationEmail(
        customer.email || "",
        orderNumber,
        items.map((it) => ({
          name: it.name,
          quantity: Number(it.quantity),
          total_price: Number(it.totalPrice),
        })),
        Number(total),
        {
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
        }
      ).catch((err) => console.error("order confirmation email:", err));
    }

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
    });
  } catch (e) {
    console.error("orders/create error:", e);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

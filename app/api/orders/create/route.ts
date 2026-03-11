import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type OrderItemInput = {
  variantId?: string;
  bundleId?: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  itemType: string;
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
  paymentMethod: "prepaid" | "cod";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  couponId?: string;
  subtotal: number;
  discount: number;
  shippingCharge: number;
  codCharge: number;
  total: number;
};

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const r = Math.floor(1000 + Math.random() * 9000);
  return `NV${ts}${r}`;
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const body: CreateOrderBody = await request.json();

    const {
      customer,
      address,
      items,
      paymentMethod,
      razorpayOrderId,
      razorpayPaymentId,
      subtotal,
      discount,
      shippingCharge,
      codCharge,
      total,
    } = body;

    if (
      !customer?.name ||
      !customer?.phone ||
      !address?.line1 ||
      !address?.city ||
      !address?.state ||
      !address?.pincode ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !["prepaid", "cod"].includes(paymentMethod)
    ) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
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

    const { data: addressRow, error: addrErr } = await supabase
      .from("addresses")
      .insert({
        customer_id: customerId,
        name: customer.name,
        phone: customer.phone,
        line1: address.line1,
        line2: address.line2 || null,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      })
      .select("id")
      .single();

    if (addrErr || !addressRow) {
      console.error("addresses insert error:", addrErr);
      return NextResponse.json(
        { error: "Failed to save address" },
        { status: 500 }
      );
    }

    const orderNumber = generateOrderNumber();
    const payment_status = paymentMethod === "prepaid" ? "paid" : "pending";
    const cod_otp_verified = paymentMethod === "cod";

    const { data: orderRow, error: orderErr } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: customerId,
        address_id: addressRow.id,
        payment_method: paymentMethod,
        payment_status,
        order_status: "confirmed",
        razorpay_order_id: razorpayOrderId || null,
        razorpay_payment_id: razorpayPaymentId || null,
        cod_otp_verified,
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
      const { error: itemErr } = await supabase.from("order_items").insert({
        order_id: orderId,
        variant_id: it.variantId || null,
        bundle_id: it.bundleId || null,
        name: it.name,
        sku: it.sku,
        quantity: it.quantity,
        unit_price: it.unitPrice,
        total_price: it.totalPrice,
        item_type: it.bundleId ? "bundle" : "variant",
      });
      if (itemErr) {
        console.error("order_items insert error:", itemErr);
        return NextResponse.json(
          { error: "Failed to save order items" },
          { status: 500 }
        );
      }

      if (it.variantId && it.quantity > 0) {
        const { data: variant } = await supabase
          .from("product_variants")
          .select("stock_quantity")
          .eq("id", it.variantId)
          .single();

        if (variant) {
          const newStock = Math.max(
            0,
            Number(variant.stock_quantity ?? 0) - it.quantity
          );
          await supabase
            .from("product_variants")
            .update({ stock_quantity: newStock })
            .eq("id", it.variantId);

          await supabase.from("inventory_log").insert({
            variant_id: it.variantId,
            order_id: orderId,
            quantity_change: -it.quantity,
            balance_after: newStock,
            reason: "order",
          });
        }
      }
    }

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

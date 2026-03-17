import React from 'react';
import { NextRequest } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";
import { InvoicePdf, type InvoiceOrder } from "@/lib/invoice-pdf";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createSupabaseServiceRoleClient();

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select(
        "id, order_number, created_at, payment_method, subtotal, discount, shipping_charge, cod_charge, total, customer_id, address_id"
      )
      .eq("id", id)
      .maybeSingle();

    if (orderErr || !order) {
      return new Response("Order not found", { status: 404 });
    }

    const [{ data: customer }, { data: address }, { data: items }] =
      await Promise.all([
        supabase
          .from("customers")
          .select("id, name, phone")
          .eq("id", order.customer_id)
          .maybeSingle(),
        supabase
          .from("addresses")
          .select("id, name, phone, line1, line2, city, state, pincode")
          .eq("id", order.address_id)
          .maybeSingle(),
        supabase
          .from("order_items")
          .select("id, name, sku, quantity, unit_price, total_price")
          .eq("order_id", order.id),
      ]);

    const invoiceOrder: InvoiceOrder = {
      order_number: order.order_number,
      created_at: order.created_at,
      payment_method: order.payment_method,
      subtotal: Number(order.subtotal ?? 0),
      discount: Number(order.discount ?? 0),
      shipping_charge: Number(order.shipping_charge ?? 0),
      cod_charge: Number(order.cod_charge ?? 0),
      total: Number(order.total ?? 0),
      customer: customer
        ? {
            name: customer.name,
            phone: customer.phone,
          }
        : null,
      address: address
        ? {
            name: address.name,
            phone: address.phone,
            line1: address.line1,
            line2: address.line2 ?? null,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
          }
        : null,
      items: (items || []).map((it: any) => ({
        name: it.name,
        sku: it.sku ?? null,
        quantity: Number(it.quantity ?? 0),
        unit_price: Number(it.unit_price ?? 0),
        total_price: Number(it.total_price ?? 0),
      })),
    };

    const stream = await renderToStream(<InvoicePdf order={invoiceOrder} />);

    const filename = `invoice-${order.order_number || order.id}.pdf`;

    return new Response(stream as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    console.error("invoice route error:", e);
    return new Response("Failed to generate invoice", { status: 500 });
  }
}


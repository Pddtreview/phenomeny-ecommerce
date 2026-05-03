import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = typeof body?.phone === "string" ? body.phone.replace(/\D/g, "") : "";
    const normalized = phone.slice(-10);
    if (normalized.length !== 10) {
      return NextResponse.json({ orders: [] }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ orders: [] }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("phone", normalized)
      .single();

    if (!customer) {
      return NextResponse.json({ orders: [] }, { status: 200 });
    }

    const { data: orders, error } = await supabase
      .from("orders")
      .select("order_number, created_at, order_status, payment_status, total")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("orders/lookup error:", error.message);
      return NextResponse.json({ orders: [] }, { status: 500 });
    }

    return NextResponse.json({ orders: orders ?? [] }, { status: 200 });
  } catch (e) {
    console.error("orders/lookup error:", e);
    return NextResponse.json({ orders: [] }, { status: 500 });
  }
}


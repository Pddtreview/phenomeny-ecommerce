import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type SessionValue = {
  customerId: string;
  phone: string;
};

export async function POST(request: NextRequest) {
  try {
    const cookie = request.cookies.get("customer_session");
    if (!cookie?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let parsed: SessionValue | null = null;
    try {
      parsed = JSON.parse(cookie.value) as SessionValue;
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!parsed || !parsed.customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
    const line1 = typeof body?.line1 === "string" ? body.line1.trim() : "";
    const line2 = typeof body?.line2 === "string" ? body.line2.trim() : "";
    const city = typeof body?.city === "string" ? body.city.trim() : "";
    const state = typeof body?.state === "string" ? body.state.trim() : "";
    const pincode = typeof body?.pincode === "string" ? body.pincode.trim() : "";
    const label = typeof body?.label === "string" ? body.label.trim() : "";

    if (!name || !phone || !line1 || !city || !state || !pincode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from("addresses")
      .insert({
        customer_id: parsed.customerId,
        name,
        phone,
        line1,
        line2: line2 || null,
        city,
        state,
        pincode,
        label: label || null,
      })
      .select(
        "id, customer_id, name, phone, line1, line2, city, state, pincode, is_default, label, created_at"
      )
      .single();

    if (error || !data) {
      console.error("account/addresses/add error:", error);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    return NextResponse.json({ success: true, address: data });
  } catch (e) {
    console.error("account/addresses/add error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type SessionValue = {
  customerId: string;
  phone: string;
};

export async function GET(request: NextRequest) {
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: addresses, error } = await supabase
      .from("addresses")
      .select(
        "id, customer_id, name, phone, line1, line2, city, state, pincode, is_default, label, created_at"
      )
      .eq("customer_id", parsed.customerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("account/addresses error:", error);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    return NextResponse.json({ addresses: addresses ?? [] });
  } catch (e) {
    console.error("account/addresses error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


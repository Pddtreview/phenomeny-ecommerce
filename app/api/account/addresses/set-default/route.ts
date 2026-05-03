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
    const addressId =
      typeof body?.addressId === "string" ? body.addressId.trim() : "";

    if (!addressId) {
      return NextResponse.json(
        { error: "addressId is required" },
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

    const { error: clearError } = await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("customer_id", parsed.customerId);

    if (clearError) {
      console.error("account/addresses/set-default clear error:", clearError);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    const { error: setError } = await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", addressId)
      .eq("customer_id", parsed.customerId);

    if (setError) {
      console.error("account/addresses/set-default error:", setError);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("account/addresses/set-default error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


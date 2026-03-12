import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Customer = {
  id: string;
  phone: string;
  email: string | null;
  name: string | null;
};

type SessionValue = {
  customerId: string;
  phone: string;
};

export async function GET(request: NextRequest) {
  try {
    const cookie = request.cookies.get("customer_session");
    if (!cookie?.value) {
      return NextResponse.json({ authenticated: false });
    }

    let parsed: SessionValue | null = null;
    try {
      parsed = JSON.parse(cookie.value) as SessionValue;
    } catch {
      return NextResponse.json({ authenticated: false });
    }

    if (!parsed || !parsed.customerId) {
      return NextResponse.json({ authenticated: false });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ authenticated: false });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: customer } = await supabase
      .from("customers")
      .select("id, phone, email, name")
      .eq("id", parsed.customerId)
      .maybeSingle();

    if (!customer) {
      return NextResponse.json({ authenticated: false });
    }

    const c = customer as Customer;

    return NextResponse.json({
      authenticated: true,
      customer: {
        id: c.id,
        phone: c.phone,
        name: c.name,
        email: c.email,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}


import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const MSG91_VERIFY_URL = "https://control.msg91.com/api/v5/otp/verify";

type Msg91VerifyResponse = {
  type?: string;
  [key: string]: unknown;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = typeof body?.phone === "string" ? body.phone.replace(/\D/g, "") : "";
    const otp = typeof body?.otp === "string" ? body.otp.trim() : "";

    if (phone.length !== 10 || otp.length !== 4) {
      return NextResponse.json(
        { success: false, error: "Invalid phone or OTP" },
        { status: 400 }
      );
    }

    const authKey = process.env.MSG91_AUTH_KEY;
    if (!authKey) {
      return NextResponse.json(
        { success: false, error: "MSG91 not configured" },
        { status: 500 }
      );
    }

    const url =
      MSG91_VERIFY_URL +
      "?mobile=91" +
      encodeURIComponent(phone) +
      "&otp=" +
      encodeURIComponent(otp);

    console.log("MSG91 verify URL:", url);
    console.log("Verifying OTP with MSG91 for mobile: 91" + phone);
    console.log("OTP entered:", otp);

    const verifyRes = await fetch(url, {
      method: "GET",
      headers: {
        authkey: authKey,
      },
    });

    let verifyJson: Msg91VerifyResponse | null = null;
    try {
      verifyJson = (await verifyRes.json()) as Msg91VerifyResponse;
    } catch {
      verifyJson = null;
    }

    console.log("MSG91 verify status:", verifyRes.status);
    console.log("MSG91 verify body:", JSON.stringify(verifyJson));

    if (!verifyRes.ok || !verifyJson || verifyJson.type !== "success") {
      return NextResponse.json(
        { success: false, error: "Invalid OTP" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: existing } = await supabase
      .from("customers")
      .select("id, phone, name, email")
      .eq("phone", phone)
      .maybeSingle();

    let customerId: string;
    let name: string | null = null;
    let email: string | null = null;

    if (existing) {
      customerId = existing.id as string;
      name = (existing as any).name ?? null;
      email = (existing as any).email ?? null;
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from("customers")
        .insert({ phone })
        .select("id, phone, name, email")
        .single();

      if (insertError || !inserted) {
        console.error("otp/verify customer insert error:", insertError);
        return NextResponse.json(
          { success: false, error: "Server error" },
          { status: 500 }
        );
      }
      customerId = inserted.id as string;
      name = (inserted as any).name ?? null;
      email = (inserted as any).email ?? null;
    }

    const res = NextResponse.json({
      success: true,
      customer: {
        id: customerId,
        phone,
        name,
        email,
      },
    });

    res.cookies.set("customer_session", JSON.stringify({ customerId, phone }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return res;
  } catch (e) {
    console.error("otp/verify error:", e);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const MSG91_OTP_URL = "https://control.msg91.com/api/v5/otp";

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = typeof body?.phone === "string" ? body.phone.replace(/\D/g, "") : "";
    if (phone.length !== 10) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: insertError } = await supabase.from("otp_verifications").insert({
      phone,
      otp,
      expires_at: expiresAt,
      verified: false,
    });

    if (insertError) {
      console.error("otp/send insert error:", insertError);
      return NextResponse.json(
        { success: false, error: "Failed to store OTP" },
        { status: 500 }
      );
    }

    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_OTP_TEMPLATE_ID || "default";
    if (!authKey) {
      return NextResponse.json(
        { success: false, error: "MSG91 not configured" },
        { status: 500 }
      );
    }

    const msg91Res = await fetch(MSG91_OTP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authkey: authKey,
      },
      body: JSON.stringify({
        template_id: templateId,
        mobile: `91${phone}`,
        otp,
      }),
    });

    if (!msg91Res.ok) {
      const errText = await msg91Res.text();
      console.error("MSG91 OTP send error:", msg91Res.status, errText);
      return NextResponse.json(
        { success: false, error: "Failed to send OTP" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("otp/send error:", e);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

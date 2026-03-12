import { NextRequest, NextResponse } from "next/server";

const MSG91_OTP_URL = "https://control.msg91.com/api/v5/otp";

export async function POST(request: NextRequest) {
  console.log("OTP SEND ROUTE HIT")
  try {
    const body = await request.json();
    const phone = typeof body?.phone === "string" ? body.phone.replace(/\D/g, "") : "";
    if (phone.length !== 10) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number" },
        { status: 400 }
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

    console.log("Sending OTP to MSG91 for mobile: 91" + phone);
    console.log("Template ID:", templateId);

    const msg91Res = await fetch(MSG91_OTP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authkey: authKey,
      },
      body: JSON.stringify({
        template_id: templateId,
        mobile: "91" + phone,
      }),
    });

    const responseText = await msg91Res.text();
    console.log("MSG91 response status:", msg91Res.status);
    console.log("MSG91 response body:", responseText);

    if (!msg91Res.ok) {
      return NextResponse.json(
        { success: false, error: "MSG91 error: " + responseText },
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

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = typeof body?.phone === "string" ? body.phone.replace(/\D/g, "") : "";
    const otp = typeof body?.otp === "string" ? body.otp.trim() : "";

    if (phone.length !== 10 || otp.length !== 6) {
      return NextResponse.json(
        { success: false, error: "Invalid phone or OTP" },
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

    const { data: row, error: fetchError } = await supabase
      .from("otp_verifications")
      .select("id, otp, expires_at, verified")
      .eq("phone", phone)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !row) {
      return NextResponse.json(
        { success: false, error: "OTP not found or expired" },
        { status: 400 }
      );
    }

    if (row.verified) {
      return NextResponse.json(
        { success: false, error: "OTP already used" },
        { status: 400 }
      );
    }

    if (new Date(row.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: "OTP expired" },
        { status: 400 }
      );
    }

    if (row.otp !== otp) {
      return NextResponse.json(
        { success: false, error: "Invalid OTP" },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from("otp_verifications")
      .update({ verified: true })
      .eq("id", row.id);

    if (updateError) {
      console.error("otp/verify update error:", updateError);
      return NextResponse.json(
        { success: false, error: "Verification failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("otp/verify error:", e);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

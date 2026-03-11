import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const order_status =
      typeof body?.order_status === "string" ? body.order_status.trim() : "";

    if (!id || !order_status) {
      return NextResponse.json(
        { error: "order_status required" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase
      .from("orders")
      .update({ order_status })
      .eq("id", id);

    if (error) {
      console.error("admin orders status update error:", error);
      return NextResponse.json(
        { error: "Update failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("admin orders status error:", e);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

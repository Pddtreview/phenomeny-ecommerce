import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !key) {
    throw new Error("Supabase not configured");
  }
  return createClient(url, key);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Product id is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const imageId =
      typeof body?.imageId === "string" ? body.imageId.trim() : "";

    if (!imageId) {
      return NextResponse.json(
        { error: "imageId is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { error: clearErr } = await supabase
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", id);

    if (clearErr) {
      console.error("product_images clear primary error:", clearErr);
      return NextResponse.json(
        { error: "Failed to update images" },
        { status: 500 }
      );
    }

    const { error: setErr } = await supabase
      .from("product_images")
      .update({ is_primary: true })
      .eq("id", imageId)
      .eq("product_id", id);

    if (setErr) {
      console.error("product_images set primary error:", setErr);
      return NextResponse.json(
        { error: "Failed to set primary image" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("admin products set-primary error:", e);
    return NextResponse.json(
      { error: "Failed to set primary image" },
      { status: 500 }
    );
  }
}


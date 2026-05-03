import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";

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

function configureCloudinary() {
  if (!cloudinary.config().cloud_name) {
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
}

export async function DELETE(
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
    const cloudinary_public_id =
      typeof body?.cloudinary_public_id === "string"
        ? body.cloudinary_public_id.trim()
        : "";

    if (!imageId || !cloudinary_public_id) {
      return NextResponse.json(
        { error: "imageId and cloudinary_public_id are required" },
        { status: 400 }
      );
    }

    configureCloudinary();

    try {
      await cloudinary.uploader.destroy(cloudinary_public_id, {
        resource_type: "image",
      });
    } catch (err) {
      console.error("Cloudinary destroy error:", err);
      // Best-effort, continue with DB delete
    }

    const supabase = getSupabase();
    const { error } = await supabase
      .from("product_images")
      .delete()
      .eq("id", imageId)
      .eq("product_id", id);

    if (error) {
      console.error("product_images delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete image" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("admin products delete-image error:", e);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}


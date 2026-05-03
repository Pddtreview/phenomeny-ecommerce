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

export async function POST(
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

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    configureCloudinary();

    const uploadResult = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `nauvarah/products/${id}`,
          resource_type: "image",
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Cloudinary upload failed"));
          } else {
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          }
        }
      );

      uploadStream.end(buffer);
    });

    const supabase = getSupabase();

    const { data: existingImages } = await supabase
      .from("product_images")
      .select("id, is_primary")
      .eq("product_id", id);

    const isFirst = !existingImages || existingImages.length === 0;

    const { data: inserted, error } = await supabase
      .from("product_images")
      .insert({
        product_id: id,
        cloudinary_url: uploadResult.secure_url,
        cloudinary_public_id: uploadResult.public_id,
        is_primary: isFirst,
      })
      .select(
        "id, product_id, cloudinary_url, cloudinary_public_id, is_primary, created_at"
      )
      .single();

    if (error || !inserted) {
      console.error("product_images insert error:", error);
      return NextResponse.json(
        { error: "Failed to save image" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, image: inserted });
  } catch (e) {
    console.error("admin products upload-image error:", e);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}


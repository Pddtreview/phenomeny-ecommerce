import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

function configureCloudinary() {
  if (!cloudinary.config().cloud_name) {
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const public_id =
      typeof body?.public_id === "string" ? body.public_id.trim() : "";

    if (!public_id) {
      return NextResponse.json(
        { error: "public_id is required" },
        { status: 400 }
      );
    }

    configureCloudinary();

    await new Promise<void>((resolve, reject) => {
      cloudinary.uploader.destroy(public_id, (err: Error | undefined) => {
        if (err) reject(err);
        else resolve();
      });
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("admin media delete error:", e);
    return NextResponse.json(
      { error: "Failed to delete" },
      { status: 500 }
    );
  }
}

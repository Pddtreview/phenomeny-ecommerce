import { NextResponse } from "next/server";
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

export async function GET() {
  try {
    configureCloudinary();

    const result = await new Promise<{
      resources: Array<{
        public_id: string;
        secure_url: string;
        filename?: string;
        created_at?: string;
        bytes?: number;
      }>;
    }>((resolve, reject) => {
      cloudinary.api.resources(
        {
          type: "upload",
          prefix: "nauvarah/",
          max_results: 500,
        },
        (err, res) => {
          if (err) reject(err);
          else resolve(res as any);
        }
      );
    });

    const images = (result.resources ?? []).map((r) => ({
      public_id: r.public_id,
      secure_url: r.secure_url,
      filename: r.public_id.split("/").pop() ?? r.public_id,
      created_at: r.created_at ?? null,
      bytes: r.bytes ?? null,
    }));

    return NextResponse.json({ images });
  } catch (e) {
    console.error("admin media list error:", e);
    return NextResponse.json(
      { error: "Failed to list images" },
      { status: 500 }
    );
  }
}

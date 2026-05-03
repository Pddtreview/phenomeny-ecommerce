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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files");

    if (!files.length || (files.length === 1 && (files[0] === null || files[0] === undefined))) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const fileList = files.filter((f): f is File => f instanceof File);
    if (fileList.length === 0) {
      return NextResponse.json(
        { error: "No valid files" },
        { status: 400 }
      );
    }

    configureCloudinary();

    const uploaded: Array<{
      public_id: string;
      secure_url: string;
      bytes?: number;
      created_at?: string;
    }> = [];

    for (const file of fileList) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await new Promise<{
        public_id: string;
        secure_url: string;
        bytes?: number;
        created_at?: string;
      }>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "nauvarah",
              resource_type: "image",
            },
            (error, res) => {
              if (error || !res) reject(error || new Error("Upload failed"));
              else
                resolve({
                  public_id: res.public_id,
                  secure_url: res.secure_url,
                  bytes: res.bytes,
                  created_at: res.created_at,
                });
            }
          )
          .end(buffer);
      });

      uploaded.push(result);
    }

    return NextResponse.json({ success: true, images: uploaded });
  } catch (e) {
    console.error("admin media upload error:", e);
    return NextResponse.json(
      { error: "Failed to upload" },
      { status: 500 }
    );
  }
}

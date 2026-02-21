import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise<NextResponse>((resolve) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "cv-generator",
            transformation: [
              { width: 400, height: 400, crop: "fill", gravity: "face" },
            ],
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary error:", error);
              resolve(
                NextResponse.json(
                  { error: "Error al subir la imagen" },
                  { status: 500 }
                )
              );
              return;
            }

            if (!result) {
              resolve(
                NextResponse.json(
                  { error: "Error al subir la imagen" },
                  { status: 500 }
                )
              );
              return;
            }

            resolve(
              NextResponse.json({
                success: true,
                url: result.secure_url,
                publicId: result.public_id,
              })
            );
          }
        )
        .end(buffer);
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Error al procesar la imagen" },
      { status: 500 }
    );
  }
}

"use server";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export type UploadResult = {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
};

export async function uploadImage(formData: FormData): Promise<UploadResult> {
  try {
    const file = formData.get("file") as File;

    if (!file) {
      return { success: false, error: "No se recibió ningún archivo" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<UploadResult>((resolve) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "cv-generator",
          transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face" },
          ],
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary error:", error);
            resolve({ success: false, error: "Error al subir la imagen" });
            return;
          }

          if (!result) {
            resolve({ success: false, error: "Error al subir la imagen" });
            return;
          }

          resolve({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      ).end(buffer);
    });

    return result;
  } catch (error: any) {
    console.error("Upload error:", error);
    return { success: false, error: error.message || "Error al procesar la imagen" };
  }
}

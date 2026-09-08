import { v2 as cloudinary } from "cloudinary";

export interface UploadResult {
  url: string;
  publicId: string;
  size?: string;
  name?: string;
  format?: string;
}

const cloudName =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Configure Cloudinary SDK instance
if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

/**
 * Upload abstraction service
 * Switches between 'cloudinary' (cloud) and 'local' (mock/fallback) based on STORAGE_PROVIDER
 */
export async function uploadAsset(
  fileBuffer: Buffer | ArrayBuffer | Uint8Array,
  filename: string,
  folder: string = "stup-timika"
): Promise<UploadResult> {
  const provider = (process.env.STORAGE_PROVIDER || "cloudinary").toLowerCase();

  // 1. Cloudinary Upload Provider
  if (provider === "cloudinary" && cloudName && apiKey && apiSecret) {
    return new Promise<UploadResult>((resolve, reject) => {
      const safeId =
        filename.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "_") +
        `_${Date.now()}`;

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: safeId,
          resource_type: "auto",
        },
        (error, result) => {
          if (error || !result) {
            console.error("Cloudinary upload error:", error);
            return reject(
              error || new Error("Cloudinary upload returned empty result")
            );
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            size: `${(result.bytes / 1024).toFixed(1)} KB`,
            name: filename,
            format: result.format,
          });
        }
      );

      let buffer: Buffer;
      if (Buffer.isBuffer(fileBuffer)) {
        buffer = fileBuffer;
      } else if (fileBuffer instanceof ArrayBuffer) {
        buffer = Buffer.from(fileBuffer);
      } else {
        buffer = Buffer.from(fileBuffer.buffer, fileBuffer.byteOffset, fileBuffer.byteLength);
      }
      uploadStream.end(buffer);
    });
  }

  // 2. Local / Mock Storage Provider Fallback
  const mockPath = `uploads/${Date.now()}-${filename}`;
  return {
    url: `https://mock-storage.supabase.co/storage/v1/object/public/stup-timika/${mockPath}`,
    publicId: `mock_${Date.now()}`,
    size: `${(fileBuffer.byteLength / 1024).toFixed(1)} KB`,
    name: filename,
    format: filename.split(".").pop() || "png",
  };
}

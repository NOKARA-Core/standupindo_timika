import "server-only";
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
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    let buffer: Buffer;
    if (Buffer.isBuffer(fileBuffer)) {
      buffer = fileBuffer;
    } else if (fileBuffer instanceof ArrayBuffer) {
      buffer = Buffer.from(fileBuffer);
    } else {
      buffer = Buffer.from(
        fileBuffer.buffer,
        fileBuffer.byteOffset,
        fileBuffer.byteLength
      );
    }

    const safeId =
      filename.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "_") +
      `_${Date.now()}`;

    const ext = filename.split(".").pop()?.toLowerCase() || "png";
    const mimeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
      svg: "image/svg+xml",
      avif: "image/avif",
      heic: "image/heic",
    };
    const mimeType = mimeMap[ext] || "image/jpeg";
    const base64Uri = `data:${mimeType};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64Uri, {
      folder,
      public_id: safeId,
      resource_type: "auto",
      overwrite: true,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      size: `${(result.bytes / 1024).toFixed(1)} KB`,
      name: filename,
      format: result.format,
    };
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

/**
 * Extracts Cloudinary public ID from a full Cloudinary URL
 */
export function extractCloudinaryPublicId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  if (!urlOrId.includes("http") && !urlOrId.includes("://")) {
    return urlOrId;
  }
  try {
    const regex = /\/image\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/;
    const match = urlOrId.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  } catch (err) {
    console.error("Error extracting publicId:", err);
  }
  return null;
}

/**
 * Deletes an asset from Cloudinary storage
 */
export async function deleteAsset(urlOrId: string): Promise<boolean> {
  const provider = (process.env.STORAGE_PROVIDER || "cloudinary").toLowerCase();
  if (provider === "cloudinary" && cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    const publicId = extractCloudinaryPublicId(urlOrId);
    if (!publicId) return false;

    try {
      const res = await cloudinary.uploader.destroy(publicId, {
        invalidate: true,
      });
      return res.result === "ok" || res.result === "not found";
    } catch (err) {
      console.warn("Cloudinary destroy error:", err);
      return false;
    }
  }
  return true;
}


import { NextResponse } from "next/server";
import { uploadAsset } from "../../../src/lib/storage";
import { requireAdminSession } from "../../../src/lib/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_FOLDERS = [
  "stup-timika",
  "comedians",
  "flyers",
  "merchandise",
  "documentation",
  "general",
  "banner",
];

function isValidImage(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;

  // JPEG: FF D8 FF
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (isJpeg) return true;

  // PNG: 89 50 4E 47
  const isPng =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;
  if (isPng) return true;

  // WebP: RIFF .... WEBP
  const isWebp =
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP";
  if (isWebp) return true;

  return false;
}

export async function POST(request: Request) {
  try {
    // Require active admin session
    const auth = await requireAdminSession();
    if (auth.response) return auth.response;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const rawFolder = (formData.get("folder") as string) || "stup-timika";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided in form data" },
        { status: 400 }
      );
    }

    // Sanitize folder name against directory traversal
    const cleanFolder = rawFolder.replace(/[^a-zA-Z0-9_-]/g, "");
    const folder = ALLOWED_FOLDERS.includes(cleanFolder) ? cleanFolder : "stup-timika";

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Enforce 5MB limit
    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file melebihi batas maksimal (5MB)." },
        { status: 400 }
      );
    }

    // Verify magic bytes for real image format (prevent MIME spoofing)
    if (!isValidImage(buffer)) {
      return NextResponse.json(
        { error: "Tipe file tidak valid. Hanya file JPEG, PNG, dan WebP yang diizinkan." },
        { status: 400 }
      );
    }

    // Sanitize file name
    const sanitizedFileName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/\.{2,}/g, ".");

    const result = await uploadAsset(buffer, sanitizedFileName, folder);

    // Auto-record to media_assets table in Neon DB
    try {
      const { getSql } = await import("../../../src/lib/db");
      const sql = getSql();
      const assetType = folder.includes("comedian")
        ? "HEADSHOT"
        : folder.includes("flyer")
        ? "FLYER"
        : folder.includes("merch")
        ? "DOCUMENTATION"
        : "BANNER";

      await sql`
        INSERT INTO media_assets (id, name, url, type, size, uploaded_at)
        VALUES (
          ${'med-' + Date.now()},
          ${sanitizedFileName},
          ${result.url},
          ${result.size || 'Unknown'},
          ${assetType},
          CURRENT_TIMESTAMP
        )
        ON CONFLICT (id) DO NOTHING
      `;
    } catch (dbErr) {
      console.warn("Could not auto-register uploaded asset to media_assets table:", dbErr);
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to upload asset to storage provider",
      },
      { status: 500 }
    );
  }
}


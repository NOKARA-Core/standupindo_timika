import { NextResponse } from "next/server";
import { uploadAsset } from "../../../src/lib/storage";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "stup-timika";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided in form data" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadAsset(buffer, file.name, folder);

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
          ${file.name},
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

import { NextResponse } from "next/server";
import { getSql } from "../../../src/lib/db";
import { getSiteConfig } from "../../../src/lib/site-config.server";

async function syncMediaAssetsFromConfig() {
  const sql = getSql();
  try {
    const config = await getSiteConfig();
    const assetsToSync: { id: string; name: string; url: string; type: string; size: string }[] = [];

    if (config.hero?.url && config.hero.url.includes("cloudinary.com")) {
      assetsToSync.push({
        id: "med-cld-hero-01",
        name: "hero_stage_profil.png",
        url: config.hero.url,
        type: "BANNER",
        size: "450 KB",
      });
    }

    config.comedians?.forEach((c) => {
      if (c.avatarUrl && c.avatarUrl.includes("cloudinary.com")) {
        assetsToSync.push({
          id: `med-cld-com-${c.id}`,
          name: `${c.name.toLowerCase()}_headshot.jpg`,
          url: c.avatarUrl,
          type: "HEADSHOT",
          size: "220 KB",
        });
      }
    });

    config.flyers?.forEach((f) => {
      if (f.flyerUrl && f.flyerUrl.includes("cloudinary.com")) {
        assetsToSync.push({
          id: `med-cld-flyer-${f.id}`,
          name: `${f.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.jpg`,
          url: f.flyerUrl,
          type: "FLYER",
          size: "350 KB",
        });
      }
    });

    config.merch?.forEach((m) => {
      if (m.imageUrl && m.imageUrl.includes("cloudinary.com")) {
        assetsToSync.push({
          id: `med-cld-merch-${m.id}`,
          name: `${m.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}.png`,
          url: m.imageUrl,
          type: "DOCUMENTATION",
          size: "180 KB",
        });
      }
    });

    const todayStr = new Date().toISOString().split("T")[0] || "2026-10-01";
    for (const a of assetsToSync) {
      await sql`
        INSERT INTO media_assets (id, name, type, size, url, uploaded_at)
        VALUES (${a.id}, ${a.name}, ${a.type}, ${a.size}, ${a.url}, ${todayStr})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          url = EXCLUDED.url,
          type = EXCLUDED.type,
          size = EXCLUDED.size
      `;
    }
  } catch (e) {
    console.warn("Could not sync media_assets from config:", e);
  }
}

export async function GET() {
  try {
    await syncMediaAssetsFromConfig();
    const sql = getSql();
    const rows = await sql`
      SELECT 
        id, 
        name, 
        url, 
        type, 
        size, 
        uploaded_at as "uploadedAt"
      FROM media_assets
      ORDER BY id DESC
    `;
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("GET /api/media-assets error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load media assets" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, url, type, size } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const id = body.id || `med-${Date.now()}`;
    const safeName = String(name || "uploaded_asset.png").trim();
    const safeType = String(type || "BANNER").trim();
    const safeSize = String(size || "Unknown").trim();
    const today = new Date().toISOString().split("T")[0] || "2026-10-01";

    const sql = getSql();
    const rows = await sql`
      INSERT INTO media_assets (id, name, type, size, url, uploaded_at)
      VALUES (${id}, ${safeName}, ${safeType}, ${safeSize}, ${url}, ${today})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        url = EXCLUDED.url,
        type = EXCLUDED.type,
        size = EXCLUDED.size,
        uploaded_at = EXCLUDED.uploaded_at
      RETURNING id, name, url, type, size, uploaded_at as "uploadedAt"
    `;

    return NextResponse.json({ success: true, asset: rows[0] });
  } catch (error: any) {
    console.error("POST /api/media-assets error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save media asset" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const sql = getSql();
    await sql`DELETE FROM media_assets WHERE id = ${id}`;

    return NextResponse.json({ success: true, message: "Asset deleted" });
  } catch (error: any) {
    console.error("DELETE /api/media-assets error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete media asset" },
      { status: 500 }
    );
  }
}

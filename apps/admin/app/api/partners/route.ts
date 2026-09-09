import { NextResponse } from "next/server";
import { getSql } from "../../../src/lib/db";
import { deleteAsset } from "../../../src/lib/storage";

// Ensure partners table exists
async function ensurePartnersTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS partners (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      logo_url TEXT NOT NULL,
      website_url TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const countRes = await sql`SELECT count(*) as count FROM partners`;
  if (Number(countRes[0]?.count || 0) === 0) {
    const initialPartners = [
      {
        id: "partner-kopitiam88",
        name: "KOPITIAM 88",
        logo_url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 220 80'><text x='50%' y='55%' text-anchor='middle' dominant-baseline='middle' font-family='monospace' font-weight='900' font-size='22' fill='%23000'>☕ KOPITIAM 88</text></svg>",
        website_url: "https://instagram.com",
        sort_order: 1,
      },
      {
        id: "partner-timikabeatz",
        name: "TIMIKA BEATZ",
        logo_url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 220 80'><text x='50%' y='55%' text-anchor='middle' dominant-baseline='middle' font-family='monospace' font-weight='900' font-size='22' fill='%23000'>🎧 TIMIKA BEATZ</text></svg>",
        website_url: "https://instagram.com",
        sort_order: 2,
      },
      {
        id: "partner-underground",
        name: "UNDERGROUND PRINT",
        logo_url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 220 80'><text x='50%' y='55%' text-anchor='middle' dominant-baseline='middle' font-family='monospace' font-weight='900' font-size='20' fill='%23000'>⚡ UNDERGROUND</text></svg>",
        website_url: "https://instagram.com",
        sort_order: 3,
      },
      {
        id: "partner-mimikacreative",
        name: "MIMIKA CREATIVE",
        logo_url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 220 80'><text x='50%' y='55%' text-anchor='middle' dominant-baseline='middle' font-family='monospace' font-weight='900' font-size='20' fill='%23000'>🔥 MIMIKA CREATIVE</text></svg>",
        website_url: "https://instagram.com",
        sort_order: 4,
      },
    ];

    for (const p of initialPartners) {
      await sql`
        INSERT INTO partners (id, name, logo_url, website_url, sort_order, is_active)
        VALUES (${p.id}, ${p.name}, ${p.logo_url}, ${p.website_url}, ${p.sort_order}, true)
        ON CONFLICT (id) DO NOTHING
      `;
    }
  }
}

export async function GET() {
  try {
    const sql = getSql();
    await ensurePartnersTable();

    const rows = await sql`
      SELECT id, name, logo_url as "logoUrl", website_url as "websiteUrl", sort_order as "sortOrder", is_active as "isActive", created_at as "createdAt"
      FROM partners
      ORDER BY sort_order ASC, created_at ASC
    `;

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("GET /api/partners error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch partners" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, logoUrl, websiteUrl, sortOrder, isActive } = body;

    if (!name || !logoUrl) {
      return NextResponse.json(
        { error: "Nama Brand/Partner dan Logo URL wajib diisi" },
        { status: 400 }
      );
    }

    const sql = getSql();
    await ensurePartnersTable();

    const id = body.id || `partner-${Date.now()}`;
    const safeName = String(name).trim();
    const safeLogo = String(logoUrl).trim();
    const safeWebsite = websiteUrl ? String(websiteUrl).trim() : null;
    const safeOrder = Number(sortOrder) || 0;
    const safeActive = isActive !== false;

    const rows = await sql`
      INSERT INTO partners (id, name, logo_url, website_url, sort_order, is_active)
      VALUES (${id}, ${safeName}, ${safeLogo}, ${safeWebsite}, ${safeOrder}, ${safeActive})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        logo_url = EXCLUDED.logo_url,
        website_url = EXCLUDED.website_url,
        sort_order = EXCLUDED.sort_order,
        is_active = EXCLUDED.is_active
      RETURNING id, name, logo_url as "logoUrl", website_url as "websiteUrl", sort_order as "sortOrder", is_active as "isActive"
    `;

    return NextResponse.json({ success: true, partner: rows[0] });
  } catch (error: any) {
    console.error("POST /api/partners error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save partner" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, logoUrl, websiteUrl, sortOrder, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Partner ID is required" }, { status: 400 });
    }

    const sql = getSql();
    await ensurePartnersTable();

    const safeName = String(name || "").trim();
    const safeLogo = String(logoUrl || "").trim();
    const safeWebsite = websiteUrl ? String(websiteUrl).trim() : null;
    const safeOrder = Number(sortOrder) || 0;
    const safeActive = isActive !== false;

    const rows = await sql`
      UPDATE partners
      SET
        name = COALESCE(NULLIF(${safeName}, ''), name),
        logo_url = COALESCE(NULLIF(${safeLogo}, ''), logo_url),
        website_url = ${safeWebsite},
        sort_order = ${safeOrder},
        is_active = ${safeActive}
      WHERE id = ${id}
      RETURNING id, name, logo_url as "logoUrl", website_url as "websiteUrl", sort_order as "sortOrder", is_active as "isActive"
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, partner: rows[0] });
  } catch (error: any) {
    console.error("PUT /api/partners error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update partner" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Partner ID is required" }, { status: 400 });
    }

    const sql = getSql();
    await ensurePartnersTable();

    // Get logo_url to delete from Cloudinary if needed
    const rows = await sql`SELECT logo_url FROM partners WHERE id = ${id}`;
    if (rows && rows.length > 0 && rows[0]?.logo_url) {
      const logoUrl = rows[0].logo_url;
      if (logoUrl.includes("cloudinary.com")) {
        await deleteAsset(logoUrl);
      }
    }

    await sql`DELETE FROM partners WHERE id = ${id}`;

    return NextResponse.json({ success: true, message: "Partner deleted" });
  } catch (error: any) {
    console.error("DELETE /api/partners error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete partner" },
      { status: 500 }
    );
  }
}

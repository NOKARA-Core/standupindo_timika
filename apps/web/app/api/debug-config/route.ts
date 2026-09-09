import { NextResponse } from "next/server";
import { getSql } from "../../../src/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, data, updated_at
      FROM site_assets_config
      WHERE id = 'current'
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({
        dbConnected: true,
        recordFound: false,
        useDynamicAssets: false,
        message: "No record found with id='current' in site_assets_config",
      });
    }

    const rawData = rows[0]?.data;
    const parsed = typeof rawData === "string" ? JSON.parse(rawData) : rawData;

    return NextResponse.json({
      dbConnected: true,
      recordFound: true,
      useDynamicAssets: Boolean(parsed?.useDynamicAssets),
      heroUrl: parsed?.hero?.url || null,
      comedians: parsed?.comedians?.map((c: any) => ({ id: c.id, name: c.name, avatarUrl: c.avatarUrl })) || [],
      flyers: parsed?.flyers?.map((f: any) => ({ id: f.id, flyerUrl: f.flyerUrl })) || [],
      merch: parsed?.merch?.map((m: any) => ({ id: m.id, imageUrl: m.imageUrl })) || [],
      updatedAt: rows[0]?.updated_at,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        dbConnected: false,
        error: error.message || "Failed to connect to Neon DB",
      },
      { status: 500 }
    );
  }
}

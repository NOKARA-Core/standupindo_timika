import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSql } from "../../../src/lib/db";
import { ComedianItem } from "../../../src/lib/mock-data";

export async function GET() {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT 
        id,
        real_name as "realName",
        stage_name as "stageName",
        comedy_style as "comedyStyle",
        punchline,
        bio,
        phone,
        total_open_mic as "totalOpenMic",
        is_active as "isActive",
        avatar_url as "avatarUrl",
        COALESCE(is_featured_lineup, false) as "isFeaturedLineup",
        COALESCE(lineup_order, 0) as "lineupOrder"
      FROM comedians
      ORDER BY is_featured_lineup DESC, lineup_order ASC, stage_name ASC
    `;
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("GET /api/comedians error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch comedians" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ComedianItem>;
    const sql = getSql();

    const id = body.id || `com-${Date.now()}`;
    const realName = body.realName || "";
    const stageName = body.stageName || "UNTITLED COMEDIAN";
    const comedyStyle = body.comedyStyle || "Observational";
    const punchline = body.punchline || "";
    const bio = body.bio || "";
    const phone = body.phone || "";
    const totalOpenMic = body.totalOpenMic || 0;
    const isActive = typeof body.isActive === "boolean" ? body.isActive : true;
    const avatarUrl = body.avatarUrl || null;
    const isFeaturedLineup = Boolean(body.isFeaturedLineup);
    const lineupOrder = typeof body.lineupOrder === "number" ? body.lineupOrder : 0;

    const inserted = await sql`
      INSERT INTO comedians (
        id, real_name, stage_name, comedy_style, punchline, bio, phone, total_open_mic, is_active, avatar_url, is_featured_lineup, lineup_order, updated_at
      ) VALUES (
        ${id}, ${realName}, ${stageName}, ${comedyStyle}, ${punchline}, ${bio}, ${phone}, ${totalOpenMic}, ${isActive}, ${avatarUrl}, ${isFeaturedLineup}, ${lineupOrder}, CURRENT_TIMESTAMP
      )
      ON CONFLICT (id) DO UPDATE SET
        real_name = EXCLUDED.real_name,
        stage_name = EXCLUDED.stage_name,
        comedy_style = EXCLUDED.comedy_style,
        punchline = EXCLUDED.punchline,
        bio = EXCLUDED.bio,
        phone = EXCLUDED.phone,
        total_open_mic = EXCLUDED.total_open_mic,
        is_active = EXCLUDED.is_active,
        avatar_url = COALESCE(EXCLUDED.avatar_url, comedians.avatar_url),
        is_featured_lineup = EXCLUDED.is_featured_lineup,
        lineup_order = EXCLUDED.lineup_order,
        updated_at = CURRENT_TIMESTAMP
      RETURNING 
        id, real_name as "realName", stage_name as "stageName", comedy_style as "comedyStyle", punchline, bio, phone, total_open_mic as "totalOpenMic", is_active as "isActive", avatar_url as "avatarUrl", is_featured_lineup as "isFeaturedLineup", lineup_order as "lineupOrder"
    `;

    revalidatePath("/comedians");
    revalidatePath("/media");
    revalidatePath("/");

    return NextResponse.json({ success: true, comedian: inserted[0] });
  } catch (error: any) {
    console.error("POST /api/comedians error:", error);
    return NextResponse.json({ error: error.message || "Failed to save comedian" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, isActive, avatarUrl, isFeaturedLineup, lineupOrder } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing comedian id" }, { status: 400 });
    }

    const sql = getSql();
    let updated;

    if (typeof isFeaturedLineup === "boolean" && typeof lineupOrder === "number") {
      updated = await sql`
        UPDATE comedians 
        SET is_featured_lineup = ${isFeaturedLineup}, lineup_order = ${lineupOrder}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING id, is_featured_lineup as "isFeaturedLineup", lineup_order as "lineupOrder"
      `;
    } else if (typeof isFeaturedLineup === "boolean") {
      updated = await sql`
        UPDATE comedians 
        SET is_featured_lineup = ${isFeaturedLineup}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING id, is_featured_lineup as "isFeaturedLineup"
      `;
    } else if (typeof lineupOrder === "number") {
      updated = await sql`
        UPDATE comedians 
        SET lineup_order = ${lineupOrder}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING id, lineup_order as "lineupOrder"
      `;
    } else if (typeof isActive === "boolean") {
      updated = await sql`
        UPDATE comedians 
        SET is_active = ${isActive}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING id, is_active as "isActive"
      `;
    } else if (avatarUrl !== undefined) {
      updated = await sql`
        UPDATE comedians 
        SET avatar_url = ${avatarUrl || null}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING id, avatar_url as "avatarUrl"
      `;
    } else {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    revalidatePath("/comedians");
    revalidatePath("/media");
    revalidatePath("/");

    return NextResponse.json({ success: true, comedian: updated[0] });
  } catch (error: any) {
    console.error("PATCH /api/comedians error:", error);
    return NextResponse.json({ error: error.message || "Failed to update comedian" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing comedian id" }, { status: 400 });
    }

    const sql = getSql();
    await sql`DELETE FROM comedians WHERE id = ${id}`;

    revalidatePath("/comedians");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/comedians error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete comedian" }, { status: 500 });
  }
}

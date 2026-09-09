import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSql } from "../../../../src/lib/db";
import { requireAdminSession } from "../../../../src/lib/auth";

export async function POST(request: Request) {
  try {
    const auth = await requireAdminSession();
    if (auth.response) return auth.response;

    const body = await request.json();
    const sql = getSql();

    // Support either { featuredIds: string[] } or { lineup: { id: string, isFeaturedLineup: boolean, lineupOrder: number }[] }
    let featuredIds: string[] = [];

    if (Array.isArray(body.featuredIds)) {
      featuredIds = body.featuredIds;
      // Reset all comedians lineup state
      await sql`
        UPDATE comedians 
        SET is_featured_lineup = false, lineup_order = 0, updated_at = CURRENT_TIMESTAMP
      `;

      // Set featured for given IDs with their order
      for (let i = 0; i < featuredIds.length; i++) {
        const id = featuredIds[i];
        if (!id) continue;
        await sql`
          UPDATE comedians 
          SET is_featured_lineup = true, lineup_order = ${i + 1}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
        `;
      }
    } else if (Array.isArray(body.lineup)) {
      // Direct lineup entries update
      for (const item of body.lineup) {
        if (!item.id) continue;
        const isFeatured = Boolean(item.isFeaturedLineup);
        const order = typeof item.lineupOrder === "number" ? item.lineupOrder : 0;
        await sql`
          UPDATE comedians 
          SET is_featured_lineup = ${isFeatured}, lineup_order = ${order}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${item.id}
        `;
        if (isFeatured) {
          featuredIds.push(item.id);
        }
      }
    } else {
      return NextResponse.json(
        { error: "Invalid payload. Provide 'featuredIds' or 'lineup' array." },
        { status: 400 }
      );
    }

    // Also persist featured_comedian_ids in settings table for redundancy and fast sync
    try {
      await sql`
        INSERT INTO settings (key, value)
        VALUES ('featured_comedian_ids', ${JSON.stringify(featuredIds)})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
    } catch (e) {
      console.warn("Could not sync settings.featured_comedian_ids:", e);
    }

    revalidatePath("/media");
    revalidatePath("/comedians");
    revalidatePath("/");

    // Return updated comedians list
    const updatedRows = await sql`
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

    return NextResponse.json({
      success: true,
      message: "Lineup configuration saved successfully",
      comedians: updatedRows,
      featuredIds,
    });
  } catch (error: any) {
    console.error("POST /api/comedians/lineup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update lineup" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSql } from "../../../src/lib/db";
import { EventItem } from "../../../src/lib/mock-data";
import { requireAdminSession } from "../../../src/lib/auth";

export async function GET() {
  try {
    const auth = await requireAdminSession();
    if (auth.response) return auth.response;

    const sql = getSql();
    const rows = await sql`
      SELECT 
        id,
        title,
        type,
        date,
        time,
        venue,
        address,
        host,
        price,
        taptap_url as "taptapUrl",
        status,
        flyer_url as "flyerUrl",
        capacity,
        registered_count as "registeredCount"
      FROM events
      ORDER BY date ASC, time ASC
    `;
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("GET /api/events error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminSession();
    if (auth.response) return auth.response;

    const body = (await request.json()) as Partial<EventItem>;
    const sql = getSql();

    const id = body.id || `evt-${Date.now()}`;
    const title = body.title || "UNTITLED EVENT";
    const type = body.type || "OPEN MIC";
    const date = body.date || new Date().toISOString().split("T")[0] || "2026-10-01";
    const time = body.time || "20:00 WIT";
    const venue = body.venue || "SKY COFFEE25";
    const address = body.address || "Jl. Bhayangkara, Timika";
    const host = body.host || "RIAN 'THE HAMMER'";
    const price = body.price || "FREE ENTRY";
    const taptapUrl = body.taptapUrl || "";
    const status = body.status || "PUBLISHED";
    const flyerUrl = body.flyerUrl || null;
    const capacity = body.capacity || 50;
    const registeredCount = body.registeredCount || 0;

    const inserted = await sql`
      INSERT INTO events (
        id, title, type, date, time, venue, address, host, price, taptap_url, status, flyer_url, capacity, registered_count, updated_at
      ) VALUES (
        ${id}, ${title}, ${type}, ${date}, ${time}, ${venue}, ${address}, ${host}, ${price}, ${taptapUrl}, ${status}, ${flyerUrl}, ${capacity}, ${registeredCount}, CURRENT_TIMESTAMP
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        type = EXCLUDED.type,
        date = EXCLUDED.date,
        time = EXCLUDED.time,
        venue = EXCLUDED.venue,
        address = EXCLUDED.address,
        host = EXCLUDED.host,
        price = EXCLUDED.price,
        taptap_url = EXCLUDED.taptap_url,
        status = EXCLUDED.status,
        flyer_url = EXCLUDED.flyer_url,
        capacity = EXCLUDED.capacity,
        registered_count = EXCLUDED.registered_count,
        updated_at = CURRENT_TIMESTAMP
      RETURNING 
        id, title, type, date, time, venue, address, host, price, taptap_url as "taptapUrl", status, flyer_url as "flyerUrl", capacity, registered_count as "registeredCount"
    `;

    revalidatePath("/events");
    revalidatePath("/");

    return NextResponse.json({ success: true, event: inserted[0] });
  } catch (error: any) {
    console.error("POST /api/events error:", error);
    return NextResponse.json({ error: error.message || "Failed to save event", details: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdminSession();
    if (auth.response) return auth.response;

    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    const sql = getSql();
    const updated = await sql`
      UPDATE events 
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, status
    `;

    revalidatePath("/events");
    revalidatePath("/");

    return NextResponse.json({ success: true, event: updated[0] });
  } catch (error: any) {
    console.error("PATCH /api/events error:", error);
    return NextResponse.json({ error: error.message || "Failed to update status" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdminSession();
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing event id" }, { status: 400 });
    }

    const sql = getSql();
    await sql`DELETE FROM events WHERE id = ${id}`;

    revalidatePath("/events");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/events error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete event" }, { status: 500 });
  }
}

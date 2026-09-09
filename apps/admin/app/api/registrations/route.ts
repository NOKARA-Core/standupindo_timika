import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSql } from "../../../src/lib/db";
import { requireAdminSession } from "../../../src/lib/auth";

export async function GET() {
  try {
    const auth = await requireAdminSession();
    if (auth.response) return auth.response;

    const sql = getSql();
    const rows = await sql`
      SELECT 
        id,
        event_id as "eventId",
        event_title as "eventTitle",
        comedian_name as "comedianName",
        phone,
        notes,
        status,
        submitted_at as "submittedAt"
      FROM open_mic_registrations
      ORDER BY created_at DESC
    `;
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("GET /api/registrations error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch registrations" }, { status: 500 });
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
      UPDATE open_mic_registrations 
      SET status = ${status}
      WHERE id = ${id}
      RETURNING id, status
    `;

    revalidatePath("/");

    return NextResponse.json({ success: true, registration: updated[0] });
  } catch (error: any) {
    console.error("PATCH /api/registrations error:", error);
    return NextResponse.json({ error: error.message || "Failed to update registration status" }, { status: 500 });
  }
}


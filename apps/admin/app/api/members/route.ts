import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSql } from "../../../src/lib/db";

// Ensure table exists & initial seed if empty
async function ensureMembersTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS members (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      status VARCHAR(50) DEFAULT 'ACTIVE',
      joined_date VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const count = await sql`SELECT count(*)::int as total FROM members`;
  if (count[0]?.total === 0) {
    await sql`
      INSERT INTO members (id, name, role, phone, status, joined_date)
      VALUES 
        ('mbr-1', 'Muhammad Amin Hidayat', 'Ketua & Super Admin', '+62 812-3456-7890', 'ACTIVE', '2018-05-12'),
        ('mbr-2', 'Rian Hidayat', 'Divisi Acara & Kurator Open Mic', '+62 812-9876-5432', 'ACTIVE', '2019-02-14'),
        ('mbr-3', 'Dimas Prasetyo', 'Bendahara & Merch Coordinator', '+62 813-1122-3344', 'ACTIVE', '2020-07-20'),
        ('mbr-4', 'Kartika Sari', 'Humas & Media Partner Lead', '+62 815-5566-7788', 'ACTIVE', '2021-01-10')
      ON CONFLICT (id) DO NOTHING
    `;
  }
}

export async function GET() {
  try {
    await ensureMembersTable();
    const sql = getSql();
    const rows = await sql`
      SELECT id, name, role, phone, status, joined_date as "joinedDate", created_at as "createdAt"
      FROM members
      ORDER BY created_at ASC
    `;
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("GET /api/members error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memuat data member" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureMembersTable();
    const body = await request.json();
    const sql = getSql();

    const name = String(body.name || "").trim();
    const role = String(body.role || "").trim();
    const phone = String(body.phone || "").trim();
    const status = body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE";
    const joinedDate = String(body.joinedDate || new Date().toISOString().split("T")[0]).trim();

    if (!name || !role) {
      return NextResponse.json(
        { error: "Nama dan Role/Jabatan wajib diisi." },
        { status: 400 }
      );
    }

    const id = body.id || `mbr-${Date.now()}`;

    const rows = await sql`
      INSERT INTO members (id, name, role, phone, status, joined_date, updated_at)
      VALUES (${id}, ${name}, ${role}, ${phone}, ${status}, ${joinedDate}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        phone = EXCLUDED.phone,
        status = EXCLUDED.status,
        joined_date = EXCLUDED.joined_date,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, name, role, phone, status, joined_date as "joinedDate"
    `;

    try {
      revalidatePath("/members");
    } catch {}

    return NextResponse.json({ success: true, member: rows[0] });
  } catch (error: any) {
    console.error("POST /api/members error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menyimpan data member" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureMembersTable();
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "ID dan status wajib disertakan." },
        { status: 400 }
      );
    }

    const validStatus = status === "INACTIVE" ? "INACTIVE" : "ACTIVE";
    const sql = getSql();

    const rows = await sql`
      UPDATE members
      SET status = ${validStatus}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, name, role, status
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Member tidak ditemukan." },
        { status: 404 }
      );
    }

    try {
      revalidatePath("/members");
    } catch {}

    return NextResponse.json({ success: true, member: rows[0] });
  } catch (error: any) {
    console.error("PATCH /api/members error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal mengubah status member" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureMembersTable();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Parameter ID wajib disertakan." },
        { status: 400 }
      );
    }

    const sql = getSql();
    await sql`DELETE FROM members WHERE id = ${id}`;

    try {
      revalidatePath("/members");
    } catch {}

    return NextResponse.json({ success: true, message: "Member berhasil dihapus." });
  } catch (error: any) {
    console.error("DELETE /api/members error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menghapus member" },
      { status: 500 }
    );
  }
}

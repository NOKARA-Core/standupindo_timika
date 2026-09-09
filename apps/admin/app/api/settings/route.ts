import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSql } from "../../../src/lib/db";
import { requireAdminSession } from "../../../src/lib/auth";

export async function ensureSettingsTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      key VARCHAR(100) PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const count = await sql`SELECT count(*)::int as total FROM settings`;
  if (count[0]?.total === 0) {
    const defaults = [
      { key: "whatsapp_order_number", value: "6282248566675" },
      { key: "community_name", value: "StandUp INDO Timika" },
      { key: "community_email", value: "standupindotimika@gmail.com" },
      { key: "hq_address", value: "SKY COFFEE25, Jl. Bhayangkara, Koperapoka, Timika" },
    ];

    for (const d of defaults) {
      await sql`
        INSERT INTO settings (key, value)
        VALUES (${d.key}, ${d.value})
        ON CONFLICT (key) DO NOTHING
      `;
    }
  }
}

export async function GET() {
  try {
    const auth = await requireAdminSession();
    if (!auth.ok) {
      return auth.response;
    }

    await ensureSettingsTable();
    const sql = getSql();
    const rows = await sql`
      SELECT key, value, updated_at as "updatedAt"
      FROM settings
    `;

    const settingsMap: Record<string, string> = {
      whatsapp_order_number: "6282248566675",
      community_name: "StandUp INDO Timika",
      community_email: "standupindotimika@gmail.com",
      hq_address: "SKY COFFEE25, Jl. Bhayangkara, Koperapoka, Timika",
    };

    for (const r of rows) {
      settingsMap[r.key] = r.value;
    }

    return NextResponse.json(settingsMap);
  } catch (error: any) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memuat pengaturan" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminSession("superadmin");
    if (!auth.ok) {
      return auth.response;
    }

    await ensureSettingsTable();
    const body = await request.json();
    const sql = getSql();

    // Body is a key-value object of settings e.g. { whatsapp_order_number: "6282248566675", ... }
    const updatedKeys: string[] = [];

    for (const [key, value] of Object.entries(body)) {
      if (typeof value === "string") {
        let cleanValue = value.trim();
        // If whatsapp number, sanitize to only digits
        if (key === "whatsapp_order_number") {
          cleanValue = cleanValue.replace(/\D/g, "");
          if (cleanValue.startsWith("0")) {
            cleanValue = "62" + cleanValue.slice(1);
          }
        }

        await sql`
          INSERT INTO settings (key, value, updated_at)
          VALUES (${key}, ${cleanValue}, CURRENT_TIMESTAMP)
          ON CONFLICT (key) DO UPDATE SET
            value = EXCLUDED.value,
            updated_at = CURRENT_TIMESTAMP
        `;
        updatedKeys.push(key);
      }
    }

    revalidatePath("/settings");
    revalidatePath("/store");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: "Pengaturan berhasil diperbarui",
      updatedKeys,
    });
  } catch (error: any) {
    console.error("POST /api/settings error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menyimpan pengaturan" },
      { status: 500 }
    );
  }
}

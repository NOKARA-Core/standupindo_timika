import { NextResponse } from "next/server";
import { getSql } from "../../../src/lib/db";

export async function GET() {
  try {
    const sql = getSql();

    // List of core tables to backup
    const tables = [
      "events",
      "comedians",
      "open_mic_registrations",
      "media_assets",
      "site_assets_config",
      "admin_users",
    ];

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    let sqlDump = `-- ========================================================\n`;
    sqlDump += `-- STANDUP INDO TIMIKA - DATABASE BACKUP DUMP\n`;
    sqlDump += `-- Exported at: ${new Date().toISOString()}\n`;
    sqlDump += `-- Engine: PostgreSQL (Neon.tech)\n`;
    sqlDump += `-- ========================================================\n\n`;
    sqlDump += `SET statement_timeout = 0;\n`;
    sqlDump += `SET client_encoding = 'UTF8';\n`;
    sqlDump += `SET standard_conforming_strings = on;\n\n`;

    for (const tableName of tables) {
      // 1. Get Table Schema Columns
      const columns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = ${tableName}
        ORDER BY ordinal_position
      `;

      if (columns.length === 0) continue;

      sqlDump += `-- --------------------------------------------------------\n`;
      sqlDump += `-- Table: ${tableName}\n`;
      sqlDump += `-- --------------------------------------------------------\n`;

      // 2. Fetch all rows
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows: any[] = await sql`SELECT * FROM ${sql(tableName)}`;

      if (rows.length === 0) {
        sqlDump += `-- (No rows in ${tableName})\n\n`;
        continue;
      }

      const colNames = columns.map((c) => c.column_name);

      for (const row of rows) {
        const values = colNames.map((col) => {
          const val = row[col];
          if (val === null || val === undefined) {
            return "NULL";
          }
          if (typeof val === "boolean" || typeof val === "number") {
            return String(val);
          }
          if (typeof val === "object") {
            if (val instanceof Date) {
              return `'${val.toISOString()}'`;
            }
            // JSON objects (like site_assets_config data)
            return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
          }
          // Escape single quotes for SQL string literals
          return `'${String(val).replace(/'/g, "''")}'`;
        });

        sqlDump += `INSERT INTO ${tableName} (${colNames.map((c) => `"${c}"`).join(", ")}) VALUES (${values.join(", ")}) ON CONFLICT DO NOTHING;\n`;
      }

      sqlDump += `\n`;
    }

    sqlDump += `-- ========================================================\n`;
    sqlDump += `-- END OF BACKUP DUMP\n`;
    sqlDump += `-- ========================================================\n`;

    const filename = `stup_timika_backup_${timestamp}.sql`;

    return new NextResponse(sqlDump, {
      status: 200,
      headers: {
        "Content-Type": "application/sql; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Backup generator error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal membuat database backup" },
      { status: 500 }
    );
  }
}

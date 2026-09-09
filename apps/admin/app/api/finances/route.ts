import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSql } from "../../../src/lib/db";

async function ensureFinancesTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS finances (
      id VARCHAR(100) PRIMARY KEY,
      type VARCHAR(50) NOT NULL,
      category VARCHAR(100) NOT NULL,
      amount NUMERIC(15, 2) NOT NULL,
      transaction_date VARCHAR(50) NOT NULL,
      description TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const count = await sql`SELECT count(*)::int as total FROM finances`;
  if (count[0]?.total === 0) {
    await sql`
      INSERT INTO finances (id, type, category, amount, transaction_date, description)
      VALUES 
        ('fnc-1', 'INCOME', 'Merchandise', 1800000, '2026-10-08', 'Penjualan 12 Kaos ''Live Raw'' Pre-Order'),
        ('fnc-2', 'EXPENSE', 'Operasional Show', 450000, '2026-10-05', 'Sewa Sound System & Mic Wireless The Bunker'),
        ('fnc-3', 'INCOME', 'Tiket Acara', 3750000, '2026-10-02', 'Bagi Hasil Tiket Presale Roasting Timika (TapTap)'),
        ('fnc-4', 'INCOME', 'Kas Komunitas', 1500000, '2026-09-20', 'Iuran Anggota Periode September 2026'),
        ('fnc-5', 'EXPENSE', 'Konsumsi', 350000, '2026-09-18', 'Konsumsi Rapat Evaluasi & Briefing Open Mic')
      ON CONFLICT (id) DO NOTHING
    `;
  }
}

export async function GET() {
  try {
    await ensureFinancesTable();
    const sql = getSql();
    const rows = await sql`
      SELECT 
        id, 
        type, 
        category, 
        amount::float as amount, 
        transaction_date as "transactionDate", 
        description, 
        created_at as "createdAt"
      FROM finances
      ORDER BY transaction_date DESC, created_at DESC
    `;

    // Calculate Summary Balances
    let totalIncome = 0;
    let totalExpense = 0;

    for (const r of rows) {
      const val = Number(r.amount) || 0;
      if (r.type === "INCOME") {
        totalIncome += val;
      } else {
        totalExpense += val;
      }
    }

    const currentBalance = totalIncome - totalExpense;

    return NextResponse.json({
      transactions: rows,
      summary: {
        currentBalance,
        totalIncome,
        totalExpense,
        transactionCount: rows.length,
      },
    });
  } catch (error: any) {
    console.error("GET /api/finances error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memuat data keuangan" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureFinancesTable();
    const body = await request.json();
    const sql = getSql();

    const type = body.type === "EXPENSE" ? "EXPENSE" : "INCOME";
    const category = String(body.category || "Lainnya").trim();
    const amount = Math.abs(Number(body.amount) || 0);
    const transactionDate = String(body.transactionDate || new Date().toISOString().split("T")[0]).trim();
    const description = String(body.description || "").trim();

    if (!description) {
      return NextResponse.json(
        { error: "Deskripsi / keterangan transaksi wajib diisi." },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Jumlah nominal transaksi harus lebih besar dari 0." },
        { status: 400 }
      );
    }

    const id = body.id || `fnc-${Date.now()}`;

    const rows = await sql`
      INSERT INTO finances (id, type, category, amount, transaction_date, description, updated_at)
      VALUES (${id}, ${type}, ${category}, ${amount}, ${transactionDate}, ${description}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        type = EXCLUDED.type,
        category = EXCLUDED.category,
        amount = EXCLUDED.amount,
        transaction_date = EXCLUDED.transaction_date,
        description = EXCLUDED.description,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, type, category, amount::float as amount, transaction_date as "transactionDate", description
    `;

    try {
      revalidatePath("/finances");
    } catch {}

    return NextResponse.json({ success: true, transaction: rows[0] });
  } catch (error: any) {
    console.error("POST /api/finances error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menyimpan transaksi" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureFinancesTable();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Parameter ID transaksi wajib disertakan." },
        { status: 400 }
      );
    }

    const sql = getSql();
    await sql`DELETE FROM finances WHERE id = ${id}`;

    try {
      revalidatePath("/finances");
    } catch {}

    return NextResponse.json({ success: true, message: "Transaksi berhasil dihapus." });
  } catch (error: any) {
    console.error("DELETE /api/finances error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menghapus transaksi" },
      { status: 500 }
    );
  }
}

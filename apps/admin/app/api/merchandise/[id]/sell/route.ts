import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSql } from "../../../../../src/lib/db";
import { ensureMerchandiseTable } from "../../route";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureMerchandiseTable();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: "ID merchandise tidak valid" },
        { status: 400 }
      );
    }

    const sql = getSql();

    // 1. Fetch current merchandise item
    const items = await sql`
      SELECT id, name, price::float as price, stock, is_active
      FROM merchandise
      WHERE id = ${id}
      LIMIT 1
    `;

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Item merchandise tidak ditemukan" },
        { status: 404 }
      );
    }

    const item = items[0];

    if (item.stock <= 0) {
      return NextResponse.json(
        { error: `Stok "${item.name}" sudah habis (0). Tambah stok terlebih dahulu.` },
        { status: 400 }
      );
    }

    // 2. Decrement stock
    const updatedMerch = await sql`
      UPDATE merchandise
      SET 
        stock = stock - 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING 
        id, name, price::float as price, category, stock, image_url as "imageUrl", description, badge, is_active as "isActive"
    `;

    // 3. Insert transaction into finances
    const txId = `fnc-${Date.now()}`;
    const todayStr = new Date().toISOString().split("T")[0];
    const txDesc = `Terjual ${item.name}`;

    // Ensure finances table exists just in case
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

    const insertedTx = await sql`
      INSERT INTO finances (
        id, type, category, amount, transaction_date, description, created_at, updated_at
      ) VALUES (
        ${txId}, 'INCOME', 'Penjualan Merchandise', ${item.price}, ${todayStr}, ${txDesc}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING 
        id, type, category, amount::float as amount, transaction_date as "transactionDate", description, created_at as "createdAt"
    `;

    revalidatePath("/store");
    revalidatePath("/finances");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: `1 unit "${item.name}" berhasil ditandai terjual dan dicatat ke Finance (+Rp ${Number(item.price).toLocaleString("id-ID")}).`,
      item: updatedMerch[0],
      transaction: insertedTx[0],
    });
  } catch (error: any) {
    console.error("POST /api/merchandise/[id]/sell error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memproses penjualan merchandise" },
      { status: 500 }
    );
  }
}

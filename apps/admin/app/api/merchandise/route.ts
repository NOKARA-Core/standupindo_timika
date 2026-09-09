import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSql } from "../../../src/lib/db";
import { requireAdminSession } from "../../../src/lib/auth";

export interface MerchItem {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string | null;
  description?: string;
  badge?: string;
  status?: string;
  isActive: boolean;
  createdAt?: string;
}

export async function ensureMerchandiseTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS merchandise (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price NUMERIC(15, 2) NOT NULL,
      category VARCHAR(100) NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      image_url TEXT,
      description TEXT,
      badge VARCHAR(100),
      status VARCHAR(50) DEFAULT 'in_stock',
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    ALTER TABLE merchandise ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'in_stock'
  `;

  const count = await sql`SELECT count(*)::int as total FROM merchandise`;
  if (count[0]?.total === 0) {
    const defaultItems = [
      {
        id: "tee-liveraw",
        name: "'LIVE RAW' HEAVYWEIGHT TEE",
        price: 150000,
        category: "T-Shirt",
        stock: 25,
        description: "Cotton Combed 24s Heavyweight, sablon plastisol doff kasar tahan banting. Cuttingan boxy fit underground.",
        badge: "BESTSELLER",
        imageUrl: null,
      },
      {
        id: "hoodie-underground",
        name: "TIMIKA CHAPTER HEAVY HOODIE",
        price: 320000,
        category: "Hoodie",
        stock: 15,
        description: "Fleece 330gsm tebal cocok untuk hawa dingin malam Mimika. Grafis bordir punchline di dada dan punggung.",
        badge: "LIMITED EDITION",
        imageUrl: null,
      },
      {
        id: "mug-bitter",
        name: "THE BITTER COMEDIAN MUG",
        price: 80000,
        category: "Aksesoris",
        stock: 40,
        description: "Keramik hitam doff 12oz. Menampung kopi pahit untuk menemani kamu nulis premis sampai subuh.",
        badge: "OFFICIAL MERCH",
        imageUrl: null,
      },
      {
        id: "sticker-pack",
        name: "STANDUP TIMIKA STICKER PACK (10 PCS)",
        price: 35000,
        category: "Aksesoris",
        stock: 100,
        description: "Vinyl waterproof die-cut tebal. Desain quote komika, logo retro, dan lambang petir komedi lokal.",
        badge: "PACK",
        imageUrl: null,
      },
      {
        id: "ticket-special-preorder",
        name: "PRE-ORDER TICKET: STANDUP FEST MIMIKA",
        price: 100000,
        category: "Tiket",
        stock: 50,
        description: "Akses VIP Presale + Merchandise bundle wristband eksklusif StandUp Festival Mimika akhir tahun.",
        badge: "EARLY ACCESS",
        imageUrl: null,
      },
      {
        id: "tote-canvas",
        name: "RAW PUNCHLINE CANVAS TOTE",
        price: 65000,
        category: "Aksesoris",
        stock: 30,
        description: "Kanvas tebal 14oz berresleting. Kuat bawa laptop dan buku catatan materi stand-up.",
        badge: "NEW ARRIVAL",
        imageUrl: null,
      },
    ];

    for (const item of defaultItems) {
      await sql`
        INSERT INTO merchandise (
          id, name, price, category, stock, description, badge, image_url, is_active
        ) VALUES (
          ${item.id}, ${item.name}, ${item.price}, ${item.category}, ${item.stock}, 
          ${item.description}, ${item.badge}, ${item.imageUrl}, true
        )
        ON CONFLICT (id) DO NOTHING
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

    await ensureMerchandiseTable();
    const sql = getSql();
    const rows = await sql`
      SELECT 
        id,
        name,
        price::float as price,
        category,
        stock,
        image_url as "imageUrl",
        description,
        badge,
        COALESCE(status, 'in_stock') as status,
        is_active as "isActive",
        created_at as "createdAt"
      FROM merchandise
      ORDER BY is_active DESC, created_at DESC
    `;
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("GET /api/merchandise error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memuat data merchandise" },
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

    await ensureMerchandiseTable();
    const body = await request.json();
    const sql = getSql();

    const id = body.id || `merch-${Date.now()}`;
    const name = String(body.name || "").trim();
    const price = Math.max(0, Number(body.price) || 0);
    const category = String(body.category || "Aksesoris").trim();
    const stock = Math.max(0, parseInt(body.stock) || 0);
    const imageUrl = body.imageUrl || null;
    const description = String(body.description || "").trim();
    const badge = String(body.badge || "").trim() || null;
    const status = body.status || (stock <= 0 ? "out_of_stock" : "in_stock");
    const isActive = typeof body.isActive === "boolean" ? body.isActive : true;

    if (!name) {
      return NextResponse.json(
        { error: "Nama merchandise wajib diisi" },
        { status: 400 }
      );
    }

    const inserted = await sql`
      INSERT INTO merchandise (
        id, name, price, category, stock, image_url, description, badge, status, is_active, updated_at
      ) VALUES (
        ${id}, ${name}, ${price}, ${category}, ${stock}, ${imageUrl}, ${description}, ${badge}, ${status}, ${isActive}, CURRENT_TIMESTAMP
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        category = EXCLUDED.category,
        stock = EXCLUDED.stock,
        image_url = COALESCE(EXCLUDED.image_url, merchandise.image_url),
        description = EXCLUDED.description,
        badge = EXCLUDED.badge,
        status = EXCLUDED.status,
        is_active = EXCLUDED.is_active,
        updated_at = CURRENT_TIMESTAMP
      RETURNING 
        id, name, price::float as price, category, stock, image_url as "imageUrl", description, badge, status, is_active as "isActive", created_at as "createdAt"
    `;

    revalidatePath("/store");
    revalidatePath("/");

    return NextResponse.json({ success: true, item: inserted[0] });
  } catch (error: any) {
    console.error("POST /api/merchandise error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menyimpan merchandise" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAdminSession("superadmin");
    if (!auth.ok) {
      return auth.response;
    }

    await ensureMerchandiseTable();
    const body = await request.json();
    const { id, name, price, category, stock, imageUrl, description, badge, status, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID merchandise wajib disertakan" },
        { status: 400 }
      );
    }

    const sql = getSql();
    const updated = await sql`
      UPDATE merchandise
      SET 
        name = COALESCE(${name}, name),
        price = COALESCE(${price !== undefined ? Number(price) : null}, price),
        category = COALESCE(${category}, category),
        stock = COALESCE(${stock !== undefined ? parseInt(stock) : null}, stock),
        image_url = CASE WHEN ${imageUrl !== undefined} THEN ${imageUrl} ELSE image_url END,
        description = COALESCE(${description}, description),
        badge = COALESCE(${badge}, badge),
        status = COALESCE(${status}, status),
        is_active = COALESCE(${isActive}, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING 
        id, name, price::float as price, category, stock, image_url as "imageUrl", description, badge, status, is_active as "isActive", created_at as "createdAt"
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Item merchandise tidak ditemukan" },
        { status: 404 }
      );
    }

    revalidatePath("/store");
    revalidatePath("/");

    return NextResponse.json({ success: true, item: updated[0] });
  } catch (error: any) {
    console.error("PUT /api/merchandise error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal mengupdate merchandise" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdminSession("superadmin");
    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID merchandise wajib disertakan" },
        { status: 400 }
      );
    }

    const sql = getSql();
    await sql`DELETE FROM merchandise WHERE id = ${id}`;

    revalidatePath("/store");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/merchandise error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menghapus merchandise" },
      { status: 500 }
    );
  }
}

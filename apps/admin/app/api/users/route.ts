import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSql } from "../../../src/lib/db";
import { requireAdminSession } from "../../../src/lib/auth";

// Declare Bun global for TypeScript
declare const Bun: any;

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export async function GET() {
  try {
    const auth = await requireAdminSession();
    if (!auth.ok) return auth.response;

    const sql = getSql();
    const rows = await sql`
      SELECT 
        id, 
        name, 
        email, 
        role, 
        created_at as "createdAt"
      FROM admin_users
      ORDER BY created_at ASC
    `;
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch admin users" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAdminSession();
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const { id, name, email, password, role } = body;

    if (!id) {
      return NextResponse.json({ error: "ID user wajib disertakan." }, { status: 400 });
    }

    const isSuperadmin = auth.user.role === "superadmin";
    const isSelf = auth.user.id === id;

    // RBAC: Superadmin can edit any user; non-superadmin can ONLY edit their own account!
    if (!isSuperadmin && !isSelf) {
      return NextResponse.json(
        { error: "Forbidden. Anda hanya dapat mengedit akun Anda sendiri." },
        { status: 403 }
      );
    }

    const sql = getSql();

    const existing = await sql`SELECT id, name, email, role, password_hash FROM admin_users WHERE id = ${id} LIMIT 1`;
    const user = existing[0];
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    // Role changes: ONLY superadmin can change roles!
    let newRole = user.role;
    if (isSuperadmin && role) {
      newRole = role === "superadmin" ? "superadmin" : "curator";
    }

    // Email duplicate check
    if (email && email !== user.email) {
      const duplicate = await sql`SELECT id FROM admin_users WHERE email = ${email} AND id != ${id} LIMIT 1`;
      if (duplicate.length > 0) {
        return NextResponse.json(
          { error: "Username atau email sudah digunakan oleh user lain." },
          { status: 400 }
        );
      }
    }

    // Password change (optional: only if provided)
    let passwordHash = user.password_hash;
    if (password && String(password).trim().length > 0) {
      if (String(password).length < 6) {
        return NextResponse.json(
          { error: "Password minimal 6 karakter." },
          { status: 400 }
        );
      }
      passwordHash = await Bun.password.hash(password, {
        algorithm: "bcrypt",
        cost: 10,
      });
    }

    const safeName = name ? String(name).trim() : user.name;
    const safeEmail = email ? String(email).trim() : user.email;

    const updated = await sql`
      UPDATE admin_users
      SET
        name = ${safeName},
        email = ${safeEmail},
        role = ${newRole},
        password_hash = ${passwordHash}
      WHERE id = ${id}
      RETURNING id, name, email, role, created_at as "createdAt"
    `;

    revalidatePath("/settings");

    return NextResponse.json({
      success: true,
      message: "Data akun admin berhasil diperbarui.",
      user: updated[0],
    });
  } catch (error: any) {
    console.error("PUT /api/users error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminSession("superadmin");
    if (auth.response) return auth.response;

    const body = await request.json();
    const { name, email, password, role = "curator" } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nama, email/username, dan password wajib diisi." },
        { status: 400 }
      );
    }

    // Role validation
    const validRole = role === "superadmin" ? "superadmin" : "curator";

    const sql = getSql();

    // Check unique email/username
    const existing = await sql`SELECT id FROM admin_users WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Username atau email sudah digunakan oleh admin lain." },
        { status: 400 }
      );
    }

    // Hash password with bcrypt
    const passwordHash = await Bun.password.hash(password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    const id = `usr-${Date.now()}`;

    const inserted = await sql`
      INSERT INTO admin_users (id, name, email, password_hash, role)
      VALUES (${id}, ${name}, ${email}, ${passwordHash}, ${validRole})
      RETURNING id, name, email, role, created_at as "createdAt"
    `;

    revalidatePath("/settings");

    return NextResponse.json({ success: true, user: inserted[0] });
  } catch (error: any) {
    console.error("POST /api/users error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdminSession("superadmin");
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    // Prevent self-deletion
    if (auth.user && id === auth.user.id) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus akun Anda sendiri saat sedang login." },
        { status: 400 }
      );
    }

    const sql = getSql();

    // Prevent deleting the last remaining admin
    const totalUsers = await sql`SELECT count(*)::int as count FROM admin_users`;
    if ((totalUsers[0]?.count || 0) <= 1) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus admin terakhir pada sistem." },
        { status: 400 }
      );
    }

    await sql`DELETE FROM admin_users WHERE id = ${id}`;

    revalidatePath("/settings");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/users error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}


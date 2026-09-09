import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSql } from "../../../../src/lib/db";
import { AdminRole } from "../../../../src/config/nav";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("stup_admin_session")?.value;
    const roleCookie = cookieStore.get("stup_admin_role")?.value as AdminRole | undefined;

    if (sessionId) {
      const sql = getSql();
      const rows = await sql`
        SELECT id, name, email, role, created_at as "createdAt"
        FROM admin_users
        WHERE id = ${sessionId}
        LIMIT 1
      `;

      const user = rows[0];
      if (user) {
        // If roleCookie is explicitly overriding for testing, respect it
        const effectiveRole: AdminRole =
          roleCookie && (roleCookie === "superadmin" || roleCookie === "curator")
            ? roleCookie
            : user.role === "curator"
            ? "curator"
            : "superadmin";

        return NextResponse.json({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: effectiveRole,
          },
        });
      }
    }

    // If no DB session found, check roleCookie or return default superadmin
    const fallbackRole: AdminRole =
      roleCookie === "curator" ? "curator" : "superadmin";

    return NextResponse.json({
      user: {
        id: "usr-admin",
        name: fallbackRole === "curator" ? "Kurator Konten" : "Super Administrator",
        email: fallbackRole === "curator" ? "curator@standuptimika.com" : "admin@standuptimika.com",
        role: fallbackRole,
      },
    });
  } catch (error: any) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json(
      {
        user: {
          id: "usr-admin",
          name: "Super Administrator",
          email: "admin",
          role: "superadmin",
        },
      },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const targetRole: AdminRole =
      body.role === "curator" ? "curator" : "superadmin";

    const response = NextResponse.json({
      success: true,
      role: targetRole,
      message: `Role berhasil diubah menjadi ${targetRole.toUpperCase()}`,
    });

    response.cookies.set("stup_admin_role", targetRole, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to switch role" },
      { status: 500 }
    );
  }
}

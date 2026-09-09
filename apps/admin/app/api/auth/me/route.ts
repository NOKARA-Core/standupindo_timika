import { NextResponse } from "next/server";
import { getAdminSession } from "../../../../src/lib/auth";
import { AdminRole } from "../../../../src/config/nav";

export async function GET() {
  try {
    const user = await getAdminSession();

    if (!user) {
      return NextResponse.json(
        { user: null, error: "Unauthorized. Tidak ada sesi aktif." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json(
      { user: null, error: "Gagal memverifikasi sesi admin" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAdminSession();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Sesi login diperlukan." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const targetRole: AdminRole =
      body.role === "curator" ? "curator" : "superadmin";

    const response = NextResponse.json({
      success: true,
      role: targetRole,
      message: `Role pratinjau berhasil diubah menjadi ${targetRole.toUpperCase()}`,
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

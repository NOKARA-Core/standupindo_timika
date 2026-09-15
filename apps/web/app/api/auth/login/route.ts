import { NextResponse } from "next/server";
import { getSql } from "../../../../src/lib/db";
import { loginSchema } from "../../../../src/lib/security";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const parseResult = loginSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const firstError =
        parseResult.error.issues[0]?.message || "Format data login tidak valid.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { username, password } = parseResult.data;

    const sql = getSql();
    const rows = await sql`
      SELECT id, name, email, password_hash, role
      FROM admin_users
      WHERE email = ${username}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Username atau password tidak cocok." },
        { status: 401 }
      );
    }

    const user = rows[0];
    if (!user) {
      return NextResponse.json(
        { error: "Username atau password tidak cocok." },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Username atau password tidak cocok." },
        { status: 401 }
      );
    }

    // Determine admin redirect URL
    const adminUrl =
      process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:5001";

    const response = NextResponse.json({
      success: true,
      message: "Autentikasi berhasil.",
      redirectUrl: adminUrl,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set("stup_admin_session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error("Web Auth login error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memproses autentikasi" },
      { status: 500 }
    );
  }
}

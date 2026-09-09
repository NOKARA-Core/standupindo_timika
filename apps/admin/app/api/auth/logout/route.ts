import { NextResponse } from "next/server";

export async function POST() {
  try {
    const webUrl =
      process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:5000";

    const response = NextResponse.json({
      success: true,
      message: "Berhasil logout.",
      redirectUrl: `${webUrl}/login`,
    });

    // Delete session cookie
    response.cookies.set("stup_admin_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    response.cookies.set("stup_admin_role", "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memproses logout" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}

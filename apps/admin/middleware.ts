import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CURATOR_FORBIDDEN_PATHS } from "./src/config/nav";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if target pathname is forbidden for curator
  const isForbidden = CURATOR_FORBIDDEN_PATHS.some(
    (forbidden) => pathname === forbidden || pathname.startsWith(`${forbidden}/`)
  );

  if (isForbidden) {
    const roleCookie = request.cookies.get("stup_admin_role")?.value;
    if (roleCookie === "curator") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("access_denied", "true");
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/finances/:path*",
    "/finances",
    "/store/:path*",
    "/store",
    "/members/:path*",
    "/members",
    "/settings/:path*",
    "/settings",
  ],
};

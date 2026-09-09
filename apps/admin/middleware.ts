import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CURATOR_FORBIDDEN_PATHS } from "./src/config/nav";

const STATIC_EXTENSION_REGEX =
  /\.(png|jpe?g|gif|webp|svg|ico|json|woff2?|ttf|eot|css|js|map)$/i;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bypass static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon.ico") ||
    STATIC_EXTENSION_REGEX.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Allow public login page and login API endpoint
  if (pathname === "/login" || pathname === "/api/auth/login") {
    // If user already has valid session, redirect away from /login to dashboard
    const sessionCookie = request.cookies.get("stup_admin_session")?.value;
    if (sessionCookie && pathname === "/login") {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/";
      return NextResponse.redirect(dashboardUrl);
    }
    return NextResponse.next();
  }

  // 3. Enforce session presence on all admin pages and API routes
  const sessionToken = request.cookies.get("stup_admin_session")?.value;

  if (!sessionToken) {
    if (pathname.startsWith("/api/")) {
      return new NextResponse(
        JSON.stringify({
          error: "Unauthorized. Sesi login diperlukan untuk mengakses API admin.",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // 4. Role-based Path Enforcement for Curator (Anti-Bypass Guard)
  const roleCookie = request.cookies.get("stup_admin_role")?.value;
  const isForbiddenForCurator = CURATOR_FORBIDDEN_PATHS.some(
    (forbidden) =>
      pathname === forbidden || pathname.startsWith(`${forbidden}/`)
  );

  if (isForbiddenForCurator && roleCookie === "curator") {
    if (pathname.startsWith("/api/")) {
      return new NextResponse(
        JSON.stringify({
          error:
            "Forbidden. Endpoint ini hanya dapat diakses oleh Super Administrator.",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const deniedUrl = request.nextUrl.clone();
    deniedUrl.pathname = "/";
    deniedUrl.searchParams.set("access_denied", "true");
    deniedUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(deniedUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Protect all paths in apps/admin except for static assets
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

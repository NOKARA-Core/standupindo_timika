import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// In-memory sliding window rate limiter
// Suitable for edge/node middleware instances against burst floods
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Purge expired entries periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Static and SEO assets bypass rate limiting
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/fonts") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".json")
  ) {
    return NextResponse.next();
  }

  // 2. Identify client IP
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp = forwardedFor?.split(",")[0]?.trim() || "127.0.0.1";

  // 3. Define limits: Strict on API/Auth, Generous on standard pages
  const isApiRoute = pathname.startsWith("/api");
  const isAuthRoute = pathname.startsWith("/login");

  // Limits per 60 seconds window
  const windowMs = 60 * 1000;
  const maxRequests = isApiRoute ? 40 : isAuthRoute ? 30 : 120;

  const now = Date.now();
  const rateLimitKey = `${clientIp}:${isApiRoute ? "api" : isAuthRoute ? "auth" : "page"}`;

  const currentEntry = rateLimitStore.get(rateLimitKey);

  if (!currentEntry || now > currentEntry.resetTime) {
    rateLimitStore.set(rateLimitKey, {
      count: 1,
      resetTime: now + windowMs,
    });
  } else {
    currentEntry.count += 1;

    if (currentEntry.count > maxRequests) {
      const retryAfter = Math.ceil((currentEntry.resetTime - now) / 1000);
      return new NextResponse(
        JSON.stringify({
          error: "Too Many Requests",
          message:
            "Kecepatan request melebihi batas wajar. Silakan tunggu beberapa detik.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(retryAfter),
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt, sitemap.xml
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};

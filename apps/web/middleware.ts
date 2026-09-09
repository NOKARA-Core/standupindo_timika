import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Bounded in-memory store with max size cap to prevent memory exhaustion in serverless/edge runtimes
const MAX_STORE_ENTRIES = 5000;
const rateLimitStore = new Map<string, RateLimitEntry>();

// Known public search engine & preview crawler user-agent regex
const SEO_CRAWLERS_REGEX =
  /(Googlebot|Google-InspectionTool|bingbot|Baiduspider|DuckDuckBot|YandexBot|facebookexternalhit|WhatsApp|Twitterbot|LinkedInBot|Applebot)/i;

// Static asset extension regex
const STATIC_EXTENSION_REGEX =
  /\.(png|jpe?g|gif|webp|svg|ico|json|woff2?|ttf|eot|css|js|map)$/i;

function cleanExpiredEntries(now: number) {
  // Lazy prune expired entries
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }

  // If still above cap, evict oldest entries
  if (rateLimitStore.size > MAX_STORE_ENTRIES) {
    const keysToDelete = Array.from(rateLimitStore.keys()).slice(
      0,
      rateLimitStore.size - MAX_STORE_ENTRIES
    );
    for (const key of keysToDelete) {
      rateLimitStore.delete(key);
    }
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();

  // 1. EXCLUSION LAW UNTUK SEO & STATIC ASSETS:
  // Selalu lolos tanpa pembatasan rate limit agar tidak menghalangi indexing
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/fonts") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname.startsWith("/manifest.json") ||
    pathname.startsWith("/apple-icon") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/opengraph-image") ||
    STATIC_EXTENSION_REGEX.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Exclude verified public crawlers reading public pages (GET / HEAD)
  const userAgent = request.headers.get("user-agent") || "";
  if ((method === "GET" || method === "HEAD") && SEO_CRAWLERS_REGEX.test(userAgent)) {
    return NextResponse.next();
  }

  // 2. Identify client IP
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  const clientIp =
    forwardedFor?.split(",")[0]?.trim() ||
    realIp?.trim() ||
    cfConnectingIp?.trim() ||
    "127.0.0.1";

  // 3. Define granular rate limits per category & request type
  const isLoginRoute = pathname.startsWith("/api/auth/login") || pathname === "/login";
  const isApiRoute = pathname.startsWith("/api");
  const isServerActionOrMutation =
    method === "POST" ||
    method === "PUT" ||
    method === "DELETE" ||
    method === "PATCH" ||
    Boolean(request.headers.get("next-action"));

  const windowMs = 60 * 1000; // 60 seconds sliding window
  let maxRequests = 120; // Default for standard GET browsing
  let routeCategory = "page";

  if (isLoginRoute && isServerActionOrMutation) {
    maxRequests = 10; // Strict protection against credential brute forcing
    routeCategory = "auth-mutation";
  } else if (isServerActionOrMutation || (isApiRoute && method !== "GET")) {
    maxRequests = 30; // Protect mutations and sensitive POST endpoints
    routeCategory = "mutation";
  } else if (isApiRoute) {
    maxRequests = 40; // Dynamic API queries
    routeCategory = "api";
  } else if (isLoginRoute) {
    maxRequests = 30; // Visiting login page
    routeCategory = "auth-page";
  }

  const now = Date.now();
  if (rateLimitStore.size > 200) {
    cleanExpiredEntries(now);
  }

  const rateLimitKey = `${clientIp}:${routeCategory}`;
  const currentEntry = rateLimitStore.get(rateLimitKey);

  if (!currentEntry || now > currentEntry.resetTime) {
    rateLimitStore.set(rateLimitKey, {
      count: 1,
      resetTime: now + windowMs,
    });

    const res = NextResponse.next();
    res.headers.set("X-RateLimit-Limit", String(maxRequests));
    res.headers.set("X-RateLimit-Remaining", String(maxRequests - 1));
    res.headers.set("X-RateLimit-Reset", String(Math.ceil((now + windowMs) / 1000)));
    return res;
  }

  currentEntry.count += 1;

  if (currentEntry.count > maxRequests) {
    const retryAfter = Math.max(1, Math.ceil((currentEntry.resetTime - now) / 1000));
    return new NextResponse(
      JSON.stringify({
        error: "Too Many Requests",
        message:
          "Kecepatan request melebihi batas wajar. Silakan tunggu beberapa saat.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(maxRequests),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(currentEntry.resetTime / 1000)),
        },
      }
    );
  }

  const res = NextResponse.next();
  res.headers.set("X-RateLimit-Limit", String(maxRequests));
  res.headers.set(
    "X-RateLimit-Remaining",
    String(Math.max(0, maxRequests - currentEntry.count))
  );
  res.headers.set(
    "X-RateLimit-Reset",
    String(Math.ceil(currentEntry.resetTime / 1000))
  );
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files, favicon, robots, and sitemap
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};

import { NextResponse } from "next/server";
import { getSql } from "../../../../src/lib/db";
import bcrypt from "bcryptjs";

// Dummy bcrypt hash to ensure constant-time comparison when user doesn't exist (anti-timing attack)
const DUMMY_BCRYPT_HASH =
  "$2b$10$e7V.Lw1aZf3B9gC0kE2m7.O8qX.p5rK4uJ7wZ1yT4r2c1a0e8d9q.";

// Rate limit store for tracking failed login attempts per IP and username
interface FailedAttemptEntry {
  count: number;
  resetTime: number;
}

const failedAttemptsStore = new Map<string, FailedAttemptEntry>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes lockout

function pruneExpiredAttempts(now: number) {
  for (const [key, entry] of failedAttemptsStore.entries()) {
    if (now > entry.resetTime) {
      failedAttemptsStore.delete(key);
    }
  }
}

function recordFailedAttempt(key: string, now: number) {
  const existing = failedAttemptsStore.get(key);
  if (!existing || now > existing.resetTime) {
    failedAttemptsStore.set(key, {
      count: 1,
      resetTime: now + LOCKOUT_WINDOW_MS,
    });
  } else {
    existing.count += 1;
  }
}

function clearFailedAttempts(ipKey: string, userKey: string) {
  failedAttemptsStore.delete(ipKey);
  failedAttemptsStore.delete(userKey);
}

export async function POST(request: Request) {
  const now = Date.now();
  if (failedAttemptsStore.size > 200) {
    pruneExpiredAttempts(now);
  }

  // 1. Identify Client IP
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const clientIp =
    forwardedFor?.split(",")[0]?.trim() || realIp?.trim() || "127.0.0.1";

  try {
    const body = await request.json().catch(() => ({}));
    const username = String(body.username || body.email || "").trim().slice(0, 255);
    const password = String(body.password || "").slice(0, 255);

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    // 2. Check Brute-Force Rate Limiting (per IP and per username/account)
    const ipKey = `ip:${clientIp}`;
    const userKey = `user:${username.toLowerCase()}`;

    const ipEntry = failedAttemptsStore.get(ipKey);
    const userEntry = failedAttemptsStore.get(userKey);

    const activeEntry =
      (ipEntry && ipEntry.count >= MAX_FAILED_ATTEMPTS && now < ipEntry.resetTime)
        ? ipEntry
        : (userEntry && userEntry.count >= MAX_FAILED_ATTEMPTS && now < userEntry.resetTime)
        ? userEntry
        : null;

    if (activeEntry) {
      const retryAfter = Math.max(
        1,
        Math.ceil((activeEntry.resetTime - now) / 1000)
      );
      return new NextResponse(
        JSON.stringify({
          error:
            "Terlalu banyak percobaan login yang gagal. Akun atau IP Anda dibatasi sementara selama 15 menit demi keamanan.",
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

    // 3. Query User from Database
    const sql = getSql();
    const rows = await sql`
      SELECT id, name, email, password_hash, role
      FROM admin_users
      WHERE email = ${username}
      LIMIT 1
    `;

    // 4. Timing Attack Mitigation: Always execute password verify even if user not found
    const user = rows[0];
    if (!user) {
      // Execute dummy verify so elapsed time matches normal verification
      try {
        await bcrypt.compare(password, DUMMY_BCRYPT_HASH);
      } catch {}

      recordFailedAttempt(ipKey, now);
      recordFailedAttempt(userKey, now);

      return NextResponse.json(
        { error: "Username atau password salah." },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      recordFailedAttempt(ipKey, now);
      recordFailedAttempt(userKey, now);

      return NextResponse.json(
        { error: "Username atau password salah." },
        { status: 401 }
      );
    }

    // 5. Successful Authentication: Clear failed attempt counters
    clearFailedAttempts(ipKey, userKey);

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

    // 6. Set secure session cookies
    response.cookies.set("stup_admin_session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    response.cookies.set("stup_admin_role", user.role || "superadmin", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error("Auth login error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memproses autentikasi" },
      { status: 500 }
    );
  }
}

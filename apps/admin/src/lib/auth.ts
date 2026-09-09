import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSql } from "./db";
import { AdminRole } from "../config/nav";

export interface AuthSessionUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

export interface AuthCheckSuccess {
  ok: true;
  user: AuthSessionUser;
  response?: undefined;
}

export interface AuthCheckFailure {
  ok: false;
  response: NextResponse;
  user?: undefined;
}

export type AuthCheckResult = AuthCheckSuccess | AuthCheckFailure;

/**
 * Validates the current admin session cookie against the Neon PostgreSQL database.
 * Returns the authenticated user or null if session is missing/invalid.
 */
export async function getAdminSession(): Promise<AuthSessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("stup_admin_session")?.value;

    if (!sessionId) {
      return null;
    }

    const sql = getSql();
    const rows = await sql`
      SELECT id, name, email, role
      FROM admin_users
      WHERE id = ${sessionId}
      LIMIT 1
    `;

    const user = rows[0];
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role === "curator" ? "curator" : "superadmin",
    };
  } catch (error) {
    console.error("Error retrieving admin session:", error);
    return null;
  }
}

/**
 * Guard helper for API routes and Server Actions.
 * Enforces session validity and optionally checks the required role (e.g. 'superadmin').
 * Returns { ok: true, user } or { ok: false, response: NextResponse } (401 or 403).
 */
export async function requireAdminSession(
  requiredRole?: AdminRole
): Promise<AuthCheckResult> {
  const user = await getAdminSession();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Unauthorized. Sesi login diperlukan untuk mengakses endpoint ini." },
        { status: 401 }
      ),
    };
  }

  if (requiredRole && user.role !== requiredRole) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: `Forbidden. Tindakan ini memerlukan hak akses ${requiredRole.toUpperCase()}. Akun Anda memiliki role ${user.role.toUpperCase()}.`,
        },
        { status: 403 }
      ),
    };
  }

  return { ok: true, user };
}

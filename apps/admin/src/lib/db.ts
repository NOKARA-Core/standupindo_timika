import postgres from "postgres";
import { execFileSync } from "node:child_process";

declare global {
  // eslint-disable-next-line no-var
  var _postgresSql: ReturnType<typeof postgres> | undefined;
}

// Runtime connection uses pooled connection if available, falling back to direct URL or local Docker
const connectionString =
  process.env.DATABASE_URL_POOLED ||
  process.env.DATABASE_URL ||
  "postgresql://postgres:root@127.0.0.1:5432/stup_db";

const isNeon = connectionString.includes("neon.tech");
const isSsl = connectionString.includes("sslmode=require") || isNeon;

// Helper to resolve an IPv4 address synchronously for Linux/Bun environments
function resolveNeonIPv4(hostname: string): string | null {
  try {
    const output = execFileSync("getent", ["ahosts", hostname], {
      encoding: "utf-8",
      timeout: 3000,
    });
    const lines = output.split("\n");
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const ip = parts[0];
      if (ip && /^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
        return ip;
      }
    }
  } catch {
    // Ignore fallback
  }
  return null;
}

// Lazy getter to prevent connection pool instantiation during next build
export function getSql() {
  if (!globalThis._postgresSql) {
    let finalConnectionString = connectionString;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sslOptions: any = isSsl ? "require" : false;

    if (isNeon) {
      try {
        const urlObj = new URL(connectionString);
        const originalHostname = urlObj.hostname;

        const ipv4 = resolveNeonIPv4(originalHostname);
        if (ipv4) {
          urlObj.hostname = ipv4;
          finalConnectionString = urlObj.toString();
          sslOptions = {
            servername: originalHostname,
            rejectUnauthorized: true,
          };
        }
      } catch {
        // Fallback to standard connection string
      }
    }

    globalThis._postgresSql = postgres(finalConnectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: sslOptions,
    });
  }
  return globalThis._postgresSql;
}

export default getSql;

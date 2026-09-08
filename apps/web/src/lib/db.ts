import postgres from "postgres";

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

// Lazy getter to prevent connection pool instantiation during next build
export function getSql() {
  if (!globalThis._postgresSql) {
    globalThis._postgresSql = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: isSsl ? "require" : false,
    });
  }
  return globalThis._postgresSql;
}

export default getSql;

import postgres from "postgres";

declare global {
  // eslint-disable-next-line no-var
  var _postgresSql: ReturnType<typeof postgres> | undefined;
}

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:root@127.0.0.1:5432/stup_db";

// Singleton client to prevent connection exhaustion during Next.js Fast Refresh
export const sql =
  globalThis._postgresSql ??
  postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis._postgresSql = sql;
}

export default sql;

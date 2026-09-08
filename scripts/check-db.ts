import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL_POOLED ||
  process.env.DATABASE_URL ||
  "postgresql://postgres:root@127.0.0.1:5432/stup_db";

const isNeon = connectionString.includes("neon.tech");
const isSsl = connectionString.includes("sslmode=require") || isNeon;

console.log("--------------------------------------------------");
console.log("🔍 Checking Database Connection...");
console.log(`Target: ${isNeon ? "☁️  Neon.tech (Cloud Serverless)" : "💻 Local PostgreSQL (Docker/Localhost)"}`);
console.log(`Connection URL: ${connectionString.replace(/:[^:@]+@/, ":****@")}`);
console.log(`SSL Mode: ${isSsl ? "require (enabled)" : "disabled"}`);
console.log("--------------------------------------------------");

const sql = postgres(connectionString, {
  connect_timeout: 8,
  ssl: isSsl ? "require" : false,
});

async function runCheck() {
  try {
    const start = Date.now();
    const result = await sql`
      SELECT 
        1 as connected, 
        current_database() as db_name, 
        current_user as db_user,
        inet_server_addr() as server_ip,
        version() as db_version
    `;
    const duration = Date.now() - start;

    console.log("✅ Database Connection SUCCESSFUL!");
    console.log(` - Connected: ${result[0]?.connected === 1}`);
    console.log(` - Database Name: ${result[0]?.db_name}`);
    console.log(` - Database User: ${result[0]?.db_user}`);
    console.log(` - Latency: ${duration}ms`);
    console.log(` - Engine Version: ${result[0]?.db_version?.split("\n")[0]}`);

    // Ensure site_assets_config table exists on this database
    await sql`
      CREATE TABLE IF NOT EXISTS site_assets_config (
        id VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log(" - Schema: Table 'site_assets_config' is ready.");

    await sql.end();
    console.log("--------------------------------------------------");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database Connection FAILED:");
    console.error(error);
    await sql.end();
    console.log("--------------------------------------------------");
    process.exit(1);
  }
}

runCheck();

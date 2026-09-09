import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL. Add it to backend/.env — see backend/.env.example.");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase's Postgres requires TLS; rejectUnauthorized: false skips
  // pinning their CA cert, which is the usual approach for connecting from
  // an external host like Render.
  ssl: { rejectUnauthorized: false },
});

pool.on("error", (err) => {
  // A background/idle client error should not crash the whole server.
  console.error("Unexpected error on idle Postgres client", err);
});

import "dotenv/config";
import { pool } from "./db.js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing SUPABASE_URL / SUPABASE_ANON_KEY. Add them to backend/.env — see backend/.env.example.",
  );
}

/**
 * Verifies the caller's Supabase access token by asking Supabase's own Auth
 * API to resolve it to a user — no JWT secret needed on our end, just the
 * public anon key. Attaches { id, email } to req.user on success.
 */
export async function requireUser(req, res, next) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Missing bearer token." });
  }

  const resp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });

  if (!resp.ok) {
    return res.status(401).json({ error: "Invalid or expired session." });
  }

  const user = await resp.json();
  req.user = { id: user.id, email: user.email };
  next();
}

/**
 * Must run after requireUser. Re-checks the caller's role directly against
 * Postgres on every request — the client can't influence this by editing
 * local/session state, only by actually having role = 'admin' in the
 * profiles table (set by hand via SQL; see supabase/schema.sql).
 */
export async function requireAdmin(req, res, next) {
  const { rows } = await pool.query("select role from profiles where id = $1", [req.user.id]);
  if (rows[0]?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required." });
  }
  next();
}

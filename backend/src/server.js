import "dotenv/config";
import cors from "cors";
import express from "express";
import { pool } from "./db.js";
import { requireAdmin, requireUser } from "./auth.js";

const app = express();
app.use(express.json());

const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());
app.use(cors({ origin: allowedOrigins }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Approve a pending meme. sort_order is filled in by a DB trigger — see
// supabase/002_admin_and_ordering.sql — so it always lands at the end of
// the approved order without a race between two admins approving at once.
app.post("/api/memes/:id/approve", requireUser, requireAdmin, async (req, res) => {
  const { rows } = await pool.query(
    "update memes set status = 'approved' where id = $1 and status = 'pending' returning id",
    [req.params.id],
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: "Meme not found, or already approved." });
  }
  res.json({ ok: true });
});

app.patch("/api/memes/:id", requireUser, requireAdmin, async (req, res) => {
  const { title, categories } = req.body ?? {};
  if (title === undefined && categories === undefined) {
    return res.status(400).json({ error: "Nothing to update." });
  }

  const { rows } = await pool.query(
    `update memes set
       title = coalesce($2, title),
       categories = coalesce($3, categories)
     where id = $1
     returning id`,
    [req.params.id, title ?? null, categories ?? null],
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: "Meme not found." });
  }
  res.json({ ok: true });
});

// NOTE: this deletes the database row only. The underlying file stays in
// Supabase Storage — actually removing it needs the service_role key, which
// this project deliberately keeps out of the backend to limit what a single
// leaked credential could do (see backend/README.md). Fine for a workshop
// project; a real deployment would want a periodic cleanup job instead.
app.delete("/api/memes/:id", requireUser, requireAdmin, async (req, res) => {
  const { rows } = await pool.query("delete from memes where id = $1 returning id", [req.params.id]);
  if (rows.length === 0) {
    return res.status(404).json({ error: "Meme not found." });
  }
  res.json({ ok: true });
});

// Any logged-in user can reorder (matches the original app's behavior) —
// not admin-gated like the routes above.
app.post("/api/memes/reorder", requireUser, async (req, res) => {
  const { orderedIds } = req.body ?? {};
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return res.status(400).json({ error: "orderedIds must be a non-empty array." });
  }

  const client = await pool.connect();
  try {
    await client.query("begin");
    for (let index = 0; index < orderedIds.length; index++) {
      await client.query("update memes set sort_order = $2 where id = $1", [orderedIds[index], index]);
    }
    await client.query("commit");
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }

  res.json({ ok: true });
});

// Express 5 forwards rejected async handlers here automatically.
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Meme Hall of Fame API listening on :${port}`);
});

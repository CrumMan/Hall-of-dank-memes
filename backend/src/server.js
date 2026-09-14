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

// Temporary diagnostic — shows exactly what CORS_ORIGIN parsed to on the
// live server, and what origin the request itself carried. Not sensitive,
// safe to leave public short-term; remove once the CORS mismatch is sorted.
app.get("/debug/cors", (req, res) => {
  res.json({ allowedOrigins, requestOrigin: req.headers.origin ?? null });
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

// Any logged-in user can vote (matches the original app's reorder-by-drag
// behavior) — not admin-gated like the routes above.
//
// Dragging is now a top-3 ranked ballot rather than a direct reorder: the
// first 3 ids get 3/2/1 points, everything past that gets none. Re-voting
// replaces the caller's previous ballot (see supabase/003_voting.sql) —
// their points move to whichever memes they rank now, they don't add up
// across repeated drags. The hall-of-fame order is then recomputed from
// every user's total points, with ties keeping their existing order so
// memes nobody has ranked don't jump around.
app.post("/api/memes/reorder", requireUser, async (req, res) => {
  const { orderedIds } = req.body ?? {};
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return res.status(400).json({ error: "orderedIds must be a non-empty array." });
  }

  const ballot = orderedIds.slice(0, 3).map((id, index) => ({ id, points: 3 - index }));

  const client = await pool.connect();
  try {
    await client.query("begin");

    await client.query("delete from meme_votes where voter_id = $1", [req.user.id]);
    for (const { id, points } of ballot) {
      // Only inserts for memes that actually exist and are approved — a
      // stale/tampered id in the payload is silently skipped rather than
      // failing the whole vote.
      await client.query(
        `insert into meme_votes (meme_id, voter_id, points)
         select $1, $2, $3 where exists (
           select 1 from memes where id = $1 and status = 'approved'
         )`,
        [id, req.user.id, points],
      );
    }

    await client.query(`
      with totals as (
        select m.id, coalesce(sum(v.points), 0) as total_votes, m.sort_order as old_order
        from memes m
        left join meme_votes v on v.meme_id = m.id
        where m.status = 'approved'
        group by m.id, m.sort_order
      ), ranked as (
        select id, row_number() over (order by total_votes desc, old_order asc) - 1 as new_order
        from totals
      )
      update memes set sort_order = ranked.new_order
      from ranked
      where memes.id = ranked.id
    `);

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

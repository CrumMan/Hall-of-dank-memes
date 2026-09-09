# Meme Hall of Fame — API

A small Express server that handles the admin-only mutations (approve, edit,
delete, reorder) for the Meme Hall of Fame app. Everything else — reading
memes, signing up/logging in, submitting a new meme — talks to Supabase
directly from the frontend and is governed by Row Level Security instead
(see `../supabase/schema.sql`).

## Why this exists

Reads and inserts are safe to leave to Supabase's Row Level Security
policies. Mutations that need a real admin-role check, and the atomic
bulk reorder, live here instead — using a direct Postgres connection
(`DATABASE_URL`) rather than going back out through Supabase's REST API.

## Auth model — no service_role/secret key

This backend verifies each request's Supabase access token by asking
Supabase's own Auth API to resolve it (`GET /auth/v1/user`, using just the
public anon/publishable key), then re-checks the caller's role directly
against the `profiles` table before allowing an admin-only mutation. It
never holds the Supabase `service_role`/secret key — on purpose, to keep
the one credential that bypasses all Row Level Security out of a service
that's reachable from the internet.

**Trade-off:** deleting a meme only removes its database row. The
underlying file stays in Supabase Storage — actually deleting the S3-backed
object needs the service_role key. Fine for a workshop project (orphaned
files just sit there); revisit if this becomes a real deployment.

## Local development

```bash
cp .env.example .env   # then fill in real values
npm install
npm run dev             # restarts on file changes
```

## Deploying

Deployed as a Render Web Service — see `../render.yaml`. Set `DATABASE_URL`,
`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `CORS_ORIGIN` (the deployed
frontend's URL) in the Render dashboard.

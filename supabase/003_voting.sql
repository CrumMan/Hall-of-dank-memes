-- Meme Hall of Fame — incremental migration #3
-- Run this in the SQL Editor AFTER 002_admin_and_ordering.sql. Turns
-- "reorder" into a top-3 ranked vote per user instead of a single
-- shared order anyone can drag around freely.
--
-- Each signed-in user gets one ballot: 1st place = 3 points, 2nd = 2,
-- 3rd = 1 (6 points total, tracked per user so a re-vote can be told
-- apart from a first vote). Re-voting replaces that user's previous
-- picks — the points move to whichever memes they rank now, they don't
-- pile up from repeated drags. A meme's position in the hall of fame is
-- the sum of every user's points for it; ties keep the existing
-- relative order instead of reshuffling.

create table if not exists public.meme_votes (
  meme_id uuid not null references public.memes(id) on delete cascade,
  voter_id uuid not null references auth.users(id) on delete cascade,
  points integer not null check (points between 1 and 3),
  updated_at timestamptz not null default now(),
  primary key (meme_id, voter_id)
);

-- No insert/update/delete/select policies: writes and vote-aware reads go
-- through the backend, which connects as the postgres role directly
-- (DATABASE_URL) and bypasses RLS, same as the memes admin mutations. This
-- just makes sure PostgREST/anon/authenticated clients can't read or write
-- it directly.
alter table public.meme_votes enable row level security;

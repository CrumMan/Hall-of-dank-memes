-- Meme Hall of Fame — incremental migration #2
-- Run this in the SQL Editor AFTER schema.sql. Adds:
--   1. submitted_by_email — a denormalized display column (avoids a
--      PostgREST join just to show who submitted a meme).
--   2. An auto-assign-sort_order trigger, so approving a meme (or an admin
--      submitting one pre-approved) always lands at the end of the order
--      without the client having to compute max(sort_order) itself.
--   3. A relaxed insert policy so an admin's own submissions can go straight
--      to status = 'approved' instead of always landing in 'pending'.

alter table public.memes add column if not exists submitted_by_email text not null default '';

create or replace function public.assign_sort_order()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'approved' and new.sort_order is null then
    select coalesce(max(sort_order), -1) + 1 into new.sort_order
    from public.memes
    where status = 'approved';
  end if;
  return new;
end;
$$;

drop trigger if exists memes_assign_sort_order on public.memes;
create trigger memes_assign_sort_order
  before insert or update on public.memes
  for each row execute function public.assign_sort_order();

drop policy if exists "memes: authenticated users submit pending" on public.memes;
create policy "memes: authenticated users submit" on public.memes
  for insert to authenticated
  with check (
    auth.uid() = submitted_by
    and (status = 'pending' or (status = 'approved' and public.is_admin()))
  );

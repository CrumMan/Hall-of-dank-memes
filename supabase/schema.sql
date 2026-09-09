-- Meme Hall of Fame — Supabase schema
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).

-- ── profiles ────────────────────────────────────────────────────────────
-- One row per auth.users row, holding the app-level role. Real admin status
-- lives here (set by hand via SQL below), not in client-side code.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Auto-create a profile row whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper used by policies below — avoids recursive RLS checks on profiles.
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create policy "profiles: read own row" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: admins read all" on public.profiles
  for select using (public.is_admin());

-- ── memes ───────────────────────────────────────────────────────────────
create table if not exists public.memes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  media_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  categories text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'approved')),
  submitted_by uuid references auth.users(id) on delete set null,
  sort_order integer,
  created_at timestamptz not null default now()
);

alter table public.memes enable row level security;

create policy "memes: anyone reads approved" on public.memes
  for select using (status = 'approved');

create policy "memes: owner reads own pending" on public.memes
  for select using (auth.uid() = submitted_by);

create policy "memes: admins read all" on public.memes
  for select using (public.is_admin());

create policy "memes: authenticated users submit pending" on public.memes
  for insert to authenticated
  with check (auth.uid() = submitted_by and status = 'pending');

create policy "memes: admins update" on public.memes
  for update using (public.is_admin());

create policy "memes: admins delete" on public.memes
  for delete using (public.is_admin());

-- ── storage bucket for uploaded images/videos ─────────────────────────────
insert into storage.buckets (id, name, public)
values ('meme-media', 'meme-media', true)
on conflict (id) do nothing;

create policy "meme-media: public read" on storage.objects
  for select using (bucket_id = 'meme-media');

create policy "meme-media: authenticated upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'meme-media');

-- ── promote yourself to admin ──────────────────────────────────────────
-- After you've created your account (sign up in the app, or Dashboard →
-- Authentication → Users → Add user), run this with your real email:
--
-- update public.profiles set role = 'admin' where email = 'you@example.com';

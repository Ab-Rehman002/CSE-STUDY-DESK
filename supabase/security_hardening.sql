-- CSE Study Desk — security hardening migration
-- Run in Supabase Dashboard → SQL Editor. Read every step before running
-- against a project that already has real data.

-- ============================================================
-- STEP 0 (do this in the Dashboard UI, not SQL) — make ONE
-- account an admin:
--   Authentication → Users → (your class-rep account) → Edit
--   → User App Metadata → set to:  { "is_admin": true }
-- app_metadata can only be edited from the Dashboard or with a
-- service-role key — a signed-in user can never grant this to
-- themselves, which is exactly why the app is allowed to trust it.
--
-- Also recommended: Authentication → Settings → turn OFF "Allow
-- new users to sign up", since this app only ever needs one admin
-- account, created by you.
-- ============================================================

-- ============================================================
-- STEP 1 — lock down kv_store (courses, notices, semesters, meta).
-- Public can read it (it's public exam info). Only the admin
-- account can write to it — this replaces "the login screen" as
-- the actual enforcement point.
-- ============================================================
alter table public.kv_store enable row level security;

drop policy if exists "kv_store_public_read" on public.kv_store;
create policy "kv_store_public_read"
  on public.kv_store for select
  using (true);

drop policy if exists "kv_store_admin_write" on public.kv_store;
create policy "kv_store_admin_write"
  on public.kv_store for all
  using (coalesce((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false))
  with check (coalesce((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false));

-- ============================================================
-- STEP 2 — community resources get their OWN table, not a key
-- inside kv_store. Anyone can post here without logging in — that
-- is intentional. Keeping it separate means this open policy can
-- never accidentally cover courses or notices.
-- ============================================================
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  course_id text not null,
  title text not null check (char_length(title) between 1 and 120),
  url text not null check (char_length(url) between 1 and 500 and url ~ '^https?://'),
  author text not null default 'Anonymous' check (char_length(author) <= 60),
  created_at timestamptz not null default now()
);

alter table public.community_posts enable row level security;

drop policy if exists "community_public_read" on public.community_posts;
create policy "community_public_read"
  on public.community_posts for select
  using (true);

drop policy if exists "community_public_insert" on public.community_posts;
create policy "community_public_insert"
  on public.community_posts for insert
  with check (true);

drop policy if exists "community_admin_delete" on public.community_posts;
create policy "community_admin_delete"
  on public.community_posts for delete
  using (coalesce((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false));

create index if not exists community_posts_course_id_idx on public.community_posts (course_id);

-- ============================================================
-- STEP 3 (optional, one-time) — migrate existing community data
-- out of kv_store into the new table. Run this AFTER steps 1 & 2,
-- check the results, THEN uncomment and run the delete below.
-- ============================================================
-- insert into public.community_posts (course_id, title, url, author, created_at)
-- select
--   split_part(key, ':', 2) as course_id,
--   item ->> 'title',
--   item ->> 'url',
--   coalesce(item ->> 'author', 'Anonymous'),
--   to_timestamp((item ->> 'ts')::bigint / 1000.0)
-- from public.kv_store, jsonb_array_elements(value -> 'resources') as item
-- where key like 'community:%';
--
-- delete from public.kv_store where key like 'community:%';

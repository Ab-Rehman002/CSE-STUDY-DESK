# Handoff notes

## 1. Security — do this before you deploy

This code assumes the database side is fixed too. The code changes alone
don't close the hole — you have to run the SQL.

1. **Make your account an admin.** Supabase Dashboard → Authentication →
   Users → your class-rep account → Edit → User App Metadata → set to:
   ```json
   { "is_admin": true }
   ```
   This field can only be set from the Dashboard or a service-role key —
   never from the browser — which is why it's safe to trust.

2. **Run `supabase/security_hardening.sql`** in Supabase Dashboard → SQL
   Editor. It:
   - Enables Row-Level Security on `kv_store` (public read, admin-only write)
   - Creates a separate `community_posts` table with its own policy
     (open insert, admin-only delete) so the public posting feature can
     never leak into courses/notices
   - Adds length + URL-format checks at the database level, not just in
     the UI

3. **(Recommended) Turn off public sign-up** — Authentication → Settings
   → "Allow new users to sign up" → off. This app only ever needs the one
   admin account you already have.

4. **Set environment variables** — copy `.env.example` to `.env` locally,
   and add the same two variables in Vercel → Project → Settings →
   Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

   These are safe to expose in the browser bundle (that's what the anon
   key is for) — but they no longer belong hardcoded in source.

5. If you have existing community posts sitting in `kv_store` under
   `community:*` keys, there's a commented-out migration query at the
   bottom of the SQL file to move them into the new table before you
   delete the old rows.

## 2. What changed visually

- **Typography**: Fraunces (display/serif) for subject names and titles,
  IBM Plex Sans for UI text, IBM Plex Mono for dates/countdown/course
  codes — replacing the unused Georgia declaration and default system
  sans.
- **Palette**: one accent (desk-lamp amber) instead of four, cooler
  near-black instead of warm brown-black, three semantic colors
  (red/amber/green) for urgency instead of scattered hues.
- **No more ambient blobs, cursor-glow, or grain overlay.** Replaced with
  a static, motionless dot-grid texture — a graph-paper nod, not a
  generated-gradient cliché.
- **Glassmorphism removed** except the sticky header, which keeps a
  functional blur.
- **All emoji replaced** with `@tabler/icons-react` — new dependency,
  already in `package.json`.
- **Home page restructured** into a two-column dashboard: course list
  grouped by Upcoming / Not Scheduled / Completed on the left, a new
  `TimelinePanel` sidebar on the right (same data, second view — no new
  backend calls). Same routes, same data model — nothing in your Supabase
  schema needs to change for this part.
- Filter chips unified into the same underline-tab style used elsewhere
  in the app (Admin, Course Detail), instead of two different selector
  patterns.

## 3. Before you ship

```
npm install
npm run build
```

This was already run once during the redesign and built clean. Re-run it
yourself after you drop in real Supabase credentials, and click through
the Admin flow with your `is_admin` account before you trust it in
production.

# Owner admin panel

The panel lives at **`/#admin`** on the deployed site. One password, no accounts.
It manages three things: **properties**, **notices** (a short strip across the
site) and **articles**.

---

## How it fits together

```
ui/  React SPA (this is what Vercel serves)      api/  serverless functions      Neon Postgres
  public pages ──fetch──► GET /api/properties, /api/notices, /api/blogs
  /#admin      ──fetch──► /api/admin/*  ← every one of these checks the session
  photographs  ─────────► Vercel Blob (uploaded straight from the browser)
```

Public reads are open. **Every write is behind the session check** — see
`api/_lib/auth.ts`, and `requireSession` as the first line of every
`api/admin/*` handler.

> The PHP panel in `admin/` is the previous system. It is not deployed and does
> not run — Vercel serves the React build, and no PHP runtime is configured.
> Do not deploy it: its `admin/include/function_do.php` performs every
> INSERT/UPDATE/DELETE **with no session check at all**, so anything reachable
> could be deleted by anyone. It is kept only for its `admin/assets/` images and
> documents.

---

## First-time setup

**1. Database.** Add the Neon (or Vercel Postgres) integration to the project.
It sets `DATABASE_URL` for you. Then create the tables and load the two listings
the site already ships with:

```bash
npm install
DATABASE_URL="postgres://…" npm run db:setup
```

Safe to re-run — it never overwrites a listing edited through the panel.

**2. Password.** Generate the hash and a session secret:

```bash
npm run hash-password
```

It prints `ADMIN_PASSWORD_HASH=…` and `SESSION_SECRET=…`. The plaintext is never
stored anywhere.

**3. Blob storage.** Create a Vercel Blob store; it sets `BLOB_READ_WRITE_TOKEN`.

**4. Environment variables** — set all four in *Project → Settings →
Environment Variables*:

| Variable | Where it comes from |
|---|---|
| `DATABASE_URL` | Neon / Vercel Postgres integration |
| `ADMIN_PASSWORD_HASH` | `npm run hash-password` |
| `SESSION_SECRET` | `npm run hash-password` (printed alongside) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob store |

Changing `SESSION_SECRET` signs everyone out immediately — which is how you
revoke access if the password is ever shared by mistake.

### The kill switch, stated plainly

Sessions carry no id, so there is nothing to revoke individually. **Signing out
only clears your own browser's cookie — it does not invalidate the token.** A
cookie copied off a machine stays valid for the rest of its 8 hours.

If you believe a session or the password has been exposed, the actual remedy is:

1. `npm run hash-password` → set the new `ADMIN_PASSWORD_HASH`
2. **Also replace `SESSION_SECRET`** (the same command prints a fresh one)
3. Redeploy

Step 2 is the one that matters — it invalidates every outstanding token at once.
Changing only the password leaves an already-stolen cookie working.

### Least-privilege database role

The API needs to read and write four tables and nothing else. Creating a role
scoped to exactly that means a leaked `DATABASE_URL` cannot drop tables or read
the system catalogue. In the Neon SQL editor:

```sql
CREATE ROLE dre_app LOGIN PASSWORD 'a-long-random-password';
GRANT CONNECT ON DATABASE neondb TO dre_app;
GRANT USAGE ON SCHEMA public TO dre_app;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON properties, notices, blogs, login_attempts TO dre_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO dre_app;
```

Then point `DATABASE_URL` at `dre_app` rather than the owner role. Run
`npm run db:setup` **before** switching, since creating tables needs the owner.

> Row-level security is deliberately not used. RLS earns its keep when untrusted
> clients hold a database key and connect directly. Here only the serverless
> functions ever open a connection, there is one owner and no tenants — policies
> would guard a door nobody can reach. The role above addresses the real risk
> (a leaked connection string) more directly.

---

## Running it locally

```bash
npm install && npm --prefix ui install
npx vercel dev            # serves the site and /api together
```

`npm --prefix ui run dev` alone runs the front end only; `/api` will 404 and the
site falls back to the listings committed in
`ui/src/components/sections/properties/properties-data.ts`.

Check the security-critical logic — password hashing, session tokens, and the
input allow-lists — at any time, no database required:

```bash
npm run selfcheck
```

---

## Day to day

**Properties.** *New property* → fill in the form → tick **Published**. Until
that box is ticked the listing is a draft and no visitor can reach it. The page
address is generated from the name and then fixed, because it is what links
point at. The first photograph is the cover; reorder with the ← → buttons.

**Notices.** A one-line announcement shown across the top of every page, with an
optional start and end. Leave both dates blank for "show it until I turn it off".
Visitors can dismiss it for their session.

**Articles.** Title, summary, cover, and a Markdown body (`**bold**`, `_italic_`,
`# heading`, `- list`, `[text](url)`). Published articles appear at `/#blog`.

---

## Notes for whoever maintains this

- **Queries are parameterised by construction.** `api/_lib/db.ts` exports the
  Neon tagged template, so `sql\`… WHERE id = ${id}\`` binds rather than splices.
  Never build a query by concatenation.
- **Input is allow-listed, never spread.** `api/_lib/validate.ts` rebuilds each
  payload field by field. This is what stops a crafted request setting
  `published` — the exact hole the old PHP endpoint had.
- **Photographs upload straight to Blob**, not through the function: a serverless
  request body is capped at 4.5 MB and phone photographs are routinely larger.
  `/api/admin/upload` only mints the token, and re-checks the session while
  doing so.
- **The site degrades rather than emptying.** If the API is unreachable, the
  listings committed in `properties-data.ts` are shown instead of a blank page.
  Keep that array roughly current for exactly that reason.

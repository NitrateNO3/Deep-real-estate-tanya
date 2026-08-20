-- Deep Real Estate — schema for the owner admin panel.
--
-- The legacy PHP app was database-driven but shipped no schema dump, so its
-- table shapes only ever existed implicitly inside queries. This file is the
-- explicit source of truth for the new stack.
--
-- The property columns deliberately mirror the `PropertyDetail` TypeScript type
-- in ui/src/components/sections/properties/properties-data.ts. The repeating
-- structures (gallery, specs, overview rows, paragraphs, features) are stored as
-- jsonb rather than being normalised into child tables: they are always read and
-- written as a whole listing, they are ordered, and keeping the exact shape means
-- the front end needs no remodelling and no join.
--
-- Apply with:  node scripts/db-setup.mjs      (or psql "$DATABASE_URL" -f db/schema.sql)
-- Safe to re-run.

CREATE TABLE IF NOT EXISTS properties (
  -- The slug used in the URL hash (#property-suncity-floors). Chosen by the
  -- owner, stable for the life of the listing so links never rot.
  id            text PRIMARY KEY,
  -- The office's own reference number, shown beside the address.
  property_id   text        NOT NULL DEFAULT '',
  name          text        NOT NULL,
  location      text        NOT NULL,
  address       text        NOT NULL DEFAULT '',
  price         text        NOT NULL DEFAULT '',
  -- Pre-formatted, because the units are not uniform: some listings are quoted
  -- per square yard and others as a flat figure.
  price_unit    text,
  badge         text,
  -- The card image. By convention the same photograph as images[0], so the card
  -- and the detail page open on the same frame.
  image         text        NOT NULL DEFAULT '',
  images        jsonb       NOT NULL DEFAULT '[]'::jsonb,  -- string[]
  specs         jsonb       NOT NULL DEFAULT '[]'::jsonb,  -- {label,value}[]
  overview      jsonb       NOT NULL DEFAULT '[]'::jsonb,  -- {label,value}[]
  description   jsonb       NOT NULL DEFAULT '[]'::jsonb,  -- string[] (one per paragraph)
  features      jsonb       NOT NULL DEFAULT '[]'::jsonb,  -- string[]
  -- New listings start as drafts: nothing reaches the public site until the
  -- owner publishes it deliberately.
  published     boolean     NOT NULL DEFAULT false,
  sort_order    integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- The public listing query is "published, in display order".
CREATE INDEX IF NOT EXISTS properties_published_idx
  ON properties (published, sort_order, created_at DESC);

-- Short dated announcements shown as a strip on the site.
CREATE TABLE IF NOT EXISTS notices (
  id         serial PRIMARY KEY,
  body       text        NOT NULL,
  -- Optional window. NULL start = live immediately, NULL end = until unpublished,
  -- so the common case needs no dates at all.
  starts_at  timestamptz,
  ends_at    timestamptz,
  published  boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notices_active_idx ON notices (published, starts_at, ends_at);

-- Full articles with their own page.
CREATE TABLE IF NOT EXISTS blogs (
  id           serial PRIMARY KEY,
  -- Unique because it addresses the article's page (#blog-<slug>).
  slug         text        NOT NULL UNIQUE,
  title        text        NOT NULL,
  excerpt      text        NOT NULL DEFAULT '',
  cover_image  text,
  body         text        NOT NULL DEFAULT '',   -- markdown
  published    boolean     NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS blogs_published_idx ON blogs (published, published_at DESC);

-- Login throttling. This lives in the database on purpose: serverless functions
-- are per-invocation, so an in-process counter would reset constantly and give
-- an attacker unlimited attempts.
CREATE TABLE IF NOT EXISTS login_attempts (
  id           bigserial PRIMARY KEY,
  ip           text        NOT NULL,
  succeeded    boolean     NOT NULL DEFAULT false,
  attempted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS login_attempts_ip_idx ON login_attempts (ip, attempted_at DESC);

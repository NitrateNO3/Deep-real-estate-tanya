/*
  Local API server for testing the admin panel end to end, with no external
  database, no Docker and no Vercel account.

  It stands up an in-process Postgres (PGlite), installs a Neon-compatible
  tagged-template on globalThis so the real handlers query it unchanged, applies
  db/schema.sql and db/seed.json, then serves the compiled /api routes on :3000.
  Vite (port 5173) proxies /api here — so `npm run dev:local` at the repo root
  runs both and you open http://127.0.0.1:5173.

  This is a test harness, not part of the deploy. Production still runs the same
  handlers against Neon via DATABASE_URL; none of this code ships.

  Known local gap: image upload needs Vercel Blob, which has no local stand-in,
  so /api/admin/upload returns 501 here. Everything else — login, property /
  notice / article CRUD, publish/draft, the public reads — works.
*/
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { hashPassword } from '../.local-api/_lib/auth.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

/* Fixed dev secrets so a restart keeps you logged in and the file-backed DB
   stays readable. These never leave your machine. */
const DEV_PASSWORD = 'local-admin-password';
process.env.SESSION_SECRET ||= 'local-dev-session-secret-not-for-production';
process.env.ADMIN_PASSWORD_HASH ||= hashPassword(DEV_PASSWORD);

/* ---------------------------------------------------------------- database */

const { PGlite } = await import('@electric-sql/pglite');
const pg = await PGlite.create(join(root, '.local-db'));

/*
  A stand-in for Neon's tagged-template. Neon returns the rows array directly
  from `sql`…`` and also exposes `sql.query(text, params)`; PGlite returns
  `{ rows }`, so both forms are adapted to hand back a plain array.
*/
const sql = Object.assign(
  async (strings, ...values) => {
    const text = strings.reduce((acc, s, i) => acc + s + (i < values.length ? `$${i + 1}` : ''), '');
    const { rows } = await pg.query(text, values);
    return rows;
  },
  {
    query: async (text, params = []) => {
      const { rows } = await pg.query(text, params);
      return rows;
    },
  },
);
globalThis.__LOCAL_SQL__ = sql;

// Schema, then seed. Split on end-of-line semicolons — the file is plain DDL.
const schema = await readFile(join(root, 'db', 'schema.sql'), 'utf8');
for (const stmt of schema.split(/;\s*$/m).map((s) => s.trim())) {
  if (stmt && !stmt.split('\n').every((l) => l.trim().startsWith('--'))) await pg.exec(stmt);
}
const seed = JSON.parse(await readFile(join(root, 'db', 'seed.json'), 'utf8'));
for (const p of seed) {
  await sql`
    INSERT INTO properties (id, property_id, name, location, address, price, price_unit, badge,
      image, images, specs, overview, description, features, published, sort_order)
    VALUES (${p.id}, ${p.propertyId}, ${p.name}, ${p.location}, ${p.address}, ${p.price},
      ${p.priceUnit}, ${p.badge}, ${p.image},
      ${JSON.stringify(p.images)}::jsonb, ${JSON.stringify(p.specs)}::jsonb,
      ${JSON.stringify(p.overview)}::jsonb, ${JSON.stringify(p.description)}::jsonb,
      ${JSON.stringify(p.features)}::jsonb, ${p.published}, ${p.sortOrder})
    ON CONFLICT (id) DO NOTHING`;
}

/* ------------------------------------------------------- route resolution */

/*
  Map a request path to the compiled handler file, mirroring Vercel's file
  routing: /api/admin/properties → admin/properties/index.js, and a trailing
  segment → the [id]/[slug] file with that segment as a query param.
*/
const API_DIR = join(root, '.local-api');

function resolveRoute(pathname) {
  const rel = pathname.replace(/^\/api\//, '').replace(/\/$/, '');
  const parts = rel.split('/').filter(Boolean);

  // Exact file or folder index.
  const asFile = join(API_DIR, `${parts.join('/')}.js`);
  if (existsSync(asFile)) return { file: asFile, params: {} };
  const asIndex = join(API_DIR, ...parts, 'index.js');
  if (existsSync(asIndex)) return { file: asIndex, params: {} };

  // Dynamic segment: drop the last part, look for a [param] sibling.
  if (parts.length > 0) {
    const head = parts.slice(0, -1);
    const last = parts.at(-1);
    const dir = join(API_DIR, ...head);
    if (existsSync(dir)) {
      const dyn = readdirSync(dir).find((f) => /^\[.+\]\.js$/.test(f));
      if (dyn) {
        const name = dyn.slice(1, -4); // [id].js -> id
        return { file: join(dir, dyn), params: { [name]: decodeURIComponent(last) } };
      }
    }
  }
  return null;
}

/* ----------------------------------------------- Vercel req/res adaptation */

function parseCookies(header = '') {
  const out = {};
  for (const pair of header.split(';')) {
    const i = pair.indexOf('=');
    if (i > 0) out[pair.slice(0, i).trim()] = decodeURIComponent(pair.slice(i + 1).trim());
  }
  return out;
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  if (!chunks.length) return undefined;
  const raw = Buffer.concat(chunks).toString('utf8');
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1:3000');

  if (!url.pathname.startsWith('/api/')) {
    res.writeHead(404).end('Not found (this server only handles /api)');
    return;
  }

  if (url.pathname === '/api/admin/upload') {
    res.writeHead(501, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Image upload needs Vercel Blob and is unavailable locally.' }));
    return;
  }

  const route = resolveRoute(url.pathname);
  if (!route) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: `No API route for ${url.pathname}` }));
    return;
  }

  // Shape req/res enough for the handlers: query, cookies, JSON body, and the
  // res.status().json() / setHeader helpers they use.
  const query = Object.fromEntries(url.searchParams);
  Object.assign(query, route.params);
  req.query = query;
  req.cookies = parseCookies(req.headers.cookie);
  req.body = ['POST', 'PUT', 'PATCH'].includes(req.method) ? await readBody(req) : undefined;

  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (obj) => {
    if (!res.headersSent) res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(obj));
    return res;
  };

  try {
    const mod = await import(pathToFileURL(route.file).href);
    await mod.default(req, res);
  } catch (err) {
    console.error('[dev-api]', url.pathname, err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Dev server error — see the terminal.' }));
    }
  }
});

server.listen(3000, '127.0.0.1', () => {
  console.log('\n  Local API ready on http://127.0.0.1:3000');
  console.log('  Database: in-process PGlite at .local-db (persists between runs)');

  // Bring up the Vite dev server too, so one command runs the whole site.
  const vite = spawn('npm', ['--prefix', 'ui', 'run', 'dev'], {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32', // npm is npm.cmd on Windows
  });
  vite.on('exit', (code) => process.exit(code ?? 0));

  console.log('\n  ────────────────────────────────────────────');
  console.log('  Open   http://127.0.0.1:5173         (the site)');
  console.log('  Admin  http://127.0.0.1:5173/#admin');
  console.log(`  Password: ${DEV_PASSWORD}`);
  console.log('  ────────────────────────────────────────────\n');
});

/*
  Creates the tables and loads the two listings the site already carries.

    DATABASE_URL='postgres://…' npm run db:setup

  Safe to run more than once: the schema uses CREATE TABLE IF NOT EXISTS, and the
  seed inserts ON CONFLICT DO NOTHING — so re-running never overwrites a listing
  the owner has since edited through the panel.
*/
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { neon } from '@neondatabase/serverless';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set.\n');
  console.error('Get it from the Neon/Vercel Postgres integration, then:');
  console.error('  DATABASE_URL="postgres://…" npm run db:setup\n');
  process.exit(1);
}

const sql = neon(url);

/* The HTTP driver runs one statement per call, so the file is split on
   semicolons at end of line. The schema is plain DDL — no functions or dollar
   quoting — so this stays correct. */
const schema = await readFile(join(root, 'db', 'schema.sql'), 'utf8');
const statements = schema
  .split(/;\s*$/m)
  .map((s) => s.trim())
  .filter((s) => s && !s.split('\n').every((line) => line.trim().startsWith('--')));

console.log(`Applying schema (${statements.length} statements)…`);
for (const statement of statements) {
  await sql.query(statement);
}
console.log('  tables ready');

const seed = JSON.parse(await readFile(join(root, 'db', 'seed.json'), 'utf8'));
console.log(`Seeding ${seed.length} properties…`);

let inserted = 0;
for (const p of seed) {
  const rows = await sql`
    INSERT INTO properties (
      id, property_id, name, location, address, price, price_unit, badge,
      image, images, specs, overview, description, features, published, sort_order
    ) VALUES (
      ${p.id}, ${p.propertyId}, ${p.name}, ${p.location}, ${p.address}, ${p.price},
      ${p.priceUnit}, ${p.badge}, ${p.image},
      ${JSON.stringify(p.images)}::jsonb, ${JSON.stringify(p.specs)}::jsonb,
      ${JSON.stringify(p.overview)}::jsonb, ${JSON.stringify(p.description)}::jsonb,
      ${JSON.stringify(p.features)}::jsonb, ${p.published}, ${p.sortOrder}
    )
    ON CONFLICT (id) DO NOTHING
    RETURNING id
  `;
  if (rows.length) inserted++;
  console.log(`  ${rows.length ? 'added  ' : 'existed'} ${p.id}`);
}

console.log(`\nDone — ${inserted} added, ${seed.length - inserted} already present.`);

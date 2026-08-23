/* /api/admin/blogs — GET every article (drafts included), POST a new one. */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../_lib/db.js';
import { requireSession } from '../../_lib/auth.js';
import { conflict, handler, json, methodNotAllowed, noStore } from '../../_lib/http.js';
import { toBlog } from '../../_lib/shape.js';
import { blogInput } from '../../_lib/validate.js';

export default handler(async (req: VercelRequest, res: VercelResponse) => {
  if (!requireSession(req, res)) return;   // must stay the first statement
  noStore(res);

  if (req.method === 'GET') {
    const rows = await sql`
      SELECT * FROM blogs ORDER BY COALESCE(published_at, created_at) DESC
    `;
    return json(res, 200, { blogs: rows.map(toBlog) });
  }

  if (req.method === 'POST') {
    const b = blogInput(req.body);

    const existing = await sql`SELECT 1 FROM blogs WHERE slug = ${b.slug} LIMIT 1`;
    if (existing.length > 0) throw conflict(`An article with the slug "${b.slug}" already exists`);

    // Publishing without an explicit date stamps it now, so the index can order
    // by something meaningful straight away.
    const publishedAt = b.publishedAt ?? (b.published ? new Date().toISOString() : null);

    const rows = await sql`
      INSERT INTO blogs (slug, title, excerpt, cover_image, body, published, published_at)
      VALUES (${b.slug}, ${b.title}, ${b.excerpt}, ${b.coverImage}, ${b.body},
              ${b.published}, ${publishedAt})
      RETURNING *
    `;
    return json(res, 201, { blog: toBlog(rows[0]) });
  }

  methodNotAllowed(res, ['GET', 'POST']);
});

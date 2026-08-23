/* GET /api/blogs/:slug — one published article, with its body. */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db.js';
import { handler, json, methodNotAllowed, notFound, publicCache } from '../_lib/http.js';
import { toBlog } from '../_lib/shape.js';

export default handler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const slug = String(req.query.slug ?? '');
  const rows = await sql`
    SELECT * FROM blogs WHERE slug = ${slug} AND published = true LIMIT 1
  `;
  if (rows.length === 0) throw notFound('Article not found');

  publicCache(res, 60);
  json(res, 200, { blog: toBlog(rows[0]) });
});

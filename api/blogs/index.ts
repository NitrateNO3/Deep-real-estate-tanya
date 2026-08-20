/* GET /api/blogs — published articles, newest first, without their bodies. */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db.js';
import { handler, json, methodNotAllowed, publicCache } from '../_lib/http.js';
import { toBlogSummary } from '../_lib/shape.js';

export default handler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const rows = await sql`
    SELECT * FROM blogs
    WHERE published = true
    ORDER BY COALESCE(published_at, created_at) DESC
  `;

  publicCache(res, 60);
  json(res, 200, { blogs: rows.map(toBlogSummary) });
});

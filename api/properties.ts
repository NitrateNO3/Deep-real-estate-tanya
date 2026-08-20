/* GET /api/properties — the published listings the public site renders. */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './_lib/db.js';
import { handler, json, methodNotAllowed, publicCache } from './_lib/http.js';
import { toProperty } from './_lib/shape.js';

export default handler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  // Drafts never leave the database.
  const rows = await sql`
    SELECT * FROM properties
    WHERE published = true
    ORDER BY sort_order ASC, created_at DESC
  `;

  publicCache(res, 60);
  json(res, 200, { properties: rows.map(toProperty) });
});

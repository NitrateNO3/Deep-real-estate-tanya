/* GET /api/notices — announcements that are published and inside their window.

   Both dates are optional: no start means "live now", no end means "until it is
   unpublished", which is the common case and needs no dates at all. */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './_lib/db.js';
import { handler, json, methodNotAllowed, publicCache } from './_lib/http.js';
import { toNotice } from './_lib/shape.js';

export default handler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const rows = await sql`
    SELECT * FROM notices
    WHERE published = true
      AND (starts_at IS NULL OR starts_at <= now())
      AND (ends_at   IS NULL OR ends_at   >  now())
    ORDER BY created_at DESC
  `;

  // Short window: a notice is time-sensitive, so it should not sit in a CDN
  // cache for long after the owner takes it down.
  publicCache(res, 30);
  json(res, 200, { notices: rows.map(toNotice) });
});

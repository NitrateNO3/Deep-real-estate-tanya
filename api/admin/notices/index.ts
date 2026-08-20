/* /api/admin/notices — GET all notices (drafts and expired included), POST a new one. */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../_lib/db.js';
import { requireSession } from '../../_lib/auth.js';
import { handler, json, methodNotAllowed, noStore } from '../../_lib/http.js';
import { toNotice } from '../../_lib/shape.js';
import { noticeInput } from '../../_lib/validate.js';

export default handler(async (req: VercelRequest, res: VercelResponse) => {
  if (!requireSession(req, res)) return;   // must stay the first statement
  noStore(res);

  if (req.method === 'GET') {
    const rows = await sql`SELECT * FROM notices ORDER BY created_at DESC`;
    return json(res, 200, { notices: rows.map(toNotice) });
  }

  if (req.method === 'POST') {
    const n = noticeInput(req.body);
    const rows = await sql`
      INSERT INTO notices (body, starts_at, ends_at, published)
      VALUES (${n.body}, ${n.startsAt}, ${n.endsAt}, ${n.published})
      RETURNING *
    `;
    return json(res, 201, { notice: toNotice(rows[0]) });
  }

  methodNotAllowed(res, ['GET', 'POST']);
});

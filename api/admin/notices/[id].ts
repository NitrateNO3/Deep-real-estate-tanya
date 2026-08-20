/* /api/admin/notices/:id — update or delete one notice. */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../_lib/db.js';
import { requireSession } from '../../_lib/auth.js';
import { badRequest, handler, json, methodNotAllowed, noStore, notFound } from '../../_lib/http.js';
import { toNotice } from '../../_lib/shape.js';
import { noticeInput } from '../../_lib/validate.js';

export default handler(async (req: VercelRequest, res: VercelResponse) => {
  if (!requireSession(req, res)) return;   // must stay the first statement
  noStore(res);

  const id = Number(req.query.id);
  if (!Number.isInteger(id)) throw badRequest('Invalid notice id');

  if (req.method === 'PUT') {
    const n = noticeInput(req.body);
    const rows = await sql`
      UPDATE notices SET
        body = ${n.body}, starts_at = ${n.startsAt}, ends_at = ${n.endsAt},
        published = ${n.published}, updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `;
    if (rows.length === 0) throw notFound('Notice not found');
    return json(res, 200, { notice: toNotice(rows[0]) });
  }

  if (req.method === 'DELETE') {
    const rows = await sql`DELETE FROM notices WHERE id = ${id} RETURNING id`;
    if (rows.length === 0) throw notFound('Notice not found');
    return json(res, 200, { ok: true, id });
  }

  methodNotAllowed(res, ['PUT', 'DELETE']);
});

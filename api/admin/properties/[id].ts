/* /api/admin/properties/:id — read, update or delete one listing. */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../_lib/db.js';
import { requireSession } from '../../_lib/auth.js';
import { handler, json, methodNotAllowed, noStore, notFound } from '../../_lib/http.js';
import { toAdminProperty } from '../../_lib/shape.js';
import { propertyInput } from '../../_lib/validate.js';

export default handler(async (req: VercelRequest, res: VercelResponse) => {
  if (!requireSession(req, res)) return;   // must stay the first statement
  noStore(res);

  const id = String(req.query.id ?? '');

  if (req.method === 'GET') {
    const rows = await sql`SELECT * FROM properties WHERE id = ${id} LIMIT 1`;
    if (rows.length === 0) throw notFound('Property not found');
    return json(res, 200, { property: toAdminProperty(rows[0]) });
  }

  if (req.method === 'PUT') {
    // The id is taken from the URL, never the body: renaming a listing would
    // break every link that already points at it.
    const p = propertyInput(req.body, { withId: false });

    const rows = await sql`
      UPDATE properties SET
        property_id = ${p.propertyId},
        name        = ${p.name},
        location    = ${p.location},
        address     = ${p.address},
        price       = ${p.price},
        price_unit  = ${p.priceUnit},
        badge       = ${p.badge},
        image       = ${p.image},
        images      = ${JSON.stringify(p.images)}::jsonb,
        specs       = ${JSON.stringify(p.specs)}::jsonb,
        overview    = ${JSON.stringify(p.overview)}::jsonb,
        description = ${JSON.stringify(p.description)}::jsonb,
        features    = ${JSON.stringify(p.features)}::jsonb,
        published   = ${p.published},
        sort_order  = ${p.sortOrder},
        updated_at  = now()
      WHERE id = ${id}
      RETURNING *
    `;
    if (rows.length === 0) throw notFound('Property not found');
    return json(res, 200, { property: toAdminProperty(rows[0]) });
  }

  if (req.method === 'DELETE') {
    const rows = await sql`DELETE FROM properties WHERE id = ${id} RETURNING id`;
    if (rows.length === 0) throw notFound('Property not found');
    // Uploaded images are left in blob storage on purpose: the same photograph
    // may be reused by another listing, and an orphaned file is cheaper than a
    // delete that silently breaks a live page.
    return json(res, 200, { ok: true, id });
  }

  methodNotAllowed(res, ['GET', 'PUT', 'DELETE']);
});

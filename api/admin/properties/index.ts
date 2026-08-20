/* /api/admin/properties — GET every listing (drafts included), POST a new one. */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../_lib/db.js';
import { requireSession } from '../../_lib/auth.js';
import { conflict, handler, json, methodNotAllowed, noStore } from '../../_lib/http.js';
import { toAdminProperty } from '../../_lib/shape.js';
import { propertyInput } from '../../_lib/validate.js';

export default handler(async (req: VercelRequest, res: VercelResponse) => {
  if (!requireSession(req, res)) return;   // must stay the first statement
  noStore(res);

  if (req.method === 'GET') {
    const rows = await sql`
      SELECT * FROM properties ORDER BY sort_order ASC, created_at DESC
    `;
    return json(res, 200, { properties: rows.map(toAdminProperty) });
  }

  if (req.method === 'POST') {
    const p = propertyInput(req.body, { withId: true });

    const existing = await sql`SELECT 1 FROM properties WHERE id = ${p.id!} LIMIT 1`;
    if (existing.length > 0) {
      throw conflict(`A property with the id "${p.id}" already exists`);
    }

    const rows = await sql`
      INSERT INTO properties (
        id, property_id, name, location, address, price, price_unit, badge,
        image, images, specs, overview, description, features, published, sort_order
      ) VALUES (
        ${p.id!}, ${p.propertyId}, ${p.name}, ${p.location}, ${p.address}, ${p.price},
        ${p.priceUnit}, ${p.badge}, ${p.image},
        ${JSON.stringify(p.images)}::jsonb, ${JSON.stringify(p.specs)}::jsonb,
        ${JSON.stringify(p.overview)}::jsonb, ${JSON.stringify(p.description)}::jsonb,
        ${JSON.stringify(p.features)}::jsonb, ${p.published}, ${p.sortOrder}
      )
      RETURNING *
    `;
    return json(res, 201, { property: toAdminProperty(rows[0]) });
  }

  methodNotAllowed(res, ['GET', 'POST']);
});

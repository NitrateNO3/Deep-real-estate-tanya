/* POST /api/auth/logout — clear the session cookie. */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clearSessionCookie } from '../_lib/auth.js';
import { handler, json, methodNotAllowed, noStore } from '../_lib/http.js';

export default handler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  noStore(res);
  clearSessionCookie(req, res);
  json(res, 200, { ok: true });
});

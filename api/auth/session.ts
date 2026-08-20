/* GET /api/auth/session — does the caller hold a valid session?
   The admin shell calls this on mount to decide between the panel and the login
   form. It reports only a boolean; there is nothing else to disclose. */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { hasValidSession } from '../_lib/auth.js';
import { handler, json, methodNotAllowed, noStore } from '../_lib/http.js';

export default handler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  noStore(res);
  json(res, 200, { authenticated: hasValidSession(req) });
});

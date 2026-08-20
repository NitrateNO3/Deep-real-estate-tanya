/*
  POST /api/auth/login — { password } → session cookie.

  Throttling is recorded in the database rather than in memory: each serverless
  invocation is a fresh process, so an in-process counter would reset constantly
  and effectively allow unlimited guessing.
*/
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db.js';
import { createSessionToken, setSessionCookie, verifyPassword } from '../_lib/auth.js';
import { handler, json, methodNotAllowed, noStore } from '../_lib/http.js';

const MAX_FAILURES = 10;
const WINDOW = '15 minutes';

function clientIp(req: VercelRequest): string {
  const fwd = req.headers['x-forwarded-for'];
  const raw = Array.isArray(fwd) ? fwd[0] : fwd;
  return (raw?.split(',')[0] ?? req.socket?.remoteAddress ?? 'unknown').trim();
}

export default handler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  noStore(res);

  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (!stored) {
    console.error('[auth] ADMIN_PASSWORD_HASH is not set');
    return json(res, 500, { error: 'Admin login is not configured' });
  }

  const ip = clientIp(req);

  const [{ count }] = (await sql`
    SELECT COUNT(*)::int AS count FROM login_attempts
    WHERE ip = ${ip}
      AND succeeded = false
      AND attempted_at > now() - ${WINDOW}::interval
  `) as { count: number }[];

  if (count >= MAX_FAILURES) {
    return json(res, 429, { error: 'Too many attempts. Try again in a few minutes.' });
  }

  const password = (req.body as { password?: unknown } | undefined)?.password;
  const ok = typeof password === 'string' && password.length > 0 && verifyPassword(password, stored);

  await sql`INSERT INTO login_attempts (ip, succeeded) VALUES (${ip}, ${ok})`;

  if (!ok) {
    // One message for every failure: never reveal whether anything matched.
    return json(res, 401, { error: 'Incorrect password' });
  }

  setSessionCookie(req, res, createSessionToken());
  json(res, 200, { ok: true });
});

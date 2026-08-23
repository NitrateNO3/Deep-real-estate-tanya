/*
  POST /api/auth/login — { password } → session cookie.

  Throttling is recorded in the database rather than in memory: each serverless
  invocation is a fresh process, so an in-process counter would reset constantly
  and effectively allow unlimited guessing.

  Three layers, because a per-IP counter alone is weak here:
    · per-IP    — the ordinary case;
    · backoff   — the delay after each failure doubles, so a patient attacker
                  gets slower rather than merely capped;
    · global    — there is exactly ONE account, so a ceiling across all IPs is
                  meaningful and is what actually bounds a botnet or an IPv6 /64
                  (a single subscriber is routinely handed 2^64 addresses, i.e.
                  effectively unlimited per-IP budgets).
  There is no CAPTCHA by choice: on a one-user panel these bound an attack more
  tightly than a widget would, with no third party and nothing to load.
*/
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db.js';
import { createSessionToken, setSessionCookie, verifyPassword } from '../_lib/auth.js';
import { handler, json, methodNotAllowed, noStore } from '../_lib/http.js';

const PER_IP_MAX = 10;
/** Across every IP in the window. One account — nobody legitimate needs more. */
const GLOBAL_MAX = 50;
const WINDOW = '15 minutes';
/** Attempts are kept only long enough to be useful; the IP is personal data. */
const RETENTION = '30 days';

/** Backoff after the 3rd failure: 4s, 8s, 16s … capped at 5 minutes. */
const BACKOFF_AFTER = 3;
const BACKOFF_CAP_S = 300;

/*
  How far back a successful login makes an address "known".

  This exists because a global cap, on its own, hands an attacker a denial of
  service: rotate addresses, trip the ceiling, and the owner is locked out of
  their own panel for the window — repeatedly. An address that has signed in
  successfully is exempt from the GLOBAL ceiling (never from the per-IP one), so
  the owner's usual location keeps working while an attacker — who by definition
  has never succeeded — stays bounded. Verified: without this, a correct password
  from a clean address returns 429 while the ceiling is tripped.
*/
const KNOWN_IP_WINDOW = '30 days';

/*
  The client's address, taken from something the client cannot set.

  `x-forwarded-for` is a chain the caller can prepend to, so its LEFTMOST entry
  is attacker-controlled — reading that would let anyone reset their own counter
  with a header line. Vercel's edge sets `x-real-ip` itself; failing that, the
  RIGHTMOST forwarded entry is the one appended by the nearest trusted proxy.
*/
function clientIp(req: VercelRequest): string {
  const real = req.headers['x-real-ip'];
  if (real) return String(Array.isArray(real) ? real[0] : real).trim();

  const fwd = req.headers['x-forwarded-for'];
  const raw = Array.isArray(fwd) ? fwd[fwd.length - 1] : fwd;
  if (raw) {
    const parts = String(raw).split(',');
    return (parts[parts.length - 1] ?? '').trim() || 'unknown';
  }
  return req.socket?.remoteAddress ?? 'unknown';
}

const tooMany = (res: VercelResponse, retryAfter: number) => {
  res.setHeader('Retry-After', String(retryAfter));
  return json(res, 429, {
    error: 'Too many attempts. Try again in a few minutes.',
    retryAfter,
  });
};

export default handler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  noStore(res);

  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (!stored) {
    console.error('[auth] ADMIN_PASSWORD_HASH is not set');
    return json(res, 500, { error: 'Admin login is not configured' });
  }

  const ip = clientIp(req);

  /* One round trip for every check. `since_last` drives the backoff, the global
     count is what a rotating-IP attacker cannot escape, and `ip_successes` is
     what stops that same ceiling locking the owner out. */
  const [stats] = (await sql`
    SELECT
      COUNT(*) FILTER (
        WHERE ip = ${ip} AND NOT succeeded
          AND attempted_at > now() - ${WINDOW}::interval)::int        AS ip_fails,
      COUNT(*) FILTER (
        WHERE NOT succeeded
          AND attempted_at > now() - ${WINDOW}::interval)::int        AS global_fails,
      EXTRACT(EPOCH FROM (now() - MAX(attempted_at) FILTER (
        WHERE ip = ${ip} AND NOT succeeded
          AND attempted_at > now() - ${WINDOW}::interval)))::int      AS since_last,
      COUNT(*) FILTER (
        WHERE ip = ${ip} AND succeeded
          AND attempted_at > now() - ${KNOWN_IP_WINDOW}::interval)::int AS ip_successes
    FROM login_attempts
    WHERE attempted_at > now() - ${RETENTION}::interval
  `) as {
    ip_fails: number;
    global_fails: number;
    since_last: number | null;
    ip_successes: number;
  }[];

  const ipFails = stats?.ip_fails ?? 0;
  const globalFails = stats?.global_fails ?? 0;
  const sinceLast = stats?.since_last;
  const knownIp = (stats?.ip_successes ?? 0) > 0;

  // Per-IP and backoff always apply, including to a known address.
  if (ipFails >= PER_IP_MAX) return tooMany(res, 900);
  if (!knownIp && globalFails >= GLOBAL_MAX) return tooMany(res, 900);

  // Each failure past the third doubles the wait before the next is accepted.
  if (ipFails >= BACKOFF_AFTER) {
    const required = Math.min(2 ** (ipFails - BACKOFF_AFTER + 2), BACKOFF_CAP_S);
    if (sinceLast !== null && sinceLast !== undefined && sinceLast < required) {
      return tooMany(res, required - sinceLast);
    }
  }

  const password = (req.body as { password?: unknown } | undefined)?.password;
  const ok = typeof password === 'string' && password.length > 0 && verifyPassword(password, stored);

  await sql`INSERT INTO login_attempts (ip, succeeded) VALUES (${ip}, ${ok})`;

  /* Sweep on the way out. This is the only unauthenticated write path in the
     API, so without it the table grows without bound — and it stores IP
     addresses, which should not be kept indefinitely. Cheap: the table stays
     small precisely because this runs, and the ip/attempted_at index covers it. */
  await sql`DELETE FROM login_attempts WHERE attempted_at < now() - ${RETENTION}::interval`;

  if (!ok) {
    // One message for every failure: never reveal whether anything matched.
    return json(res, 401, { error: 'Incorrect password' });
  }

  setSessionCookie(req, res, createSessionToken());
  json(res, 200, { ok: true });
});

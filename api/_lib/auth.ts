/*
  Owner authentication.

  Written against the specific failures of the PHP panel this replaces, which:
    · hashed passwords with unsalted md5();
    · built its login query by string interpolation, so `' OR '1'='1' -- ` in the
      email field logged you straight in;
    · and — the real defect — never checked the session on its write endpoints at
      all, so anyone could call function_do.php?deleteProperty=5.

  So: scrypt with a per-install salt, constant-time comparison everywhere, and a
  single `requireSession` that every admin route calls before it does anything.

  There are no user accounts by design — one owner, one password. The hash lives
  in the ADMIN_PASSWORD_HASH env var (generate with `npm run hash-password`); the
  plaintext is never stored, committed or logged.
*/
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { json } from './http.js';

/*
  The __Host- prefix is a browser-enforced guarantee, not decoration: a cookie
  named this way is only accepted when it is Secure, Path=/ and has no Domain —
  which means a sibling subdomain cannot set it. Without the prefix, anything
  running on another subdomain could push its own `dre_session` for the parent
  domain and the browser would send it here (cookie tossing / session fixation).
  The cookie already met every requirement, so this costs one string.

  Browsers only apply the rule over HTTPS, so plain-http localhost keeps the
  bare name — hence two constants rather than one.
*/
const COOKIE_SECURE_NAME = '__Host-dre_session';
const COOKIE_DEV_NAME = 'dre_session';
/** Eight hours: long enough for a working session, short enough to matter. */
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 } as const;

/* ------------------------------------------------------------------ password */

/** Format: scrypt$<saltHex>$<keyHex> — self-describing so it can be upgraded later. */
export function hashPassword(plain: string): string {
  const salt = randomBytes(16);
  const key = scryptSync(plain, salt, SCRYPT.keylen, {
    N: SCRYPT.N,
    r: SCRYPT.r,
    p: SCRYPT.p,
  });
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;

  const salt = Buffer.from(parts[1], 'hex');
  const expected = Buffer.from(parts[2], 'hex');
  if (salt.length === 0 || expected.length !== SCRYPT.keylen) return false;

  const actual = scryptSync(plain, salt, SCRYPT.keylen, {
    N: SCRYPT.N,
    r: SCRYPT.r,
    p: SCRYPT.p,
  });
  return timingSafeEqual(actual, expected);
}

/* ------------------------------------------------------------------- session */

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error('SESSION_SECRET is missing or too short (need 16+ characters).');
  }
  return s;
}

const b64url = (b: Buffer) => b.toString('base64url');

function sign(payload: string): string {
  return b64url(createHmac('sha256', secret()).update(payload).digest());
}

/** Token = <payload>.<hmac>, payload carrying only an expiry. */
export function createSessionToken(now = Date.now()): string {
  const payload = b64url(Buffer.from(JSON.stringify({ exp: now + SESSION_TTL_MS })));
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined, now = Date.now()): boolean {
  if (!token) return false;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return false;

  const payload = token.slice(0, dot);
  const provided = Buffer.from(token.slice(dot + 1));
  const expected = Buffer.from(sign(payload));

  // Length check first: timingSafeEqual throws on a length mismatch.
  if (provided.length !== expected.length) return false;
  if (!timingSafeEqual(provided, expected)) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return typeof exp === 'number' && exp > now;
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------- cookie */

/*
  Secure is required everywhere except plain-http local development.

  This used to be decided from the request's `Host` header — a value the client
  sends. It was safe only because Vercel's edge rejects hosts not attached to the
  deployment, i.e. the guarantee came from the platform rather than from this
  code. VERCEL_ENV is set by the runtime and cannot be influenced by a request,
  so the attribute no longer keys on untrusted input.
*/
function isSecureContext(): boolean {
  return process.env.VERCEL_ENV !== undefined && process.env.VERCEL_ENV !== 'development';
}

const cookieName = () => (isSecureContext() ? COOKIE_SECURE_NAME : COOKIE_DEV_NAME);

function cookieAttributes(): string[] {
  // Path=/ and no Domain are also what the __Host- prefix requires.
  const bits = ['Path=/', 'HttpOnly', 'SameSite=Strict'];
  if (isSecureContext()) bits.push('Secure');
  return bits;
}

export function setSessionCookie(_req: VercelRequest, res: VercelResponse, token: string) {
  res.setHeader(
    'Set-Cookie',
    [
      `${cookieName()}=${token}`,
      ...cookieAttributes(),
      `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
    ].join('; '),
  );
}

export function clearSessionCookie(_req: VercelRequest, res: VercelResponse) {
  res.setHeader(
    'Set-Cookie',
    [`${cookieName()}=`, ...cookieAttributes(), 'Max-Age=0'].join('; '),
  );
}

export function hasValidSession(req: VercelRequest): boolean {
  /* Read the prefixed name first. Both are checked so a session issued either
     side of a deploy still works, and because a __Host- cookie cannot be forged
     by a subdomain, preferring it is safe. */
  const jar = req.cookies ?? {};
  return verifySessionToken(jar[COOKIE_SECURE_NAME] ?? jar[COOKIE_DEV_NAME]);
}

/*
  The guard. Call this as the FIRST statement of every /api/admin/* handler:

      if (!requireSession(req, res)) return;

  It replies 401 and returns false when the session is missing, forged or
  expired, so the handler returns before reaching the database.
*/
export function requireSession(req: VercelRequest, res: VercelResponse): boolean {
  if (hasValidSession(req)) return true;
  res.setHeader('Cache-Control', 'no-store');
  json(res, 401, { error: 'Not authenticated' });
  return false;
}

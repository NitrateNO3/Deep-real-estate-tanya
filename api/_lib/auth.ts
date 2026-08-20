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

const COOKIE_NAME = 'dre_session';
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

/* Secure is required in production but would stop the cookie being stored over
   plain http on localhost, which is how `vercel dev` runs. */
function isSecureRequest(req: VercelRequest): boolean {
  const host = String(req.headers.host ?? '');
  if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) return false;
  return true;
}

export function setSessionCookie(req: VercelRequest, res: VercelResponse, token: string) {
  const bits = [
    `${COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ];
  if (isSecureRequest(req)) bits.push('Secure');
  res.setHeader('Set-Cookie', bits.join('; '));
}

export function clearSessionCookie(req: VercelRequest, res: VercelResponse) {
  const bits = [`${COOKIE_NAME}=`, 'Path=/', 'HttpOnly', 'SameSite=Strict', 'Max-Age=0'];
  if (isSecureRequest(req)) bits.push('Secure');
  res.setHeader('Set-Cookie', bits.join('; '));
}

export function hasValidSession(req: VercelRequest): boolean {
  return verifySessionToken(req.cookies?.[COOKIE_NAME]);
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

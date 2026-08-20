/* Small HTTP helpers shared by every route: JSON replies, method dispatch and a
   wrapper that turns an unexpected throw into a 500 without leaking internals. */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export function json(res: VercelResponse, status: number, body: unknown) {
  res.status(status).json(body);
}

export function methodNotAllowed(res: VercelResponse, allowed: string[]) {
  res.setHeader('Allow', allowed.join(', '));
  json(res, 405, { error: 'Method not allowed' });
}

/** A request-handling error whose message is safe to show the caller. */
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const badRequest = (message: string) => new HttpError(400, message);
export const notFound = (message = 'Not found') => new HttpError(404, message);
export const conflict = (message: string) => new HttpError(409, message);

/*
  Wraps a handler so a thrown HttpError becomes its own status and anything else
  becomes a generic 500. Unexpected errors are logged server-side but never sent
  to the client — a database error message can disclose schema details.
*/
export function handler(
  fn: (req: VercelRequest, res: VercelResponse) => Promise<void>,
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      await fn(req, res);
    } catch (err) {
      if (err instanceof HttpError) {
        json(res, err.status, { error: err.message });
        return;
      }
      console.error('[api] unhandled error', err);
      json(res, 500, { error: 'Internal server error' });
    }
  };
}

/*
  Public GET responses may be cached briefly at the edge; admin ones never.

  `max-age=0` is the important part: it applies to the *browser*, forcing it to
  revalidate on every load, while `s-maxage` still lets the CDN absorb the
  traffic. Without it the visitor's own cache serves a stale copy — and with
  stale-while-revalidate that meant a notice the owner had just taken down could
  keep showing for minutes on a page they had already visited.
*/
export function publicCache(res: VercelResponse, seconds = 60) {
  res.setHeader(
    'Cache-Control',
    `public, max-age=0, s-maxage=${seconds}, stale-while-revalidate=${seconds * 5}`,
  );
}

export function noStore(res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
}

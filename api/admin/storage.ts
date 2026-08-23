/*
  GET /api/admin/storage — how much of the blob store the photographs occupy.

  There is no "usage" call in the Blob API, so this pages through the listing and
  sums the sizes. That is fine at this scale (a few hundred images) and the panel
  only asks for it on load and after an upload.

  When there is no blob token — the local harness, or a deploy before the store
  is created — this answers `{ available: false }` rather than failing, so the
  panel can simply omit the meter instead of showing a broken one.
*/
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { list } from '@vercel/blob';
import { requireSession } from '../_lib/auth.js';
import { handler, json, methodNotAllowed, noStore } from '../_lib/http.js';

/** Vercel Blob's Hobby tier is 1 GB; override if the plan changes. */
const DEFAULT_LIMIT_MB = 1024;

export default handler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  if (!requireSession(req, res)) return;
  noStore(res);

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return json(res, 200, { available: false });
  }

  let usedBytes = 0;
  let fileCount = 0;
  let cursor: string | undefined;

  // Bounded so a runaway store can never hang the request.
  for (let page = 0; page < 50; page++) {
    const result = await list({ cursor, limit: 1000 });
    for (const blob of result.blobs) {
      usedBytes += blob.size;
      fileCount++;
    }
    if (!result.hasMore || !result.cursor) break;
    cursor = result.cursor;
  }

  const limitBytes = Number(process.env.BLOB_STORAGE_LIMIT_MB ?? DEFAULT_LIMIT_MB) * 1024 * 1024;

  json(res, 200, { available: true, usedBytes, limitBytes, fileCount });
});

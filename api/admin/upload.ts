/*
  POST /api/admin/upload — issues a short-lived token so the browser can upload
  an image straight to Vercel Blob.

  Why client uploads rather than posting the file through this function: a
  serverless request body is capped at 4.5 MB, and a photograph straight off a
  phone is routinely larger. Proxying would work in testing and then fail on the
  owner's real photos, which is the worst kind of bug. Going direct removes the
  cap entirely.

  Auth is enforced inside onBeforeGenerateToken as well as at the top of the
  handler. That matters: the token is what actually grants write access, so the
  check has to sit on the path that mints it, not only on the way in.
*/
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { hasValidSession, requireSession } from '../_lib/auth.js';
import { handler, json, methodNotAllowed, noStore } from '../_lib/http.js';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

export default handler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  if (!requireSession(req, res)) return;
  noStore(res);

  const result = await handleUpload({
    body: req.body as HandleUploadBody,
    request: req as unknown as Request,
    onBeforeGenerateToken: async () => {
      // Re-check: this callback is what authorises the write.
      if (!hasValidSession(req)) throw new Error('Not authenticated');
      return {
        allowedContentTypes: ALLOWED,
        // Keeps a re-uploaded "photo.jpg" from overwriting an earlier one that a
        // published listing is still pointing at.
        addRandomSuffix: true,
        maximumSizeInBytes: 25 * 1024 * 1024,
      };
    },
    onUploadCompleted: async () => {
      /* Nothing to record here — the URL is saved when the owner saves the
         listing, so an abandoned upload never becomes a database row. */
    },
  });

  json(res, 200, result);
});

/*
  The admin panel's calls to /api.

  Every request sends the session cookie (`credentials: 'same-origin'`) and every
  response is checked for 401, which is the server telling us the session has
  expired. When that happens the panel drops back to the login screen rather than
  showing a wall of failed requests.
*/
import { upload } from '@vercel/blob/client';
import type { PropertyDetail } from '@/components/sections/properties/properties-data';

/* `id` is narrowed to string: the site's Property type allows a number for
   historical reasons, but a listing's id is its page address and the API only
   ever issues slugs. */
export type AdminProperty = Omit<PropertyDetail, 'id'> & {
  id: string;
  published: boolean;
  sortOrder: number;
};

export type AdminNotice = {
  id: number;
  body: string;
  startsAt: string | null;
  endsAt: string | null;
  published: boolean;
};

export type AdminBlog = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  body: string;
  published: boolean;
  publishedAt: string | null;
};

/** Thrown for any non-2xx reply; `unauthorised` lets callers bounce to login. */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
  get unauthorised() {
    return this.status === 401;
  }
}

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...init,
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) {
    // The error body is JSON for our own routes, but a platform-level failure
    // (a crashed function, a 502) may not be — don't let that mask the status.
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* keep the status-based message */
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/* ---------------------------------------------------------------- session */

export const checkSession = () =>
  request<{ authenticated: boolean }>('/api/auth/session').then((r) => r.authenticated);

export const login = (password: string) =>
  request<{ ok: true }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });

export const logout = () => request<{ ok: true }>('/api/auth/logout', { method: 'POST' });

/* ------------------------------------------------------------- properties */

export const listProperties = () =>
  request<{ properties: AdminProperty[] }>('/api/admin/properties').then((r) => r.properties);

export const createProperty = (body: Partial<AdminProperty>) =>
  request<{ property: AdminProperty }>('/api/admin/properties', {
    method: 'POST',
    body: JSON.stringify(body),
  }).then((r) => r.property);

export const updateProperty = (id: string, body: Partial<AdminProperty>) =>
  request<{ property: AdminProperty }>(`/api/admin/properties/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  }).then((r) => r.property);

export const deleteProperty = (id: string) =>
  request<{ ok: true }>(`/api/admin/properties/${encodeURIComponent(id)}`, { method: 'DELETE' });

/* ---------------------------------------------------------------- notices */

export const listNotices = () =>
  request<{ notices: AdminNotice[] }>('/api/admin/notices').then((r) => r.notices);

export const createNotice = (body: Partial<AdminNotice>) =>
  request<{ notice: AdminNotice }>('/api/admin/notices', {
    method: 'POST',
    body: JSON.stringify(body),
  }).then((r) => r.notice);

export const updateNotice = (id: number, body: Partial<AdminNotice>) =>
  request<{ notice: AdminNotice }>(`/api/admin/notices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  }).then((r) => r.notice);

export const deleteNotice = (id: number) =>
  request<{ ok: true }>(`/api/admin/notices/${id}`, { method: 'DELETE' });

/* ------------------------------------------------------------------ blogs */

export const listBlogs = () =>
  request<{ blogs: AdminBlog[] }>('/api/admin/blogs').then((r) => r.blogs);

export const createBlog = (body: Partial<AdminBlog>) =>
  request<{ blog: AdminBlog }>('/api/admin/blogs', {
    method: 'POST',
    body: JSON.stringify(body),
  }).then((r) => r.blog);

export const updateBlog = (id: number, body: Partial<AdminBlog>) =>
  request<{ blog: AdminBlog }>(`/api/admin/blogs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  }).then((r) => r.blog);

export const deleteBlog = (id: number) =>
  request<{ ok: true }>(`/api/admin/blogs/${id}`, { method: 'DELETE' });

/* ----------------------------------------------------------------- upload */

/** Longest edge kept, in pixels. The gallery never renders anywhere near this. */
const MAX_EDGE = 2000;
const JPEG_QUALITY = 0.82;
/** Below this, resizing is not worth the quality loss. */
const SKIP_UNDER_BYTES = 300 * 1024;

/*
  Shrinks a photograph before it is uploaded.

  A phone camera produces ~4000px, 5-10 MB files; the largest the site ever
  displays one is about 1600px. Uploading the original would burn through the
  1 GB free tier in ~100 listings for no visible benefit — this typically turns
  8 MB into a few hundred KB with no difference on screen.

  Anything it cannot handle is passed through untouched rather than blocked:
  HEIC in particular is not decodable in every browser, and a failed resize must
  never stop the owner adding a photograph. The server keeps a 10 MB cap for
  those.
*/
export async function prepareImage(file: File): Promise<File> {
  // Canvas would flatten an animated GIF to a single frame.
  if (file.type === 'image/gif' || file.size < SKIP_UNDER_BYTES) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));

    // Already small enough, and re-encoding would only lose quality.
    if (scale === 1 && file.type === 'image/jpeg') {
      bitmap.close();
      return file;
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
    );
    // Flat graphics (a logo, a floor plan) can come out larger as JPEG.
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^./\\]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    return file;                       // undecodable — let the original through
  }
}

/*
  Goes straight from the browser to Vercel Blob, with /api/admin/upload only
  minting the token. A serverless request body is capped at 4.5 MB and a photo
  off a phone is often larger, so proxying the bytes through the function would
  fail on exactly the files the owner most wants to upload.
*/
export async function uploadImage(file: File): Promise<string> {
  const prepared = await prepareImage(file);
  const result = await upload(prepared.name, prepared, {
    access: 'public',
    handleUploadUrl: '/api/admin/upload',
  });
  // Lets the storage meter move as photographs are added, without the uploader
  // and the meter having to know about each other.
  window.dispatchEvent(new Event(UPLOAD_EVENT));
  return result.url;
}

export const UPLOAD_EVENT = 'dre:blob-uploaded';

export type StorageUsage =
  | { available: false }
  | { available: true; usedBytes: number; limitBytes: number; fileCount: number };

export const getStorage = () => request<StorageUsage>('/api/admin/storage');

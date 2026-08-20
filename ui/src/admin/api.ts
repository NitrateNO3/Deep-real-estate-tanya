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

/*
  Goes straight from the browser to Vercel Blob, with /api/admin/upload only
  minting the token. A serverless request body is capped at 4.5 MB and a photo
  off a phone is often larger, so proxying the bytes through the function would
  fail on exactly the files the owner most wants to upload.
*/
export async function uploadImage(file: File): Promise<string> {
  const result = await upload(file.name, file, {
    access: 'public',
    handleUploadUrl: '/api/admin/upload',
  });
  return result.url;
}

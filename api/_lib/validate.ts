/*
  Input validation for the write endpoints.

  Every payload is rebuilt field by field from an explicit allow-list rather than
  being spread into the query. The PHP endpoint this replaces did the opposite —

      foreach($_POST as $key => $value){ $posted[$key] = addslashes($value); }
      DB::insert('propertyList', [$posted]);

  — which let a crafted request set any column it liked, including the `pactive`
  approval flag, so an anonymous submission could publish itself. Listing the
  fields here is what makes that structurally impossible.
*/
import { badRequest } from './http.js';

type Json = Record<string, unknown>;

const asObject = (v: unknown, what: string): Json => {
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw badRequest(`${what} must be an object`);
  return v as Json;
};

function str(src: Json, key: string, { required = false, max = 2000 } = {}): string {
  const v = src[key];
  if (v === undefined || v === null || v === '') {
    if (required) throw badRequest(`"${key}" is required`);
    return '';
  }
  if (typeof v !== 'string') throw badRequest(`"${key}" must be a string`);
  const trimmed = v.trim();
  if (trimmed.length > max) throw badRequest(`"${key}" is too long (max ${max})`);
  return trimmed;
}

function optStr(src: Json, key: string, max = 2000): string | null {
  const s = str(src, key, { max });
  return s === '' ? null : s;
}

function bool(src: Json, key: string, fallback = false): boolean {
  const v = src[key];
  if (v === undefined || v === null) return fallback;
  if (typeof v !== 'boolean') throw badRequest(`"${key}" must be true or false`);
  return v;
}

/*
  `Number.isInteger` alone reads like a bounds check and is not one: it accepts
  1e300, and `Number()` happily coerces `["5"]` and `true`. A value like that
  passes validation and then blows up against an `integer` column as a 500.
  Require a real number, a safe integer, and an explicit range.
*/
function int(src: Json, key: string, { fallback = 0, min = -1e6, max = 1e6 } = {}): number {
  const v = src[key];
  if (v === undefined || v === null || v === '') return fallback;
  if (typeof v !== 'number' && typeof v !== 'string') {
    throw badRequest(`"${key}" must be a whole number`);
  }
  const n = Number(v);
  if (!Number.isSafeInteger(n)) throw badRequest(`"${key}" must be a whole number`);
  if (n < min || n > max) throw badRequest(`"${key}" must be between ${min} and ${max}`);
  return n;
}

/*
  Stored URLs are written into `src` attributes. `img src` is not a
  script-executing context, so this is hygiene rather than an XSS fix — but a
  stored URL should still be a real http(s) address or a site-relative path, not
  arbitrary text.
*/
function urlish(value: string, key: string): string {
  if (value === '') return '';
  if (!/^(https?:\/\/|\/)/i.test(value)) {
    throw badRequest(`"${key}" must be an http(s) address or start with "/"`);
  }
  return value;
}

function strArray(src: Json, key: string, { max = 100, itemMax = 5000 } = {}): string[] {
  const v = src[key];
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v)) throw badRequest(`"${key}" must be a list`);
  if (v.length > max) throw badRequest(`"${key}" has too many entries (max ${max})`);
  return v.map((item, i) => {
    if (typeof item !== 'string') throw badRequest(`"${key}[${i}]" must be a string`);
    const t = item.trim();
    if (t.length > itemMax) throw badRequest(`"${key}[${i}]" is too long`);
    return t;
  }).filter((s) => s !== '');
}

/** The {label, value} rows used by both `specs` and `overview`. */
function factArray(src: Json, key: string, max = 40): { label: string; value: string }[] {
  const v = src[key];
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v)) throw badRequest(`"${key}" must be a list`);
  if (v.length > max) throw badRequest(`"${key}" has too many rows (max ${max})`);
  return v
    .map((row, i) => {
      const o = asObject(row, `"${key}[${i}]"`);
      return { label: str(o, 'label', { max: 200 }), value: str(o, 'value', { max: 500 }) };
    })
    .filter((r) => r.label !== '' || r.value !== '');
}

/** Slugs address a page, so keep them to a safe, predictable alphabet. */
export function slug(src: Json, key: string): string {
  const s = str(src, key, { required: true, max: 120 }).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)) {
    throw badRequest(`"${key}" may contain only lowercase letters, numbers and single hyphens`);
  }
  return s;
}

/* Normalised to ISO rather than passed through: JavaScript accepts date strings
   Postgres rejects, so handing the raw text on turns a bad date into a 500
   instead of a 400. */
function dateOrNull(src: Json, key: string): string | null {
  const v = src[key];
  if (v === undefined || v === null || v === '') return null;
  if (typeof v !== 'string') throw badRequest(`"${key}" must be a date string`);
  const parsed = Date.parse(v);
  if (Number.isNaN(parsed)) throw badRequest(`"${key}" is not a valid date`);
  return new Date(parsed).toISOString();
}

/* ------------------------------------------------------------------ payloads */

export type PropertyInput = ReturnType<typeof propertyInput>;

export function propertyInput(body: unknown, { withId }: { withId: boolean }) {
  const b = asObject(body, 'Body');
  const images = strArray(b, 'images', { max: 40, itemMax: 500 }).map((u, i) =>
    urlish(u, `images[${i}]`),
  );

  // The card image defaults to the first gallery frame, which is the convention
  // the front end already documents ("images[0] is the frame the carousel opens
  // on, and should be the same photograph as image").
  const image = urlish(str(b, 'image', { max: 500 }), 'image') || images[0] || '';

  const out = {
    ...(withId ? { id: slug(b, 'id') } : {}),
    propertyId: str(b, 'propertyId', { max: 60 }),
    name: str(b, 'name', { required: true, max: 300 }),
    location: str(b, 'location', { required: true, max: 300 }),
    address: str(b, 'address', { max: 500 }),
    price: str(b, 'price', { max: 100 }),
    priceUnit: optStr(b, 'priceUnit', 100),
    badge: optStr(b, 'badge', 100),
    image,
    images,
    specs: factArray(b, 'specs'),
    overview: factArray(b, 'overview'),
    description: strArray(b, 'description', { max: 40 }),
    features: strArray(b, 'features', { max: 60, itemMax: 500 }),
    published: bool(b, 'published', false),
    sortOrder: int(b, 'sortOrder', { fallback: 0, min: -10_000, max: 10_000 }),
  };

  return out as typeof out & { id?: string };
}

export function noticeInput(body: unknown) {
  const b = asObject(body, 'Body');
  const startsAt = dateOrNull(b, 'startsAt');
  const endsAt = dateOrNull(b, 'endsAt');
  if (startsAt && endsAt && Date.parse(endsAt) <= Date.parse(startsAt)) {
    throw badRequest('The end date must be after the start date');
  }
  return {
    body: str(b, 'body', { required: true, max: 1000 }),
    startsAt,
    endsAt,
    published: bool(b, 'published', false),
  };
}

export function blogInput(body: unknown) {
  const b = asObject(body, 'Body');
  return {
    slug: slug(b, 'slug'),
    title: str(b, 'title', { required: true, max: 300 }),
    excerpt: str(b, 'excerpt', { max: 600 }),
    coverImage: (() => {
      const v = optStr(b, 'coverImage', 500);
      return v === null ? null : urlish(v, 'coverImage');
    })(),
    body: str(b, 'body', { max: 100_000 }),
    published: bool(b, 'published', false),
    publishedAt: dateOrNull(b, 'publishedAt'),
  };
}

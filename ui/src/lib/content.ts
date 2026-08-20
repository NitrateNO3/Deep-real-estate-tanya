/*
  Site content, fetched once from the API.

  Properties used to be a hardcoded array imported at module load. They now come
  from the database so the owner can edit them from the admin panel — but that
  array is still imported here and used as the **fallback**. If the API is slow,
  down, or not configured yet (a fresh clone with no DATABASE_URL), the site
  renders the listings it shipped with rather than an empty page. A visitor
  should never meet a blank Properties index because of a transient API error.

  The fetch is module-level and happens once per page load, shared by every
  consumer, so mounting several components does not mean several requests.
*/
import { useEffect, useState } from 'react';
import {
  allProperties as fallbackProperties,
  syncProperties,
  type PropertyDetail,
} from '@/components/sections/properties/properties-data';

export type Notice = {
  id: number;
  body: string;
  startsAt: string | null;
  endsAt: string | null;
};

export type BlogSummary = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  publishedAt: string | null;
};

export type BlogPost = BlogSummary & { body: string };

export type SiteContent = {
  properties: PropertyDetail[];
  notices: Notice[];
  blogs: BlogSummary[];
  /** True until the first fetch settles — used to avoid a flash of fallback data. */
  loading: boolean;
  /** Set when the API could not be reached; the site is running on fallback data. */
  offline: boolean;
};

const initial: SiteContent = {
  properties: fallbackProperties,
  notices: [],
  blogs: [],
  loading: true,
  offline: false,
};

let snapshot: SiteContent = initial;
let inFlight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function publish(next: Partial<SiteContent>) {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((l) => l());
}

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function load(): Promise<void> {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const [props, notices, blogs] = await Promise.all([
      getJson<{ properties: PropertyDetail[] }>('/api/properties'),
      getJson<{ notices: Notice[] }>('/api/notices'),
      getJson<{ blogs: BlogSummary[] }>('/api/blogs'),
    ]);

    // Point the sections' default `items` at the live listings. Without this the
    // home page and the index would keep rendering the shipped array.
    if (props?.properties?.length) syncProperties(props.properties);

    publish({
      // An empty listings table is a legitimate answer, but it is far more
      // likely to mean "not seeded yet" than "the firm has no properties" — so
      // the shipped listings stand in rather than showing nothing.
      properties: props?.properties?.length ? props.properties : fallbackProperties,
      notices: notices?.notices ?? [],
      blogs: blogs?.blogs ?? [],
      loading: false,
      offline: props === null,
    });
  })();

  return inFlight;
}

/** Re-fetch after an admin edit so the public pages reflect it immediately. */
export function refreshContent() {
  inFlight = null;
  return load();
}

export function useSiteContent(): SiteContent {
  const [state, setState] = useState(snapshot);

  useEffect(() => {
    const listener = () => setState(snapshot);
    listeners.add(listener);
    void load();
    // A fetch that resolved before this effect ran would otherwise be missed.
    listener();
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return state;
}

export function useBlogPost(slug: string | null) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(Boolean(slug));

  useEffect(() => {
    if (!slug) {
      setPost(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void getJson<{ blog: BlogPost }>(`/api/blogs/${encodeURIComponent(slug)}`).then((data) => {
      if (cancelled) return;
      setPost(data?.blog ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { post, loading };
}

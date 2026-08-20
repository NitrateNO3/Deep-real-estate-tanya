/*
  Database rows → the shapes the front end already uses.

  The public property object is deliberately identical to the `PropertyDetail`
  type in ui/src/components/sections/properties/properties-data.ts, so the site's
  components need no adapting and the hardcoded array can stay as a drop-in
  fallback when the API is unreachable.
*/

type Row = Record<string, any>;

export function toProperty(r: Row) {
  return {
    id: r.id as string,
    propertyId: r.property_id ?? '',
    name: r.name,
    location: r.location,
    address: r.address ?? '',
    price: r.price ?? '',
    priceUnit: r.price_unit ?? undefined,
    badge: r.badge ?? undefined,
    image: r.image ?? '',
    images: (r.images ?? []) as string[],
    specs: (r.specs ?? []) as { label: string; value: string }[],
    overview: (r.overview ?? []) as { label: string; value: string }[],
    description: (r.description ?? []) as string[],
    features: (r.features ?? []) as string[],
  };
}

/** The admin list needs the editorial fields the public shape hides. */
export function toAdminProperty(r: Row) {
  return {
    ...toProperty(r),
    published: r.published as boolean,
    sortOrder: r.sort_order as number,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function toNotice(r: Row) {
  return {
    id: r.id as number,
    body: r.body as string,
    startsAt: r.starts_at,
    endsAt: r.ends_at,
    published: r.published as boolean,
    createdAt: r.created_at,
  };
}

export function toBlog(r: Row) {
  return {
    id: r.id as number,
    slug: r.slug as string,
    title: r.title as string,
    excerpt: r.excerpt ?? '',
    coverImage: r.cover_image ?? null,
    body: r.body ?? '',
    published: r.published as boolean,
    publishedAt: r.published_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/** Index cards don't need the full article body. */
export function toBlogSummary(r: Row) {
  const { body, ...rest } = toBlog(r);
  return rest;
}

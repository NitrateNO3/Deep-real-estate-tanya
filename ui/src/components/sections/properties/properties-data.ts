/* The properties the business actually carries, in one place.

   The office's own photography and its own figures. The home page section, the
   Properties index and every property's detail page all read from this file,
   so none of the three can drift.

   ---------------------------------------------------------------------------
   ADDING A PROPERTY
   ---------------------------------------------------------------------------
   Append one object to `featuredProperties`. Nothing else needs touching:

     · its detail page is generated from this array in registry.tsx, so the
       page exists as soon as the entry does, laid out by the one
       PropertyDetailPage component — title band, gallery, Overview,
       Description, Features, Location, enquire rail, back link, in that
       order. There is no per-property layout to keep in step;
     · its card appears on the Properties index and links to that page;
     · `propertyHref(id)` is the only way anything links to it.

   Every field below is required — TypeScript will not accept a listing that
   omits the description, the features, the Overview rows or the address, which
   is what stops a later entry from quietly being half a page. `checkProperty`
   catches the things types cannot: an empty gallery, an empty Overview, a
   duplicate id.

   Two conventions worth keeping:
     · prices are pre-formatted strings, because the units are not uniform —
       the farmhouse is quoted per square yard, the floors as a figure;
     · `images[0]` is the frame the carousel opens on, and should be the same
       photograph as `image` so the card and the page agree. The hero carousel
       carries as many as you give it — previous/next and the dots appear only
       when there is more than one — and the Gallery box lays them out three
       across. Never point either at a watermarked photograph.
   --------------------------------------------------------------------------- */

import type { Property } from './property-card';

/** A row in the detail page's Overview table. */
export type PropertyFact = { label: string; value: string };

export type PropertyDetail = Property & {
  /** The office's own reference, shown beside the address. */
  propertyId: string;
  /**
   * Gallery, in order; the first is the hero. The detail page lays out three
   * and degrades to however many are actually here, so a listing is never
   * blocked on photography it does not have yet.
   */
  images: string[];
  /** One string per paragraph. */
  description: string[];
  features: string[];
  overview: PropertyFact[];
  /** Full postal address — what the map button searches for. */
  address: string;
};

export const featuredProperties: PropertyDetail[] = [
  {
    id: 'suncity-floors',
    propertyId: '112',
    name: '4 BHK Luxury Floors – Suncity',
    location: 'D Block, Suncity, Gurugram, Haryana, India',
    address: 'D-BLOCK, SHIV SHAKTI-3, Suncity, Sector 54, Gurugram, Haryana 122011, India',
    price: '₹5.50 Cr',
    priceUnit: 'from ₹4.60 Cr',
    badge: 'For Sale · Residential',
    image: '/img/props/suncity-3.jpg',
    /* The three the live listing carries, taken from
       deeprealestate.in/property/premium-4-bhk-luxury-floors-for-sale-d-block-suncity.
       All the firm's own and none watermarked.

       The shot previously held here as suncity-floors.jpg is the same
       photograph as suncity-3, re-encoded — keeping both would have shown the
       same room twice in the carousel, so it is gone and the card points at
       suncity-3 instead. */
    images: [
      '/img/props/suncity-3.jpg',
      '/img/props/suncity-1.jpg',
      '/img/props/suncity-2.jpg',
    ],
    specs: [
      { label: 'Beds', value: '4' },
      { label: 'Baths', value: '4' },
      { label: 'SqFt', value: '2,664' },
    ],
    overview: [
      { label: 'Type', value: 'Apartment · Residential' },
      { label: 'Bedrooms', value: '4' },
      { label: 'Bathrooms', value: '4' },
      { label: 'Built-up area', value: '2,664 SqFt' },
      { label: 'Plot size', value: '296 sq. yards' },
      { label: 'Builder', value: 'Independent Builder' },
      { label: 'Corner property', value: 'Yes' },
      { label: 'Status', value: 'For Sale' },
    ],
    description: [
      'Located in the premium Suncity neighborhood, these 4 BHK luxury floors offer spacious layouts and premium finishes. The 4th floor comes with an exclusive private terrace — perfect for entertaining or a rooftop garden.',
      'The corner positioning ensures excellent ventilation and natural light, and the location is close to schools, hospitals and shopping.',
    ],
    features: [
      'Spacious layouts, premium finishes',
      'Dedicated guest waiting area',
      'Servant quarters',
      'Ample parking',
      'Private terrace (4th floor)',
      'Corner positioning, excellent ventilation',
    ],
  },
  {
    id: 'farmhouse-garatpurbas',
    propertyId: '113',
    name: 'Premium Farmhouse – Garat Pur Bas',
    location: 'Village Garat Pur Bas, Gurugram, Haryana, India',
    address: 'Village Garat Pur Bas, Gurugram, Haryana, India',
    price: 'On call',
    priceUnit: '₹30,000 / sq. yard',
    badge: 'For Sale · Farmhouse',
    image: '/img/props/farmhouse-garatpurbas.jpg',
    images: ['/img/props/farmhouse-garatpurbas.jpg', '/img/props/p2.jpg'],
    specs: [
      { label: 'Plot', value: '3,000 sq. yards' },
      { label: 'Road', value: '30 m' },
    ],
    overview: [
      { label: 'Type', value: 'Farmhouse Plot · Residential' },
      { label: 'Plot size', value: '3,000 sq. yards' },
      { label: 'Road width', value: '30 m' },
      { label: 'Rate', value: '₹30,000 / sq. yard' },
      { label: 'Builder', value: 'Independent' },
      { label: 'Status', value: 'For Sale' },
    ],
    description: [
      'A three-thousand square yard farmhouse plot at Garat Pur Bas, on a thirty-metre road. Quoted per square yard rather than as a lump sum, so the plot can be taken in part.',
      'Suited to a weekend house or a long hold — the belt has been steadily absorbed by the city over the last decade.',
    ],
    features: [
      '30 m road frontage',
      'Boundary wall in place',
      'Electricity connection',
      'Borewell on site',
      'Clear title, complete documentation',
      'Divisible — can be taken in part',
    ],
  },
];

/* What the types cannot state: that the arrays actually have something in
   them, and that no two listings share an id — duplicates would collide in the
   registry and the second page would shadow the first.

   Dev-only and non-fatal. A missing photograph should show up loudly while
   someone is working on the site, not take the live site down for a visitor. */
const checkProperties = (list: PropertyDetail[]) => {
  if (!import.meta.env.DEV) return;
  const seen = new Set<string>();
  for (const p of list) {
    const id = String(p.id);
    const complain = (what: string) =>
      console.error(`[properties-data] ${id}: ${what}. See ADDING A PROPERTY at the top of properties-data.ts.`);

    if (seen.has(id)) complain('duplicate id — its detail page would shadow the earlier one');
    seen.add(id);

    if (!p.images.length) complain('images[] is empty — the gallery has no hero');
    if (!p.overview.length) complain('overview[] is empty — the Overview table would render blank');
    if (!p.description.length) complain('description[] is empty');
    if (!p.features.length) complain('features[] is empty');
    if (!p.address.trim()) complain('address is blank — the map button would search for nothing');
  }
};

export const allProperties: PropertyDetail[] = featuredProperties;

checkProperties(allProperties);

/*
  Replaces the shipped listings with the ones the owner has published, once they
  have been fetched from /api/properties (see src/lib/content.ts).

  The contents are swapped **in place** rather than the binding being reassigned,
  and that is deliberate. Every section takes its listings as a default parameter
  — `items = featuredProperties` — which JavaScript evaluates on each render, not
  once at import. Mutating the array those defaults already point at therefore
  makes all of them live, without threading a prop through the demos, the home
  page and the index.

  The listings above remain the fallback: what the site shows before the first
  fetch returns, and what it keeps showing if the API cannot be reached.
*/
export function syncProperties(next: PropertyDetail[]) {
  if (!next.length) return;              // never blank the site with an empty answer
  featuredProperties.length = 0;
  featuredProperties.push(...next);
  checkProperties(featuredProperties);
}

/** The hash a card points at. One page per property, registered in registry.tsx. */
export const propertyPageId = (id: string | number) => `property-${id}`;
export const propertyHref = (id: string | number) => `#${propertyPageId(id)}`;

/** Which sector sheet stands in for a locality on the detail page. */
export const mapForLocality = (location: string) =>
  location.includes('DLF Phase 3') ? '/img/maps/dlf-phase-3.jpg' : '/img/maps/gurgaon-master-plan.jpg';

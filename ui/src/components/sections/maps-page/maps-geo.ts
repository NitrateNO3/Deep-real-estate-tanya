/* ============================================================================
   MAP PIN COORDINATES — VERIFIED AGAINST OPENSTREETMAP
   ============================================================================

   Every lat/lng below was looked up against OpenStreetMap (Overpass for the
   HUDA sector boundaries, Nominatim for the named colonies) — the same data
   that draws the tiles this page renders, so a pin lands on the label a
   visitor sees underneath it.

   The previous table was a set of hand-guessed estimates and several were
   badly wrong: Sushant Lok 2 sat in Sector 47 when it is in Sector 57, and
   Sectors 21, 22 and 23 sat near the city centre when they are up by the
   Delhi border. Each entry now carries the sector OSM places it in, so the
   next person can spot-check a row without re-running the lookups.

   Two rows are marked APPROX — OSM has no feature for them and they are
   placed inside the correct sector by hand.

   Anything without an entry here simply does not get a pin. It still appears
   in search, in the filters and in the library below the map, so the page is
   complete either way; the map just shows fewer markers.
   ========================================================================= */

/** Legend groups — these are the four pin colours on the map. */
export type MapKind = 'sector' | 'builder' | 'masterplan' | 'commercial';

/** What the sheet actually is, used by the Type filter. */
export type MapType = 'Master plan' | 'Sector layout' | 'Township' | 'Industrial';

/** Which town it belongs to, used by the Location filter. */
export type MapArea = 'Gurugram' | 'Manesar' | 'Dharuhera' | 'Sohna';

export type GeoEntry = {
  lat: number;
  lng: number;
  area: MapArea;
};

export const KIND_LABEL: Record<MapKind, string> = {
  sector: 'Sectors',
  builder: 'Builders',
  masterplan: 'Master Plans',
  commercial: 'Commercial',
};

/** Legend / pin colours, drawn from the palette already in use on the site. */
export const KIND_COLOR: Record<MapKind, string> = {
  sector: '#0080c6',
  builder: '#3d8f53',
  masterplan: '#d08700',
  commercial: '#7c3aed',
};

/** Section title → legend group and sheet type. */
export const SECTION_KIND: Record<string, { kind: MapKind; type: MapType }> = {
  'Master Plans': { kind: 'masterplan', type: 'Master plan' },
  'HUDA Sectors': { kind: 'sector', type: 'Sector layout' },
  DLF: { kind: 'builder', type: 'Township' },
  'Sushant Lok': { kind: 'builder', type: 'Township' },
  'South City': { kind: 'builder', type: 'Township' },
  Vatika: { kind: 'builder', type: 'Township' },
  'Builder Projects': { kind: 'builder', type: 'Township' },
  'Udyog Vihar': { kind: 'commercial', type: 'Industrial' },
};

/* Keyed by the map's `name` exactly as it appears in maps-data.ts. */
export const MAP_GEO: Record<string, GeoEntry> = {
  // ---------------------------------------------------------- master plans
  Masterplan: { lat: 28.4646, lng: 77.0299, area: 'Gurugram' }, // Gurugram city
  Manesar: { lat: 28.3617, lng: 76.9402, area: 'Manesar' },
  Dharuhera: { lat: 28.2055, lng: 76.7953, area: 'Dharuhera' },
  'Sohna Masterplan': { lat: 28.246, lng: 77.0671, area: 'Sohna' },

  // ------------------------------------------------------------------ DLF
  'DLF 1': { lat: 28.4765, lng: 77.0902, area: 'Gurugram' }, // Sector 28
  'DLF 2': { lat: 28.4839, lng: 77.0846, area: 'Gurugram' }, // Sector 25
  'DLF 3': { lat: 28.4941, lng: 77.1044, area: 'Gurugram' }, // Sector 24
  'DLF 4': { lat: 28.4641, lng: 77.0836, area: 'Gurugram' }, // Sector 27

  // --------------------------------------------------------- HUDA sectors
  /* Sector centroids from the OSM boundary for each sector. Where a sheet
     covers more than one sector the pin sits at the midpoint of those. */
  'Sector 4 & 7': { lat: 28.4706, lng: 77.0123, area: 'Gurugram' },
  'Sector 5': { lat: 28.4804, lng: 77.0191, area: 'Gurugram' },
  'Sector 7 Ext.': { lat: 28.4645, lng: 77.0075, area: 'Gurugram' }, // APPROX — west of Sector 7
  'Sector 7': { lat: 28.4663, lng: 77.0143, area: 'Gurugram' },
  'Sector 9': { lat: 28.4622, lng: 77.0001, area: 'Gurugram' },
  'Sector 9A': { lat: 28.469, lng: 76.9963, area: 'Gurugram' },
  'Sector 10': { lat: 28.454, lng: 77.0025, area: 'Gurugram' },
  'Sector 10A': { lat: 28.4446, lng: 77.006, area: 'Gurugram' },
  'Sector 12A': { lat: 28.4701, lng: 77.0315, area: 'Gurugram' },
  'Sector 14': { lat: 28.4738, lng: 77.0472, area: 'Gurugram' },
  /* Two Sector 15 sheets, Part I and Part II, share one name — the pin sits
     between the two OSM boundaries so it is right for both. */
  'Sector 15': { lat: 28.4572, lng: 77.0418, area: 'Gurugram' },
  'Sector 17': { lat: 28.4758, lng: 77.0608, area: 'Gurugram' },
  /* 21, 22, 23 and 23A are the northern sectors by the Delhi border, not the
     city-centre sectors the old table put them in. */
  'Sector 21': { lat: 28.5144, lng: 77.073, area: 'Gurugram' },
  'Sector 22': { lat: 28.5063, lng: 77.0655, area: 'Gurugram' },
  'Sector 23': { lat: 28.5103, lng: 77.053, area: 'Gurugram' },
  'Sector 23A': { lat: 28.5057, lng: 77.0463, area: 'Gurugram' },
  'Sector 27 & 28': { lat: 28.4694, lng: 77.0833, area: 'Gurugram' },
  'Sector 29': { lat: 28.4669, lng: 77.0671, area: 'Gurugram' },
  'Sector 31 & 32a': { lat: 28.4499, lng: 77.0455, area: 'Gurugram' },
  'Sector 31': { lat: 28.454, lng: 77.0497, area: 'Gurugram' },
  'Sector 32,33,34': { lat: 28.4374, lng: 77.026, area: 'Gurugram' },
  'Sector 34': { lat: 28.428, lng: 77.0116, area: 'Gurugram' },
  'Sector 38': { lat: 28.4351, lng: 77.0404, area: 'Gurugram' },
  'Sector 39': { lat: 28.4424, lng: 77.0505, area: 'Gurugram' },
  'Sector 40': { lat: 28.45, lng: 77.0577, area: 'Gurugram' },
  'Sector 43': { lat: 28.4549, lng: 77.0859, area: 'Gurugram' },
  'Sector 44': { lat: 28.4507, lng: 77.0738, area: 'Gurugram' },
  'Sector 45': { lat: 28.4449, lng: 77.0664, area: 'Gurugram' },
  'Sector 46': { lat: 28.4359, lng: 77.0584, area: 'Gurugram' },
  'Sector 47': { lat: 28.4252, lng: 77.0475, area: 'Gurugram' },
  'Sector 51': { lat: 28.4287, lng: 77.0667, area: 'Gurugram' },
  'Sector 52': { lat: 28.4368, lng: 77.0795, area: 'Gurugram' },
  'Sector 57': { lat: 28.4233, lng: 77.0805, area: 'Gurugram' },

  // ---------------------------------------------------------- Sushant Lok
  'Sushant LOK 1': { lat: 28.4546, lng: 77.0826, area: 'Gurugram' }, // Sector 43
  'Sushant LOK 2': { lat: 28.4228, lng: 77.0866, area: 'Gurugram' }, // Sector 57
  'Sushant LOK 3': { lat: 28.4208, lng: 77.0796, area: 'Gurugram' }, // Sector 57

  // ----------------------------------------------------------- South City
  'South City 1': { lat: 28.4597, lng: 77.0612, area: 'Gurugram' }, // Sector 41
  'South City 2': { lat: 28.417, lng: 77.0488, area: 'Gurugram' }, // Sector 49

  // ----------------------------------------------------- builder projects
  'Greenwood City': { lat: 28.4449, lng: 77.0611, area: 'Gurugram' }, // Sector 45
  'Malibu Town': { lat: 28.4234, lng: 77.0469, area: 'Gurugram' }, // Sector 47
  'Mayfield Garden': { lat: 28.4275, lng: 77.0609, area: 'Gurugram' }, // Sector 51
  Nirvana: { lat: 28.4151, lng: 77.0643, area: 'Gurugram' }, // Nirvana Country, Sector 50
  'Rosewood City': { lat: 28.4102, lng: 77.0545, area: 'Gurugram' }, // Sector 49
  'Saraswati Vihar': { lat: 28.4772, lng: 77.0833, area: 'Gurugram' }, // Sector 28
  Suncity: { lat: 28.4351, lng: 77.1106, area: 'Gurugram' }, // Sector 54
  'Uppal Southend': { lat: 28.4103, lng: 77.0465, area: 'Gurugram' }, // Sector 49
  'Vipul World': { lat: 28.4128, lng: 77.0345, area: 'Gurugram' }, // Sector 48

  // ---------------------------------------------------------- Udyog Vihar
  'Pace City 1': { lat: 28.4397, lng: 77.0109, area: 'Gurugram' },
  'Pace City 2': { lat: 28.4343, lng: 76.9993, area: 'Gurugram' }, // APPROX — Sector 37 industrial belt
  'Udyog Vihar': { lat: 28.5002, lng: 77.0807, area: 'Gurugram' }, // Sectors 18-20

  /* Rows removed with this pass: DLF 5, DLF Alameda, DLF Garden City,
     Sushant LOK 4, Vatika 1-5, Anant RAJ, Bptp Amstoria, Emerald Floors,
     Raheja, Palam Vihar and Ireo City. None of them has a sheet in
     maps-data.ts, so none drew a pin, and their coordinates were guesses.
     Restore a sheet and add a checked coordinate here at the same time. */
};

/** Where the map opens: Gurugram, wide enough to hold Manesar and Sohna. */
export const GURGAON_CENTER: [number, number] = [28.4425, 77.055];
export const GURGAON_ZOOM = 12;

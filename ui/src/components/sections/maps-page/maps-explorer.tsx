import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bookmark,
  Building,
  Building2,
  ChevronRight,
  Clock,
  Crosshair,
  Download,
  Factory,
  Grid3x3,
  Home,
  Landmark,
  LayoutGrid,
  Map as MapIcon,
  MapPin as PinIcon,
  Menu as MenuIcon,
  Trees,
  X,
  ArrowDown,
} from 'lucide-react';
import { MenuContainer, MenuItem } from '@/components/ui/fluid-menu/fluid-menu';
import Globe from '@/components/ui/globe/globe';
import GlowingSearchBar from '@/components/ui/search-bar/animated-glowing-search-bar';
import { Lightbox } from '@/components/ui/image-gallery/lightbox';
import { LeafletMap, type MapPin } from '@/components/ui/leaflet-map/leaflet-map';
import { mapSections, type MapSection } from './maps-data';
import {
  GURGAON_CENTER,
  GURGAON_ZOOM,
  KIND_COLOR,
  KIND_LABEL,
  MAP_GEO,
  SECTION_KIND,
  type MapArea,
  type MapKind,
  type MapType,
} from './maps-geo';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ model */

type ExplorerMap = {
  id: string;
  name: string;
  thumb: string;
  full: string;
  section: string;
  kind: MapKind;
  type: MapType;
  area?: MapArea;
  lat?: number;
  lng?: number;
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const buildIndex = (sections: MapSection[]): ExplorerMap[] =>
  sections.flatMap((section) => {
    const meta = SECTION_KIND[section.title] ?? { kind: 'sector' as MapKind, type: 'Sector layout' as MapType };
    return section.maps.map((m, i) => {
      const geo = MAP_GEO[m.name];
      return {
        // names repeat across the library — "Sector 15" appears twice — so the
        // section and position are part of the identity
        id: `${slug(section.title)}-${slug(m.name)}-${i}`,
        name: m.name,
        thumb: m.thumb,
        full: m.full,
        section: section.title,
        kind: meta.kind,
        type: meta.type,
        area: geo?.area,
        lat: geo?.lat,
        lng: geo?.lng,
      };
    });
  });

/* --------------------------------------------------------------- storage */

/** Small localStorage-backed list. Survives a reload; degrades to memory if
    storage is unavailable (private windows, blocked cookies). */
const useStoredList = (key: string, limit = 24) => {
  const [ids, setIds] = useState<string[]>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(ids));
    } catch {
      /* storage unavailable — the list still works for this session */
    }
  }, [key, ids]);

  const push = useCallback(
    (id: string) => setIds((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, limit)),
    [limit],
  );
  const toggle = useCallback(
    (id: string) =>
      setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev].slice(0, limit))),
    [limit],
  );

  return { ids, push, toggle, clear: () => setIds([]) };
};

/** One icon per category for the rail. Distinct glyphs, since the rail is
    circles and a wrong-but-similar icon is worse than a generic one. */
const SECTION_ICON: Record<string, React.ReactNode> = {
  'Master Plans': <MapIcon size={18} strokeWidth={1.9} />,
  DLF: <Building2 size={18} strokeWidth={1.9} />,
  'HUDA Sectors': <Grid3x3 size={18} strokeWidth={1.9} />,
  'Sushant Lok': <Home size={18} strokeWidth={1.9} />,
  'South City': <Landmark size={18} strokeWidth={1.9} />,
  Vatika: <Trees size={18} strokeWidth={1.9} />,
  'Builder Projects': <Building size={18} strokeWidth={1.9} />,
  'Udyog Vihar': <Factory size={18} strokeWidth={1.9} />,
};

/* ------------------------------------------------------------------ bits */

/**
 * The site's marker-pen heading treatment, painted as the text's own
 * background so it follows every line box — an absolutely positioned bar only
 * ever covers the last line once a heading wraps.
 */
const Highlight = ({
  children,
  bright = false,
}: {
  children: React.ReactNode;
  /** Heavier, more saturated stroke — for the one heading that leads a page
      section rather than labelling a row inside it. */
  bright?: boolean;
}) => (
  <span
    className={cn(
      'box-decoration-clone',
      bright
        ? 'bg-[linear-gradient(transparent_58%,rgb(0_170_255/0.55)_58%)]'
        : 'bg-[linear-gradient(transparent_62%,rgb(0_128_198/0.3)_62%)]',
    )}
  >
    {children}
  </span>
);

/** One map, as a card. Used by both rows and by the library grid. */
const MapCard = ({
  item,
  saved,
  onOpen,
  onToggleSave,
  compact = false,
  fluid = false,
}: {
  item: ExplorerMap;
  saved: boolean;
  onOpen: () => void;
  onToggleSave: () => void;
  compact?: boolean;
  /** Fill the grid column instead of holding the rail's fixed width. */
  fluid?: boolean;
}) => (
  <div
    className={cn(
      'group relative flex shrink-0 flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300',
      'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_18px_40px_-24px_rgb(0_0_0/0.45)]',
      fluid ? 'w-full' : compact ? 'w-[260px]' : 'w-[228px]',
      compact && 'flex-row items-center gap-3 p-2.5',
    )}
  >
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open ${item.name}`}
      className={cn(
        'relative cursor-zoom-in overflow-hidden bg-muted',
        compact ? 'h-14 w-20 shrink-0 rounded-lg' : 'aspect-[4/3] w-full',
      )}
    >
      <img
        src={item.thumb}
        alt={item.name}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
      />
    </button>

    <div className={cn('min-w-0 flex-1', compact ? '' : 'p-3.5')}>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full min-w-0 items-center gap-1.5 text-left"
      >
        <PinIcon className="h-3.5 w-3.5 shrink-0" style={{ color: KIND_COLOR[item.kind] }} />
        <span className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
          {item.name}
        </span>
      </button>

      <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
        {/* the section and sheet type, because we have those. There is no
            per-map "N projects" figure anywhere in the library to show. */}
        <span className="truncate">{item.section}</span>
        {!compact && (
          <>
            <span aria-hidden="true">·</span>
            <a
              href={item.full}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-1 font-medium transition-colors hover:text-primary"
            >
              Download <Download className="h-3 w-3" />
            </a>
          </>
        )}
      </div>
    </div>

    <button
      type="button"
      onClick={onToggleSave}
      aria-label={saved ? `Remove ${item.name} from saved` : `Save ${item.name}`}
      aria-pressed={saved}
      className={cn(
        'absolute right-2 top-2 grid h-7 w-7 cursor-pointer place-items-center rounded-full border bg-background/90 backdrop-blur-sm transition-colors',
        compact && 'right-1.5 top-1.5 h-6 w-6',
        saved ? 'border-primary text-primary' : 'text-muted-foreground hover:text-primary',
      )}
    >
      <Bookmark className={cn('h-3.5 w-3.5', saved && 'fill-current')} />
    </button>
  </div>
);

/** A horizontally scrolling row with an arrow, as in the wireframe. */
const CardRail = ({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          <Highlight>{title}</Highlight>
        </h2>
        {action}
      </div>

      <div className="relative">
        <div
          ref={ref}
          className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {children}
        </div>
        <button
          type="button"
          aria-label={`Scroll ${title} right`}
          onClick={() => ref.current?.scrollBy({ left: 320, behavior: 'smooth' })}
          className="absolute -right-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full border bg-background shadow-md transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground sm:grid"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ page */

export type MapsExplorerProps = {
  sections?: MapSection[];
  className?: string;
};

export const MapsExplorer = ({ sections = mapSections, className }: MapsExplorerProps) => {
  const all = useMemo(() => buildIndex(sections), [sections]);

  const [query, setQuery] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  /** Which category rail item is chosen. null = All. */
  const [section, setSection] = useState<string | null>(null);
  /** Set once the rail has been used, including on "All" — it swaps the
      library rather than the map on its own. */
  const [browsed, setBrowsed] = useState(false);
  const [recentOnly, setRecentOnly] = useState(false);
  const [railOpen, setRailOpen] = useState(false);

  const saved = useStoredList('dre.maps.saved');
  const recent = useStoredList('dre.maps.recent', 12);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((m) => {
      if (savedOnly && !saved.ids.includes(m.id)) return false;
      if (recentOnly && !recent.ids.includes(m.id)) return false;
      if (section && m.section !== section) return false;
      if (q && !m.name.toLowerCase().includes(q) && !m.section.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [all, query, savedOnly, saved.ids, recentOnly, recent.ids, section]);

  const dirty = query.trim() !== '' || savedOnly || recentOnly || section !== null;

  const reset = () => {
    setQuery('');
    setSavedOnly(false);
    setRecentOnly(false);
    setSection(null);
  };

  /* Pins follow the filters, so narrowing to "Builders" empties the map of
     everything else rather than leaving it to be read against the list. */
  const pins = useMemo<MapPin[]>(
    () =>
      results
        .filter((m) => m.lat != null && m.lng != null)
        .map((m) => ({
          id: m.id,
          name: m.name,
          lat: m.lat as number,
          lng: m.lng as number,
          color: KIND_COLOR[m.kind],
          detail: `${m.section} · ${m.type}`,
        })),
    [results],
  );

  const byId = useMemo(() => new Map(all.map((m) => [m.id, m])), [all]);
  const lightboxItems = results.map((m) => ({ name: m.name, thumb: m.thumb, full: m.full }));
  const openIndex = openId ? results.findIndex((m) => m.id === openId) : -1;

  const open = (id: string) => {
    setOpenId(id);
    recent.push(id);
  };

  const recentMaps = recent.ids.map((id) => byId.get(id)).filter(Boolean) as ExplorerMap[];
  const resultsRef = useRef<HTMLDivElement>(null);

  return (
    <div className={cn('w-full bg-muted/30', className)}>
      <div className="mx-auto w-full max-w-[1400px] px-5 py-8 sm:px-8 sm:py-10">
        {/* ---------------------------------------------------------- head */}
        <header className="flex flex-wrap items-start justify-between gap-x-8 gap-y-5">
          <div className="min-w-0">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-[2.75rem]">
              Explore <span className="text-primary">Gurugram</span>
            </h1>
            <p className="mt-1.5 text-[15px] text-muted-foreground">
              Find any sector, township or builder plan.
            </p>
          </div>

          {/* The glowing bar the home page and documents page already use —
              a third bespoke search input on one site is two too many.

              Its colours come from CSS variables, so the tint is set here on a
              wrapper rather than in the shared component: the field goes a pale
              blue on this page only, and the home page keeps its plain white. */}
          <div
            className="order-last w-full min-w-0 sm:order-none sm:max-w-md sm:flex-1"
            style={
              {
                '--sb-field': '#eaf4fc',
                '--sb-field-text': '#0d1b2a',
                '--sb-placeholder': '#5b7d99',
                '--sb-icon-1': '#0080c6',
                '--sb-icon-2': '#5b7d99',
              } as React.CSSProperties
            }
          >
            <GlowingSearchBar
              placeholder="Search sector, builder or location…"
              label="Search maps"
              onQueryChange={setQuery}
              onSearch={setQuery}
            />
          </div>

          {/* The two library toggles, paired. They answer neighbouring
              questions — what you kept, and where you have been — so they read
              as one control group rather than two stray buttons. */}
          <div className="flex shrink-0 flex-wrap items-center gap-2">
          {/* While this is filtering the page it wears the same travelling
              conic rim as the FAQ card — the rim is the "something is on" tell,
              so it animates only in that state and sits still otherwise. */}
          <div
            className={cn(
              'shrink-0 rounded-full p-[2px] transition-colors',
              savedOnly
                ? 'animate-border-run [background:conic-gradient(from_var(--border-angle),#fcd34d,#f59e0b,#fde68a,#d97706,#fcd34d)] motion-reduce:animate-none'
                : 'bg-transparent',
            )}
          >
            {/* Amber, because a bookmark is a thing you kept — and because it
                is already on the site, marking the phone numbers and the star
                ratings. Not a new colour, a reused one. */}
            <button
              type="button"
              onClick={() => setSavedOnly((v) => !v)}
              aria-pressed={savedOnly}
              className={cn(
                'group/saved relative isolate inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-300',
                savedOnly
                  ? 'border-transparent bg-[linear-gradient(135deg,#f59e0b_0%,#d97706_100%)] text-white shadow-[0_10px_24px_-10px_rgb(217_119_6/0.95)]'
                  : 'border-amber-300/70 bg-amber-50 text-amber-900 hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-[0_10px_24px_-12px_rgb(217_119_6/0.75)]',
              )}
            >
              {/* the sheen. -z-10 keeps it under the label; the group-hover
                  animation replays on every pass rather than once ever. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 -z-10 w-8 bg-white/45 opacity-0 group-hover/saved:animate-sheen group-hover/saved:opacity-100 motion-reduce:hidden"
              />
              <Bookmark
                className={cn(
                  'h-4 w-4 transition-transform duration-300',
                  savedOnly
                    ? 'scale-110 fill-current'
                    : 'group-hover/saved:-translate-y-0.5 group-hover/saved:scale-110 group-hover/saved:fill-amber-400',
                )}
              />
              Saved Maps
              {saved.ids.length > 0 && (
                <span
                  /* keyed on the count so React remounts it and the pop replays
                     every time something is saved or unsaved */
                  key={saved.ids.length}
                  className={cn(
                    'animate-count-pop rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums motion-reduce:animate-none',
                    savedOnly ? 'bg-white/30 text-white' : 'bg-amber-400/25 text-amber-800',
                  )}
                >
                  {saved.ids.length}
                </span>
              )}
            </button>
          </div>

          {/* Violet — the Commercial pin colour, so the two toggles read as a
              pair without either of them borrowing the brand blue the rest of
              the page uses for actions. */}
          <div
            className={cn(
              'shrink-0 rounded-full p-[2px] transition-colors',
              recentOnly
                ? 'animate-border-run [background:conic-gradient(from_var(--border-angle),#c4b5fd,#7c3aed,#ddd6fe,#6d28d9,#c4b5fd)] motion-reduce:animate-none'
                : 'bg-transparent',
            )}
          >
            <button
              type="button"
              onClick={() => setRecentOnly((v) => !v)}
              aria-pressed={recentOnly}
              disabled={recent.ids.length === 0}
              className={cn(
                'group/recent relative isolate inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-300',
                'disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:shadow-none',
                recentOnly
                  ? 'border-transparent bg-[linear-gradient(135deg,#8b5cf6_0%,#6d28d9_100%)] text-white shadow-[0_10px_24px_-10px_rgb(109_40_217/0.95)]'
                  : 'border-violet-300/70 bg-violet-50 text-violet-900 hover:-translate-y-0.5 hover:border-violet-400 hover:shadow-[0_10px_24px_-12px_rgb(109_40_217/0.75)]',
              )}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 -z-10 w-8 bg-white/45 opacity-0 group-hover/recent:animate-sheen group-hover/recent:opacity-100 motion-reduce:hidden"
              />
              <Clock
                className={cn(
                  'h-4 w-4 transition-transform duration-500',
                  recentOnly
                    ? 'scale-110'
                    : 'group-hover/recent:rotate-[300deg] group-hover/recent:scale-110',
                )}
              />
              Recently viewed
              {recent.ids.length > 0 && (
                <span
                  key={recent.ids.length}
                  className={cn(
                    'animate-count-pop rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums motion-reduce:animate-none',
                    recentOnly ? 'bg-white/30 text-white' : 'bg-violet-400/25 text-violet-800',
                  )}
                >
                  {recent.ids.length}
                </span>
              )}
            </button>
          </div>
          </div>
        </header>

        {/* ------------------------------------------------- map + filters */}
        {/* A tray under the two panels. The explorer is the working half of
            this page and the library is the reference half; the tray separates
            them without a rule or a heading. Black, so the categories panel is
            not a dark rectangle sitting on a light one — the whole working area
            is one surface, and the map is the only bright thing on it. */}
        <div className="mt-6 rounded-3xl border border-white/10 bg-[linear-gradient(160deg,#080d14_0%,#04070b_100%)] p-3 shadow-[0_24px_60px_-30px_rgb(4_7_11/0.9)] sm:p-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
          {/* map */}
          {/* `isolate` is load-bearing. Leaflet positions its panes at z-index
              200-700 *internally*; without a stacking context here those values
              compete in the root context and beat the site header's z-50, so
              the map paints straight over the navbar as you scroll past it.
              Isolating traps them inside this card, which then sits below the
              header like any other element. */}
          <div className="relative isolate h-[420px] overflow-hidden rounded-2xl border border-white/15 bg-card shadow-[0_16px_40px_-24px_rgb(0_0_0/0.8)] sm:h-[500px]">
            <LeafletMap
              pins={pins}
              center={GURGAON_CENTER}
              zoom={GURGAON_ZOOM}
              fitToPins={dirty}
              onOpen={open}
            />

            {/* hint */}
            <div className="pointer-events-none absolute left-4 top-4 z-[650] flex max-w-[228px] items-start gap-3 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur-sm">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Crosshair className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold text-foreground">Explore on map</span>
                <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                  Click any pin to open its plan full size.
                </span>
              </span>
            </div>

            {/* legend */}
            <div className="absolute bottom-4 left-4 z-[650] rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur-sm">
              <ul className="space-y-1.5">
                {(Object.keys(KIND_LABEL) as MapKind[]).map((k) => (
                  <li key={k} className="flex items-center gap-2 text-[12px] text-foreground">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: KIND_COLOR[k] }}
                    />
                    {KIND_LABEL[k]}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ------------------------------------------------ categories */}
          {/* Where the filter panel used to be. The rail does the same job the
              Category select did, and does it with the library's own eight
              names instead of four legend groups. Black ground: the globe needs
              a night sky, and the white circles need something to sit on. */}
          {/* No ground of its own any more — the tray is already black. Fixed
              height, matching the map beside it: opening the rail must not
              change the size of the box. */}
          <aside className="relative z-30 flex h-[420px] flex-col overflow-hidden rounded-2xl p-4 sm:h-[500px]">
            <h2
              className={cn(
                'font-bold tracking-tight text-white transition-all duration-300',
                railOpen ? 'text-base' : 'text-2xl',
              )}
            >
              Categories
            </h2>

            {/* The globe is the closed state's whole job: give the button
                something to be next to, and a reason to press it. It leaves as
                soon as the rail opens, so it never competes with the labels. */}
            <div
              className={cn(
                'pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center gap-5 px-5 transition-all duration-500',
                railOpen ? 'scale-90 opacity-0' : 'scale-100 opacity-100',
              )}
            >
              <Globe size={168} />
              <p className="text-center text-[13px] leading-snug text-white/65">
                Click the button to explore
                <br />
                <span className="font-semibold text-white">all map categories</span>
              </p>
            </div>

              {/* Closing the rail is closing the thing that made the choice,
                  so the choice goes with it: the map returns to every pin and
                  the library drops back out of the page. */}
              <MenuContainer
                /* Centred while it is just a button beside the globe; pinned
                   left once it is the corner of a grid. */
                className={cn(
                  'transition-all duration-300',
                  railOpen ? 'ml-0 mr-auto mt-4' : 'mx-auto mt-8',
                )}
                onOpenChange={setRailOpen}
                onCollapse={() => {
                  setSection(null);
                  setBrowsed(false);
                }}
              >
                <MenuItem
                  head
                  label="Browse categories"
                  icon={
                    <span className="relative block h-6 w-6">
                      <span className="absolute inset-0 origin-center rotate-0 scale-100 opacity-100 transition-all duration-300 ease-in-out [div[data-expanded=true]_&]:rotate-180 [div[data-expanded=true]_&]:scale-0 [div[data-expanded=true]_&]:opacity-0">
                        <MenuIcon size={18} strokeWidth={1.9} />
                      </span>
                      <span className="absolute inset-0 origin-center -rotate-180 scale-0 opacity-0 transition-all duration-300 ease-in-out [div[data-expanded=true]_&]:rotate-0 [div[data-expanded=true]_&]:scale-100 [div[data-expanded=true]_&]:opacity-100">
                        <X size={18} strokeWidth={1.9} />
                      </span>
                    </span>
                  }
                />
                <MenuItem
                  label={`All maps · ${all.length}`}
                  active={browsed && section === null}
                  onClick={() => {
                    setSection(null);
                    setBrowsed(true);
                  }}
                  icon={<LayoutGrid size={18} strokeWidth={1.9} />}
                />
                {sections.map((sec) => (
                  <MenuItem
                    key={sec.title}
                    label={`${sec.title} · ${sec.maps.length}`}
                    active={section === sec.title}
                    onClick={() => {
                      setSection(sec.title);
                      setBrowsed(true);
                    }}
                    icon={SECTION_ICON[sec.title] ?? <LayoutGrid size={18} strokeWidth={1.9} />}
                  />
                ))}
              </MenuContainer>

            {/* Once anything is chosen the thing to do next is below the fold,
                so say so and take them there. Keyed on `browsed`, not on
                `section`: picking "All maps" also puts a grid down there, and
                it was the one path that left without a word. */}
            {browsed && (
              <div className="mt-auto pt-4">
                <p className="mb-2 text-center text-[11px] font-medium text-white/50">
                  Your maps are below
                </p>
                <button
                  type="button"
                  onClick={() =>
                    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                  className="group/cue inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_26px_-12px_rgb(0_128_198/0.9)] transition-colors hover:bg-primary/90"
                >
                  Scroll to {results.length} {results.length === 1 ? 'map' : 'maps'}
                  <ArrowDown className="h-4 w-4 animate-bounce motion-reduce:animate-none" />
                </button>
              </div>
            )}
          </aside>

        </div>
        </div>

        {/* -------------------------------------------------------- rails */}
        {recentMaps.length > 0 && !dirty && !browsed && (
          <CardRail
            title="Recently viewed"
            action={
              <button
                type="button"
                onClick={recent.clear}
                className="cursor-pointer text-sm font-medium text-primary hover:underline"
              >
                Clear
              </button>
            }
          >
            {recentMaps.map((m) => (
              <MapCard
                key={m.id}
                item={m}
                compact
                saved={saved.ids.includes(m.id)}
                onOpen={() => open(m.id)}
                onToggleSave={() => saved.toggle(m.id)}
              />
            ))}
          </CardRail>
        )}


        {/* ------------------------------------------------------ results */}
        {/* Nothing chosen means nothing to list — the map is already showing
            every pin, and repeating all 74 as a grid underneath it says the
            same thing twice. The library appears once you pick a category,
            search, or turn on one of the two toggles. */}
        {(dirty || browsed) && (
        <section ref={resultsRef} className="mt-10 scroll-mt-24">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            {/* This is the title of everything below the map, so it is sized
                as a section heading rather than as a row label. */}
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              <Highlight bright>
                {savedOnly
                  ? 'Saved maps'
                  : recentOnly
                    ? 'Recently viewed'
                    : (section ?? (dirty ? 'Results' : 'All maps'))}
              </Highlight>
            </h2>
            <span className="pb-1 text-[15px] font-medium text-muted-foreground">
              {results.length} of {all.length}
            </span>
          </div>

          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed py-20 text-center">
              <p className="text-[15px] text-muted-foreground">
                {savedOnly
                  ? 'You have not saved any maps yet.'
                  : recentOnly
                    ? 'You have not opened any maps yet.'
                    : 'No map matches those filters.'}
              </p>
              {dirty && (
                <button
                  type="button"
                  onClick={reset}
                  className="mt-3 cursor-pointer text-sm font-semibold text-primary hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {results.map((m) => (
                <MapCard
                  key={m.id}
                  item={m}
                  saved={saved.ids.includes(m.id)}
                  onOpen={() => open(m.id)}
                  onToggleSave={() => saved.toggle(m.id)}
                  fluid
                />
              ))}
            </div>
          )}
        </section>
        )}
      </div>

      <Lightbox
        items={lightboxItems}
        index={openIndex >= 0 ? openIndex : null}
        onClose={() => setOpenId(null)}
        onIndexChange={(i) => setOpenId(results[i]?.id ?? null)}
      />
    </div>
  );
};

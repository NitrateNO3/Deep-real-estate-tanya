import { useMemo, useState } from 'react';
import { ImageGallery, type GalleryItem } from '@/components/ui/image-gallery/image-gallery';
import { Lightbox } from '@/components/ui/image-gallery/lightbox';
import { SectionRail } from '@/components/ui/section-rail/section-rail';
import GlowingSearchBar from '@/components/ui/search-bar/animated-glowing-search-bar';
import { StarButton } from '@/components/ui/star-button';
import { IndexCta } from '@/components/sections/index-cta/index-cta';
import { mapSections, type MapSection } from './maps-data';
import { cn } from '@/lib/utils';

export type MapsPageProps = {
  sections?: MapSection[];
  className?: string;
};

const sectionId = (title: string) => title.toLowerCase().replace(/\s+/g, '-');

/** Above this, a section is collapsed behind a "show all". */
const COLLAPSE_OVER = 12;

/**
 * One section, as a band.
 *
 * Bands alternate ground so eight sections read as eight things rather than
 * one wall. Anything over a dozen maps starts collapsed — All Huda Sectors is
 * 34 on its own, and left open it is half the page and swamps the seven
 * sections around it.
 */
const MapsBand = ({
  section,
  tinted,
  searching,
  onOpen,
}: {
  section: MapSection;
  tinted: boolean;
  /** A query is active, so nothing may stay hidden behind "show all". */
  searching: boolean;
  onOpen: (item: GalleryItem) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  /* Collapsing while filtering would hide the very thing that was searched
     for — HUDA Sectors shows 12 of 34, so a match on Sector 57 would land
     behind the button and read as "no result". */
  const collapsible = !searching && section.maps.length > COLLAPSE_OVER;
  const shown = collapsible && !expanded ? section.maps.slice(0, COLLAPSE_OVER) : section.maps;

  return (
    <section
      id={sectionId(section.title)}
      /* clears the header (80px) and the rail beneath it, so a jumped-to
         heading is not hidden under them */
      className={cn('w-full scroll-mt-[8.5rem]', tinted && 'bg-muted/30')}
    >
      <div className="mx-auto w-full max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b pb-5">
          {/* heading and count, nothing else — repeating the eyebrow rule on
              eight consecutive sections of one list is a tic */}
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {section.title}
          </h2>
          <span className="pb-1 text-sm text-muted-foreground">
            {section.maps.length} {section.maps.length === 1 ? 'map' : 'maps'}
          </span>
        </div>

        <ImageGallery items={shown} onOpen={onOpen} />

        {collapsible && (
          <div className="mt-8 flex justify-center">
            <StarButton
              onClick={() => setExpanded((v) => !v)}
              lightColor="#0080C6"
              className="h-11 px-6 text-sm font-semibold"
            >
              {expanded ? 'Show fewer' : `Show all ${section.maps.length}`}
            </StarButton>
          </div>
        )}
      </div>
    </section>
  );
};

/**
 * Maps page.
 *
 * Section order and contents mirror the live site's /maps/ page exactly.
 * The lightbox indexes across the *flattened* list rather than per section, so
 * the arrow keys keep going from the last map of one section into the first of
 * the next instead of dead-ending.
 */
export const MapsPage = ({ sections = mapSections, className }: MapsPageProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  /* Match on the map's own name and on its section, so "huda" pulls the whole
     sector run and "45" pulls the one sheet. Empty sections drop out entirely
     rather than sitting there as headings with nothing under them. */
  const visible = useMemo(
    () =>
      sections
        .map((s) => ({
          ...s,
          maps: q
            ? s.maps.filter(
                (m) => m.name.toLowerCase().includes(q) || s.title.toLowerCase().includes(q),
              )
            : s.maps,
        }))
        .filter((s) => s.maps.length > 0),
    [sections, q],
  );

  /* The lightbox indexes across everything currently on screen, so the arrow
     keys walk the filtered set — stepping off a search result into a map that
     is not displayed would be disorienting. */
  const flat = useMemo<GalleryItem[]>(() => visible.flatMap((s) => s.maps), [visible]);
  const indexOf = useMemo(() => {
    const m = new Map<string, number>();
    flat.forEach((item, i) => m.set(item.thumb, i));
    return m;
  }, [flat]);

  const total = useMemo(() => sections.reduce((n, s) => n + s.maps.length, 0), [sections]);
  const shownCount = flat.length;

  return (
    <div className={cn('w-full bg-background', className)}>
      {/* page header — same backdrop treatment as the home page's dark bands:
          photo at opacity, then a gradient so the type sits on even ground */}
      <section className="relative isolate w-full overflow-hidden border-b bg-[#06121b]">
        <img
          src="/img/bg/gurgaon-map.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-center opacity-45"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(6,18,27,0.86)_0%,rgba(6,18,27,0.70)_45%,rgba(6,18,27,0.94)_100%)]"
        />

        <div className="mx-auto w-full max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-sky-400" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
              Sector maps
            </p>
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
            Every map of Gurugram, in one place
          </h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-[1.65] text-white/75">
            Master plans, DLF phases, HUDA sectors and builder projects — down to plot numbers.
            Tap any map to open it full size.
          </p>
          {/* Same search bar and placement as the documents page — both are
              long index pages and there is no reason for them to behave
              differently. Thirty-four HUDA sectors is more than anyone should
              have to scan by eye. */}
          <div className="mt-8 max-w-xl">
            <GlowingSearchBar
              placeholder="Sector 45, DLF 3, Sushant Lok…"
              label="Search maps"
              onQueryChange={setQuery}
              onSearch={setQuery}
            />
          </div>

          <p className="mt-6 text-sm font-semibold text-white">
            {searching
              ? `${shownCount} of ${total} maps`
              : `${total} maps across ${sections.length} sections`}
          </p>
        </div>
      </section>

      {/* index rail — sticks under the header for the whole scroll, and follows
          the filter so its counts never disagree with what is on the page */}
      <SectionRail
        items={[
          { label: 'All', count: shownCount },
          ...visible.map((s) => ({ id: sectionId(s.title), label: s.title, count: s.maps.length })),
        ]}
      />

      {/* one band per section, in the live site's order */}
      {visible.length === 0 ? (
        <div className="mx-auto w-full max-w-[1400px] px-5 py-24 sm:px-8">
          <p className="text-center text-[15px] text-muted-foreground">
            No map matches “{query.trim()}”.
          </p>
        </div>
      ) : (
        visible.map((section, i) => (
          <MapsBand
            key={section.title}
            section={section}
            tinted={i % 2 === 1}
            searching={searching}
            onOpen={(item) => setOpenIndex(indexOf.get(item.thumb) ?? 0)}
          />
        ))
      )}

      <IndexCta
        heading="Can’t find your sector?"
        body="Tell us the sector, phase or project and we will send the map across."
      />

      <Lightbox
        items={flat}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onIndexChange={setOpenIndex}
      />
    </div>
  );
};

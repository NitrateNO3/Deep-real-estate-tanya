import { useState } from 'react';
import { StarButton } from '@/components/ui/star-button';
import { CardStack, type StackCard } from '@/components/ui/card-stack/card-stack';
import { Lightbox } from '@/components/ui/image-gallery/lightbox';
import { useIsDark } from '@/lib/use-is-dark';
import { cn } from '@/lib/utils';

export type MapCard = {
  id: string | number;
  name: string;
  /** Short qualifier under the name — area, phase, what the map shows. */
  detail?: string;
  image: string;
};

export type MapsSectionProps = {
  eyebrow?: string;
  heading?: string;
  lede?: string;
  maps?: MapCard[];
  ctaLabel?: string;
  ctaHref?: string;
  /** Tighter vertical rhythm for viewport-height pages. */
  fill?: boolean;
  className?: string;
};

/* The master plans the live site leads its maps library with, in the order the
   lede names them. Sohna is the fourth and lives on the maps page. */
const defaultMaps: MapCard[] = [
  {
    id: 'gurgaon-master-plan',
    name: 'Gurugram Master Plan',
    detail: 'Sector zoning · land use',
    image: '/img/maps/gurgaon-master-plan.jpg',
  },
  {
    id: 'manesar-master-plan',
    name: 'Manesar Master Plan',
    detail: 'IMT & sector zoning',
    image: '/img/maps/manesar-master-plan.jpg',
  },
  {
    id: 'dharuhera-master-plan',
    name: 'Dharuhera Master Plan',
    detail: 'Sector zoning · land use',
    image: '/img/maps/dharuhera-master-plan.jpg',
  },
];

/**
 * Homepage section — Maps & master plans.
 *
 * Copy on the left, the plans stacked as a deck on the right. A deck rather
 * than a row of three: it holds the section to roughly one card's height
 * instead of three cards' width, and a stack of documents is what a map
 * library actually is.
 */
export const MapsSection = ({
  eyebrow = 'Maps & Master Plans',
  heading = 'Explore sectors and master plans before you invest',
  lede = 'Access master plans for Gurugram, Manesar and Dharuhera, plus HUDA sector maps, DLF phases, Sushant Lok, South City and dozens of builder projects — all in one organized library.',
  maps = defaultMaps,
  ctaLabel = 'Explore all maps',
  ctaHref = '#maps-page',
  fill = false,
  className,
}: MapsSectionProps) => {
  const isDark = useIsDark();

  /* Clicking a plan opens it full size, in the same lightbox the Maps page
     uses — a master plan is unreadable at deck size, so a card you cannot open
     is a picture of a map rather than a map. */
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const lightboxItems = maps.map((m) => ({
    name: m.detail ? `${m.name} — ${m.detail}` : m.name,
    thumb: m.image,
    full: m.image,
  }));

  const cards: StackCard[] = maps.map((m) => ({
    id: m.id,
    src: m.image,
    alt: m.name,
    title: m.name,
    description: m.detail,
  }));

  return (
    <section
      className={cn(
        // Soft blue-grey, the same family as the page's other light grounds —
        // it separates this band from the plain white above without becoming a
        // colour of its own.
        'w-full bg-[linear-gradient(180deg,#f6fafd_0%,#eaf1f7_100%)]',
        fill && 'lg:flex lg:h-full lg:min-h-0 lg:items-center',
        className,
      )}
    >
      <div
        className={cn(
          'mx-auto w-full max-w-[1400px] px-5 sm:px-8',
          fill ? 'py-12 lg:py-10' : 'py-16 sm:py-20',
        )}
      >
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* ------------------------------------------------------- copy */}
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-primary" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                {eyebrow}
              </p>
            </div>

            <h2 className="mt-4 text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-[2.4rem]">
              {heading}
            </h2>

            <p className="mt-4 max-w-xl text-[16px] leading-[1.7] text-muted-foreground">{lede}</p>

            <div className="mt-7">
              <StarButton
                href={ctaHref}
                lightColor={isDark ? '#FAFAFA' : '#0080C6'}
                className="h-12 px-7 text-[15px] font-semibold"
              >
                {ctaLabel}
              </StarButton>
            </div>
          </div>

          {/* ------------------------------------------------------- deck */}
          <div className="min-w-0">
            <CardStack
              cards={cards}
              aspect="aspect-[4/3]"
              className="mx-auto max-w-[520px]"
              onCardOpen={setOpenIndex}
            />
            {/* The pile affords dragging, not opening — this says the second
                thing, the way the Maps page says it. */}
            <p className="mt-3 text-center text-[13px] text-muted-foreground">
              Tap a plan to open it full size · drag to shuffle
            </p>
          </div>
        </div>
      </div>

      <Lightbox
        items={lightboxItems}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onIndexChange={setOpenIndex}
      />
    </section>
  );
};

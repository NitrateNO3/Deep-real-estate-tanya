import { cn } from '@/lib/utils';

export type Project = {
  /** The scheme, named the way the notification names it. */
  name: string;
  /** Where it has actually got to. Kept short enough to sit in a chip. */
  status: string;
  /** What it is, and what it changes for someone buying nearby. */
  body: string;
  /** The report this card is drawn from. Opens in a new tab. */
  href: string;
  /** Masthead, shown on the card. Who says so is part of the claim. */
  source: string;
};

/**
 * Cleared or under construction as of August 2026.
 *
 * Every card links the report it was written from, and every figure on it was
 * read back off that report — not off a search summary. That check was worth
 * doing: it caught a cost taken from a different scheme's figure, two flyover
 * junctions that were never in the list, and a completion year no source
 * carried. Infrastructure copy on property sites is usually rumour with a
 * number bolted on, and one detail a buyer can falsify costs you the rest of
 * the page.
 *
 * So the rule for editing this array: if the linked piece does not say it,
 * it does not go in. Anything that could not be sourced was dropped rather
 * than rounded up, which is why some of these are shorter than they could be.
 */
const defaultProjects: Project[] = [
  {
    name: 'Gurugram Metro',
    status: 'Under construction',
    body: 'A 28.5 km corridor of 27 stations, running the Millennium City Centre through to Cyber City. The Haryana Cabinet cleared a revised cost of ₹10,266 crore — close to double the original — with the soft-loan component moving to World Bank funding.',
    href: 'https://www.tribuneindia.com/news/gurugram/gurugram-metro-project-cost-nearly-doubles-to-rs-10266-crore-haryana-cabinet-clears-revised-plan/',
    source: 'The Tribune',
  },
  {
    name: 'Greater Noida – Gurugram RRTS',
    status: 'Alignment approved',
    body: 'Haryana has approved the final alignment. IFFCO Chowk and Sector 61 become combined RRTS-and-metro hubs, with further stations at Sector 29, Millennium City Centre, Sector 52, Wazirabad, Sector 57 and Sector 58/61 — and Sector 57 is our own.',
    href: 'https://indianinfrastructure.com/2026/03/02/haryana-government-approves-final-alignment-for-greater-noida-gurugram-rrts-project/',
    source: 'Indian Infrastructure',
  },
  {
    name: 'Ghata – Vatika Chowk – NH48',
    status: 'In the state budget',
    body: 'An eight-lane elevated road from Ghata to Vatika Chowk and on to NH48, estimated at about ₹2,900 crore. It is the Golf Course Extension traffic taken off the surface.',
    href: 'https://swarajyamag.com/news-brief/haryana-budget-2026-gurugram-receives-2900-crore-elevated-road-and-five-flyovers-to-ease-traffic-congestion',
    source: 'Swarajya',
  },
  {
    name: 'Five new flyovers',
    status: 'In the state budget',
    body: '₹302 crore allocated across Ambedkar Chowk, Dadi Sati Chowk, Millennium City Centre, Bakhtawar Chowk and the Garhi railway crossing near Basai — the junctions that cost you the most minutes today.',
    href: 'https://swarajyamag.com/news-brief/haryana-budget-2026-gurugram-receives-2900-crore-elevated-road-and-five-flyovers-to-ease-traffic-congestion',
    source: 'Swarajya',
  },
  {
    name: 'Sector 78–80 link road',
    status: 'Sanctioned',
    body: 'A 2.4 km six-lane corridor tying the Delhi–Gurugram Expressway to Naurangpur through Sectors 78 to 80, at ₹29 crore. Sanctioned after nearly ten years lost to encroachments, and reckoned at about two years to build.',
    href: 'https://swarajyamag.com/news-brief/after-10-year-delay-haryana-approves-6-lane-road-connecting-delhi-gurugram-expressway-to-new-gurugram-sectors',
    source: 'Swarajya',
  },
  {
    name: 'GMDA road strengthening',
    status: 'Funded',
    body: '₹249.77 crore of works, ₹166 crore of it rebuilding 64 km of master sector roads and 17.2 km of service roads. Unglamorous, and the part you feel every single day.',
    href: 'https://www.tribuneindia.com/news/haryana/haryana-cm-approves-rs-249-crore-infrastructure-development-projects-for-gurugram',
    source: 'The Tribune',
  },
];

export type GurugramSectionProps = {
  eyebrow?: string;
  heading?: string;
  lede?: string;
  projects?: Project[];
  /** Printed under the grid. These schemes move; the page should say when. */
  asOf?: string;
  fill?: boolean;
  className?: string;
};

/**
 * Homepage section 2 — what the state is building.
 *
 * It replaces the developer marquee that used to sit here. A wall of other
 * firms' logos is a claim about who the firm knows; on the second screen of
 * the page, before anything has been said about Gurugram, it asked the visitor
 * to be impressed by names rather than told anything they came for. The
 * marquee still exists, on the About page, where a claim about the firm
 * belongs.
 *
 * What stands here instead is the news a buyer is actually shopping against:
 * the metro, the rapid rail and the corridors the government has cleared, and
 * what each one does to the ground near it. Every figure is sourced and every
 * card carries its real status, because "proposed" and "under construction"
 * are different news and a page that blurs them is worth nothing.
 *
 * The backdrop is drawn rather than filmed — a surveyor's grid under a wash of
 * the brand blue, fading out at the edges. Stock footage of a city that is not
 * this one was working against copy whose whole point is local specificity,
 * and it cost 9MB to say less than a grid does.
 */
export const GurugramSection = ({
  eyebrow = 'What’s new in the city',
  heading = 'The state is rebuilding the map around you',
  lede = 'Metro, rapid rail, elevated corridors — cleared or already under construction. Where these land is what a sector will be worth, usually well before the asking price catches up.',
  projects = defaultProjects,
  asOf = 'Status as announced, August 2026',
  fill = false,
  className,
}: GurugramSectionProps) => {
  return (
    <section
      className={cn(
        /* A marine navy that carries some blue rather than the near-black the
           footage needed behind it. With nothing to hold back any more, the
           ground can be the brand's own colour family instead of a neutral
           dark, and the grid and the copy both read warmer against it. */
        'relative isolate w-full overflow-hidden bg-[#071c2e]',
        fill && 'lg:flex lg:h-full lg:min-h-0 lg:items-center',
        className,
      )}
    >
      {/* Depth on the ground itself — lighter at the top left where the wash
          falls, settling to near-black at the bottom. A single flat fill under
          a grid is what reads as unfinished. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(160deg,#0d2c46_0%,#082034_38%,#051625_72%,#030f1a_100%)]"
      />
      {/* Surveyor's grid, drawn in the brand blue rather than white so it
          belongs to the ground it sits on. Masked to fade well before the
          edges: an unmasked grid running into the corners reads as a table
          drawn around the copy instead of texture under it. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(56,189,248,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.10)_1px,transparent_1px)] bg-[length:72px_72px] [mask-image:radial-gradient(ellipse_78%_68%_at_50%_45%,#000_38%,transparent_100%)]"
      />
      {/* Every twelfth line heavier, the way a plan sheet marks its majors —
          it gives the grid a scale instead of one uniform mesh. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(56,189,248,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.16)_1px,transparent_1px)] bg-[length:288px_288px] [mask-image:radial-gradient(ellipse_78%_68%_at_50%_45%,#000_38%,transparent_100%)]"
      />
      {/* Brand-blue wash falling from the top edge, and a second, tighter one
          under the heading — together they lift the middle of the section so
          the cards have something to sit on. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(72%_58%_at_50%_-12%,rgba(0,128,198,0.38)_0%,transparent_66%),radial-gradient(42%_32%_at_50%_30%,rgba(11,154,224,0.18)_0%,transparent_72%)]"
      />
      {/* Floor and ceiling, so the section closes cleanly against the white
          that sits above and below it on the page. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(3,15,26,0.55)_0%,transparent_20%,transparent_80%,rgba(3,15,26,0.90)_100%)]"
      />

      <div
        className={cn(
          'mx-auto w-full max-w-[1400px] px-5 sm:px-8',
          fill ? 'py-16 lg:py-12' : 'py-20 sm:py-24',
        )}
      >
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-sky-300/70" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
              {eyebrow}
            </p>
            <span className="h-px w-8 bg-sky-300/70" />
          </div>
          <h2 className="mt-5 text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-[2.6rem]">
            {heading}
          </h2>
          <p className="mt-5 text-[16px] leading-[1.7] text-white/70">{lede}</p>
        </div>

        <ul
          className={cn(
            'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3',
            fill ? 'mt-10' : 'mt-14',
          )}
        >
          {projects.map((p) => (
            <li key={p.name} className="min-w-0">
              {/* The whole card is the link, not a "read more" at the bottom of
                  it — on a phone the card is the tap target you actually hit,
                  and a 12px link inside it is the one you miss. */}
              <a
                href={p.href}
                target="_blank"
                rel="noreferrer"
                /* A lit face rather than flat white at 4%: with a drawn ground
                   behind it there is nothing to frost, so the card earns its
                   edge from a top-down gradient and a hairline instead. */
                className="group/corridor relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/12 bg-[linear-gradient(160deg,rgba(255,255,255,0.075)_0%,rgba(255,255,255,0.03)_55%,rgba(255,255,255,0.015)_100%)] p-5 shadow-[0_18px_40px_-28px_rgb(0_0_0/0.9)] transition-all duration-300 hover:-translate-y-1 hover:border-sky-300/45 hover:bg-[linear-gradient(160deg,rgba(255,255,255,0.11)_0%,rgba(255,255,255,0.05)_55%,rgba(255,255,255,0.02)_100%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#071c2e] sm:p-6"
              >
              {/* the rule fills in from the left on hover — the same marker the
                  About page uses on its mission plates */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-sky-300/25 transition-colors duration-300 group-hover/corridor:bg-sky-300"
              />
              {/* The status carries most of the weight on this card — "under
                  construction" and "proposed" are entirely different news to
                  someone deciding where to buy, and burying that inside the
                  paragraph would let the section read as six done deals. */}
              {/* self-start, or the card's flex column stretches the chip to
                  the full width and it stops reading as a chip */}
              <p className="inline-flex self-start items-center gap-1.5 rounded-full border border-sky-300/25 bg-sky-300/10 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-sky-200">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-sky-300" />
                {p.status}
              </p>
              <h3 className="mt-3 text-[19px] font-bold leading-tight tracking-tight text-white">
                {p.name}
              </h3>
              <p className="mt-2 text-[14.5px] leading-[1.6] text-white/65">{p.body}</p>

              {/* Masthead and an arrow, pinned to the foot of the card by
                  mt-auto so the six read as one row however the copy wraps.
                  Naming the paper matters: an unattributed figure about public
                  money is just a claim, and this is the difference between
                  the section reporting and the section boasting. */}
              <span className="mt-auto flex items-center gap-1.5 pt-4 text-[12px] font-semibold text-sky-300/75 transition-colors duration-300 group-hover/corridor:text-sky-200">
                {p.source}
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover/corridor:translate-x-0.5 group-hover/corridor:-translate-y-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
                {/* the destination is a different site, so say so for anyone
                    who cannot see the arrow */}
                <span className="sr-only">— opens {p.source} in a new tab</span>
              </span>
              </a>
            </li>
          ))}
        </ul>

        {/* Dated on purpose. Every figure above is somebody's announcement, and
            announcements move — a page that prints them undated is claiming a
            currency it cannot keep. */}
        <p className="mt-8 text-center text-[12.5px] text-white/45">{asOf}</p>
      </div>
    </section>
  );
};

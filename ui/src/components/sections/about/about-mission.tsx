import { GradientButton } from '@/components/ui/gradient-button/gradient-button';
import { cn } from '@/lib/utils';

export type PartnerLogo = { name: string; src: string };

/** One of the statements the heading promises. */
export type Pillar = { label: string; body: string };

export type AboutMissionProps = {
  eyebrow?: string;
  heading?: string;
  lede?: string;
  /** Mission, vision and the promise under both. */
  pillars?: Pillar[];
  beliefsIntro?: string;
  beliefs?: string[];
  /** Panel beside the copy. */
  partnersEyebrow?: string;
  partnersHeading?: string;
  partnersLede?: string;
  /** Logo wall. Sixteen fills the 4×4 mosaic edge to edge with no remainder. */
  partners?: PartnerLogo[];
  ctaLine?: string;
  /** Reassurance under the closing line. */
  ctaNote?: string;
  ctaLabel?: string;
  ctaHref?: string;
  fill?: boolean;
  className?: string;
};

/* The heading says "Mission and vision"; for a long time only the mission was
   actually here, which is what left this column short beside the logo wall.
   Both are now stated, plus the promise that sits under them — the free
   paperwork support the firm offers whether or not you buy through it. */
const defaultPillars: Pillar[] = [
  {
    label: 'Our mission',
    body: 'To help our clients make wise and profitable property decisions in Gurugram — guiding every buyer and seller toward outcomes that genuinely serve their goals.',
  },
  {
    label: 'Our vision',
    body: 'To stay the firm Gurugram families and investors call first, and to be judged as much by the deals we advised against as by the ones we closed.',
  },
  {
    label: 'Our promise',
    body: 'Straight answers, the same price to everyone, and free help with paperwork, registry and dues — whether or not the property came through us.',
  },
];

/* The reference site's four, as it words them. */
const defaultBeliefs = [
  'Performance across all lines of business',
  'Delivering tangible benefits to clients',
  'Solid fundamentals',
  'Profitable results',
];

/* Sixteen of the seventeen logos the home page marquee carries — 4×4 tiles the
   mosaic exactly, and a seventeenth would leave three empty cells on the last
   row and break the block edge the collage depends on. */
const defaultPartners: PartnerLogo[] = [
  { name: 'DLF', src: '/img/brands/dlf.png' },
  { name: 'Emaar', src: '/img/brands/emaar.png' },
  { name: 'Unitech', src: '/img/brands/unitech.png' },
  { name: 'BPTP', src: '/img/brands/bptp.png' },
  { name: 'Bestech', src: '/img/brands/bestech.png' },
  { name: 'Parsvnath', src: '/img/brands/parsvnath.png' },
  { name: 'Ansal API', src: '/img/brands/ansal-api.png' },
  { name: 'Central Park', src: '/img/brands/central-park.png' },
  { name: 'Spaze', src: '/img/brands/spaze.png' },
  { name: 'Ansal Housing', src: '/img/brands/ansal-housing.png' },
  { name: 'Suncity', src: '/img/brands/suncity.png' },
  { name: 'Earth', src: '/img/brands/earth.png' },
  { name: 'SS Group', src: '/img/brands/ss-group.png' },
  { name: 'Antariksh', src: '/img/brands/antariksh.png' },
  { name: 'Universal', src: '/img/brands/universal.png' },
  { name: 'KLJ', src: '/img/brands/klj.png' },
];

/**
 * About page — section 2.
 *
 * Copy left, partner-developer panel right, each taking half the width. The
 * panel is one object: heading, a logo mosaic, and the closing ask, stacked
 * inside a single card so the three read as one statement rather than three
 * stray blocks.
 */
export const AboutMission = ({
  eyebrow = 'What drives us',
  heading = 'Mission and vision',
  lede = 'Twenty years in one market, and the same two statements behind every deal we have handled in it.',
  pillars = defaultPillars,
  beliefsIntro = 'We believe in:',
  beliefs = defaultBeliefs,
  partnersEyebrow = 'Partner developers',
  partnersHeading = 'Trusted developer network',
  partnersLede = "We work with Gurugram's leading developers to bring you the widest choice of quality projects.",
  partners = defaultPartners,
  ctaLine = "Let's find your next property",
  ctaNote = 'Talk to a licensed advisor today — no commission on free support.',
  ctaLabel = 'Contact Us',
  ctaHref = '#contact-page',
  fill = false,
  className,
}: AboutMissionProps) => {
  return (
    <section
      className={cn(
        'w-full bg-muted/40',
        fill && 'lg:flex lg:h-full lg:min-h-0 lg:items-center',
        className,
      )}
    >
      <div
        className={cn(
          'mx-auto w-full max-w-[1400px] px-5 sm:px-8',
          fill ? 'py-14 lg:py-10' : 'py-16 sm:py-24',
        )}
      >
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-14">
          {/* copy */}
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-primary" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                {eyebrow}
              </p>
            </div>

            <h2 className="mt-4 text-5xl font-bold leading-[1.02] tracking-tight text-foreground sm:text-6xl">
              {heading}
            </h2>

            <p className="mt-6 text-[17px] leading-[1.7] text-foreground/85">{lede}</p>

            {/* Mission, vision, promise. Stacked plates rather than three more
                cards in a grid: read top to bottom they are one argument, and
                stacked they also carry this column down to the height of the
                logo wall opposite, which is what left it looking empty. */}
            <ul className="mt-7 space-y-3">
              {pillars.map((p) => (
                <li
                  key={p.label}
                  className="group/pillar relative overflow-hidden rounded-2xl border bg-card p-5 shadow-[0_10px_28px_-22px_rgb(0_0_0/0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-[0_18px_38px_-22px_rgb(0_128_198/0.5)] sm:p-6"
                >
                  {/* a brand rule down the left edge that fills in on hover —
                      the plate is doing the work, so the marker stays a hairline */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-primary/25 transition-colors duration-300 group-hover/pillar:bg-primary"
                  />
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                    {p.label}
                  </p>
                  <p className="mt-2 text-[15.5px] leading-[1.65] text-foreground/85">{p.body}</p>
                </li>
              ))}
            </ul>

            {/* The four generic claims that used to live here — "Solid
                fundamentals", "Profitable results" — are gone: the About page
                now states why to choose this firm in its own section, in the
                firm's own words, and saying it twice weakened both. Guarded
                rather than deleted so the block returns if beliefs are set. */}
            {beliefs.length > 0 && (
              <>
            <p className="mt-7 text-[15px] font-semibold text-foreground">{beliefsIntro}</p>

            {/* Four cards rather than four bullets. A bulleted list reads as
                an aside to the paragraph above it; as cards they carry the same
                weight as the panel opposite, which is what these four claims
                are meant to have. Numbered, not iconed — "Solid fundamentals"
                has no honest glyph, and a guessed one is worse than none. */}
            <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {beliefs.map((b, i) => (
                <li
                  key={b}
                  /* The whole card takes the brand colour on hover, not just
                     its border — a hairline going blue is a change you have to
                     look for. The tint stays pale enough that the text keeps
                     its contrast. */
                  className="group/belief relative flex flex-col overflow-hidden rounded-2xl border bg-card p-4 shadow-[0_10px_28px_-22px_rgb(0_0_0/0.4)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-[linear-gradient(150deg,#eaf4fc_0%,#f7fbfe_55%,#e3eff9_100%)] hover:shadow-[0_20px_40px_-20px_rgb(0_128_198/0.55)]"
                >
                  {/* a wash that sweeps up from the bottom edge as you arrive */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-0 bg-[linear-gradient(0deg,rgb(0_128_198/0.14),transparent)] transition-[height] duration-500 ease-out group-hover/belief:h-full"
                  />
                  <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-[13px] font-bold text-primary shadow-none transition-all duration-300 group-hover/belief:scale-110 group-hover/belief:bg-primary group-hover/belief:text-primary-foreground group-hover/belief:shadow-[0_8px_18px_-8px_rgb(0_128_198/0.95)]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="relative mt-3 text-[14px] font-medium leading-[1.5] text-foreground transition-colors duration-300 group-hover/belief:text-primary">
                    {b}
                  </span>
                </li>
              ))}
            </ul>
              </>
            )}
          </div>

          {/* partner developers */}
          <div className="group/panel min-w-0 overflow-hidden rounded-2xl border bg-card shadow-[0_20px_48px_-26px_rgb(0_0_0/0.35)] transition-all duration-500 hover:border-primary/40 hover:shadow-[0_26px_56px_-26px_rgb(0_128_198/0.45)]">
            {/* Empty `partners` drops the wall and its heading, leaving the
                panel as the closing ask alone. The About page uses that: the
                developer marquee runs immediately above this section, and the
                same sixteen logos twice on one scroll is not twice the
                argument. */}
            {partners.length > 0 && (
              <>
            <div className="px-6 pb-5 pt-6 sm:px-7">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-primary" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  {partnersEyebrow}
                </p>
              </div>
              <h3 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-foreground">
                {partnersHeading}
              </h3>
              <p className="mt-2.5 text-[15px] leading-[1.6] text-muted-foreground">
                {partnersLede}
              </p>
            </div>

            {/* Logo mosaic. gap-0 with hairline dividers instead of gutters, so
                the wall is one continuous block flush to the card's edges —
                gutters would read as sixteen separate cards. Held back to 75%
                opacity: sixteen full-strength logos would out-shout the copy
                they are meant to support. */}
            {/* Warm stone, not blue. Half these marks are themselves blue —
                Bestech, Unitech, KLJ, Earth — and a blue ground flattened them
                into it. A neutral warm wall is the gallery trick: it belongs to
                none of the logos, so it sets all of them off. */}
            <ul className="grid grid-cols-4 border-y border-border/70 bg-[linear-gradient(135deg,#f5f1e9_0%,#fbf9f4_50%,#efeae0_100%)]">
              {partners.slice(0, 16).map((logo, i) => (
                <li
                  key={logo.src}
                  className={cn(
                    // flex, not grid: a grid item's min-height is auto, so
                    // percentage heights on the logo resolved to nothing and
                    // tall marks pushed straight out of their tile
                    'flex aspect-[16/9] items-center justify-center overflow-hidden p-2.5',
                    // each tile lifts to near-white on hover, so the one being
                    // looked at separates from the wall
                    'transition-colors duration-300 hover:bg-white/70',
                    // no right rule on the last column, no bottom rule on the
                    // last row — the card's own border closes those edges
                    (i + 1) % 4 !== 0 && 'border-r border-border/70',
                    i < 12 && 'border-b border-border/70',
                  )}
                >
                  <img
                    src={logo.src}
                    alt={logo.name}
                    loading="lazy"
                    className="h-full w-full object-contain opacity-75 transition-opacity duration-300 hover:opacity-100"
                  />
                </li>
              ))}
            </ul>
              </>
            )}

            <div
              className={cn(
                'flex flex-wrap items-center justify-between gap-4 px-6 pb-6 sm:px-7',
                // nothing above it to sit under when the wall is off
                partners.length > 0 ? 'pt-5' : 'pt-6',
              )}
            >
              <div className="min-w-0">
                <p className="text-[17px] font-semibold tracking-tight text-foreground">
                  {ctaLine}
                </p>
                <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{ctaNote}</p>
              </div>
              <GradientButton asChild className="shrink-0 gap-2 px-6 py-3 text-sm">
                <a href={ctaHref}>
                  {ctaLabel}
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </a>
              </GradientButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

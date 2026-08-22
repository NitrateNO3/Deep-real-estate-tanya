import { cn } from '@/lib/utils';

export type WhyPoint = { title: string; body: string };

export type AboutWhyProps = {
  eyebrow?: string;
  heading?: string;
  /** Sits under the heading, inside the grid's first cell. */
  lede?: string;
  points?: WhyPoint[];
  className?: string;
};

/* The firm's own five, as supplied. */
const defaultPoints: WhyPoint[] = [
  {
    title: '20+ Years of Experience',
    body: 'Established in 2005 with extensive experience in Gurugram real estate.',
  },
  {
    title: 'Gurugram Market Expertise',
    body: 'Deep knowledge of Gurugram’s established and emerging locations.',
  },
  {
    title: 'Trusted Relationships',
    body: 'Our business is built on repeat clients, referrals, and long-term relationships.',
  },
  {
    title: 'Transparent Dealings',
    body: 'Clear communication and straightforward advice at every stage.',
  },
  {
    title: 'Personalised Service',
    body: 'Every client and property requirement receives individual attention.',
  },
];

/**
 * About page — why choose us.
 *
 * Numbered rather than iconed. Five claims of this kind — experience, market
 * knowledge, trust, transparency, attention — have no honest glyphs between
 * them, and five guessed ones would say less than the numerals do.
 *
 * The heading is a cell of the grid rather than a band above it: five cards in
 * a three-up grid always left a hole, and heading + five fills 3×2 exactly.
 * The asymmetry then reads as the composition rather than as a gap.
 *
 * The numeral is a watermark behind each card instead of a chip on top of it.
 * Five identical blue chips in a row were the loudest thing in the section and
 * all said the same thing; set back at 7% they order the cards without
 * competing with the titles for the eye.
 */
export const AboutWhy = ({
  eyebrow = 'Why Choose Us',
  heading = 'Why Deep Real Estate?',
  lede = 'Two decades in one market, and a client list that still grows mostly by word of mouth. Five reasons that keeps happening.',
  points = defaultPoints,
  className,
}: AboutWhyProps) => (
  <section className={cn('w-full bg-muted/40', className)}>
    <div className="mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-8 sm:py-20">
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* the heading, holding the first cell */}
        <li className="flex flex-col justify-center md:col-span-2 lg:col-span-1 lg:pr-4">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-primary" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {eyebrow}
            </p>
          </div>
          <h2 className="mt-4 text-3xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-[2.5rem]">
            {heading}
          </h2>
          <p className="mt-4 max-w-md text-[15.5px] leading-[1.7] text-muted-foreground">{lede}</p>
        </li>

        {points.map((p, i) => (
          <li
            key={p.title}
            className={cn(
              'group/why relative flex flex-col overflow-hidden rounded-2xl border bg-card p-6 shadow-[0_10px_28px_-22px_rgb(0_0_0/0.4)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_20px_44px_-22px_rgb(0_128_198/0.5)]',
              // two-up, the heading eats one cell, so an odd count would leave
              // the last card hanging beside a gap — it takes the row instead
              i === points.length - 1 && points.length % 2 === 1 && 'md:col-span-2 lg:col-span-1',
            )}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-0 bg-[linear-gradient(0deg,rgb(0_128_198/0.12),transparent)] transition-[height] duration-500 ease-out group-hover/why:h-full"
            />
            {/* the numeral, set into the card's top corner */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-3 right-3 select-none text-[76px] font-black leading-none tabular-nums text-primary/[0.07] transition-colors duration-300 group-hover/why:text-primary/[0.14]"
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            {/* a rule that draws itself out as you arrive — the one moving
                part, in place of five chips that all lit up at once */}
            <span
              aria-hidden="true"
              className="relative block h-[3px] w-9 rounded-full bg-primary/60 transition-all duration-300 group-hover/why:w-16 group-hover/why:bg-primary"
            />
            <h3 className="relative mt-5 text-[17px] font-bold tracking-tight text-foreground">
              {p.title}
            </h3>
            <p className="relative mt-2 text-[15px] leading-[1.65] text-muted-foreground">
              {p.body}
            </p>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

import { cn } from '@/lib/utils';

export type ServiceItem = { title: string; body: string };

export type AboutServicesProps = {
  eyebrow?: string;
  heading?: string;
  /** Under the heading in the left column, above the CTA. */
  lede?: string;
  items?: ServiceItem[];
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
};

const defaultItems: ServiceItem[] = [
  {
    title: 'Buy',
    body: 'Find the right property based on your requirements, location, and investment goals.',
  },
  {
    title: 'Sell',
    body: 'Get professional assistance in positioning, marketing, negotiating, and closing your property sale.',
  },
  {
    title: 'Invest',
    body: 'Identify promising real estate opportunities with practical, market-driven guidance.',
  },
  {
    title: 'Lease & Rent',
    body: 'Reliable assistance for residential and commercial leasing requirements.',
  },
];

/* One glyph per service, and each is a literal picture of the thing: a key for
   buying, a tag for selling, a rising line for investing, a handover for
   leasing. Where a claim has no honest glyph this site numbers it instead —
   these four do have one. */
const icons: Record<string, React.ReactNode> = {
  Buy: (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="m10.85 12.15 8.15-8.15 2 2-2 2 2 2-3 3-2-2-2 2" />
    </>
  ),
  Sell: (
    <>
      <path d="M20.59 13.41 13.42 20.6a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <path d="M7 7h.01" />
    </>
  ),
  Invest: (
    <>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M21 3h-6M21 3v6" />
    </>
  ),
  'Lease & Rent': (
    <>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </>
  ),
};

/**
 * About page — what the firm actually does for you.
 *
 * Split rather than stacked: the heading and the ask hold a column of their
 * own on the left, the four services sit two-up beside them. Four equal cards
 * strung across the full width read as a row of tiles with a stray button
 * underneath; paired against the heading they read as the offer, with the ask
 * attached to it.
 *
 * Each card is itself a link to the same conversation, because every one of
 * these four starts with it.
 */
export const AboutServices = ({
  eyebrow = 'Our Services',
  heading = 'Buying, selling, investing or letting.',
  lede = 'Four ways to move with property in Gurugram. Start with the one that’s right for you.',
  items = defaultItems,
  ctaLabel = 'Talk to us about it',
  ctaHref = '#contact-page',
  className,
}: AboutServicesProps) => (
  <section className={cn('w-full bg-background', className)}>
    <div className="mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-8 sm:py-20">
      {/* Mirrored: the reasons above lead with their heading on the left, so
          this one sits on the right and the page alternates instead of
          repeating the same column twice running. Heading stays first in the
          DOM — it is what you read first, and on mobile it is what you see
          first; only the wide layout swaps the two. */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_minmax(0,380px)] lg:gap-14">
        {/* the offer, stated once */}
        <div className="self-start lg:sticky lg:top-24 lg:order-2">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-primary" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {eyebrow}
            </p>
          </div>
          <h2 className="mt-4 text-3xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-[2.5rem]">
            {heading}
          </h2>
          <p className="mt-5 max-w-md text-[15.5px] leading-[1.7] text-muted-foreground">{lede}</p>

          <a
            href={ctaHref}
            className="group/cta relative isolate mt-7 inline-flex h-12 items-center gap-2 overflow-hidden rounded-full bg-[linear-gradient(120deg,#0b9ae0_0%,#0080c6_50%,#00618f_100%)] px-8 text-[15px] font-bold text-white shadow-[0_14px_30px_-12px_rgb(0_128_198/0.85)] transition-transform duration-300 hover:-translate-y-0.5"
          >
            <span
              aria-hidden="true"
              className="animate-sheen pointer-events-none absolute inset-y-0 -z-10 w-10 bg-white/40 motion-reduce:hidden"
              style={{ animationDuration: '2.4s', animationIterationCount: 'infinite' }}
            />
            {ctaLabel}
            <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </a>
        </div>

        {/* the four */}
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:order-1">
          {items.map((s) => (
            <li key={s.title} className="flex">
              <a
                href={ctaHref}
                className="group/svc relative flex w-full flex-col overflow-hidden rounded-2xl border bg-card p-6 shadow-[0_10px_28px_-22px_rgb(0_0_0/0.4)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_20px_44px_-22px_rgb(0_128_198/0.5)] sm:p-7"
              >
                {/* a wash that fills from the bottom on hover, the same one the
                    reasons above use, so the two sections behave alike */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-0 bg-[linear-gradient(0deg,rgb(0_128_198/0.1),transparent)] transition-[height] duration-500 ease-out group-hover/svc:h-full"
                />

                <span
                  aria-hidden="true"
                  className="relative grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover/svc:scale-105 group-hover/svc:bg-[linear-gradient(135deg,#0b9ae0_0%,#00618f_100%)] group-hover/svc:text-white group-hover/svc:shadow-[0_12px_24px_-12px_rgb(0_128_198/0.95)]"
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {icons[s.title] ?? <circle cx="12" cy="12" r="9" />}
                  </svg>
                </span>

                <h3 className="relative mt-5 text-xl font-bold tracking-tight text-foreground">
                  {s.title}
                </h3>
                <p className="relative mt-2.5 flex-1 text-[15px] leading-[1.65] text-muted-foreground">
                  {s.body}
                </p>

                {/* the affordance: the card is a link, and this is what says so */}
                <span className="relative mt-5 inline-flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-[0.14em] text-primary/70 transition-colors duration-300 group-hover/svc:text-primary">
                  Enquire
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 transition-transform duration-300 group-hover/svc:translate-x-1" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);

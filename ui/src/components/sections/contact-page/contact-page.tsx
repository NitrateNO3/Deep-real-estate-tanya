import { useState } from 'react';
import { ContactPopup } from '@/components/ui/contact-popup/contact-popup';
import { ContactForm, type ContactValues } from '@/components/sections/contact/contact-form';
import { cn } from '@/lib/utils';

export type ContactPageProps = {
  address?: string;
  phones?: string[];
  emails?: string[];
  heading?: string;
  lede?: string;
  onSubmit?: (values: ContactValues) => void;
  className?: string;
};

/* Comma after "Extn." — the same spelling the footer and the legal pages use. */
const DEFAULT_ADDRESS =
  'G-564, Sushant Lok-II Extn., Sector 57, Nr. Scottish High Gurgaon, Haryana-122002, India';

const PinIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PhoneIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.35 1.9.66 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.31 1.85.53 2.81.66A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MailIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 6L2 7" />
  </svg>
);

/**
 * A flat capture of the head-office map, cropped to a wide band with the marker
 * centred. It replaces the Google Maps embed that used to back this hero: the
 * embed was over a megabyte of script and tiles, it sat above the fold so
 * `loading="lazy"` never deferred it, and its live compositing layer left the
 * heading and lede rendering pale until something forced a repaint. One 134KB
 * image has none of those problems. "Open in Maps" below covers the case where
 * someone actually wants to pan around.
 */
const MAP_IMAGE = '/img/maps/head-office.webp';

/**
 * Where "Open in Maps" goes.
 *
 * Deliberately not built from the address printed on this page. The two are
 * written differently — the printed one reads "Sushant Lok-II Extn., …
 * 122002", the Google listing reads "Block G, Sushant Lok 2, … 122011" — so
 * searching the printed text does not reliably resolve to the office's own
 * listing. This is the listing's own wording, which does. The plus code
 * C3GR+88 Gurugram is the same point if it ever needs checking against a map.
 */
const MAP_QUERY =
  'Deep Real Estate, Ground Floor, G-564, Block G, Sushant Lok 2, Sector 57, Gurugram, Haryana 122011';

/**
 * Contact page.
 *
 * The hero band carries a map of the head office as its backdrop, held well
 * back so the heading and copy stay the thing you read. The two cards straddle
 * the boundary between the band and the page below it.
 */
export const ContactPage = ({
  address = DEFAULT_ADDRESS,
  phones = ['0124-4080100', '9810922338'],
  emails = ['info@deeprealestate.in'],
  heading = 'Contact us',
  lede = 'We are happy to answer questions about a sector, a project or a price. Call the office, write to us, or leave your details below and we will come back to you.',
  onSubmit,
  className,
}: ContactPageProps) => {
  const [contactOpen, setContactOpen] = useState(false);
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_QUERY)}`;

  return (
    <div className={cn('w-full bg-background', className)}>
      {/* ------------------------------------------------------------ hero */}
      <section className="relative isolate overflow-hidden bg-muted/60">
        {/* map backdrop — decorative, so it carries no alt text */}
        <img
          src={MAP_IMAGE}
          alt=""
          aria-hidden="true"
          width={1920}
          height={645}
          fetchPriority="high"
          decoding="async"
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-60 grayscale-[0.2] dark:opacity-35 dark:invert"
        />
        {/* wash, so headings sit on an even ground rather than on map detail */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(246,249,251,0.62)_0%,rgba(246,249,251,0.42)_50%,rgba(246,249,251,0.80)_100%)] dark:bg-[linear-gradient(180deg,rgba(8,21,31,0.72)_0%,rgba(8,21,31,0.58)_50%,rgba(8,21,31,0.88)_100%)]"
        />

        <div className="mx-auto w-full max-w-[1400px] px-5 pb-28 pt-8 text-center sm:px-8 sm:pb-32 sm:pt-10">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-primary" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Get in touch
              </p>
              <span className="h-px w-8 bg-primary" />
            </div>

            <h1 className="mt-3 text-3xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-4xl lg:text-[2.6rem]">
              {heading}
            </h1>
            {/* full-strength, same as the heading — over a map backdrop a
                dimmed lede just reads as washed out */}
            <p className="mt-3 text-[15px] leading-[1.55] text-foreground">{lede}</p>

            {/* filled in the brand blue, with the pin dropping on hover and a
                soft pulse behind it so it reads as a live control */}
            <a
              href={mapLink}
              target="_blank"
              rel="noreferrer"
              className="group relative mt-5 inline-flex items-center gap-2 overflow-hidden rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/35"
            >
              {/* sheen that sweeps across on hover */}
              <span
                aria-hidden="true"
                className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)] transition-transform duration-700 group-hover:translate-x-full"
              />
              <span aria-hidden="true" className="relative flex h-4 w-4 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/50 motion-reduce:animate-none" />
                <PinIcon className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
              </span>
              <span className="relative">Open in Maps</span>
            </a>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- cards */}
      {/* relative z-10 is load-bearing: the hero above is position:relative, and
          positioned elements paint above static ones regardless of DOM order —
          so without this the cards pulled up by the negative margin render
          *underneath* the hero's wash and come out looking faded. */}
      <section className="relative z-10 w-full">
        {/* pulled up so the cards straddle the band edge */}
        <div className="mx-auto -mt-24 w-full max-w-[1400px] px-5 pb-12 sm:-mt-24 sm:px-8 sm:pb-14">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
            {/* details */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border bg-card p-5 shadow-[0_24px_60px_-28px_rgb(0_0_0/0.45)] sm:p-6">
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  Head Office
                </h2>

                <ul className="mt-5 space-y-4">
                  <li className="flex gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <PinIcon className="h-[18px] w-[18px]" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Address
                      </p>
                      <p className="mt-1 text-[15px] leading-[1.65] text-foreground">{address}</p>
                    </div>
                  </li>

                  <li className="flex gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <PhoneIcon className="h-[18px] w-[18px]" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Phone Number
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                        {phones.map((p, i) => (
                          <span key={p} className="inline-flex items-center gap-2">
                            {i > 0 && <span className="text-muted-foreground/50">|</span>}
                            <a
                              href={`tel:${p.replace(/[^\d+]/g, '')}`}
                              className="text-[15px] font-semibold text-foreground transition-colors hover:text-primary"
                            >
                              {p}
                            </a>
                          </span>
                        ))}
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <MailIcon className="h-[18px] w-[18px]" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Emails
                      </p>
                      {emails.map((e) => (
                        <a
                          key={e}
                          href={`mailto:${e}`}
                          className="mt-1 block truncate text-[15px] font-semibold text-primary hover:underline"
                        >
                          {e}
                        </a>
                      ))}
                    </div>
                  </li>
                </ul>

                {/* Filling in seven fields is not everyone's idea of getting
                    in touch. This opens the same numbers dialog the header's
                    Buy/Sell Property button opens, so the alternative to the
                    form is one click away from it rather than buried. */}
                <div className="mt-6 border-t pt-5">
                  <button
                    type="button"
                    onClick={() => setContactOpen(true)}
                    className="group/call flex w-full cursor-pointer items-center gap-3 rounded-xl border-2 border-primary/25 bg-primary/[0.04] px-4 py-3.5 text-left transition-colors hover:border-primary hover:bg-primary/[0.08]"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[linear-gradient(120deg,#0b9ae0_0%,#0080c6_50%,#00618f_100%)] text-white">
                      <PhoneIcon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-bold text-foreground">
                        Prefer a call?
                      </span>
                      <span className="mt-0.5 block text-[13px] text-muted-foreground">
                        See every number and WhatsApp us directly
                      </span>
                    </span>
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-primary transition-transform duration-300 group-hover/call:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* form — same component the home page uses */}
            <div className="lg:col-span-7">
              <ContactForm onSubmit={onSubmit} compact />
            </div>
          </div>
        </div>
      </section>

      <ContactPopup open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
};

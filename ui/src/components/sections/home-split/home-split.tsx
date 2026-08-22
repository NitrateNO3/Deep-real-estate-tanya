import { AnimatedScroll, type ScrollPanel } from '@/components/ui/animated-scroll/animated-scroll';
import { ContactForm, type ContactValues } from '@/components/sections/contact/contact-form';
import { reviews as defaultReviews, type Review } from '@/components/sections/reviews/reviews-section';
import { cn } from '@/lib/utils';

export type PhoneLine = { number: string; label: string };

const defaultPhones: PhoneLine[] = [
  { number: '+91-9810922338', label: 'Mobile' },
  { number: '0124-4080100', label: 'Landline' },
  { number: '+91-9599639738', label: 'Free Support' },
];

const MailIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 6L2 7" />
  </svg>
);

const GoogleMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.86c2.26-2.09 3.57-5.17 3.57-8.87z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z" />
    <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.7 0 3.99 2.47 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
  </svg>
);

const Stars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
    {Array.from({ length: 5 }, (_, i) => (
      <svg key={i} viewBox="0 0 24 24" aria-hidden="true" className={cn('h-3.5 w-3.5', i < rating ? 'fill-amber-400 text-amber-400' : 'fill-none text-white/30')} stroke="currentColor" strokeWidth="1.5">
        <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

/** Shared frame: every half is a full-height, centred, padded block. */
const Half = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn('flex h-full w-full flex-col justify-center px-6 py-14 sm:px-10 lg:px-12 xl:px-16', className)}>
    {children}
  </div>
);

export type HomeSplitProps = {
  items?: Review[];
  phones?: PhoneLine[];
  email?: string;
  onSubmit?: (values: ContactValues) => void;
  className?: string;
};

/**
 * Home page — reviews and contact, as one split-scroll section.
 *
 * Two panels: what other people say, then the form. That order is the argument
 * — you are asked for your phone number only after someone else has vouched
 * for the office.
 *
 * Both halves are sized to a viewport, which is what drove the trimming: four
 * review cards became a 2 x 2 grid of quotes, and the form runs compact.
 */
export const HomeSplit = ({
  items = defaultReviews,
  phones = defaultPhones,
  email = 'info@deeprealestate.in',
  onSubmit,
  className,
}: HomeSplitProps) => {
  const panels: ScrollPanel[] = [
    {
      id: 'reviews',
      left: (
        <Half className="bg-[linear-gradient(160deg,#0b6fa8_0%,#08507c_100%)]">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-sky-200/70" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
              What people said
            </p>
          </div>
          <h2 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
            <span className="box-decoration-clone bg-[linear-gradient(transparent_62%,rgb(255_255_255/0.24)_62%)]">
              Our Sweet Testimonials
            </span>
          </h2>
          <p className="mt-4 max-w-md text-[16px] leading-[1.6] text-white/75">
            Verified Google reviews from our valued clients
          </p>
          <p className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-white/85">
            <GoogleMark className="h-4 w-4" />
            Unedited, straight from Google
          </p>
        </Half>
      ),
      right: (
        <Half className="bg-[#f4f8fb]">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {items.slice(0, 4).map((review) => (
              <figure
                key={review.name}
                className="flex h-full flex-col rounded-2xl border bg-card p-4 shadow-sm"
              >
                <Stars rating={review.rating} />
                {/* clamped, not shortened — the full text is still in the DOM
                    for anyone reading with assistive tech */}
                <blockquote className="mt-2.5 line-clamp-5 flex-1 text-[13px] leading-[1.6] text-foreground">
                  {review.text}
                </blockquote>
                <figcaption className="mt-3 flex items-center gap-2.5 border-t pt-3">
                  <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold uppercase text-primary">
                    {review.name.trim().charAt(0)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[12px] font-semibold capitalize text-foreground">
                      {review.name}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <GoogleMark className="h-3 w-3" />
                      Posted on {review.source}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Half>
      ),
    },
    {
      id: 'contact',
      left: (
        <Half className="bg-[#071a26]">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-sky-400" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
              Get in touch
            </p>
          </div>
          <h2 className="mt-4 text-4xl font-bold leading-[1.03] tracking-tight text-white sm:text-5xl">
            Tell us what you&apos;re looking for
          </h2>
          <p className="mt-4 max-w-md text-[16px] leading-[1.6] text-white/70">
            Fill out our inquiry questionnaire and a member of our licensed team will reach out —
            typically within 15 minutes during business hours (9am–10pm).
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            {phones.map((p) => (
              <a
                key={p.number}
                href={`tel:${p.number.replace(/[^+\d]/g, '')}`}
                className="inline-flex items-baseline gap-1.5 transition-opacity hover:opacity-80"
              >
                <span className="box-decoration-clone bg-[linear-gradient(transparent_58%,rgb(245_158_11/0.75)_58%)] text-[15px] font-semibold text-white">
                  {p.number}
                </span>
                <span aria-hidden="true" className="text-white/40">
                  ·
                </span>
                <span className="text-xs text-white/60">{p.label}</span>
              </a>
            ))}
          </div>

          <a
            href={`mailto:${email}`}
            className="mt-4 inline-flex items-center gap-2.5 text-[15px] font-semibold text-sky-400 hover:underline"
          >
            <MailIcon className="h-4 w-4 shrink-0" />
            {email}
          </a>
        </Half>
      ),
      right: (
        <Half className="bg-[#f4f8fb]">
          <ContactForm onSubmit={onSubmit} compact />
        </Half>
      ),
    },
  ];

  return <AnimatedScroll panels={panels} className={className} />;
};

import { ContactForm, type ContactValues } from './contact-form';
import { HowItWorksCompact } from '@/components/ui/how-it-works/how-it-works';
import { cn } from '@/lib/utils';

export type FlowStep = {
  step: string;
  title: string;
  body: string;
  /** Which of the card's three palettes this step is drawn in. */
  colorTheme?: 'orange' | 'blue' | 'purple';
};

export type { ContactValues };

export type PhoneLine = {
  number: string;
  /** What the number is for — "Mobile", "Landline", "Free Support". */
  label: string;
};

export type ContactSectionProps = {
  phones?: PhoneLine[];
  email?: string;
  steps?: FlowStep[];
  onSubmit?: (values: ContactValues) => void;
  fill?: boolean;
  className?: string;
};

const defaultPhones: PhoneLine[] = [
  { number: '+91-9810922338', label: 'Mobile' },
  { number: '0124-4080100', label: 'Landline' },
  { number: '+91-9599639738', label: 'Free Support' },
];

const defaultSteps: FlowStep[] = [
  {
    step: '01',
    title: 'Reach Us',
    body: 'Call or send an inquiry — we respond within 15 minutes during business hours.',
    colorTheme: 'blue',
  },
  {
    step: '02',
    title: 'Choose Location',
    body: 'Pick your preferred sector or locality across the Gurugram market.',
    colorTheme: 'orange',
  },
  {
    step: '03',
    title: 'Choose Property',
    body: 'Shortlist from properties matched to your budget and requirements.',
    colorTheme: 'purple',
  },
  {
    step: '04',
    title: 'Confirmation',
    body: 'Close the deal with transparent documentation and full support.',
    colorTheme: 'blue',
  },
];

const MailIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 6L2 7" />
  </svg>
);

/**
 * Homepage section — contact + process flow.
 *
 * The form is the page's primary conversion point, so it is treated as an
 * object rather than a set of outlines: raised card, filled fields with real
 * borders, and a solid full-width submit. The section sits on a tinted ground
 * so the white card has something to lift off.
 */
export const ContactSection = ({
  phones = defaultPhones,
  email = 'info@deeprealestate.in',
  steps = defaultSteps,
  onSubmit,
  fill = false,
  className,
}: ContactSectionProps) => {

  return (
    /* Blue-tinted, not white. The reviews band above is a neutral light grey
       and this used to be plain white beside it — two pale grounds with nothing
       between them, so the seam disappeared and the two sections read as one
       long block. A blue cast separates them by hue while both stay light, and
       the top rule makes the join explicit. The two halves keep their own step
       of that blue so the form and the process are still told apart. */
    <section
      className={cn(
        'grid w-full grid-cols-1 border-t border-primary/15 lg:grid-cols-2',
        fill && 'lg:h-full lg:min-h-0',
        className,
      )}
    >
      {/* =============================================== part 1 · contact */}
      <div
        className={cn(
          'flex flex-col justify-center bg-[linear-gradient(165deg,#f1f7fc_0%,#e6f0f9_100%)] px-5 sm:px-8 lg:px-10 xl:px-14',
          fill ? 'py-14 lg:py-10' : 'py-16 sm:py-20',
        )}
      >
        {/* ------------------------------------------------------- header */}
        <div className="max-w-3xl">
          {/* The navbar's limelight, reused: a hot bar with a cone of light
              spilling down from it. Same recipe as the active nav item, so the
              page's two "this is the thing" markers are one idea. Fixed width
              here rather than measured — it lights the heading, not a tab. */}
          <span
            aria-hidden="true"
            className="pointer-events-none relative z-0 block h-[3px] w-28 rounded-full bg-primary shadow-[0_0_18px_2px_var(--primary)]"
          >
            <span className="absolute left-[-30%] top-[3px] h-16 w-[160%] bg-gradient-to-b from-primary/25 to-transparent [clip-path:polygon(6%_100%,26%_0,74%_0,94%_100%)]" />
          </span>

          {/* No eyebrow — the heading says what this is, and a label above it
              only repeated the point. */}
          <h2 className="mt-7 text-4xl font-bold leading-[1.03] tracking-tight sm:text-5xl lg:text-[3.5rem]">
            {/* Same brand ramp as the Featured Properties title, so the page's
                two big headings are cut from one cloth. */}
            <span className="bg-[linear-gradient(100deg,#0b9ae0_0%,#0080c6_45%,#00618f_100%)] bg-clip-text text-transparent">
              Tell us what you&apos;re looking for
            </span>
          </h2>
          <p className="mt-4 max-w-xl text-[17px] leading-[1.6] text-muted-foreground">
            Fill out our inquiry questionnaire and a member of our licensed team will reach out
            — typically within 15 minutes during business hours (9am–10pm).
          </p>

          {/* All three numbers on one row. The per-number phone icons are gone:
              at this width three icons are what pushed the row into wrapping,
              and the caption after each number already says what it is.
              flex-wrap is the fallback for narrow screens; tel: strips the
              separators the display keeps.

              Each number is marked with a highlighter — the same trick as the
              testimonials heading (a background gradient that starts partway
              down the line box, so it follows the text rather than sitting
              behind it), in amber instead of blue. */}
          <div className="mt-5 flex flex-wrap items-baseline gap-x-3.5 gap-y-2.5">
            {phones.map((p) => (
              <a
                key={p.number}
                href={`tel:${p.number.replace(/[^+\d]/g, '')}`}
                className="inline-flex items-baseline gap-1 whitespace-nowrap transition-colors hover:text-primary"
              >
                <span className="box-decoration-clone bg-[linear-gradient(transparent_58%,rgb(245_158_11/0.5)_58%)] text-sm font-semibold text-foreground">
                  {p.number}
                </span>
                <span aria-hidden="true" className="text-muted-foreground/50">
                  ·
                </span>
                <span className="text-xs text-muted-foreground">{p.label}</span>
              </a>
            ))}
          </div>

          <a
            href={`mailto:${email}`}
            className="mt-3 inline-flex items-center gap-2.5 text-[15px] font-semibold text-primary hover:underline"
          >
            <MailIcon className="h-4 w-4 shrink-0" />
            {email}
          </a>
        </div>

        {/* -------------------------------------------------- form card */}
        <div className={cn(fill ? 'mt-8' : 'mt-10')}>
          <ContactForm onSubmit={onSubmit} compact={fill} />
        </div>
      </div>

      {/* ========================================== part 2 · how we work */}
      <div
        className={cn(
          'flex flex-col justify-center border-l border-primary/10 bg-[linear-gradient(160deg,#e2edf7_0%,#d4e5f3_100%)] px-5 sm:px-8 lg:px-10 xl:px-14',
          fill ? 'py-14 lg:py-10' : 'py-16 sm:py-20',
        )}
      >
        {/* The "How it works" eyebrow is gone — the heading under it already
            said the same thing twice over. Its absence is what the extra top
            margin replaces: without it the title started hard against the top
            of the column. */}
        <h2 className="mt-6 text-4xl font-bold leading-[1.03] tracking-tight text-foreground sm:mt-12 sm:text-5xl lg:text-[3.5rem]">
          Our Process
        </h2>
        {/* Indented rather than right-aligned — the line is set ragged-right,
            and flipping it would leave the ragged edge on the side the eye
            starts from. */}
        <p className="mt-4 max-w-xl text-[16px] leading-[1.6] text-muted-foreground sm:ml-20">
          A streamlined, transparent, customer-focused path from first contact to confirmation.
        </p>

        {/* The pinned cards in a zig-zag, with the travelling dashed line
            running between them — the same cards and the same animation as the
            HowItWorks component, at the compact size, so this column can carry
            the arrangement without the 900px band the full layout needs. */}
        <HowItWorksCompact
          className="mt-8"
          features={steps.map((s) => ({
            title: s.title,
            description: s.body,
            colorTheme: s.colorTheme,
          }))}
        />
      </div>
    </section>
  );
};

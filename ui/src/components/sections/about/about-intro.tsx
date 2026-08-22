import { cn } from '@/lib/utils';

export type AboutIntroProps = {
  eyebrow?: string;
  heading?: string;
  paragraphs?: string[];
  imageSrc?: string;
  imageAlt?: string;
  fill?: boolean;
  className?: string;
};

/* The firm's own About Us copy, as supplied. It replaces the reference site's
   text, which claimed "the industry's top talent with technology" twice in
   three paragraphs and never once named the person who founded the place. */
const defaultParagraphs = [
  'Since 2005, Deep Real Estate has been serving clients across Gurugram with a commitment to honest advice, market knowledge, and personalised service.',
  'Founded by Pawan Yadav, our firm has grown through strong client relationships and an in-depth understanding of Gurugram’s evolving real estate landscape.',
  'From finding the right property to negotiating the right deal, we provide end-to-end assistance with professionalism and transparency.',
];

/**
 * About page — section 1.
 *
 * A 45 / 55 split: picture left, copy right. Stated as an explicit fraction
 * rather than a 12-column span, whose real width shifts with the gap.
 */
export const AboutIntro = ({
  eyebrow = 'About Us',
  heading = 'Experience You Can Trust.',
  paragraphs = defaultParagraphs,
  imageSrc = '/img/about/office.jpg',
  imageAlt = 'The Deep Real Estate office in Gurugram',
  fill = false,
  className,
}: AboutIntroProps) => {
  return (
    <section
      className={cn(
        'w-full bg-background',
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
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[52%_1fr] lg:gap-14">
          {/* picture */}
          <figure className="relative">
            <div className="overflow-hidden rounded-2xl border bg-muted shadow-[0_24px_56px_-28px_rgb(0_0_0/0.35)]">
              {/* 8/5 is the photograph's own ratio, so object-cover has nothing
                  to crop. It matters for this picture specifically: the frame
                  used to be 4/3 and 7/6 for a portrait-ish stock interior, and
                  those would take the sign off the right edge and cut the car
                  in half — the two things the photograph is of. */}
              <img
                src={imageSrc}
                alt={imageAlt}
                className="aspect-[8/5] w-full object-cover"
                loading="eager"
              />
            </div>
          </figure>

          {/* copy */}
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-primary" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                {eyebrow}
              </p>
            </div>

            <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
              {heading}
            </h1>

            {/* first paragraph carries more weight, the rest step back — the
                same three-size logic used on the home page */}
            <div className="mt-6 space-y-4">
              {paragraphs.map((p, i) => (
                <p
                  key={i}
                  className={cn(
                    'leading-[1.7]',
                    i === 0
                      ? 'text-[17px] text-foreground/85'
                      : 'text-[15px] text-muted-foreground',
                  )}
                >
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

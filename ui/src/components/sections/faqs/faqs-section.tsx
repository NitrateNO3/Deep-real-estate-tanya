import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

export type FaqItem = {
  id: string;
  question: string;
  /** One entry per paragraph — a couple of these answers run long. */
  answer: string[];
};

/**
 * The eight questions, in the order and wording the reference site publishes
 * them. Copied verbatim — including its straight apostrophes and its em dash,
 * so this stays diffable against the source rather than quietly re-typeset.
 *
 * These replace the phrasing carried over from the old PHP page, which had
 * gone through a mangling somewhere ("What are helps does Deep Real provide",
 * "the district's sub-office. registrar's").
 */
export const faqItems: FaqItem[] = [
  {
    id: 'item-1',
    question:
      "I'd like to sell my property. What documentation would I need to provide a buyer?",
    answer: [
      'The original Sale Deed, Title Deed, pertinent tax receipts, and Encumbrance Certificate may be requested by purchasers.',
    ],
  },
  {
    id: 'item-2',
    question: 'Stamp duty is paid by the buyer or seller?',
    answer: ['Only the buyer pays the Stamp Duty.'],
  },
  {
    id: 'item-3',
    question:
      'Is there a process/form to fill before the Sale Deed or Transfer Document can be executed?',
    answer: [
      'Yes — procedures and forms vary by state; each state in India has its own set of forms. Both parties must provide PAN numbers; either party may need Income Tax Form 60. An NRI not assessed for taxes in India may be exempt.',
    ],
  },
  {
    id: 'item-4',
    question: 'Do legal papers for property sales have to be registered?',
    answer: ["Yes. You can complete it at the district's sub-registrar's office."],
  },
  {
    id: 'item-5',
    question: 'When does a residential property sale become official?',
    answer: [
      'When the seller has received the full purchase price, the documents have been registered, and the buyer has been given physical possession.',
    ],
  },
  {
    id: 'item-6',
    question: 'What help does Deep Real provide to property brokers?',
    answer: [
      'Brokers can list properties for sale through the inquiry form on the website, connecting with buyers at no additional cost.',
    ],
  },
  {
    id: 'item-7',
    question: 'How soon after I list my property would I get a call?',
    answer: [
      'Within 15 minutes during business hours (9am–10pm), or the next business day otherwise.',
    ],
  },
  {
    id: 'item-8',
    question: 'How does Deep Real help if I want to sell my property?',
    answer: ["Complete an inquiry form, available on the website's front page."],
  },
];

export type FaqsProps = {
  items?: FaqItem[];
  heading?: string;
  lede?: string;
  /** Where the closing "get in touch" line points. */
  contactHref?: string;
  className?: string;
};

/**
 * FAQ section — a single-open accordion on a muted band.
 *
 * `type="single" collapsible` means one answer at a time and every item can be
 * closed, so the section has a short resting height instead of a wall of text.
 */
export const Faqs = ({
  items = faqItems,
  heading = 'Frequently Asked Questions',
  lede = 'The questions we are asked most often about selling, buying and registering property in Gurugram.',
  contactHref = '#contact-page',
  className,
}: FaqsProps) => {
  return (
    /* bluish-white ground rather than the flat neutral muted token */
    <section
      className={cn(
        'bg-[linear-gradient(180deg,#eef5fb_0%,#f7fbfe_45%,#e9f2fa_100%)] py-8 md:py-12',
        'dark:bg-[linear-gradient(180deg,#0b1b26_0%,#0d2130_45%,#09161f_100%)]',
        className,
      )}
    >
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div>
          <h2 className="text-4xl font-semibold text-foreground">
            {/* Highlighter, painted as the text's own background so it follows
                every line box rather than only the last one. */}
            <span className="box-decoration-clone bg-[linear-gradient(transparent_62%,rgb(0_128_198/0.3)_62%)]">
              {heading}
            </span>
          </h2>
          <p className="mt-3 text-balance text-lg text-muted-foreground">{lede}</p>
        </div>

        {/* the running border: a conic gradient on the wrapper, card inset by
            2px so only the rim shows */}
        <div className="mt-6 animate-border-run rounded-2xl p-[2px] [background:conic-gradient(from_var(--border-angle),var(--color-sky-400),var(--color-blue-600),var(--color-cyan-300),var(--color-blue-600),var(--color-sky-400))] motion-reduce:animate-none">
          <Accordion
            type="single"
            collapsible
            className="w-full rounded-[calc(1rem-2px)] bg-card px-5 py-1 shadow-lg sm:px-8 sm:py-2"
          >
            {items.map((item, i) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border-dotted last:border-b-0"
              >
                <AccordionTrigger className="group cursor-pointer gap-4 py-3.5 text-left text-base hover:no-underline">
                  <span className="flex min-w-0 items-start gap-3">
                    {/* Q / A badges — the thing that actually tells you which
                        is which; a chevron alone never did */}
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">
                      Q{i + 1}
                    </span>
                    <span className="font-semibold text-foreground transition-colors group-hover:text-primary">
                      {item.question}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="flex gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-emerald-500/15 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      A
                    </span>
                    {/* answers run to three paragraphs, so space them */}
                    <div className="min-w-0 space-y-2.5 border-l-2 border-primary/25 pl-4">
                      {item.answer.map((paragraph) => (
                        <p key={paragraph} className="text-[15px] leading-[1.65] text-muted-foreground">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <p className="mt-5 text-muted-foreground">
          Can’t find what you’re looking for? Talk to our{' '}
          <a href={contactHref} className="font-medium text-primary hover:underline">
            Gurugram office
          </a>
        </p>
      </div>
    </section>
  );
};

export default Faqs;

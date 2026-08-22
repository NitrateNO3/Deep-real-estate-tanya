import { Mail, MessageCircle, Phone } from 'lucide-react';
import { ProfileCard, type ProfileAction } from '@/components/ui/profile-card/profile-card';
import { cn } from '@/lib/utils';

export type AboutFounderProps = {
  eyebrow?: string;
  heading?: string;
  name?: string;
  role?: string;
  paragraphs?: string[];
  /** A photograph, when there is one. Without it the panel uses a monogram. */
  imageSrc?: string;
  /** Reached from the round buttons on the card. */
  phone?: string;
  whatsapp?: string;
  email?: string;
  className?: string;
};

const defaultParagraphs = [
  'With a vision to build a real estate business based on trust, integrity, and genuine relationships, Pawan Yadav founded Deep Real Estate in 2005.',
  'His understanding of the Gurugram market and commitment to client satisfaction continue to shape the firm’s approach today.',
];

/** tel: and wa.me both want digits; wa.me additionally wants no leading +. */
const telHref = (n: string) => `tel:${n.replace(/[^+\d]/g, '')}`;
const waHref = (n: string) => `https://wa.me/${n.replace(/\D/g, '')}`;

/**
 * About page — the founder.
 *
 * On the navy the site already uses for its stats strip and footer, so the
 * page has one dark beat in it rather than running pale from top to bottom.
 *
 * The portrait and the copy are one object: a square photograph with a white
 * card riding 80px over its right edge (see ProfileCard). The buttons on that
 * card are the ways to actually reach him — a founder section that introduces
 * a person and then gives you no way to speak to them is a dead end.
 *
 * The real photograph now, supplied by the firm. The monogram fallback stays
 * for anyone rendering this without one — a stranger's stock face under a real
 * person's name would be a lie about the one section whose whole point is that
 * a real person is behind the firm.
 */
export const AboutFounder = ({
  eyebrow = 'Founder',
  heading = 'Meet the Founder',
  name = 'Pawan Yadav',
  role = 'Founder, Deep Real Estate',
  paragraphs = defaultParagraphs,
  imageSrc = '/img/about/founder.jpg',
  phone = '+91-9810922338',
  whatsapp = '+91-9810922338',
  email = 'info@deeprealestate.in',
  className,
}: AboutFounderProps) => {
  const actions: ProfileAction[] = [
    ...(phone ? [{ icon: Phone, href: telHref(phone), label: `Call ${phone}` }] : []),
    ...(whatsapp
      ? [{ icon: MessageCircle, href: waHref(whatsapp), label: 'WhatsApp', external: true }]
      : []),
    ...(email ? [{ icon: Mail, href: `mailto:${email}`, label: email }] : []),
  ];

  return (
    <section className={cn('relative isolate w-full overflow-hidden bg-[#0b1a27]', className)}>
      {/* a wash of brand blue out of the corner, so the ground is not flat */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-40 -z-10 h-96 w-96 rounded-full bg-primary/20 blur-[90px]"
      />

      <div className="mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-8 sm:py-20">
        {/* The heading sits above the pair rather than inside the card: the
            card is about the person, the heading is about the section. */}
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-sky-400" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
              {eyebrow}
            </p>
          </div>
          <h2 className="mt-4 text-3xl font-bold leading-[1.08] tracking-tight text-white sm:text-[2.5rem]">
            {heading}
          </h2>
        </div>

        <ProfileCard
          className="mt-10"
          name={name}
          title={role}
          description={paragraphs}
          imageUrl={imageSrc}
          /* the portrait is a standing shot — a centred square crop would cut
             the head off, so the window is held near the top */
          imagePosition="center 16%"
          actions={actions}
          /* One notch off white on the navy: pure white at this size glared. */
          cardClassName="bg-[#f7fafc] ring-1 ring-white/10"
        />
      </div>
    </section>
  );
};

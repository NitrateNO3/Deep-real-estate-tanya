import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type ContactLine = {
  /** As displayed, separators and all. */
  number: string;
  label: string;
  /** What this line is actually for. Two numbers with no explanation is a list;
      with one, it is a choice. */
  note: string;
  /**
   * Landlines have no WhatsApp account, so those rows are call-only. Set true
   * on the mobiles.
   */
  whatsapp?: boolean;
};

export type ContactPopupProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  blurb?: string;
  lines?: ContactLine[];
  email?: string;
  hours?: string;
  className?: string;
};

/** tel: and wa.me both want digits; wa.me additionally wants no leading +. */
const telHref = (n: string) => `tel:${n.replace(/[^+\d]/g, '')}`;
const waHref = (n: string) => `https://wa.me/${n.replace(/\D/g, '')}`;

const PhoneIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.35 1.9.66 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.31 1.85.53 2.81.66A2 2 0 0 1 22 16.92z" />
  </svg>
);

/** WhatsApp's glyph, solid so it takes currentColor. */
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.174.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.892c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a12.03 12.03 0 0 0 5.71 1.447h.006c6.585 0 11.946-5.335 11.949-11.893 0-3.176-1.24-6.165-3.495-8.411M12.05 21.785h-.004a9.94 9.94 0 0 1-5.061-1.383l-.363-.216-3.759.982 1.004-3.653-.236-.375a9.86 9.86 0 0 1-1.516-5.263c.002-5.45 4.458-9.885 9.942-9.885a9.87 9.87 0 0 1 7.021 2.9 9.78 9.78 0 0 1 2.909 6.99c-.003 5.45-4.458 9.884-9.937 9.884" />
  </svg>
);

const DEFAULT_LINES: ContactLine[] = [
  { number: '+91-9810922338', label: 'Mobile', note: 'Fastest — the desk that answers first', whatsapp: true },
  { number: '0124-4080100', label: 'Landline', note: 'The office line' },
  { number: '+91-9599639738', label: 'Free support', note: 'Paperwork, registry and dues', whatsapp: true },
];

/**
 * The header CTA's dialog — the office's numbers, each with a call control and,
 * where there is one, a WhatsApp control.
 *
 * A dialog rather than a page: buying or selling starts with a phone call, and
 * putting a contact form in front of that adds a step to the thing the visitor
 * came to do.
 *
 * Kept calm on purpose: a pale sky-washed card, the site's blue only on the
 * call controls and under the digits, and no limelight bar. The dialog opens
 * on someone deciding whether to phone a stranger about a large sum of money —
 * it should look like an easy thing to do.
 *
 * Portaled to <body>, for the same reason the mobile drawer is: the header
 * establishes its own stacking context, and a fixed overlay rendered inside it
 * would size itself to the header rather than to the viewport.
 */
export const ContactPopup = ({
  open,
  onClose,
  title = 'Let’s talk about it',
  blurb = 'Buying or selling, it starts with a call. Someone picks up between 9am and 10pm.',
  lines = DEFAULT_LINES,
  email = 'info@deeprealestate.in',
  hours = 'Open today · 9:00am – 10:00pm',
  className,
}: ContactPopupProps) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className={cn('fixed inset-0 z-[70] grid place-items-center px-5 py-8', className)}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[#0f2231]/55 backdrop-blur-[3px]"
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            /* Soft daylight, not the header's navy. A dark panel made a phone
               call feel like an alert; this is a pale sky-washed card — low
               saturation, high light, one calm step off white — so the dialog
               reads as an invitation. Solid and opaque, still: the blurred
               colour washes that used to sit behind it are gone. */
            className="relative w-full max-w-[440px] overflow-hidden rounded-[22px] border border-[#d3e5f1] bg-[linear-gradient(160deg,#fbfdfe_0%,#f0f7fb_55%,#e7f1f8_100%)] shadow-[0_40px_90px_-32px_rgb(15_34_49/0.45)]"
          >

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-[#0f2231]/12 text-[#0f2231]/45 transition-colors hover:bg-[#0f2231]/[0.06] hover:text-[#0f2231]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            {/* ------------------------------------------------------ head */}
            {/* The navbar's limelight bar used to open this panel. It is gone:
                on a pale card the hot bar and its cone of light were the
                loudest thing in a dialog whose job is to be calm. */}
            <div className="relative px-7 pb-5 pt-8">
              <h2 className="text-[26px] font-bold leading-tight tracking-tight text-[#0f2231]">
                {title}
              </h2>
              <p className="mt-2 max-w-[330px] text-[14px] leading-[1.55] text-[#0f2231]/60">
                {blurb}
              </p>
            </div>

            {/* ---------------------------------------------------- numbers */}
            <div className="relative px-3 pb-3">
              {lines.map((line) => (
                <div
                  key={line.number}
                  className="group/row flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-colors hover:bg-white/70"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#0f2231]/40">
                      {line.label}
                    </p>
                    {/* The number keeps the highlighter the home page draws
                        under the same three numbers — a background gradient
                        that starts partway down the line box, so it follows
                        the digits instead of sitting behind them. Sky rather
                        than amber: on a pale card amber shouted, and the site's
                        own blue is the quieter mark here. */}
                    <a
                      href={telHref(line.number)}
                      className="mt-1 inline-block text-[19px] font-bold tracking-tight text-[#0f2231]"
                    >
                      <span className="box-decoration-clone bg-[linear-gradient(transparent_62%,rgb(0_128_198/0.22)_62%)]">
                        {line.number}
                      </span>
                    </a>
                    <p className="mt-1 truncate text-[12px] text-[#0f2231]/50">{line.note}</p>
                  </div>

                  <a
                    href={telHref(line.number)}
                    aria-label={`Call ${line.number}`}
                    title="Call"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[linear-gradient(120deg,#0b9ae0_0%,#0080c6_50%,#00618f_100%)] text-white shadow-[0_10px_24px_-10px_rgb(0_128_198/0.95)] transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    <PhoneIcon className="h-[18px] w-[18px]" />
                  </a>

                  {line.whatsapp ? (
                    <a
                      href={waHref(line.number)}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`WhatsApp ${line.number}`}
                      title="Open WhatsApp chat"
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#1da851]/45 text-[#1da851] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#25D366] hover:text-white"
                    >
                      <WhatsAppIcon className="h-5 w-5" />
                    </a>
                  ) : (
                    /* Holds the column so the call buttons stay in one line
                       down the dialog rather than stepping in and out. */
                    <span aria-hidden="true" className="h-11 w-11 shrink-0" />
                  )}
                </div>
              ))}
            </div>

            {/* ------------------------------------------------------ foot */}
            <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-[#0f2231]/10 px-7 py-4">
              <p className="inline-flex items-center gap-2 text-[12.5px] text-[#0f2231]/55">
                <span aria-hidden="true" className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                {hours}
              </p>
              <a
                href={`mailto:${email}`}
                className="text-[12.5px] font-semibold text-sky-700 transition-colors hover:text-sky-800"
              >
                {email}
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

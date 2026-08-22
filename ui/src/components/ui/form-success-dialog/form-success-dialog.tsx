import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type FormSuccessDialogProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** The reassurance. One short paragraph — this is read in two seconds. */
  blurb?: string;
  /** Shown quietly under the blurb, for the impatient. */
  phone?: string;
  className?: string;
};

/**
 * The confirmation shown after the contact form is sent.
 *
 * A dialog rather than the inline note it replaces: the form sits low on a
 * long page, and on a phone the confirmation used to appear below the fold of
 * whatever the visitor was looking at — they pressed Send and, as far as they
 * could tell, nothing happened. A dialog is impossible to miss, which is the
 * whole job of a receipt.
 *
 * Portaled to <body>: the form is inside sections that establish their own
 * stacking and transform contexts, and a fixed overlay rendered inside one of
 * those would position against the section rather than the viewport.
 *
 * Styling deliberately echoes ContactPopup — same pale sky-washed card, same
 * radius and shadow — so the site has one dialog language rather than two.
 */
export const FormSuccessDialog = ({
  open,
  onClose,
  title = 'Thank you — your enquiry is on its way',
  blurb = 'We have sent a confirmation to your email. Someone from our team replies within about 15 minutes, between 9am and 10pm.',
  phone = '+91-9810922338',
  className,
}: FormSuccessDialogProps) => {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    /* Move focus into the dialog. Without this, focus stays on the Send button
       behind the overlay, so a keyboard or screen-reader user is left tabbing
       through a form they can no longer see. */
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className={cn('fixed inset-0 z-[80] grid place-items-center px-5 py-8', className)}
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
            className="relative w-full max-w-[420px] overflow-hidden rounded-[22px] border border-[#d3e5f1] bg-[linear-gradient(160deg,#fbfdfe_0%,#f0f7fb_55%,#e7f1f8_100%)] p-7 text-center shadow-[0_40px_90px_-32px_rgb(15_34_49/0.45)]"
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-[#0f2231]/12 text-[#0f2231]/45 transition-colors hover:bg-[#0f2231]/[0.06] hover:text-[#0f2231]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            {/* The tick draws itself: at this size a static mark reads as an
                icon, but a drawn one reads as something that just happened. */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.08, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[linear-gradient(140deg,#16b364_0%,#0e9f6e_100%)] text-white shadow-[0_16px_34px_-14px_rgb(14_159_110/0.9)]"
            >
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <motion.path
                  d="m5 13 4 4L19 7"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
                />
              </svg>
            </motion.div>

            <h2 className="mt-5 text-[22px] font-bold leading-tight tracking-tight text-[#0f2231]">
              {title}
            </h2>
            <p className="mx-auto mt-2.5 max-w-[330px] text-[14px] leading-[1.55] text-[#0f2231]/60">
              {blurb}
            </p>

            {phone && (
              <p className="mt-4 text-[13px] text-[#0f2231]/55">
                In a hurry?{' '}
                <a
                  href={`tel:${phone.replace(/[^+\d]/g, '')}`}
                  className="font-bold text-sky-700 transition-colors hover:text-sky-800"
                >
                  {phone}
                </a>
              </p>
            )}

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full cursor-pointer rounded-xl bg-[linear-gradient(120deg,#0b9ae0_0%,#0080c6_50%,#00618f_100%)] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_16px_34px_-16px_rgb(0_128_198/0.95)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              Done
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

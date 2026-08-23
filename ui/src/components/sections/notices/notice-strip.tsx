/*
  The announcement ticker — a thin belt that sits between the hero and the
  partners band on the home page.

  Renders nothing at all when no notice is live, so on an ordinary day the page
  reads exactly as if this feature did not exist. The section wrapping it in the
  home page is conditional for the same reason, so there is no empty band or
  stray margin left behind either.

  The scroll reuses the `marquee-left` keyframes already in index.css and the
  duplicate-track technique from LogoMarquee: the belt holds the text twice and
  translates by exactly -50%, so the loop lands on an identical frame with no
  visible jump. There is one marquee mechanism in this codebase and this is it.
*/
import { useEffect, useRef, useState } from 'react';
import { useSiteContent } from '@/lib/content';

const STORAGE_KEY = 'dre-dismissed-notices';

const readDismissed = (): number[] => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
};

export function NoticeStrip() {
  const { notices } = useSiteContent();
  const [dismissed, setDismissed] = useState<number[]>([]);

  /* How many times the notice is repeated inside ONE half of the belt.
     The -50% keyframe only looks seamless while each half is at least as wide as
     the strip; a short notice is far narrower than that, and the loop would drag
     a visible gap across the screen. So the text is repeated until a half spans
     the strip, measured rather than guessed at because it depends on the font
     and the viewport. */
  const [copies, setCopies] = useState(2);
  const boxRef = useRef<HTMLDivElement>(null);
  const halfRef = useRef<HTMLSpanElement>(null);

  // Read on mount rather than in useState, so the first client render matches.
  useEffect(() => setDismissed(readDismissed()), []);

  const live = notices.filter((n) => !dismissed.includes(n.id));

  /* Several live notices share one belt rather than stacking bars — the point of
     a ticker is that it is a single thin line. */
  const text = live.map((n) => n.body).join('   •   ');

  useEffect(() => {
    if (!text) return;
    const measure = () => {
      const box = boxRef.current?.offsetWidth ?? 0;
      const half = halfRef.current?.offsetWidth ?? 0;
      if (!box || !half) return;
      const perCopy = half / copies;
      if (perCopy < 1) return;
      // One spare copy so the seam is always off-screen.
      const needed = Math.max(2, Math.ceil(box / perCopy) + 1);
      if (needed !== copies) setCopies(needed);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [text, copies]);

  if (live.length === 0) return null;

  const dismissAll = () => {
    const next = [...dismissed, ...live.map((n) => n.id)];
    setDismissed(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* private mode — dismissing still works for this page */
    }
  };

  /* Pace by the length of a whole half of the belt — text × copies — so the
     pixel speed stays constant however many repeats it took to fill the strip.
     Scaling by the text alone would make a short, heavily repeated notice race. */
  const duration = Math.min(120, Math.max(20, Math.round((text.length * copies) / 5)));

  /* One half of the belt: the notice repeated `copies` times. The whole half is
     rendered twice, and only the first copy of the first half is left readable —
     everything else is decoration, so a screen reader hears the notice once. */
  const belt = (dupe: boolean) => (
    <span
      ref={dupe ? undefined : halfRef}
      aria-hidden={dupe || undefined}
      className="flex shrink-0 items-center whitespace-nowrap"
    >
      {Array.from({ length: copies }, (_, i) => (
        <span key={i} className="flex items-center" aria-hidden={i > 0 || undefined}>
          <span className="px-6">{text}</span>
          <span aria-hidden="true" className="opacity-40">
            •
          </span>
        </span>
      ))}
    </span>
  );

  return (
    <div className="relative w-full border-y border-border bg-foreground text-background">
      <div className="flex items-center">
        <div
          ref={boxRef}
          className="relative flex-1 overflow-hidden py-1.5"
          style={{
            maskImage:
              'linear-gradient(90deg, transparent 0%, #000 4%, #000 96%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(90deg, transparent 0%, #000 4%, #000 96%, transparent 100%)',
          }}
        >
          <div
            className="flex w-max items-center text-[13px] leading-5 motion-reduce:animate-none"
            style={{ animation: `marquee-left ${duration}s linear infinite` }}
            onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = 'paused')}
            onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = 'running')}
          >
            {belt(false)}
            {belt(true)}
          </div>
        </div>

        <button
          type="button"
          onClick={dismissAll}
          aria-label="Dismiss notice"
          className="shrink-0 px-3 py-1.5 text-xs text-background/60 transition hover:text-background"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

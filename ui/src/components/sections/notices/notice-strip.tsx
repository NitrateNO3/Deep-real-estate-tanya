/*
  The announcement strip.

  Renders only when the owner has a published notice inside its date window, so
  on an ordinary day it occupies no space at all. Dismissal is remembered per
  notice for the browsing session — closing one should not bring it straight back
  on the next page, and should not hide the *next* notice either.
*/
import { useEffect, useState } from 'react';
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

  // Read on mount rather than in useState, so server-less prerender and the
  // first client render agree.
  useEffect(() => setDismissed(readDismissed()), []);

  const notice = notices.find((n) => !dismissed.includes(n.id));
  if (!notice) return null;

  const close = () => {
    const next = [...dismissed, notice.id];
    setDismissed(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* private mode — dismissing still works for this page */
    }
  };

  return (
    <div className="relative z-50 border-b border-border bg-foreground text-background">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2.5 sm:px-6">
        <p className="flex-1 text-center text-sm leading-6">{notice.body}</p>
        <button
          type="button"
          onClick={close}
          aria-label="Dismiss notice"
          className="shrink-0 rounded p-1 text-background/70 transition hover:text-background"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

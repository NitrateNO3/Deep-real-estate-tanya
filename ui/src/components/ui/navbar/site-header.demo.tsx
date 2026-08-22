import { SiteHeader } from './site-header';

/** Header sitting at the top of a page, with content below so you can scroll it. */
export const InPage = () => (
  <div className="min-h-dvh bg-background">
    <SiteHeader activeIndex={0} />

    {/* --- dummy page content, purely so the sticky header has something to sit over --- */}
    <section className="relative overflow-hidden border-b">
      <div className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 sm:py-32">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Gurugram · Since 2005
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
          Find the right address in Gurugram.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Residential and commercial property across Gurugram&apos;s sectors and DLF phases —
          matched to your budget and your timeline.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <a href="#" className="rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground">
            Browse Residential
          </a>
          <a href="#" className="rounded-full border px-7 py-3.5 text-sm font-semibold hover:bg-muted">
            Browse Commercial
          </a>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8">
      <div className="grid gap-6 sm:grid-cols-3">
        {['Living in Gurugram', 'A good investment', 'Ask for best options'].map((t) => (
          <div key={t} className="rounded-xl border p-6">
            <div className="mb-4 h-40 rounded-lg bg-muted" />
            <h3 className="font-semibold">{t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Placeholder card — scroll up and down to check the sticky header.
            </p>
          </div>
        ))}
      </div>
    </section>
  </div>
);

/** Just the bar, with "FAQs" marked as the current page. */
export const HeaderOnly = () => (
  <div className="min-h-dvh bg-background">
    <SiteHeader activeIndex={2} />
    <div className="grid h-[60vh] place-items-center px-6 text-center text-sm text-muted-foreground">
      Hover the links — the limelight follows and resizes, then settles back on
      the active page. &ldquo;More&rdquo; opens a dropdown.
    </div>
  </div>
);

/** No phone / no theme toggle, custom CTA — shows the props. */
export const Minimal = () => (
  <div className="min-h-dvh bg-background">
    <SiteHeader
      activeIndex={4}
      phone={undefined}
      showThemeToggle={false}
      ctaLabel="Request a Callback"
    />
    <div className="grid h-[60vh] place-items-center px-6 text-center text-sm text-muted-foreground">
      Same component, trimmed down via props.
    </div>
  </div>
);

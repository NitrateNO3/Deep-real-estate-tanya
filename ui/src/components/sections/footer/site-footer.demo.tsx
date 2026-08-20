import { SiteHeader } from '@/components/ui/navbar/site-header';
import { WelcomeSection } from '@/components/sections/welcome/welcome-section';
import { BrandsSection } from '@/components/sections/brands/brands-section';
import { MapsSection } from '@/components/sections/maps/maps-section';
import { StatsBand } from '@/components/sections/stats/stats-band';
import { PropertiesSection } from '@/components/sections/properties/properties-section';
import { ReviewsSection } from '@/components/sections/reviews/reviews-section';
import { ContactSection } from '@/components/sections/contact/contact-section';
import { IndexCta } from '@/components/sections/index-cta/index-cta';
import { NoticeStrip } from '@/components/sections/notices/notice-strip';
import { RecentArticles } from '@/components/sections/blog/recent-articles';
import { SiteFooter } from './site-footer';

/** The footer on its own, over a short filler block. */
export const Standalone = () => (
  <div className="min-h-dvh bg-background">
    <div className="grid h-[45vh] place-items-center text-sm text-muted-foreground">
      section above
    </div>
    <SiteFooter />
  </div>
);

/**
 * The full home page — seven screens.
 *   1 · header + welcome
 *   2 · ask about property
 *   3 · maps + stats strip
 *   4 · featured & top properties
 *   5 · reviews
 *   6 · contact + process flow
 *   7 · footer
 */
export const HomePage = () => (
  <div className="min-h-dvh scroll-smooth bg-background">
    {/* No search strip. It read "Search by sector, project or developer" over
        a placeholder suggesting "Sector 56, DLF Phase 3, M3M…" — a catalogue
        of a hundred listings. There are two, so every one of those queries
        found nothing and dropped the visitor on an index of two cards. The
        first screen promises what the second screen has to deliver, and the
        welcome section now takes the height back. */}
    <section className="flex flex-col lg:h-dvh">
      <div className="shrink-0">
        <SiteHeader activeIndex={0} />
      </div>
      <div className="lg:min-h-0 lg:flex-1">
        <WelcomeSection fill />
      </div>
    </section>

    {/* The announcement ticker, between the opening screen and the partners
        band. NoticeStrip renders null when nothing is live and there is no
        wrapping <section> here, so with no notice the page has no band, no
        border and no gap — exactly as if the feature did not exist. */}
    <NoticeStrip />

    <section className="lg:h-dvh">
      <BrandsSection fill />
    </section>

    <section className="flex flex-col lg:min-h-dvh">
      {/* flex-1 lives on the section itself, not on a wrapper div. A wrapper
          gets its height from flex-grow, which is a *used* height — so
          MapsSection's own `h-full` resolved against `auto`, the section sized
          to its content, and the slack underneath showed the page's plain white
          through, right above the stats strip. Growing the section directly
          sizes it with flex, which needs no percentage to resolve. */}
      <MapsSection fill className="lg:min-h-0 lg:flex-1" />
      <div className="shrink-0">
        <StatsBand />
      </div>
    </section>

    {/* Sized to its content. Forcing this one to a viewport was what put the
        empty band above and below it — two cards and a column of copy simply
        do not fill a screen. */}
    <section>
      <PropertiesSection />
    </section>

    {/* The ask, between what is on offer and what other people say about it.
        Sized to its content — a band, not a screen. */}
    <section>
      <IndexCta
        heading="Ready to buy or sell in Gurgaon?"
        body="Get free, no-commission assistance from a licensed team."
        ctaLabel="Get in touch"
        ctaHref="#contact-page"
        secondaryLabel="Call +91-9810922338"
        secondaryHref="tel:+919810922338"
      />
    </section>

    {/* sized to its content: four cards do not need a whole viewport, and
        padding them out to one would leave a gap between two full screens */}
    <section>
      <ReviewsSection />
    </section>

    {/* Recent articles. Renders its own <section> and returns null when nothing
        is published, so with no articles the reviews band runs straight into
        contact with no seam. */}
    <RecentArticles />

    <section className="lg:min-h-dvh">
      {/* see contact-page.demo — no PII into the console */}
      <ContactSection fill />
    </section>

    {/* sized to its content — the footer is shorter than a viewport */}
    <section>
      <SiteFooter />
    </section>
  </div>
);


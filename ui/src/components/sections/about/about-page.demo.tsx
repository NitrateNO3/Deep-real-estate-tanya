import { SiteHeader } from '@/components/ui/navbar/site-header';
import { ScrollCue } from '@/components/ui/scroll-cue/scroll-cue';
import { SiteFooter } from '@/components/sections/footer/site-footer';
import { StatsBand } from '@/components/sections/stats/stats-band';
import { Breadcrumb } from '@/components/ui/breadcrumb/breadcrumb';
import { AboutIntro } from './about-intro';
import { AboutWhy } from './about-why';
import { AboutServices } from './about-services';
import { AboutFounder } from './about-founder';
import { AboutMission } from './about-mission';
import { BrandsSection } from '@/components/sections/brands/brands-section';

/** Section 1 on its own. */
export const Intro = () => (
  <div className="min-h-dvh bg-background">
    <SiteHeader activeIndex={1} />
    <AboutIntro />
  </div>
);

/** Section 2 on its own. */
export const Mission = () => (
  <div className="min-h-dvh bg-background">
    <SiteHeader activeIndex={1} />
    <AboutMission />
  </div>
);

/**
 * The About Us page.
 *   nav → breadcrumb → intro → why us → founder → services → mission → footer
 *
 * Scrolls normally, same as every other page — screens are still sized to the
 * viewport, but nothing snaps the scroll to their boundaries.
 *
 * The order is the firm's own argument, in the order it makes it: who we are,
 * why us, who is behind it, what we do — and only then the mission and the
 * developer network, which are context rather than claims. The founder sits
 * directly after the case for the firm because he is the answer to it: the
 * reason to trust the claims above is the person who has been making good on
 * them since 2005.
 */
export const AboutPage = () => (
  <div className="min-h-dvh scroll-smooth bg-background">
    {/* min-h-dvh, not h-dvh: this screen now also carries the 104px stats strip,
        and on a short laptop the intro would otherwise collide with it. */}
    <section className="flex flex-col lg:min-h-dvh">
      <div className="shrink-0">
        {/* activeIndex 1 puts the limelight on About Us */}
        <SiteHeader activeIndex={1} />
        <Breadcrumb items={[{ label: 'About Us' }]} />
      </div>
      <div className="lg:min-h-0 lg:flex-1">
        <AboutIntro fill />
      </div>
      {/* screen one ends exactly at the fold, so nothing tells you the page
          carries on — this does, and takes you there. Symmetric padding, so the
          cue is centred in its own strip rather than hanging off the bottom of
          the copy and pressing against the stats band. */}
      <div className="flex shrink-0 items-center justify-center py-5">
        <ScrollCue targetId="about-mission" label="More below" />
      </div>
      {/* same strip as the home page, closing screen one */}
      <div className="shrink-0">
        <StatsBand />
      </div>
    </section>

    {/* Everything below screen one is sized to its content, not to a viewport.
        Forcing min-h-dvh on these was what created the empty bands — the copy
        simply does not fill a full screen. */}
    <section id="about-mission" className="scroll-mt-20">
      <AboutWhy />
    </section>
    <section>
      <AboutFounder />
    </section>
    <section>
      <AboutServices />
    </section>
    {/* The developer marquee, moved off the home page. A wall of other firms'
        names is a claim about this firm, so it belongs on the page that makes
        the firm's case — and it sets up the mission statement directly under
        it. Sized to its content: on the home page it held a full screen, but
        here it is one band in a longer argument. */}
    <section>
      <BrandsSection />
    </section>
    <section>
      {/* beliefs off: "Why Deep Real Estate?" above already answers this, in
          the firm's own words rather than in four generic claims.
          The logo mosaic stays. It repeats the marquee above deliberately —
          the marquee is motion you watch go past, the mosaic is the full set
          held still next to the closing ask, where someone checking for a
          particular developer can actually find it. */}
      <AboutMission beliefs={[]} />
    </section>
    <section>
      <SiteFooter />
    </section>
  </div>
);

import { SiteHeader } from '@/components/ui/navbar/site-header';
import { GurugramSection } from './gurugram-section';

/** The section on its own, sized to its content. */
export const Standalone = () => (
  <div className="min-h-dvh bg-background">
    <SiteHeader activeIndex={0} />
    <GurugramSection />
  </div>
);

/** As the home page carries it — one full screen. */
export const Fill = () => (
  <div className="flex min-h-dvh flex-col bg-background">
    <div className="shrink-0">
      <SiteHeader activeIndex={0} />
    </div>
    <div className="lg:min-h-0 lg:flex-1">
      <GurugramSection fill />
    </div>
  </div>
);

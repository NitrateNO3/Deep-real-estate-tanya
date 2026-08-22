import HowItWorks from './how-it-works';

/** The component as supplied, on its own defaults. */
export const Default = () => (
  <div className="w-full bg-background text-foreground">
    <HowItWorks />
  </div>
);

/**
 * The site's own four steps in the scattered layout.
 *
 * This is what the full-width arrangement looks like with real copy — the
 * home page uses the same cards in a two-up grid instead, because that half
 * sits beside the contact form and cannot carry a 900px band.
 */
export const OurProcess = () => (
  <div className="w-full bg-background text-foreground">
    <HowItWorks
      features={[
        {
          title: 'Reach Us',
          description:
            'Call or send an inquiry — we respond within 15 minutes during business hours.',
          colorTheme: 'blue',
        },
        {
          title: 'Choose Location',
          description: 'Pick your preferred sector or locality across the Gurugram market.',
          colorTheme: 'orange',
        },
        {
          title: 'Choose Property',
          description: 'Shortlist from properties matched to your budget and requirements.',
          colorTheme: 'purple',
        },
        {
          title: 'Confirmation',
          description: 'Close the deal with transparent documentation and full support.',
          colorTheme: 'blue',
        },
      ]}
    />
  </div>
);

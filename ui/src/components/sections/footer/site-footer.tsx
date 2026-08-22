import { useState } from 'react';
import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { ContactPopup } from '@/components/ui/contact-popup/contact-popup';
import { cn } from '@/lib/utils';

export type FooterLink = {
  label: string;
  href?: string;
  /**
   * Opens the numbers dialog instead of navigating. Buying or selling starts
   * with a phone call, so that row is a control, not a destination — and it is
   * rendered as a <button> rather than an anchor with a dead href.
   */
  dialog?: boolean;
};

export type SiteFooterProps = {
  address?: string;
  phone?: string;
  email?: string;
  facebookHref?: string;
  instagramHref?: string;
  explore?: FooterLink[];
  services?: FooterLink[];
  copyright?: string;
  className?: string;
};

/**
 * A social mark. Renders a link only when there is somewhere real to go —
 * otherwise a plain span, so clicking it does nothing at all.
 */
const SocialMark = ({
  href,
  label,
  children,
}: {
  href?: string;
  label: string;
  children: React.ReactNode;
}) => {
  const styles =
    'grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/75 transition-all duration-200';

  if (!href || href === '#') {
    return (
      <span aria-label={label} className={styles}>
        {children}
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className={cn(styles, 'hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-white')}
    >
      {children}
    </a>
  );
};

const defaultExplore: FooterLink[] = [
  { label: 'Home', href: '#home-so-far' },
  { label: 'About Us', href: '#about-page' },
  { label: 'Maps', href: '#maps-page' },
  { label: 'Documents', href: '#documents-page' },
  { label: 'Contact Us', href: '#contact-page' },
];

/* Was Residential / Commercial / Plots / Developers / Sell Your Property, all
   of them href="#" — five rows that looked like navigation and went nowhere.
   These five all lead somewhere real. */
const defaultServices: FooterLink[] = [
  { label: 'Properties', href: '#properties-page' },
  { label: 'FAQs', href: '#faqs-page' },
  { label: 'Privacy Policy', href: '#privacy-page' },
  { label: 'Terms and Conditions', href: '#terms-page' },
  { label: 'Buy/Sell Property', dialog: true },
];

/**
 * Site footer.
 *
 * Sits on the same deep navy as the stats strip and the brands section, so the
 * page closes on a colour it has already established rather than a fifth one.
 * A hairline brand-blue rule across the top separates it from whatever section
 * it follows without needing a heavy border.
 */
export const SiteFooter = ({
  /* Comma after "Extn." to match the address as it is set in the Privacy
     Policy and Terms — one address, one spelling. */
  address = 'G-564, Sushant Lok-II Extn., Sector 57, Nr. Scottish High Gurgaon, Haryana-122002, India',
  phone = '+91-9810922338',
  email = 'info@deeprealestate.in',
  facebookHref,
  instagramHref,
  explore = defaultExplore,
  services = defaultServices,
  copyright = '© Copyright 2005-2025 Deep Real Estate . All Rights Reserved | Managed By Asterisk Serve',
  className,
}: SiteFooterProps) => {
  const [contactOpen, setContactOpen] = useState(false);
  const linkCls =
    'text-sm text-white/70 transition-all duration-200 hover:text-sky-300 hover:pl-1';

  return (
    <footer
      className={cn(
        'relative w-full bg-[linear-gradient(180deg,#0b1a27_0%,#06121b_100%)] text-white',
        className,
      )}
    >
      {/* brand hairline */}
      <div
        aria-hidden="true"
        className="h-px w-full bg-[linear-gradient(90deg,transparent_0%,#0080c6_30%,#3aa9e8_50%,#0080c6_70%,transparent_100%)]"
      />

      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:py-16">
          {/* brand */}
          <div className="lg:col-span-4">
            {/* the real wordmark, same asset the header uses — the drawn house
                glyph here was a stand-in and read as a different company */}
            <a
              href="#home-so-far"
              className="inline-flex shrink-0 items-center"
              aria-label="Deep Real Estate — home"
            >
              <img
                src="/img/logo/deep-logo-light.png"
                alt="Deep Real Estate"
                className="h-14 w-auto"
              />
            </a>
            <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.16em] text-sky-300/70">
              Gurugram · Since 2005
            </p>

            <p className="mt-5 max-w-sm text-sm leading-[1.7] text-white/70">
              Residential and commercial property across all of Gurugram&apos;s HUDA sectors
              and private developer colonies — matched to your taste, your budget, your
              location and your timeline.
            </p>

            {/* No profile URLs yet, so these are marks rather than links.
                Pointing them at "#" would clear the hash and drop you on a
                different page — a redirect to nowhere is worse than no link. */}
            <div className="mt-6 flex items-center gap-3">
              <SocialMark href={facebookHref} label="Deep Real Estate on Facebook">
                <Facebook className="h-[18px] w-[18px]" />
              </SocialMark>
              <SocialMark href={instagramHref} label="Deep Real Estate on Instagram">
                <Instagram className="h-[18px] w-[18px]" />
              </SocialMark>
            </div>
          </div>

          {/* get in touch */}
          <div className="lg:col-span-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
              Get in touch
            </h2>
            <ul className="mt-6 space-y-4">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-[18px] w-[18px] shrink-0 text-primary" />
                <span className="text-sm leading-[1.65] text-white/70">{address}</span>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-[18px] w-[18px] shrink-0 text-primary" />
                <a
                  href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                  className="text-sm font-semibold text-white transition-colors hover:text-sky-300"
                >
                  {phone}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-[18px] w-[18px] shrink-0 text-primary" />
                <a
                  href={`mailto:${email}`}
                  className="text-sm font-semibold text-white transition-colors hover:text-sky-300"
                >
                  {email}
                </a>
              </li>
            </ul>
          </div>

          {/* explore */}
          <div className="lg:col-span-2">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
              Explore
            </h2>
            <ul className="mt-6 space-y-3">
              {explore.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className={linkCls}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* services */}
          {/* Headed "More", not "Properties" — Properties is now one of the
              rows in it, and a column cannot be named after its own first
              item. Same label as the navbar's menu, which holds the same set. */}
          <div className="lg:col-span-2">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
              More
            </h2>
            <ul className="mt-6 space-y-3">
              {services.map((l) => (
                <li key={l.label}>
                  {l.dialog ? (
                    <button
                      type="button"
                      onClick={() => setContactOpen(true)}
                      className={cn(linkCls, 'cursor-pointer text-left')}
                    >
                      {l.label}
                    </button>
                  ) : (
                    <a href={l.href} className={linkCls}>
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 sm:flex-row">
          <p className="text-center text-xs text-white/55 sm:text-left">{copyright}</p>
          <a
            href={`tel:${phone.replace(/[^\d+]/g, '')}`}
            className="text-xs font-semibold text-sky-300 transition-colors hover:text-white"
          >
            {phone}
          </a>
        </div>
      </div>

      <ContactPopup open={contactOpen} onClose={() => setContactOpen(false)} />
    </footer>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { StarButton } from '@/components/ui/star-button';
import { useIsDark } from '@/lib/use-is-dark';

const defaultGallery = [
  { src: '/img/welcome.jpg', alt: 'A bright living space in a Gurugram residence' },
  { src: '/img/props/p1.jpg', alt: 'Entrance of a residence in DLF Phase 5' },
  { src: '/img/props/p3.jpg', alt: 'Interior corridor of a Gurugram apartment' },
  { src: '/img/props/p4.jpg', alt: 'Commercial floor plate in Cyber City' },
  { src: '/img/props/p6.jpg', alt: 'Residential plot in Sector 57' },
];

export type WelcomeSectionProps = {
  eyebrow?: string;
  heading?: string;
  /** The pitch — the section's only paragraph. */
  lead?: string;
  /** Bold line of the trust badge that sits just above the buttons. */
  trustTitle?: string;
  /** Quiet second line of the trust badge. */
  trustNote?: string;
  /** Single-image override. Supplying it collapses the gallery to one frame. */
  imageSrc?: string;
  imageAlt?: string;
  /** Gallery shown beside the copy. First entry is the opening frame. */
  images?: { src: string; alt: string }[];
  /**
   * Footage for the main frame. When set it replaces the gallery outright —
   * the thumbnail rail exists to switch between stills and has nothing to
   * switch between here. Pass '' to go back to the still gallery.
   */
  videoSrc?: string;
  /**
   * Still held before the footage paints. Off by default: the frame beside the
   * welcome copy is meant to be moving footage and nothing else, and a poster
   * is a photograph — on a slow connection, or with the video merely paused,
   * it is the photograph that people end up looking at.
   */
  videoPoster?: string;
  /**
   * Run the footage full-bleed behind the whole section instead of inside a
   * frame beside the copy, held back under a wash so the copy stays readable.
   *
   * The frame version cannot show a 16:9 clip at the height of a viewport-tall
   * row without either cropping it hard or leaving the row half empty. As a
   * backdrop the clip has the whole section to fill, and the space to the
   * right of the copy — which the frame was competing for — becomes the part
   * of it you actually see.
   *
   * Only applies when `videoSrc` is set; the still gallery keeps its frame.
   */
  backdrop?: boolean;
  /** Milliseconds between automatic advances. */
  interval?: number;
  /** Put the picture on the left instead of the right. */
  reverse?: boolean;
  showActions?: boolean;
  /** Element "Browse Properties" scrolls to — the featured properties block. */
  propertiesSectionId?: string;
  /** Where "Talk to us" goes. */
  contactHref?: string;
  /**
   * Fill the remaining height of a viewport-height page instead of sizing to
   * content, so header + search + welcome occupy exactly one screen with no
   * scroll. Only applies from lg up — squeezing a phone into 100dvh crushes it.
   */
  fill?: boolean;
  className?: string;
};

/**
 * Homepage section 1 — Welcome.
 *
 * Layout rules that make it read as "arranged":
 *  - One 12-column grid split cleanly 6 / 6 — text left, picture right.
 *  - The text column has a single shared measure (34rem), so the heading and
 *    all three paragraphs wrap to the *same* right edge. One rectangle of text,
 *    not four blocks of differing widths.
 *  - Every text element shares one left edge; nothing is centred or indented.
 *  - Three paragraph sizes step down clearly (19px → 16px → 14px) so the
 *    hierarchy is obvious at a glance rather than a subtle 1px difference.
 *  - The columns stretch to equal height, so the picture's top and bottom edges
 *    line up exactly with the top and bottom of the text block.
 */
export const WelcomeSection = ({
  /* The firm's own strapline, in place of the list of towns. The towns are
     still on the page — the maps section names them — and a strapline earns
     the position above the headline more than a geography does. */
  eyebrow = 'Local Expertise · Trusted Guidance · Better Real Estate Decisions',
  // Deliberate break: "Welcome to" is the greeting, the name is the statement.
  heading = 'Welcome to\nDeep Real Estate',
  lead = 'With over two decades of experience in Gurugram’s real estate market, Deep Real Estate is built on trust, transparency, and long-term relationships. Founded by Pawan Yadav, we help clients buy, sell, and invest in premium residential and commercial properties across Gurugram.',
  trustTitle = 'Licensed & transparent',
  trustNote = 'Serving Gurugram since 2005',
  imageSrc,
  imageAlt = '',
  images = defaultGallery,
  videoSrc = '/video/hero.mp4',
  videoPoster,
  backdrop = false,
  interval = 3000,
  reverse = false,
  showActions = true,
  propertiesSectionId = 'featured-properties',
  contactHref = '#contact-page',
  fill = false,
  className,
}: WelcomeSectionProps) => {
  /* The sandbox routes on the hash, so href="#featured-properties" would be
     read as a page id and land on the fallback entry. Scroll the section into
     view directly — that works whether the window or the sandbox's own
     container is doing the scrolling. If it isn't on the page (the section
     rendered on its own), fall back to opening the home page. */
  const handleBrowse = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const target = document.getElementById(propertiesSectionId);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else window.location.hash = 'home-so-far';
  };

  // The travelling light needs contrast against the button face, which flips
  // with the theme: near-white on the dark face, brand blue on the light one.
  const isDark = useIsDark();

  // `imageSrc` collapses the gallery to a single frame, so the old single-image
  // callers keep working unchanged.
  const gallery = imageSrc ? [{ src: imageSrc, alt: imageAlt }] : images;

  const [active, setActive] = useState(0);
  const paused = useRef(false);

  /* Auto-advance. Pauses while the pointer is over the gallery, and does not
     run at all under prefers-reduced-motion — an unrequested loop is exactly
     the kind of motion that setting exists to stop. */
  useEffect(() => {
    if (videoSrc) return;
    if (gallery.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const id = window.setInterval(() => {
      if (paused.current) return;
      setActive((i) => (i + 1) % gallery.length);
    }, interval);

    return () => window.clearInterval(id);
  }, [gallery.length, interval, videoSrc]);

  /* The footage plays, full stop. This used to hold a still under
     prefers-reduced-motion — which is why a photograph was showing here on
     any machine with "Reduce motion" switched on, including in the browser's
     own device emulation. The client wants the video and only the video in
     this frame; it is muted, looping and decorative, so it plays regardless.
     Browsers that refuse the autoplay attribute get an explicit play(). */
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !videoSrc) return;
    const start = () => el.play().catch(() => undefined);
    start();
    el.addEventListener('canplay', start);
    return () => el.removeEventListener('canplay', start);
  }, [videoSrc]);

  // Only the footage can be a backdrop; the gallery keeps its frame and rail.
  const asBackdrop = Boolean(videoSrc) && backdrop;

  return (
    <section
      className={cn(
        'relative isolate w-full overflow-hidden bg-background',
        fill && 'lg:h-full lg:min-h-0',
        className,
      )}
    >
      {asBackdrop && (
        <>
          <video
            ref={videoRef}
            className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover"
            src={videoSrc}
            /* A poster here, unlike in the framed version: full-bleed, the
               alternative to a still is a blank screen the height of the
               viewport for as long as the first bytes take to arrive. */
            poster={videoPoster ?? '/img/bg/hero-poster.jpg'}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
            tabIndex={-1}
          />
          {/* Legibility wash. Weighted across rather than evenly: the copy is
              dark-on-light and sits left, so that side has to go nearly opaque,
              while the right — which is the part of the clip anyone actually
              looks at — keeps far more of it. An even veil at the strength the
              text needs would have hidden the whole thing. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.92)_30%,rgba(255,255,255,0.70)_58%,rgba(255,255,255,0.45)_100%)] dark:bg-[linear-gradient(90deg,rgba(8,21,31,0.96)_0%,rgba(8,21,31,0.92)_30%,rgba(8,21,31,0.72)_58%,rgba(8,21,31,0.50)_100%)]"
          />
          {/* Softens the top and bottom edges into the header and whatever
              follows, so the clip does not end on a hard line. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.55)_0%,transparent_18%,transparent_82%,rgba(255,255,255,0.65)_100%)] dark:bg-[linear-gradient(180deg,rgba(8,21,31,0.55)_0%,transparent_18%,transparent_82%,rgba(8,21,31,0.75)_100%)]"
          />
        </>
      )}
      <div
        className={cn(
          'mx-auto max-w-[1400px] px-5 sm:px-8',
          fill ? 'py-12 lg:h-full lg:py-10' : 'py-16 sm:py-24 lg:py-28',
        )}
      >
        {/* An explicit fraction rather than 12 columns: the split that suits
            this row falls between two column boundaries, and rounding it to
            the nearest one cost the picture more width than the copy could
            usefully take. The picture holds the 1fr track; reversing swaps
            which side that track is on. */}
        <div
          className={cn(
            'grid grid-cols-1 gap-10 lg:items-stretch lg:gap-x-10',
            // as a backdrop there is no second column to size — the copy keeps
            // its own measure and the clip fills everything to the right of it
            asBackdrop
              ? 'lg:grid-cols-1'
              : reverse
                ? 'lg:grid-cols-[1fr_36%]'
                : 'lg:grid-cols-[36%_1fr]',
            fill && 'lg:h-full lg:min-h-0',
          )}
        >
          {/* ---------------------------------------------------------- text */}
          <div
            className={cn(
              'flex flex-col justify-center',
              reverse ? 'lg:order-2' : 'lg:order-1',
            )}
          >
            {/* one shared measure keeps every line flush to the same right edge */}
            <div className="max-w-[34rem]">
            {/* eyebrow */}
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-primary" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                {eyebrow}
              </p>
            </div>

            {/* heading — whitespace-pre-line so the newline in the copy is the
                line break, rather than leaving it to wherever the measure
                happens to wrap */}
            <h1 className="mt-5 whitespace-pre-line text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
              {heading}
            </h1>

            {/* the pitch */}
            <p className="mt-7 text-[19px] leading-[1.6] text-foreground/85">{lead}</p>

            {/* Trust line. This was a tinted panel with a tick, which competed
                with the buttons underneath it for the same attention. It is a
                quiet credential, not a call to action, so it now reads as one
                more line under the pitch. */}
            {(trustTitle || trustNote) && (
              <p className="mt-3 text-sm text-foreground/60">
                {[trustTitle, trustNote].filter(Boolean).join(' · ')}
              </p>
            )}

            {showActions && (
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <StarButton
                  href={`#${propertiesSectionId}`}
                  onClick={handleBrowse}
                  lightColor={isDark ? '#FAFAFA' : '#0080C6'}
                  className="h-12 px-7 text-[15px] font-semibold"
                >
                  Browse Properties
                </StarButton>
                <a
                  href={contactHref}
                  className="inline-flex items-center gap-1.5 rounded-full px-5 py-3.5 text-sm font-semibold text-foreground transition-colors hover:text-primary"
                >
                  Talk to us
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </a>
              </div>
            )}
            </div>
          </div>

          {/* ------------------------------------------------------- picture */}
          {!asBackdrop && (
          <figure className={cn(reverse ? 'lg:order-1' : 'lg:order-2')}>
            {/* h-full matters: the main frame below uses lg:h-full, and without
                a definite height on every ancestor it resolves to auto and the
                picture collapses to nothing. */}
            <div className="relative h-full">
              {/* Main frame + vertical rail on the plain page background. */}
              <div
                className={cn(
                  'relative flex h-full gap-4',
                  // the footage frame is shorter than the column, so centre it
                  videoSrc && 'items-center',
                )}
                onMouseEnter={() => (paused.current = true)}
                onMouseLeave={() => (paused.current = false)}
              >
                {/* main frame — the video, or all stills stacked and crossfaded.
                    On white the frame needs its own border and shadow to have
                    an edge. */}
                {/* The still gallery stretches to the column's full height — a
                    photograph crops to any shape without losing its subject.
                    The footage cannot: filling a viewport-height column with a
                    16:9 source would crop it to a vertical slot through the
                    middle.
                    So the video keeps its own 16:9 and the column carries the
                    leftover height. This frame briefly tightened to 3/2 on wide
                    screens to fill more of the row, which was fine for footage
                    with a centred subject — but the clip here runs a line of
                    services from edge to edge, and cropping 8% off each side
                    started eating the first and last words of it. Height is
                    worth less than the copy the client put in the frame. */}
                <div
                  className={cn(
                    'relative min-w-0 flex-1 overflow-hidden rounded-2xl border bg-muted shadow-[0_24px_56px_-28px_rgb(0_0_0/0.35)]',
                    videoSrc ? 'aspect-video' : 'aspect-[4/3] lg:aspect-auto lg:h-full',
                  )}
                >
                  {videoSrc ? (
                    <video
                      ref={videoRef}
                      className="absolute inset-0 h-full w-full object-cover"
                      src={videoSrc}
                      poster={videoPoster}
                      autoPlay
                      muted
                      loop
                      playsInline
                      /* auto, not metadata: at 5.4MB the frame sat empty for
                         a beat before the first picture arrived */
                      preload="auto"
                      aria-hidden="true"
                      tabIndex={-1}
                    />
                  ) : (
                    gallery.map((img, i) => (
                      <img
                        key={img.src}
                        src={img.src}
                        alt={i === active ? img.alt : ''}
                        aria-hidden={i === active ? undefined : true}
                        loading={i === 0 ? 'eager' : 'lazy'}
                        className={cn(
                          'absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out motion-reduce:transition-none',
                          i === active ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                    ))
                  )}
                </div>

                {/* rail — stills only; there is nothing to switch to when the
                    frame is playing footage */}
                <div
                  className={cn(
                    'w-16 shrink-0 flex-col gap-2.5 lg:w-[92px] lg:gap-3',
                    videoSrc ? 'hidden' : 'flex',
                  )}
                  role="tablist"
                  aria-label="Gallery"
                >
                  {gallery.map((img, i) => {
                    const isActive = i === active;
                    return (
                      <button
                        key={img.src}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-label={img.alt}
                        onClick={() => setActive(i)}
                        className={cn(
                          'relative min-h-0 flex-1 cursor-pointer overflow-hidden rounded-xl transition-all duration-500',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                          /* back to a brand-blue ring — a white ring is
                             invisible now the rail sits on the page background */
                          isActive
                            ? 'opacity-100 ring-2 ring-primary ring-offset-2 ring-offset-background'
                            : 'border opacity-40 hover:opacity-75',
                        )}
                      >
                        <img
                          src={img.src}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </figure>
          )}
        </div>
      </div>
    </section>
  );
};

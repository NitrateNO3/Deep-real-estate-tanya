import React, { useRef, useState } from 'react';
import { LiquidMetalButton } from '@/components/ui/liquid-metal-button';
import { GlassCard } from '@/components/ui/glass-card/glass-card';
import { FormSuccessDialog } from '@/components/ui/form-success-dialog/form-success-dialog';
import { cn } from '@/lib/utils';

export type ContactValues = {
  fullname: string;
  mobileno: string;
  emailid: string;
  subject: string;
  propertytype: string;
  location: string;
  message: string;
};

/* The three pick-lists. Kept as data so the markup below stays one <select>
   rendered three times rather than three near-identical blocks. */
const SUBJECTS = [
  'Buying Property',
  'Selling Property',
  'Valuation & Consultation',
  'Rent / Lease',
  'General Inquiry',
];
const PROPERTY_TYPES = [
  'Residential (Floors/Apartments)',
  'Plots / Land',
  'Commercial',
  'Farmhouse',
];
const LOCATIONS = ['Gurugram', 'Manesar', 'Dharuhera', 'Sohna'];

/**
 * A pick-list field.
 *
 * Module level, not nested in ContactForm: a component defined inside a render
 * is a new type on every render, so React would unmount and remount each select
 * and drop whatever the visitor had picked.
 *
 * The native chevron is suppressed (appearance-none) and redrawn in brand blue,
 * because the OS default is grey and would be the one control on the card that
 * ignores the palette.
 */
const SelectField = ({
  id,
  name,
  label,
  options,
  fieldCls,
  labelCls,
  chevronCls,
  emptyOptionCls,
}: {
  id: string;
  name: string;
  label: string;
  options: string[];
  fieldCls: string;
  labelCls: string;
  chevronCls: string;
  emptyOptionCls: string;
}) => (
  <div>
    <label className={labelCls} htmlFor={id}>
      {label}
    </label>
    <div className="relative">
      <select
        id={id}
        name={name}
        defaultValue=""
        /* A select has no ::placeholder, so "Please select" is matched to the
           text inputs' prompt styling by testing whether the empty option is
           the one currently chosen. */
        className={cn(fieldCls, 'cursor-pointer appearance-none pr-10', emptyOptionCls)}
      >
        {/* The open dropdown is drawn by the OS, not by us — on the glass
            variant a white-on-white option list is the failure mode, so the
            colours are pinned here rather than inherited. */}
        <option value="" style={{ color: '#0d1b2a', backgroundColor: '#ffffff' }}>
          Please select
        </option>
        {options.map((o) => (
          <option key={o} value={o} style={{ color: '#0d1b2a', backgroundColor: '#ffffff' }}>
            {o}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={cn('pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2', chevronCls)}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  </div>
);

export type ContactFormProps = {
  onSubmit?: (values: ContactValues) => void;
  /**
   * POST the enquiry here as JSON. When set, this is how the lead is
   * delivered — point it at a form service (Formspree, Web3Forms) or at the
   * site's own handler.
   *
   * When it is NOT set, the form hands the enquiry to WhatsApp instead, on
   * `whatsapp` below. That fallback exists because the alternative was what
   * this form used to do: collect seven fields, hand them to a console.log
   * and tell the visitor nothing. A lead that reaches the office by WhatsApp
   * is a lead; a lead that reaches a browser console is not.
   */
  endpoint?: string;
  /**
   * Where enquiries are emailed, via FormSubmit. Either the inbox address or —
   * better — the FormSubmit alias that stands in for it. Takes precedence over
   * `endpoint`.
   *
   * See FORMSUBMIT_TARGET below for why the alias is worth the extra step.
   */
  emailTo?: string;
  /** Office WhatsApp number for the fallback. Digits and + only. */
  whatsapp?: string;
  /** Fewer message rows, for viewport-height layouts. */
  compact?: boolean;
  /**
   * 'card'  — solid white card. For light grounds, e.g. the contact page.
   * 'glass' — frosted panel. Needs a photograph or a dark ground behind it;
   *           over a flat light fill there is nothing to frost and it vanishes.
   */
  variant?: 'card' | 'glass';
  className?: string;
};

/**
 * The contact form, shared by the home page section and the contact page so
 * the two cannot drift apart.
 *
 * Field names mirror the live Contact_Us.php exactly — fullname, mobileno,
 * emailid, subject, message — so wiring it to the existing endpoint is a
 * one-to-one mapping rather than a re-spec.
 */
/* ===========================================================================
   EMAIL DELIVERY — FormSubmit. Enquiries arrive as email in the inbox named
   between the quotes below.

   ACTIVATION: the very first submission does not deliver. FormSubmit replies
   to that inbox with a confirmation link instead; open it once and every
   submission from then on lands normally. Send one test enquiry yourself
   after deploying, or the first real lead is the one that gets spent on it.

   SWAP THIS FOR THE ALIAS once activated. FormSubmit issues a random-string
   endpoint that delivers to the same inbox without naming it — it is in the
   activation email. It matters here: this bundle is public and the repo is
   public, so an address written in plain text is scraped and spammed. The
   alias reads the same to the code and gives a spammer nothing.

   Leave it empty and the form keeps handing enquiries to WhatsApp instead;
   nothing breaks either way.
   =========================================================================== */
const FORMSUBMIT_TARGET = 'deeprealestate.responses@gmail.com';

/* The /ajax/ endpoint answers with JSON rather than redirecting to FormSubmit's
   own thank-you page, so the visitor stays on the site and sees the form's own
   confirmation. */
const formsubmitEndpoint = (target: string) =>
  `https://formsubmit.co/ajax/${encodeURIComponent(target)}`;

/* FormSubmit turns the JSON keys into the labels in the email body, so the
   payload is written for someone reading it on a phone rather than for the
   database column names the form fields carry. Keys prefixed with _ are
   FormSubmit's own settings and are not printed. */
const composeEmailPayload = (v: ContactValues) => ({
  _subject: `New enquiry — ${v.subject || 'Website'} — ${v.fullname}`,
  // a table reads far better than FormSubmit's default run-on list
  _template: 'table',
  // no captcha page: an AJAX post cannot show one, and it would block the send
  _captcha: 'false',
  // replying in Gmail then goes straight back to the enquirer
  _replyto: v.emailid || undefined,
  /* Receipt for the enquirer, sent by FormSubmit to the address above. Plain
     text — FormSubmit does not render HTML here, so markup would arrive as
     literal tags. Deliberately promises only what the office can keep: that
     it arrived and roughly when someone will reply. */
  _autoresponse: `Thank you for contacting Deep Real Estate.

We have received your enquiry and someone from our team will get back to you shortly. We reply within about 15 minutes between 9am and 10pm.

If it is urgent, call us on +91-9810922338 and we will take the details over the phone.

— Deep Real Estate, Gurugram`,
  Name: v.fullname,
  Mobile: v.mobileno,
  Email: v.emailid || '—',
  'Enquiry about': v.subject || '—',
  'Property type': v.propertytype || '—',
  Location: v.location || '—',
  Message: v.message || '—',
});

/** The enquiry as a WhatsApp message, for the no-endpoint fallback. */
const composeMessage = (v: ContactValues) =>
  [
    'New enquiry from deeprealestate.in',
    '',
    `Name: ${v.fullname}`,
    `Mobile: ${v.mobileno}`,
    v.emailid && `Email: ${v.emailid}`,
    v.subject && `Subject: ${v.subject}`,
    v.propertytype && `Property type: ${v.propertytype}`,
    v.location && `Location: ${v.location}`,
    v.message && `\n${v.message}`,
  ]
    .filter(Boolean)
    .join('\n');

export const ContactForm = ({
  onSubmit,
  endpoint,
  emailTo = FORMSUBMIT_TARGET,
  whatsapp = '+91-9810922338',
  compact = false,
  variant = 'card',
  className,
}: ContactFormProps) => {
  const glass = variant === 'glass';
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  /* A submit lock. Deliberately a ref and not a `status === 'sending'` check:
     two fast clicks on Send can both enter this handler before React re-renders
     with the new status, so each would post its own copy and one enquiry would
     arrive as two emails. A ref updates synchronously, so the second click sees
     the lock the first one set. The button has no disabled state of its own. */
  const sending = useRef(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending.current) return;
    sending.current = true;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const values: ContactValues = {
      fullname: String(fd.get('fullname') ?? ''),
      mobileno: String(fd.get('mobileno') ?? ''),
      emailid: String(fd.get('emailid') ?? ''),
      subject: String(fd.get('subject') ?? ''),
      propertytype: String(fd.get('propertytype') ?? ''),
      location: String(fd.get('location') ?? ''),
      message: String(fd.get('message') ?? ''),
    };

    onSubmit?.(values);

    /* Email first when a target is configured, then any custom endpoint, then
       WhatsApp. Each rung down is still a real delivery — the form never
       silently drops a lead. */
    const target = emailTo ? formsubmitEndpoint(emailTo) : endpoint;

    if (target) {
      setStatus('sending');
      try {
        const res = await fetch(target, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(emailTo ? composeEmailPayload(values) : values),
        });
        /* FormSubmit can answer 200 while still refusing the send — an
           unactivated inbox is the common one. The HTTP status alone is not
           proof the mail went, so read the body: a lead reported as sent but
           never delivered is the failure this whole path exists to prevent.
           `success` comes back as the *string* "true", not a boolean. */
        if (!res.ok) throw new Error(String(res.status));
        if (emailTo) {
          const body = await res.json().catch(() => null);
          const ok = body && (body.success === true || body.success === 'true');
          if (!ok) throw new Error((body && body.message) || 'rejected');
        }
        form.reset();
        setStatus('sent');
      } catch {
        setStatus('error');
      } finally {
        // released only once the post has settled, so the lock spans the request
        sending.current = false;
      }
      return;
    }

    /* No endpoint configured: hand it to WhatsApp. Opened in a new tab so the
       page and its confirmation survive if the visitor comes straight back. */
    const wa = `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
      composeMessage(values),
    )}`;
    window.open(wa, '_blank', 'noopener,noreferrer');
    form.reset();
    setStatus('sent');
    sending.current = false;
  };

  /* Filled fields with a real border read as "type here"; hairline outlines
     read as decoration. Both variants keep that rule and only change what the
     fill and the border are made of — ink on white, or a lighter pane of the
     same frosted glass the card is cut from.

     Placeholders stay bold but faint in both: the prompt has the weight of the
     answer that replaces it, without being mistaken for one already typed. */
  const field = cn(
    'w-full rounded-xl border-2 transition-all focus:outline-none',
    'placeholder:font-semibold',
    glass
      ? [
          'border-white/25 bg-white/10 text-white placeholder:text-white/45',
          'hover:border-white/45',
          'focus:border-white/80 focus:bg-white/20 focus:ring-4 focus:ring-white/20',
        ]
      : [
          'border-primary/30 bg-primary/[0.04] text-foreground placeholder:text-muted-foreground/45',
          'hover:border-primary/50',
          'focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/15',
        ],
    compact ? 'px-3.5 py-2.5 text-sm' : 'px-4 py-3 text-[15px]',
  );
  const labelCls = cn(
    'block font-semibold',
    glass ? 'text-white/85' : 'text-foreground',
    compact ? 'mb-1 text-xs' : 'mb-1.5 text-[13px]',
  );
  const chevronCls = glass ? 'text-white/70' : 'text-primary';
  // Same rule, one variant: the empty option is styled like a placeholder.
  const emptyOptionCls = glass
    ? "[&:has(option[value='']:checked)]:font-semibold [&:has(option[value='']:checked)]:text-white/45"
    : "[&:has(option[value='']:checked)]:font-semibold [&:has(option[value='']:checked)]:text-muted-foreground/45";

  const Shell = glass ? GlassCard : 'div';

  return (
    <Shell
      className={cn(
        // GlassCard ships its own gap-6 and py-6; the form is a single grid, so
        // the gap has nothing to space and the padding is set here instead.
        glass
          ? 'gap-0 rounded-2xl shadow-[0_24px_60px_-28px_rgb(0_0_0/0.75)]'
          : 'rounded-2xl border bg-card shadow-[0_24px_60px_-28px_rgb(0_0_0/0.45)]',
        compact ? 'p-5 sm:p-6' : 'p-6 sm:p-8',
        className,
      )}
    >
      <form onSubmit={handleSubmit} className={cn('grid grid-cols-1 sm:grid-cols-2', compact ? 'gap-3' : 'gap-4')}>
        <div>
          <label className={labelCls} htmlFor="c-fullname">
            Full Name
          </label>
          <input
            id="c-fullname"
            name="fullname"
            type="text"
            required
            autoComplete="name"
            placeholder="Your name"
            className={field}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="c-mobileno">
            Mobile No.
          </label>
          <input
            id="c-mobileno"
            name="mobileno"
            type="tel"
            required
            autoComplete="tel"
            inputMode="tel"
            placeholder="10-digit mobile"
            className={field}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="c-emailid">
            Email Address
          </label>
          <input
            id="c-emailid"
            name="emailid"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={field}
          />
        </div>

        <SelectField
          id="c-subject"
          name="subject"
          label="What is this regarding?"
          options={SUBJECTS}
          fieldCls={field}
          labelCls={labelCls}
          chevronCls={chevronCls}
          emptyOptionCls={emptyOptionCls}
        />

        <SelectField
          id="c-propertytype"
          name="propertytype"
          label="Property Type"
          options={PROPERTY_TYPES}
          fieldCls={field}
          labelCls={labelCls}
          chevronCls={chevronCls}
          emptyOptionCls={emptyOptionCls}
        />

        <SelectField
          id="c-location"
          name="location"
          label="Preferred Location"
          options={LOCATIONS}
          fieldCls={field}
          labelCls={labelCls}
          chevronCls={chevronCls}
          emptyOptionCls={emptyOptionCls}
        />

        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="c-message">
            Message
          </label>
          <textarea
            id="c-message"
            name="message"
            rows={compact ? 2 : 4}
            placeholder="Budget, preferred sector, timeline…"
            className={cn(field, 'resize-y')}
          />
        </div>

        <div className="sm:col-span-2">
          <LiquidMetalButton
            type="submit"
            label={status === 'sending' ? 'Sending…' : 'Send message'}
            width="100%"
            height={compact ? 48 : 56}
            fontSize={compact ? 14 : 15}
          />

          {/* Success is the dialog below, not a note here: on a phone this sits
              well below the fold and the visitor saw nothing happen. Failure
              stays inline and next to the button — an error belongs beside the
              form you still have to deal with, not behind a dismissal. */}
          <div aria-live="polite">
            {status === 'error' && (
              <p
                className={cn(
                  'mt-3 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-[14px] leading-snug',
                  glass
                    ? 'border-red-300/40 bg-red-400/15 text-white'
                    : 'border-red-200 bg-red-50 text-red-900',
                )}
              >
                <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8v5M12 17h.01" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
                <span>
                  That did not go through. Please call{' '}
                  <a href={`tel:${whatsapp.replace(/[^+\d]/g, '')}`} className="font-bold underline">
                    {whatsapp}
                  </a>{' '}
                  and we will take the details over the phone.
                </span>
              </p>
            )}
          </div>
        </div>
      </form>

      {/* Closing it returns the form to idle, so a second enquiry from the same
          visitor starts clean rather than re-opening the dialog. */}
      <FormSuccessDialog
        open={status === 'sent'}
        onClose={() => setStatus('idle')}
        phone={whatsapp}
        /* The receipt email only goes out when FormSubmit is carrying the
           enquiry. On the WhatsApp fallback there is no address to send it to,
           so the dialog must not claim one was sent. */
        blurb={
          emailTo
            ? 'We have sent a confirmation to your email. Someone from our team replies within about 15 minutes, between 9am and 10pm.'
            : 'Someone from our team replies within about 15 minutes, between 9am and 10pm.'
        }
      />
    </Shell>
  );
};

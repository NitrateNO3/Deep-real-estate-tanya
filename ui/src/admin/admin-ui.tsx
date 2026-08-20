/* Small building blocks shared by the three admin screens.

   Plain Tailwind on the site's own tokens rather than a second design system —
   the PHP panel this replaces shipped an entire purchased admin theme with 88
   vendor libraries to render what amounts to some forms and tables. */
import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { uploadImage } from './api';

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-foreground text-background hover:opacity-90',
        variant === 'ghost' && 'border border-border bg-transparent hover:bg-muted',
        variant === 'danger' && 'bg-destructive text-destructive-foreground hover:opacity-90',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

const control =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground ' +
  'outline-none placeholder:text-muted-foreground focus:border-foreground/40';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(control, props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(control, 'resize-y', props.className)} />;
}

export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-foreground"
      />
      {label}
    </label>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-5', className)}>{children}</div>
  );
}

export function Banner({ kind, children }: { kind: 'error' | 'success'; children: ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-lg border px-3 py-2 text-sm',
        kind === 'error'
          ? 'border-destructive/30 bg-destructive/10 text-destructive'
          : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      )}
    >
      {children}
    </div>
  );
}

/** A list of plain strings — paragraphs, features. */
export function StringList({
  values,
  onChange,
  placeholder,
  multiline,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  const set = (i: number, v: string) => onChange(values.map((x, j) => (j === i ? v : x)));
  const remove = (i: number) => onChange(values.filter((_, j) => j !== i));

  return (
    <div className="flex flex-col gap-2">
      {values.map((v, i) => (
        <div key={i} className="flex items-start gap-2">
          {multiline ? (
            <Textarea rows={3} value={v} placeholder={placeholder} onChange={(e) => set(i, e.target.value)} />
          ) : (
            <Input value={v} placeholder={placeholder} onChange={(e) => set(i, e.target.value)} />
          )}
          <Button variant="ghost" onClick={() => remove(i)} className="shrink-0 px-3">
            ✕
          </Button>
        </div>
      ))}
      <Button variant="ghost" onClick={() => onChange([...values, ''])} className="self-start">
        + Add
      </Button>
    </div>
  );
}

/** The {label, value} rows behind both Specs and the Overview table. */
export function FactList({
  values,
  onChange,
}: {
  values: { label: string; value: string }[];
  onChange: (next: { label: string; value: string }[]) => void;
}) {
  const set = (i: number, patch: Partial<{ label: string; value: string }>) =>
    onChange(values.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <div className="flex flex-col gap-2">
      {values.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={row.label}
            placeholder="Label (e.g. Bedrooms)"
            onChange={(e) => set(i, { label: e.target.value })}
          />
          <Input
            value={row.value}
            placeholder="Value (e.g. 4)"
            onChange={(e) => set(i, { value: e.target.value })}
          />
          <Button
            variant="ghost"
            onClick={() => onChange(values.filter((_, j) => j !== i))}
            className="shrink-0 px-3"
          >
            ✕
          </Button>
        </div>
      ))}
      <Button
        variant="ghost"
        onClick={() => onChange([...values, { label: '', value: '' }])}
        className="self-start"
      >
        + Add row
      </Button>
    </div>
  );
}

/*
  Gallery editor. The first image is the cover — the card and the detail page
  both open on it — so it is labelled as such and can be changed by moving
  another photograph to the front.

  Reordering is by buttons rather than dragging: it works with a keyboard and on
  a touch screen, and there is no drag library to carry.
*/
export function ImageList({
  images,
  onChange,
}: {
  images: string[];
  onChange: (next: string[]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) urls.push(await uploadImage(file));
      onChange([...images, ...urls]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  const move = (i: number, delta: number) => {
    const j = i + delta;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((src, i) => (
            <div key={`${src}-${i}`} className="overflow-hidden rounded-lg border border-border">
              <div className="relative aspect-4/3 bg-muted">
                <img src={src} alt="" className="size-full object-cover" />
                {i === 0 && (
                  <span className="absolute left-2 top-2 rounded bg-foreground/85 px-1.5 py-0.5 text-[11px] font-medium text-background">
                    Cover
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1 p-1.5">
                <div className="flex gap-1">
                  <Button variant="ghost" className="px-2 py-1" onClick={() => move(i, -1)}>
                    ←
                  </Button>
                  <Button variant="ghost" className="px-2 py-1" onClick={() => move(i, 1)}>
                    →
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  className="px-2 py-1"
                  onClick={() => onChange(images.filter((_, j) => j !== i))}
                >
                  ✕
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <label className="inline-flex cursor-pointer items-center rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">
          {busy ? 'Uploading…' : '+ Add photographs'}
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            disabled={busy}
            onChange={(e) => {
              void onPick(e.target.files);
              e.target.value = '';
            }}
          />
        </label>
        {images.length === 0 && (
          <span className="text-xs text-muted-foreground">
            The first photograph becomes the cover.
          </span>
        )}
      </div>

      {error && <Banner kind="error">{error}</Banner>}
    </div>
  );
}

/* Property CRUD — the list, and the form behind it. */
import { useEffect, useState } from 'react';
import {
  ApiError, createProperty, deleteProperty, listProperties, updateProperty,
  type AdminProperty,
} from './api';
import {
  Banner, Button, Card, Checkbox, FactList, Field, ImageList, Input, StringList,
} from './admin-ui';

/** A blank listing. Kept in one place so "new" and "reset" cannot drift apart. */
const empty = (): AdminProperty => ({
  id: '',
  propertyId: '',
  name: '',
  location: '',
  address: '',
  price: '',
  priceUnit: '',
  badge: '',
  image: '',
  images: [],
  specs: [],
  overview: [],
  description: [],
  features: [],
  published: false,
  sortOrder: 0,
});

/** "4 BHK Luxury Floors – Suncity" → "4-bhk-luxury-floors-suncity" */
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);

export function PropertiesAdmin({ onExpired }: { onExpired: () => void }) {
  const [items, setItems] = useState<AdminProperty[]>([]);
  const [editing, setEditing] = useState<AdminProperty | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fail = (e: unknown) => {
    if (e instanceof ApiError && e.unauthorised) return onExpired();
    setError(e instanceof Error ? e.message : 'Something went wrong');
  };

  const refresh = () =>
    listProperties()
      .then(setItems)
      .catch(fail)
      .finally(() => setLoading(false));

  useEffect(() => {
    void refresh();
  }, []);

  async function save() {
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        // Fall back to a slug derived from the name, so the owner never has to
        // think about URLs unless they want to.
        const id = editing.id.trim() || slugify(editing.name);
        if (!id) throw new Error('Give the property a name first');
        await createProperty({ ...editing, id });
      } else {
        await updateProperty(editing.id, editing);
      }
      setNotice(isNew ? 'Property created.' : 'Changes saved.');
      setEditing(null);
      await refresh();
    } catch (e) {
      fail(e);
    } finally {
      setSaving(false);
    }
  }

  async function remove(p: AdminProperty) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await deleteProperty(p.id);
      setNotice('Property deleted.');
      await refresh();
    } catch (e) {
      fail(e);
    }
  }

  /* ------------------------------------------------------------------ form */
  if (editing) {
    const set = <K extends keyof AdminProperty>(k: K, v: AdminProperty[K]) =>
      setEditing({ ...editing, [k]: v });

    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">{isNew ? 'New property' : `Editing ${editing.name}`}</h2>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </div>

        {error && <Banner kind="error">{error}</Banner>}

        <Card className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <Input value={editing.name} onChange={(e) => set('name', e.target.value)} placeholder="4 BHK Luxury Floors – Suncity" />
            </Field>
            <Field
              label="Page address"
              hint={isNew ? 'Leave blank to build it from the name. Cannot be changed later.' : 'Fixed — changing it would break existing links.'}
            >
              <Input
                value={editing.id}
                disabled={!isNew}
                onChange={(e) => set('id', e.target.value)}
                placeholder={slugify(editing.name) || 'suncity-floors'}
              />
            </Field>
            <Field label="Locality" hint="Shown under the name.">
              <Input value={editing.location} onChange={(e) => set('location', e.target.value)} />
            </Field>
            <Field label="Reference no." hint="Your own file number.">
              <Input value={editing.propertyId} onChange={(e) => set('propertyId', e.target.value)} />
            </Field>
            <Field label="Price" hint="Written exactly as it should read, e.g. ₹5.50 Cr or On call.">
              <Input value={editing.price} onChange={(e) => set('price', e.target.value)} />
            </Field>
            <Field label="Price note" hint="Optional second line, e.g. from ₹4.60 Cr.">
              <Input value={editing.priceUnit ?? ''} onChange={(e) => set('priceUnit', e.target.value)} />
            </Field>
            <Field label="Badge" hint="e.g. For Sale · Residential">
              <Input value={editing.badge ?? ''} onChange={(e) => set('badge', e.target.value)} />
            </Field>
            <Field label="Order" hint="Lower numbers come first.">
              <Input type="number" value={editing.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} />
            </Field>
          </div>

          <Field label="Full address" hint="What the map button searches for.">
            <Input value={editing.address} onChange={(e) => set('address', e.target.value)} />
          </Field>
        </Card>

        <Card className="flex flex-col gap-3">
          <h3 className="font-medium">Photographs</h3>
          <ImageList
            images={editing.images}
            onChange={(images) =>
              // The cover follows the first photograph, matching how the site reads it.
              setEditing({ ...editing, images, image: images[0] ?? '' })
            }
          />
        </Card>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="flex flex-col gap-3">
            <h3 className="font-medium">Key figures</h3>
            <p className="text-xs text-muted-foreground">The few shown on the card, e.g. Beds · 4.</p>
            <FactList values={editing.specs ?? []} onChange={(specs) => set('specs', specs)} />
          </Card>

          <Card className="flex flex-col gap-3">
            <h3 className="font-medium">Overview table</h3>
            <p className="text-xs text-muted-foreground">The full table on the property's page.</p>
            <FactList values={editing.overview} onChange={(overview) => set('overview', overview)} />
          </Card>
        </div>

        <Card className="flex flex-col gap-3">
          <h3 className="font-medium">Description</h3>
          <p className="text-xs text-muted-foreground">One box per paragraph.</p>
          <StringList
            values={editing.description}
            onChange={(description) => set('description', description)}
            placeholder="Write a paragraph…"
            multiline
          />
        </Card>

        <Card className="flex flex-col gap-3">
          <h3 className="font-medium">Features</h3>
          <StringList
            values={editing.features}
            onChange={(features) => set('features', features)}
            placeholder="e.g. Boundary wall in place"
          />
        </Card>

        <Card className="flex items-center justify-between gap-4">
          <div>
            <Checkbox checked={editing.published} onChange={(v) => set('published', v)} label="Published" />
            <p className="mt-1 text-xs text-muted-foreground">
              Until this is ticked the listing stays a draft and no visitor can see it.
            </p>
          </div>
          <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </Card>
      </div>
    );
  }

  /* ------------------------------------------------------------------ list */
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Properties</h2>
        <Button
          onClick={() => {
            setEditing(empty());
            setIsNew(true);
            setError(null);
          }}
        >
          + New property
        </Button>
      </div>

      {error && <Banner kind="error">{error}</Banner>}
      {notice && <Banner kind="success">{notice}</Banner>}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <Card>
          <p className="text-sm text-muted-foreground">
            No properties yet. Add the first one with the button above.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((p) => (
            <Card key={p.id} className="flex flex-wrap items-center gap-4">
              <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                {p.image && <img src={p.image} alt="" className="size-full object-cover" />}
              </div>
              <div className="min-w-48 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{p.name}</span>
                  <span
                    className={
                      p.published
                        ? 'rounded bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400'
                        : 'rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground'
                    }
                  >
                    {p.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {p.location} · {p.price}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditing(p);
                    setIsNew(false);
                    setError(null);
                  }}
                >
                  Edit
                </Button>
                <Button variant="danger" onClick={() => remove(p)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

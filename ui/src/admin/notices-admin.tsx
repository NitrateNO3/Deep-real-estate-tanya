/* Notices — short dated announcements shown as a strip on the site. */
import { useEffect, useState } from 'react';
import {
  ApiError, createNotice, deleteNotice, listNotices, updateNotice, type AdminNotice,
} from './api';
import { Banner, Button, Card, Checkbox, Field, Input, Textarea } from './admin-ui';

const empty = (): AdminNotice => ({
  id: 0,
  body: '',
  startsAt: null,
  endsAt: null,
  published: false,
});

/** <input type="datetime-local"> wants "YYYY-MM-DDTHH:mm" in local time. */
const toLocalInput = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null);

export function NoticesAdmin({ onExpired }: { onExpired: () => void }) {
  const [items, setItems] = useState<AdminNotice[]>([]);
  const [editing, setEditing] = useState<AdminNotice | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fail = (e: unknown) => {
    if (e instanceof ApiError && e.unauthorised) return onExpired();
    setError(e instanceof Error ? e.message : 'Something went wrong');
  };

  const refresh = () =>
    listNotices().then(setItems).catch(fail).finally(() => setLoading(false));

  useEffect(() => {
    void refresh();
  }, []);

  async function save() {
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      if (isNew) await createNotice(editing);
      else await updateNotice(editing.id, editing);
      setEditing(null);
      await refresh();
    } catch (e) {
      fail(e);
    } finally {
      setSaving(false);
    }
  }

  async function remove(n: AdminNotice) {
    if (!confirm('Delete this notice?')) return;
    try {
      await deleteNotice(n.id);
      await refresh();
    } catch (e) {
      fail(e);
    }
  }

  if (editing) {
    const set = <K extends keyof AdminNotice>(k: K, v: AdminNotice[K]) =>
      setEditing({ ...editing, [k]: v });

    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">{isNew ? 'New notice' : 'Edit notice'}</h2>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </div>

        {error && <Banner kind="error">{error}</Banner>}

        <Card className="flex flex-col gap-4">
          <Field label="Notice" hint="Keep it to a sentence — it shows as a single strip.">
            <Textarea rows={3} value={editing.body} onChange={(e) => set('body', e.target.value)} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Show from" hint="Leave blank to show as soon as it is published.">
              <Input
                type="datetime-local"
                value={toLocalInput(editing.startsAt)}
                onChange={(e) => set('startsAt', fromLocalInput(e.target.value))}
              />
            </Field>
            <Field label="Hide after" hint="Leave blank to keep showing until you unpublish it.">
              <Input
                type="datetime-local"
                value={toLocalInput(editing.endsAt)}
                onChange={(e) => set('endsAt', fromLocalInput(e.target.value))}
              />
            </Field>
          </div>

          <Checkbox checked={editing.published} onChange={(v) => set('published', v)} label="Published" />
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Notices</h2>
        <Button onClick={() => { setEditing(empty()); setIsNew(true); setError(null); }}>
          + New notice
        </Button>
      </div>

      {error && <Banner kind="error">{error}</Banner>}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <Card>
          <p className="text-sm text-muted-foreground">
            No notices. Add one to show an announcement across the top of the site.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((n) => (
            <Card key={n.id} className="flex flex-wrap items-center gap-4">
              <div className="min-w-48 flex-1">
                <p className="text-sm">{n.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {n.published ? 'Published' : 'Draft'}
                  {n.startsAt && ` · from ${new Date(n.startsAt).toLocaleDateString()}`}
                  {n.endsAt && ` · until ${new Date(n.endsAt).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => { setEditing(n); setIsNew(false); setError(null); }}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => remove(n)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

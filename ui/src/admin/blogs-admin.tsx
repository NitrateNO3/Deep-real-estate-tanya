/* Blog articles — title, cover, body, and its own page. */
import { useEffect, useMemo, useState } from 'react';
import {
  ApiError, createBlog, deleteBlog, listBlogs, updateBlog, type AdminBlog,
} from './api';
import {
  Banner, Button, Card, Checkbox, Field, Input, ListControls, Textarea,
  type StatusFilter,
} from './admin-ui';
import { uploadImage } from './api';

const empty = (): AdminBlog => ({
  id: 0,
  slug: '',
  title: '',
  excerpt: '',
  coverImage: null,
  body: '',
  published: false,
  publishedAt: null,
});

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);

export function BlogsAdmin({ onExpired }: { onExpired: () => void }) {
  const [items, setItems] = useState<AdminBlog[]>([]);
  const [editing, setEditing] = useState<AdminBlog | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  const counts = useMemo(
    () => ({
      all: items.length,
      published: items.filter((b) => b.published).length,
      draft: items.filter((b) => !b.published).length,
    }),
    [items],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((b) => {
      if (status === 'published' && !b.published) return false;
      if (status === 'draft' && b.published) return false;
      if (!q) return true;
      return (
        b.title.toLowerCase().includes(q) ||
        b.excerpt.toLowerCase().includes(q) ||
        b.slug.toLowerCase().includes(q)
      );
    });
  }, [items, query, status]);

  const fail = (e: unknown) => {
    if (e instanceof ApiError && e.unauthorised) return onExpired();
    setError(e instanceof Error ? e.message : 'Something went wrong');
  };

  const refresh = () =>
    listBlogs().then(setItems).catch(fail).finally(() => setLoading(false));

  useEffect(() => {
    void refresh();
  }, []);

  async function save() {
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      const slug = editing.slug.trim() || slugify(editing.title);
      if (!slug) throw new Error('Give the article a title first');
      if (isNew) await createBlog({ ...editing, slug });
      else await updateBlog(editing.id, { ...editing, slug });
      setEditing(null);
      await refresh();
    } catch (e) {
      fail(e);
    } finally {
      setSaving(false);
    }
  }

  async function remove(b: AdminBlog) {
    if (!confirm(`Delete "${b.title}"?`)) return;
    try {
      await deleteBlog(b.id);
      await refresh();
    } catch (e) {
      fail(e);
    }
  }

  if (editing) {
    const set = <K extends keyof AdminBlog>(k: K, v: AdminBlog[K]) =>
      setEditing({ ...editing, [k]: v });

    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">{isNew ? 'New article' : 'Edit article'}</h2>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </div>

        {error && <Banner kind="error">{error}</Banner>}

        <Card className="flex flex-col gap-4">
          <Field label="Title">
            <Input value={editing.title} onChange={(e) => set('title', e.target.value)} />
          </Field>

          <Field label="Page address" hint="Leave blank to build it from the title.">
            <Input
              value={editing.slug}
              placeholder={slugify(editing.title) || 'stamp-duty-in-haryana'}
              onChange={(e) => set('slug', e.target.value)}
            />
          </Field>

          <Field label="Summary" hint="The line shown on the article list.">
            <Textarea rows={2} value={editing.excerpt} onChange={(e) => set('excerpt', e.target.value)} />
          </Field>

          <Field label="Cover image">
            <div className="flex flex-wrap items-center gap-3">
              {editing.coverImage && (
                <img
                  src={editing.coverImage}
                  alt=""
                  className="h-20 w-32 rounded-lg border border-border object-cover"
                />
              )}
              <label className="inline-flex cursor-pointer items-center rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">
                {uploading ? 'Uploading…' : editing.coverImage ? 'Replace' : '+ Add cover'}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={uploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (!file) return;
                    setUploading(true);
                    setError(null);
                    try {
                      set('coverImage', await uploadImage(file));
                    } catch (err) {
                      fail(err);
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
              </label>
              {editing.coverImage && (
                <Button variant="ghost" onClick={() => set('coverImage', null)}>Remove</Button>
              )}
            </div>
          </Field>

          <Field
            label="Article"
            hint="Markdown: **bold**, _italic_, # heading, - list, [link](https://…)."
          >
            <Textarea rows={16} value={editing.body} onChange={(e) => set('body', e.target.value)} />
          </Field>

          <Checkbox checked={editing.published} onChange={(v) => set('published', v)} label="Published" />
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Articles</h2>
        <Button onClick={() => { setEditing(empty()); setIsNew(true); setError(null); }}>
          + New article
        </Button>
      </div>

      {error && <Banner kind="error">{error}</Banner>}

      {!loading && items.length > 0 && (
        <ListControls
          query={query}
          onQuery={setQuery}
          status={status}
          onStatus={setStatus}
          counts={counts}
          placeholder="Search by title, summary or page address…"
        />
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <Card>
          <p className="text-sm text-muted-foreground">No articles yet.</p>
        </Card>
      ) : visible.length === 0 ? (
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">No articles match that search.</p>
          <Button
            variant="ghost"
            onClick={() => {
              setQuery('');
              setStatus('all');
            }}
          >
            Clear filters
          </Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((b) => (
            <Card key={b.id} className="flex flex-wrap items-center gap-4">
              <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                {b.coverImage && <img src={b.coverImage} alt="" className="size-full object-cover" />}
              </div>
              <div className="min-w-48 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{b.title}</span>
                  <span
                    className={
                      b.published
                        ? 'rounded bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400'
                        : 'rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground'
                    }
                  >
                    {b.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="line-clamp-1 text-sm text-muted-foreground">{b.excerpt}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => { setEditing(b); setIsNew(false); setError(null); }}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => remove(b)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

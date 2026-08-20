import { useEffect, useMemo, useRef, useState } from 'react';
import { buildRegistry } from './registry';
import { useSiteContent } from './lib/content';
import { AdminPanel } from './admin/admin-panel';
import { NoticeStrip } from './components/sections/notices/notice-strip';

type Theme = 'light' | 'dark';

/** The page a visitor should land on: the home page, not the first component. */
const LANDING_ID = 'home-so-far';

/*
  The sandbox chrome is a development tool. On the deployed build the link goes
  to clients, so it opens straight into the site itself — otherwise the first
  thing they see is a sidebar full of component names.

  ?full=1   forces the bare component (works everywhere, used by "Open full
            screen" and for checking responsive breakpoints)
  ?sandbox=1 forces the gallery back on, including on the deployed build
*/
const params = new URLSearchParams(window.location.search);
const SHOW_SITE_ONLY = params.has('full') || (import.meta.env.PROD && !params.has('sandbox'));

export default function App() {
  /* Listings and articles come from the database, and a property's page only
     exists because the registry has an entry for it — so the registry is
     rebuilt whenever that content changes. Until the first fetch returns this
     is the set the site shipped with. */
  const { properties, blogs } = useSiteContent();
  const registry = useMemo(() => buildRegistry(properties, blogs), [properties, blogs]);

  // Initial theme can be forced with ?theme=dark so a preview link is shareable.
  const [theme, setTheme] = useState<Theme>(() =>
    new URLSearchParams(window.location.search).get('theme') === 'dark' ? 'dark' : 'light',
  );
  const [activeId, setActiveId] = useState<string>(
    () =>
      window.location.hash.slice(1) ||
      (SHOW_SITE_ONLY ? LANDING_ID : registry[0]?.id) ||
      '',
  );
  /* The sandbox's own scroll container. In ?full=1 the window scrolls instead,
     so both are reset when the page changes. */
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (activeId) window.location.hash = activeId;
  }, [activeId]);

  /* Arriving at a page puts you at the top of it.
     Switching entries only swaps what renders — the scroll offset belongs to
     the container, not to the page, so without this you land wherever the
     previous page happened to be scrolled to. `instant` because a page change
     is not a movement within a page; smooth-scrolling it reads as a glitch. */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeId]);

  /* Follow hash changes, so an in-page link (the nav's Home / About Us) can
     move between registry entries. Without this the hash is only read once at
     mount and clicking a link would change the URL but render nothing new. */
  useEffect(() => {
    const onHashChange = () => {
      const id = window.location.hash.slice(1);
      if (id) setActiveId(id);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, typeof registry>();
    for (const entry of registry) {
      const list = map.get(entry.group) ?? [];
      list.push(entry);
      map.set(entry.group, list);
    }
    return [...map.entries()];
  }, [registry]);

  const active = registry.find((e) => e.id === activeId) ?? registry[0];

  /* The owner's panel. Deliberately outside the registry and the sandbox
     chrome: it is not part of the site, and it must not appear in the sidebar
     as something browsable. Access is decided by the API, not by this branch. */
  if (activeId === 'admin') return <AdminPanel />;

  if (SHOW_SITE_ONLY && active) {
    return (
      <>
        <NoticeStrip />
        {active.render()}
      </>
    );
  }

  if (!active) {
    return (
      <div className="grid min-h-dvh place-items-center p-8 text-center">
        <div>
          <h1 className="text-xl font-semibold">No components yet</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Add one to <code className="rounded bg-muted px-1.5 py-0.5">src/registry.tsx</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r bg-card/40 p-4">
        <div className="mb-6 px-2">
          <p className="text-sm font-semibold">Deep Real Estate</p>
          <p className="text-xs text-muted-foreground">Component sandbox</p>
        </div>

        <nav className="space-y-5">
          {groups.map(([group, entries]) => (
            <div key={group}>
              <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group}
              </p>
              <ul className="space-y-0.5">
                {entries.map((entry) => {
                  const isActive = entry.id === active.id;
                  return (
                    <li key={entry.id}>
                      <button
                        type="button"
                        onClick={() => setActiveId(entry.id)}
                        className={`w-full cursor-pointer rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground/80 hover:bg-muted'
                        }`}
                      >
                        {entry.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Preview */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b px-6 py-3">
          <h1 className="truncate text-sm font-medium">{active.name}</h1>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={`?full=1${theme === 'dark' ? '&theme=dark' : ''}#${active.id}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
              title="Open without the sandbox sidebar — use this to test responsive breakpoints"
            >
              Open full screen ↗
            </a>
            <button
              type="button"
              onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
              className="cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
            >
              {theme === 'light' ? 'Dark' : 'Light'} mode
            </button>
          </div>
        </header>

        {active.layout === 'full' ? (
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            {active.render()}
          </div>
        ) : (
          <div className="grid flex-1 place-items-center p-10">{active.render()}</div>
        )}
      </main>
    </div>
  );
}

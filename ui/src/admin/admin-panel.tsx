/*
  The owner's panel: one password in, then properties / notices / articles.

  Everything here is a convenience — the real protection is server-side. Hiding
  the UI proves nothing, so every route it calls re-checks the session and the
  panel simply reacts to a 401 by showing the login form again.
*/
import { useCallback, useEffect, useState } from 'react';
import { ApiError, checkSession, login, logout } from './api';
import { Banner, Button, Card, Field, Input } from './admin-ui';
import { PropertiesAdmin } from './properties-admin';
import { NoticesAdmin } from './notices-admin';
import { BlogsAdmin } from './blogs-admin';
import { refreshContent } from '@/lib/content';

type Tab = 'properties' | 'notices' | 'blogs';

const TABS: { id: Tab; label: string }[] = [
  { id: 'properties', label: 'Properties' },
  { id: 'notices', label: 'Notices' },
  { id: 'blogs', label: 'Articles' },
];

function LoginScreen({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(password);
      setPassword('');
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not sign in');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <h1 className="text-lg font-semibold">Deep Real Estate</h1>
            <p className="text-sm text-muted-foreground">Owner sign-in</p>
          </div>

          {error && <Banner kind="error">{error}</Banner>}

          <Field label="Password">
            <Input
              type="password"
              value={password}
              autoFocus
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          <Button type="submit" disabled={busy || password.length === 0}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export function AdminPanel() {
  const [authed, setAuthed] = useState<boolean | null>(null);   // null = still checking
  const [tab, setTab] = useState<Tab>('properties');

  useEffect(() => {
    void checkSession()
      .then(setAuthed)
      .catch(() => setAuthed(false));
  }, []);

  /* Any admin call that comes back 401 lands here: the session lapsed while the
     panel was open, so go back to the login form rather than failing silently. */
  const onExpired = useCallback(() => setAuthed(false), []);

  async function signOut() {
    try {
      await logout();
    } finally {
      setAuthed(false);
    }
  }

  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Checking…</p>
      </div>
    );
  }

  if (!authed) return <LoginScreen onDone={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-4">
            <span className="font-semibold">Deep Real Estate</span>
            <nav className="flex gap-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={
                    'rounded-lg px-3 py-1.5 text-sm transition ' +
                    (tab === t.id
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground')
                  }
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                // Pull the public pages back in step with what was just edited.
                void refreshContent();
                window.location.hash = '';
              }}
            >
              View site
            </Button>
            <Button variant="ghost" onClick={signOut}>Sign out</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {tab === 'properties' && <PropertiesAdmin onExpired={onExpired} />}
        {tab === 'notices' && <NoticesAdmin onExpired={onExpired} />}
        {tab === 'blogs' && <BlogsAdmin onExpired={onExpired} />}
      </main>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SectionKey, SiteContent } from '../content/types';
import { sections } from '../content/schema';
import { api, setCsrf, ApiError, type SessionInfo, type Versions } from './api';
import { ConfirmProvider, ToastProvider, Icon, useToast } from './ui';
import { FieldContext, useOptions } from './fields';
import { Dashboard, SectionPage, MediaLibrary } from './views';

/* Hash routes: #/  ·  #/s/<section>  ·  #/s/<section>/<index|new>  ·  #/media */
export type Route = { name: 'dash' } | { name: 'section'; key: SectionKey; item?: string } | { name: 'media' };
const parse = (h: string): Route => {
  const p = h.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  if (p[0] === 's' && sections.some((s) => s.key === p[1])) return { name: 'section', key: p[1] as SectionKey, item: p[2] };
  if (p[0] === 'media') return { name: 'media' };
  return { name: 'dash' };
};
export const go = (r: string) => { location.hash = r; };

let dirtyFlag = false;
export const setDirty = (v: boolean) => { dirtyFlag = v; };

export function AdminApp() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <Root />
      </ConfirmProvider>
    </ToastProvider>
  );
}

function Root() {
  const [session, setSession] = useState<SessionInfo | null | undefined>(undefined);
  const [setupError, setSetupError] = useState<string | null>(null);
  useEffect(() => {
    api.session().then((s) => { setCsrf(s.csrf); setSession(s); }).catch((e) => {
      if (e instanceof ApiError && e.status === 503) setSetupError(e.message);
      setSession(null);
    });
    const out = () => setSession(null);
    window.addEventListener('admin:signed-out', out);
    return () => window.removeEventListener('admin:signed-out', out);
  }, []);
  if (session === undefined) return <div className="center muted">Loading…</div>;
  if (!session) return <Login setupError={setupError} onIn={(s) => { setCsrf(s.csrf); setSession(s); }} />;
  return <Shell session={session} onOut={() => setSession(null)} />;
}

function Login({ onIn, setupError }: { onIn: (s: SessionInfo) => void; setupError: string | null }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(setupError);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try { onIn(await api.login(username, password)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Sign-in failed.'); setPassword(''); }
    finally { setBusy(false); }
  };
  return (
    <main className="login">
      <form className="login-card" onSubmit={submit}>
        <p className="brand-mark">ICCMM-26</p>
        <h1>Website admin</h1>
        <p className="muted">Sign in to edit the conference website.</p>
        {error && <p className="alert alert--error" role="alert">{error}</p>}
        <label className="fld"><span className="fld-label">Username</span>
          <input type="text" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus /></label>
        <label className="fld"><span className="fld-label">Password</span>
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        <button className="btn btn--primary btn--block" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <a className="muted small" href="/">← Back to the website</a>
      </form>
    </main>
  );
}

export type Store = {
  content: SiteContent;
  versions: Versions;
  save: <K extends SectionKey>(key: K, value: SiteContent[K]) => Promise<boolean>;
  reset: (key: SectionKey) => Promise<boolean>;
  reload: () => Promise<void>;
  session: SessionInfo;
};

function Shell({ session, onOut }: { session: SessionInfo; onOut: () => void }) {
  const toast = useToast();
  const [route, setRoute] = useState<Route>(() => parse(location.hash));
  const [data, setData] = useState<{ content: SiteContent; versions: Versions } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [nav, setNav] = useState(false);
  const [mediaTick, setMediaTick] = useState(0);

  const reload = useCallback(async () => {
    try { setData(await api.content()); setLoadError(null); }
    catch (e) { setLoadError(e instanceof Error ? e.message : 'Could not load content.'); }
  }, []);
  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    let last = location.hash;
    const on = () => {
      if (dirtyFlag && !window.confirm('You have unsaved changes. Leave this page and lose them?')) { history.replaceState(null, '', last); return; }
      dirtyFlag = false;
      last = location.hash;
      setRoute(parse(location.hash));
      setNav(false);
      window.scrollTo(0, 0);
    };
    const before = (e: BeforeUnloadEvent) => { if (dirtyFlag) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('hashchange', on);
    window.addEventListener('beforeunload', before);
    return () => { window.removeEventListener('hashchange', on); window.removeEventListener('beforeunload', before); };
  }, []);

  const save = useCallback(async <K extends SectionKey>(key: K, value: SiteContent[K]) => {
    if (!data) return false;
    try {
      const r = await api.save(key, value, data.versions[key]?.version ?? 0);
      setData((d) => d && ({ content: { ...d.content, [key]: r.value }, versions: { ...d.versions, [key]: { version: r.version, updatedAt: r.updatedAt, updatedBy: r.updatedBy } } }));
      return true;
    } catch (e) {
      toast({ kind: 'error', text: e instanceof Error ? e.message : 'Save failed.', ...(e instanceof ApiError && e.status === 409 ? { action: { label: 'Reload', run: () => { setDirty(false); reload(); } } } : {}) });
      return false;
    }
  }, [data, toast, reload]);

  const reset = useCallback(async (key: SectionKey) => {
    if (!data) return false;
    try {
      const r = await api.reset(key, data.versions[key]?.version ?? 0);
      setData((d) => d && ({ content: { ...d.content, [key]: r.value }, versions: { ...d.versions, [key]: { version: r.version, updatedAt: r.updatedAt, updatedBy: r.updatedBy } } }));
      return true;
    } catch (e) {
      toast({ kind: 'error', text: e instanceof Error ? e.message : 'Restore failed.' });
      return false;
    }
  }, [data, toast]);

  const logout = async () => {
    if (dirtyFlag && !window.confirm('You have unsaved changes. Sign out anyway?')) return;
    dirtyFlag = false;
    await api.logout().catch(() => {});
    onOut();
  };

  const options = useOptions(data?.content);
  const fieldCtx = useMemo(() => ({ options, onAsset: () => setMediaTick((t) => t + 1) }), [options]);
  const groups = useMemo(() => [...new Set(sections.map((s) => s.group))], []);
  const store: Store | null = data ? { ...data, save, reset, reload, session } : null;
  const current = route.name === 'section' ? route.key : route.name;

  return (
    <div className={`shell${nav ? ' nav-open' : ''}`}>
      <aside className="side" aria-label="Sections">
        <a className="side-brand" href="#/"><span className="brand-mark">ICCMM-26</span><span>Admin</span></a>
        <nav>
          <a className={`side-link${current === 'dash' ? ' is-on' : ''}`} href="#/">Dashboard</a>
          <a className={`side-link${current === 'media' ? ' is-on' : ''}`} href="#/media">Media library</a>
          {groups.map((g) => (
            <div key={g} className="side-group">
              <p className="side-title">{g}</p>
              {sections.filter((s) => s.group === g).map((s) => (
                <a key={s.key} className={`side-link${current === s.key ? ' is-on' : ''}`} href={`#/s/${s.key}`}>{s.label}</a>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <div className="side-scrim" onClick={() => setNav(false)} aria-hidden="true" />
      <div className="main">
        <header className="top">
          <button type="button" className="btn btn--icon top-menu" aria-label="Open menu" onClick={() => setNav((n) => !n)}><Icon name="menu" size={20} /></button>
          <span className="top-store muted small">{session.storage ? `Storage: ${session.storage}` : ''}</span>
          <a className="btn btn--sm btn--ghost" href="/?fresh=1" target="_blank" rel="noopener">View site <Icon name="ext" size={14} /></a>
          <span className="top-user small" title="Signed in">{session.user}</span>
          <button type="button" className="btn btn--sm" onClick={logout}>Sign out</button>
        </header>
        <main className="content" id="main">
          {loadError && <div className="alert alert--error">{loadError} <button className="btn btn--sm" onClick={reload}>Try again</button></div>}
          {!store && !loadError && <p className="muted">Loading content…</p>}
          {store && (
            <FieldContext.Provider value={fieldCtx}>
              {route.name === 'dash' && <Dashboard store={store} />}
              {route.name === 'media' && <MediaLibrary store={store} tick={mediaTick} />}
              {route.name === 'section' && <SectionPage key={`${route.key}/${route.item ?? ''}`} store={store} sectionKey={route.key} item={route.item} />}
            </FieldContext.Provider>
          )}
        </main>
      </div>
    </div>
  );
}

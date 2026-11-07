import { useEffect, useMemo, useState } from 'react';
import type { SectionKey } from '../content/types';
import { sections, sectionByKey, validate, validateSection, ValidationError, type SectionDef } from '../content/schema';
import { api, displayUrl, fmtBytes, fmtDate, prepareImage, ApiError, MAX_UPLOAD, type Asset } from './api';
import { FieldEditor } from './fields';
import { Icon, useConfirm, useToast } from './ui';
import { go, setDirty, type Store } from './App';

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v ?? null));
const pageUrl = (p: string) => (p === 'index.html' ? '/' : p === 'all pages' ? '/' : `/${p}`);

/* ───────────────────────── Dashboard ───────────────────────── */

export function Dashboard({ store }: { store: Store }) {
  const c = store.content;
  const [assets, setAssets] = useState<number | null>(null);
  useEffect(() => { api.media().then((r) => setAssets(r.assets.length)).catch(() => setAssets(null)); }, []);
  const items = c.schedule.flatMap((d) => d.items);
  const papers = items.flatMap((i) => (i.lanes ?? []).flatMap((l) => l.papers ?? [])).length;
  const cards: { label: string; value: number | string; note?: string; href: string }[] = [
    { label: 'Guests & speakers', value: c.guests.filter((g) => !g.placeholder).length, note: `${c.guests.filter((g) => g.placeholder).length} placeholders · ${c.guests.filter((g) => !g.photo).length} without photo`, href: '#/s/guests' },
    { label: 'Keynote speakers', value: c.keynoteIds.length, href: '#/s/keynoteIds' },
    { label: 'Committee members', value: c.committee.reduce((n, g) => n + g.people.length, 0), note: `${c.committee.length} groups · ${c.organizingCommittee.length} organizing`, href: '#/s/committee' },
    { label: 'Programme items', value: items.length, note: `${c.schedule.length} days · ${papers} papers`, href: '#/s/schedule' },
    { label: 'Research tracks', value: c.tracks.length, href: '#/s/tracks' },
    { label: 'Important dates', value: c.importantDates.length + c.posterDates.length, note: 'papers + posters', href: '#/s/importantDates' },
    { label: 'Gallery photos', value: c.ieeeGallery.length, href: '#/s/ieeeGallery' },
    { label: 'Supporters', value: c.supporters.length, note: `${c.sponsorTiers.length} sponsorship tiers`, href: '#/s/supporters' },
    { label: 'Posters & downloads', value: c.posters.length + c.documents.length, href: '#/s/posters' },
    { label: 'Uploaded files', value: assets ?? '…', href: '#/media' },
  ];
  const recent = Object.entries(store.versions).filter(([, v]) => v.updatedAt).sort((a, b) => b[1].updatedAt!.localeCompare(a[1].updatedAt!)).slice(0, 8);
  return (
    <>
      <div className="page-head">
        <h1>Dashboard</h1>
        <p className="muted">Everything on the public website is editable from the sections on the left. Changes appear on the site within about a minute of saving.</p>
      </div>
      <div className="cards">
        {cards.map((k) => (
          <a key={k.label} className="card stat" href={k.href}>
            <span className="stat-v">{k.value}</span>
            <span className="stat-l">{k.label}</span>
            {k.note && <span className="stat-n muted">{k.note}</span>}
          </a>
        ))}
      </div>
      <div className="two">
        <section className="card">
          <h2>Recent changes</h2>
          {recent.length === 0 ? <p className="muted">No edits yet. All content is as it was originally published.</p> : (
            <ul className="recent">{recent.map(([k, v]) => <li key={k}><a href={`#/s/${k}`}>{sectionByKey[k as SectionKey]?.label ?? k}</a><span className="muted small">{fmtDate(v.updatedAt)} · {v.updatedBy}</span></li>)}</ul>
          )}
        </section>
        <section className="card">
          <h2>Quick links</h2>
          <ul className="quick">
            <li><a href="#/s/guests/new">Add a guest</a></li>
            <li><a href="#/s/importantDates">Change a deadline</a></li>
            <li><a href="#/s/links">Registration form & CMT links</a></li>
            <li><a href="#/s/ieeeGallery/new">Add a gallery photo</a></li>
            <li><a href="#/s/meta">Contact details</a></li>
            <li><a href={api.exportUrl}>Download a backup of all content (JSON)</a></li>
          </ul>
        </section>
      </div>
    </>
  );
}

/* ───────────────────────── Section page ───────────────────────── */

export function SectionPage({ store, sectionKey, item }: { store: Store; sectionKey: SectionKey; item?: string }) {
  const def = sectionByKey[sectionKey];
  if (def.kind === 'list' && item !== undefined) return <ItemEditor store={store} def={def} item={item} />;
  if (def.kind === 'list') return <ListView store={store} def={def} />;
  return <FormView store={store} def={def} />;
}

function Head({ def, store, children, crumb }: { def: SectionDef; store: Store; children?: React.ReactNode; crumb?: string }) {
  const v = store.versions[def.key];
  return (
    <div className="page-head">
      <p className="crumbs small"><a href="#/">Dashboard</a> / <span>{def.group}</span>{crumb && <> / <a href={`#/s/${def.key}`}>{def.label}</a></>}</p>
      <div className="page-head-row">
        <h1>{crumb ?? def.label}</h1>
        <div className="actions">{children}</div>
      </div>
      <p className="muted">{def.description}</p>
      <p className="muted small">
        {def.shownOn.length > 0 && <>Shown on: {def.shownOn.map((p, i) => <span key={p}>{i > 0 && ', '}<a href={pageUrl(p)} target="_blank" rel="noopener">{p}</a></span>)} · </>}
        {v?.updatedAt ? `Last saved ${fmtDate(v.updatedAt)} by ${v.updatedBy}` : 'Original content (not edited yet)'}
      </p>
    </div>
  );
}

function errorOf(e: unknown) {
  return e instanceof ValidationError ? { path: e.path, message: e.message } : { path: null, message: e instanceof Error ? e.message : String(e) };
}

function ListView({ store, def }: { store: Store; def: SectionDef }) {
  const list = store.content[def.key] as any[];
  const L = def.list!;
  const toast = useToast();
  const confirm = useConfirm();
  const [q, setQ] = useState('');
  const [filters, setFilters] = useState<Record<number, string>>({});
  const [sort, setSort] = useState(-1);
  const [busy, setBusy] = useState(false);

  const rows = useMemo(() => {
    let r = list.map((it, i) => ({ it, i }));
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length) r = r.filter(({ it }) => { const t = L.search(it).toLowerCase(); return words.every((w) => t.includes(w)); });
    (L.filters ?? []).forEach((f, fi) => { const v = filters[fi]; const o = f.options.find((x) => x.value === v); if (o) r = r.filter(({ it }) => o.test(it)); });
    if (sort >= 0 && L.sorts?.[sort]) { const key = L.sorts[sort].key; r = [...r].sort((a, b) => { const x = key(a.it), y = key(b.it); return x < y ? -1 : x > y ? 1 : 0; }); }
    return r;
  }, [list, q, filters, sort, L]);
  const ordered = sort < 0 && !q && !Object.values(filters).some(Boolean);

  const commit = async (next: any[], msg: string, undo?: any[]) => {
    try { validateSection(def.key, next); } catch (e) { toast({ kind: 'error', text: errorOf(e).message }); return; }
    setBusy(true);
    const ok = await store.save(def.key, next as never);
    setBusy(false);
    if (ok) toast({ kind: 'ok', text: msg, ...(undo ? { action: { label: 'Undo', run: () => { store.save(def.key, undo as never).then((k) => k && toast({ kind: 'info', text: 'Undone.' })); } } } : {}) });
  };
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const next = [...list]; [next[i], next[j]] = [next[j], next[i]];
    commit(next, 'Order saved.');
  };
  const del = async (i: number) => {
    const t = L.title(list[i]);
    if (!(await confirm({ title: `Delete "${t}"?`, body: <p>This removes it from the public website. You can undo straight after.</p>, confirm: 'Delete', danger: true }))) return;
    commit(list.filter((_, k) => k !== i), `Deleted "${t}".`, list);
  };
  const dup = (i: number) => {
    const copy = clone(list[i]);
    if (L.unique) copy[L.unique] = `${copy[L.unique]}-copy`;
    commit([...list.slice(0, i + 1), copy, ...list.slice(i + 1)], 'Duplicated. Edit the copy to change it.');
  };

  return (
    <>
      <Head def={def} store={store}><a className="btn btn--primary" href={`#/s/${def.key}/new`}><Icon name="plus" /> Add new</a></Head>
      <div className="toolbar">
        <label className="search"><Icon name="search" /><input type="search" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" /></label>
        {(L.filters ?? []).map((f, fi) => (
          <select key={f.label} value={filters[fi] ?? ''} onChange={(e) => setFilters((x) => ({ ...x, [fi]: e.target.value }))} aria-label={f.label}>
            <option value="">{f.label}: all</option>
            {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ))}
        <select value={sort} onChange={(e) => setSort(Number(e.target.value))} aria-label="Sort">
          <option value={-1}>Order on the site</option>
          {(L.sorts ?? []).map((s, i) => <option key={s.label} value={i}>Sort by {s.label.toLowerCase()}</option>)}
        </select>
        <span className="muted small">{rows.length} of {list.length}</span>
      </div>
      {!ordered && <p className="muted small">Clear search, filters and sorting to change the order.</p>}
      <ul className="rows">
        {rows.map(({ it, i }) => {
          const thumb = L.thumb?.(it);
          return (
            <li key={i} className="row">
              <span className="idx">{i + 1}</span>
              {L.thumb && (thumb ? <img className="row-thumb" src={displayUrl(thumb)} alt="" loading="lazy" /> : <span className="row-thumb row-thumb--empty" />)}
              <a className="row-main" href={`#/s/${def.key}/${i}`}>
                <span className="row-title">{L.title(it) || <em className="muted">(untitled)</em>}</span>
                {L.subtitle && <span className="row-sub muted">{L.subtitle(it)}</span>}
              </a>
              <span className="row-ctrls">
                <button type="button" className="btn btn--icon" title="Move up" aria-label="Move up" disabled={!ordered || busy || i === 0} onClick={() => move(i, -1)}><Icon name="up" /></button>
                <button type="button" className="btn btn--icon" title="Move down" aria-label="Move down" disabled={!ordered || busy || i === list.length - 1} onClick={() => move(i, 1)}><Icon name="down" /></button>
                <a className="btn btn--icon" title="Edit" aria-label="Edit" href={`#/s/${def.key}/${i}`}><Icon name="edit" /></a>
                <button type="button" className="btn btn--icon" title="Duplicate" aria-label="Duplicate" disabled={busy} onClick={() => dup(i)}><Icon name="copy" /></button>
                <button type="button" className="btn btn--icon btn--danger-ghost" title="Delete" aria-label="Delete" disabled={busy} onClick={() => del(i)}><Icon name="trash" /></button>
              </span>
            </li>
          );
        })}
        {rows.length === 0 && <li className="muted empty">Nothing matches.</li>}
      </ul>
    </>
  );
}

function SaveBar({ dirty, busy, onSave, onCancel, error, saveLabel = 'Save' }: { dirty: boolean; busy: boolean; onSave: () => void; onCancel: () => void; error: string | null; saveLabel?: string }) {
  return (
    <div className={`savebar${dirty ? ' is-dirty' : ''}`}>
      {error ? <span className="savebar-err" role="alert">{error}</span> : <span className="muted small">{dirty ? 'Unsaved changes' : 'All changes saved'}</span>}
      <button type="button" className="btn" disabled={busy} onClick={onCancel}>{dirty ? 'Discard' : 'Back'}</button>
      <button type="button" className="btn btn--primary" disabled={busy || !dirty} onClick={onSave}>{busy ? 'Saving…' : saveLabel}</button>
    </div>
  );
}

function useDraft<T>(initial: T) {
  const [draft, setDraft] = useState<T>(() => clone(initial));
  const [base, setBase] = useState(() => JSON.stringify(initial ?? null));
  const dirty = JSON.stringify(draft ?? null) !== base;
  useEffect(() => { setDirty(dirty); }, [dirty]);
  useEffect(() => () => setDirty(false), []);
  return { draft, setDraft, dirty, markSaved: (v: T) => { setBase(JSON.stringify(v ?? null)); setDraft(clone(v)); }, discard: () => setDraft(JSON.parse(base)) };
}

function ItemEditor({ store, def, item }: { store: Store; def: SectionDef; item: string }) {
  const list = store.content[def.key] as any[];
  const isNew = item === 'new';
  const index = isNew ? list.length : Number(item);
  const L = def.list!;
  const toast = useToast();
  const initial = useMemo(() => (isNew ? L.newItem(list) : list[index]), []); // eslint-disable-line react-hooks/exhaustive-deps
  const { draft, setDraft, dirty, markSaved } = useDraft(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<{ path: string | null; message: string } | null>(null);
  const itemField = def.field.t === 'list' ? def.field.of : def.field;

  if (!isNew && (!Number.isInteger(index) || !list[index])) {
    return <><Head def={def} store={store} crumb="Not found" /><p>This item no longer exists. <a href={`#/s/${def.key}`}>Back to the list</a></p></>;
  }
  const save = async (back: boolean) => {
    setErr(null);
    let clean: any;
    try {
      clean = validate(itemField, draft, '');
      const next = isNew ? [...list, clean] : list.map((x, i) => (i === index ? clean : x));
      try { validateSection(def.key, next); } catch (e) {
        if (e instanceof ValidationError) { const m = /^\[(\d+)\]\.?(.*)$/.exec(e.path); throw new ValidationError(m ? m[2] : e.path, e.message.replace(/^[^:]*: /, '')); }
        throw e;
      }
      setBusy(true);
      const ok = await store.save(def.key, next as never);
      setBusy(false);
      if (!ok) return;
      markSaved(clean);
      setDirty(false);
      toast({ kind: 'ok', text: isNew ? 'Added. It is now on the website.' : 'Saved. Changes are live within about a minute.' });
      if (back) go(`#/s/${def.key}`);
      else if (isNew) go(`#/s/${def.key}/${list.length}`);
    } catch (e) {
      setBusy(false);
      const x = errorOf(e);
      setErr(x);
      toast({ kind: 'error', text: `Not saved: ${x.message}` });
    }
  };
  const title = isNew ? `New ${def.label.toLowerCase().replace(/s$/, '')}` : L.title(draft) || '(untitled)';
  return (
    <>
      <Head def={def} store={store} crumb={title}>
        {def.shownOn[0] && <a className="btn btn--ghost btn--sm" href={pageUrl(def.shownOn[0]) + '?fresh=1'} target="_blank" rel="noopener">Preview page <Icon name="ext" size={14} /></a>}
      </Head>
      <form className="card form" onSubmit={(e) => { e.preventDefault(); save(false); }}>
        <FieldEditor field={itemField} value={draft} onChange={setDraft} errorPath={err?.path} path="" />
        <button type="submit" hidden />
      </form>
      <SaveBar dirty={dirty || isNew} busy={busy} error={err?.message ?? null} onSave={() => save(true)} saveLabel={isNew ? 'Add' : 'Save'}
        onCancel={() => { setDirty(false); go(`#/s/${def.key}`); }} />
    </>
  );
}

function FormView({ store, def }: { store: Store; def: SectionDef }) {
  const toast = useToast();
  const confirm = useConfirm();
  const { draft, setDraft, dirty, markSaved, discard } = useDraft(store.content[def.key]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<{ path: string | null; message: string } | null>(null);
  const save = async () => {
    setErr(null);
    try {
      const clean = validateSection(def.key, draft);
      setBusy(true);
      const ok = await store.save(def.key, clean as never);
      setBusy(false);
      if (ok) { markSaved(clean); toast({ kind: 'ok', text: 'Saved. Changes are live within about a minute.' }); }
    } catch (e) {
      setBusy(false);
      const x = errorOf(e);
      setErr(x);
      toast({ kind: 'error', text: `Not saved: ${x.message}` });
    }
  };
  const restore = async () => {
    if (!(await confirm({ title: `Restore "${def.label}" to the original content?`, body: <p>This replaces the current content of this section with the content the website was launched with. You can't undo this from here.</p>, confirm: 'Restore original', danger: true }))) return;
    setBusy(true);
    const ok = await store.reset(def.key);
    setBusy(false);
    if (ok) toast({ kind: 'ok', text: 'Restored to the original content.' });
  };
  useEffect(() => { if (!dirty) markSaved(store.content[def.key]); }, [store.content[def.key]]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <Head def={def} store={store}>
        {store.versions[def.key]?.version > 0 && <button type="button" className="btn btn--ghost btn--sm" disabled={busy} onClick={restore}>Restore original</button>}
      </Head>
      <form className="card form" onSubmit={(e) => { e.preventDefault(); save(); }}>
        <FieldEditor field={def.field} value={draft} onChange={setDraft} errorPath={err?.path} path="" />
        <button type="submit" hidden />
      </form>
      <SaveBar dirty={dirty} busy={busy} error={err?.message ?? null} onSave={save} onCancel={() => { if (dirty) discard(); else go('#/'); }} />
    </>
  );
}

/* ───────────────────────── Media library ───────────────────────── */

const KIND_LABEL: Record<string, string> = { portrait: 'Guest portrait', pair: 'Gallery photo', poster: 'Poster', single: 'Logo / image', square: 'Committee photo', pdf: 'PDF' };

export function MediaLibrary({ store, tick }: { store: Store; tick: number }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [assets, setAssets] = useState<Asset[] | null>(null);
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('');
  const [unused, setUnused] = useState(false);
  const [upKind, setUpKind] = useState('single');
  const [busy, setBusy] = useState(false);
  const load = () => api.media().then((r) => setAssets(r.assets)).catch((e) => toast({ kind: 'error', text: e.message }));
  useEffect(() => { load(); }, [tick, store.versions]); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = (assets ?? []).filter((a) => (!kind || a.kind === kind) && (!unused || a.usedIn.length === 0) && (!q || `${a.originalName} ${a.url}`.toLowerCase().includes(q.toLowerCase())));
  const upload = async (f: File) => {
    const isPdf = upKind === 'pdf';
    if (isPdf ? f.type !== 'application/pdf' : !/^image\/(jpeg|png|webp|gif|avif)$/.test(f.type)) return toast({ kind: 'error', text: isPdf ? 'Choose a PDF file.' : 'Choose a JPEG, PNG, WebP, GIF or AVIF image.' });
    const blob = isPdf ? f : await prepareImage(f);
    if (blob.size > MAX_UPLOAD) return toast({ kind: 'error', text: 'The file is larger than 4 MB.' });
    setBusy(true);
    try { await api.upload(upKind, blob, f.name); toast({ kind: 'ok', text: 'Uploaded. Copy its address into a section, or pick it from the section form.' }); load(); }
    catch (e) { toast({ kind: 'error', text: e instanceof ApiError ? e.message : 'Upload failed.' }); }
    finally { setBusy(false); }
  };
  const del = async (a: Asset) => {
    if (!(await confirm({ title: 'Delete this file permanently?', body: <p><strong>{a.originalName}</strong> and its {a.files.length} size variant(s) will be deleted. This can't be undone.</p>, confirm: 'Delete', danger: true }))) return;
    try { await api.deleteMedia(a.id); toast({ kind: 'ok', text: 'File deleted.' }); load(); }
    catch (e) { toast({ kind: 'error', text: e instanceof Error ? e.message : 'Delete failed.' }); }
  };
  const copy = (a: Asset) => navigator.clipboard?.writeText(a.url).then(() => toast({ kind: 'info', text: 'Address copied.' }));
  return (
    <>
      <div className="page-head">
        <p className="crumbs small"><a href="#/">Dashboard</a></p>
        <h1>Media library</h1>
        <p className="muted">Images and PDFs uploaded through the admin. Images are converted to WebP in the sizes the website uses. The original site images (in the website's files) are not listed here; replace them from the section where they appear.</p>
      </div>
      <div className="card upload-card">
        <label className="fld fld--inline"><span className="fld-label">Upload as</span>
          <select value={upKind} onChange={(e) => setUpKind(e.target.value)}>{Object.entries(KIND_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        <label className={`btn btn--primary${busy ? ' is-busy' : ''}`}>
          <Icon name="upload" /> {busy ? 'Uploading…' : 'Choose file'}
          <input type="file" hidden disabled={busy} accept={upKind === 'pdf' ? 'application/pdf' : 'image/jpeg,image/png,image/webp,image/gif,image/avif'} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) upload(f); }} />
        </label>
        <span className="muted small">Max 4 MB (large photos are reduced automatically).</span>
      </div>
      <div className="toolbar">
        <label className="search"><Icon name="search" /><input type="search" placeholder="Search files…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search files" /></label>
        <select value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Type"><option value="">All types</option>{Object.entries(KIND_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <label className="check"><input type="checkbox" checked={unused} onChange={(e) => setUnused(e.target.checked)} /> Unused only</label>
        <span className="muted small">{shown.length} files</span>
      </div>
      {!assets ? <p className="muted">Loading…</p> : shown.length === 0 ? <p className="muted">No uploaded files{assets.length ? ' match' : ' yet'}.</p> : (
        <ul className="media-grid">
          {shown.map((a) => (
            <li key={a.id} className="card media">
              {a.kind === 'pdf' ? <a className="media-pdf" href={a.url} target="_blank" rel="noopener">PDF</a> : <img src={displayUrl(a.url, a.kind)} alt={a.originalName} loading="lazy" />}
              <div className="media-info">
                <p className="media-name" title={a.originalName}>{a.originalName}</p>
                <p className="muted small">{KIND_LABEL[a.kind] ?? a.kind}{a.w ? ` · ${a.w}×${a.h}` : ''} · {fmtBytes(a.files.reduce((n, f) => n + f.size, 0))}</p>
                <p className="muted small">{fmtDate(a.createdAt)}</p>
                <p className="small">{a.usedIn.length ? <span className="badge badge--ok">Used in {a.usedIn.map((k) => sectionByKey[k as SectionKey]?.label ?? k).join(', ')}</span> : <span className="badge">Unused</span>}</p>
                <div className="actions">
                  <button type="button" className="btn btn--sm" onClick={() => copy(a)}><Icon name="copy" /> Copy address</button>
                  <button type="button" className="btn btn--sm btn--danger-ghost" disabled={a.usedIn.length > 0} title={a.usedIn.length ? 'Remove it from the sections that use it first' : 'Delete'} onClick={() => del(a)}><Icon name="trash" /> Delete</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export const allSections = sections;

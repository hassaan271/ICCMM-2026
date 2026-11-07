// Recursive form editor driven by src/content/schema.ts.
import { createContext, useContext, useEffect, useId, useMemo, useState } from 'react';
import type { Field, ImageVariant } from '../content/schema';
import { api, displayUrl, fmtBytes, prepareImage, ApiError, MAX_UPLOAD, type Asset } from './api';
import { Icon, useConfirm, useToast } from './ui';

export type Option = { value: string; label: string };
export type FieldCtx = { options: Record<'guests' | 'scheduleItems' | 'trackKeys', Option[]>; onAsset: (a: Asset) => void };
export const FieldContext = createContext<FieldCtx>({ options: { guests: [], scheduleItems: [], trackKeys: [] }, onAsset: () => {} });

type Props = { field: Field; value: any; onChange: (v: any) => void; label?: string; error?: string | null; errorPath?: string | null; path?: string };

const humanize = (k: string) => k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

export function FieldEditor({ field, value, onChange, label, errorPath, path = '' }: Props) {
  const id = useId();
  const name = field.label ?? label ?? '';
  const hasError = !!errorPath && (errorPath === path || errorPath.startsWith(path + '.') || errorPath.startsWith(path + '['));
  const ownError = !!errorPath && errorPath === path;
  const wrap = (control: React.ReactNode, inline = false) => (
    <div className={`fld${field.half ? ' fld--half' : ''}${ownError ? ' fld--error' : ''}${inline ? ' fld--inline' : ''}`}>
      {name && <label htmlFor={id} className="fld-label">{name}{('required' in field && field.required) ? <span className="req" aria-label="required"> *</span> : null}</label>}
      {control}
      {field.help && <p className="fld-help">{field.help}</p>}
    </div>
  );

  switch (field.t) {
    case 'text':
      return wrap(<input id={id} type="text" value={value ?? ''} maxLength={field.max ?? 600} onChange={(e) => onChange(e.target.value)} aria-invalid={ownError} />);
    case 'url':
      return wrap(<div className="url-row"><input id={id} type="url" value={value ?? ''} placeholder="https://…" onChange={(e) => onChange(e.target.value)} aria-invalid={ownError} />
        {value && /^https?:\/\//.test(value) && <a className="btn btn--icon" href={value} target="_blank" rel="noopener noreferrer" title="Open link"><Icon name="ext" /></a>}</div>);
    case 'textarea':
      return wrap(<textarea id={id} rows={field.rows ?? 4} value={value ?? ''} maxLength={field.max ?? 12000} onChange={(e) => onChange(e.target.value)} aria-invalid={ownError} />);
    case 'number':
      return wrap(<input id={id} type="number" value={value ?? ''} step={field.int ? 1 : 'any'} min={field.min} max={field.max}
        onChange={(e) => onChange(e.target.value === '' ? (field.nullable ? null : '') : Number(e.target.value))} aria-invalid={ownError} />);
    case 'bool':
      return (
        <div className={`fld fld--check${field.half ? ' fld--half' : ''}`}>
          <label className="check"><input id={id} type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} /> <span>{name}</span></label>
          {field.help && <p className="fld-help">{field.help}</p>}
        </div>
      );
    case 'date':
      return wrap(<input id={id} type="date" value={value ?? ''} onChange={(e) => onChange(e.target.value)} aria-invalid={ownError} />);
    case 'time':
      return wrap(<input id={id} type="time" value={value ?? ''} onChange={(e) => onChange(e.target.value)} aria-invalid={ownError} />);
    case 'select':
      return wrap(<SelectInput id={id} field={field} value={value} onChange={onChange} />);
    case 'image':
      return wrap(<ImageInput variant={field.variant} value={value} onChange={(v) => onChange(typeof v === 'string' ? v : v.url)} />);
    case 'photo':
      return wrap(<PhotoInput value={value} onChange={onChange} />);
    case 'file':
      return wrap(<FileInput value={value} onChange={(v) => onChange(v.url)} />);
    case 'object':
      return <ObjectEditor field={field} value={value} onChange={onChange} label={name} errorPath={errorPath} path={path} />;
    case 'list':
      return <ListEditor field={field} value={value} onChange={onChange} label={name} errorPath={errorPath} path={path} hasError={hasError} />;
  }
}

function SelectInput({ id, field, value, onChange }: { id: string; field: Extract<Field, { t: 'select' }>; value: any; onChange: (v: any) => void }) {
  const ctx = useContext(FieldContext);
  const opts = Array.isArray(field.options) ? field.options : ctx.options[field.options];
  const known = !value || opts.some((o) => o.value === value);
  return (
    <select id={id} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
      {(!field.required || !value) && <option value="">{field.required ? 'Choose…' : '— none —'}</option>}
      {!known && <option value={value}>{value} (not found)</option>}
      {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function ObjectEditor({ field, value, onChange, label, errorPath, path }: { field: Extract<Field, { t: 'object' }>; value: any; onChange: (v: any) => void; label: string; errorPath?: string | null; path: string }) {
  const nullable = field.nullable;
  if (nullable && (value === null || value === undefined)) {
    return (
      <fieldset className="group group--empty">
        {label && <legend>{label}</legend>}
        <p className="muted">Not set.</p>
        <button type="button" className="btn btn--sm" onClick={() => onChange(blank(field))}><Icon name="plus" /> Add</button>
      </fieldset>
    );
  }
  const v = value ?? {};
  const set = (k: string, x: any) => {
    const next = { ...v };
    if (x === undefined) delete next[k]; else next[k] = x;
    onChange(next);
  };
  const body = (
    <div className="grid">
      {Object.entries(field.fields).map(([k, sub]) => {
        const p = path ? `${path}.${k}` : k;
        if (sub.t === 'image' && sub.sets) {
          return (
            <div key={k} className="fld">
              <label className="fld-label">{sub.label ?? humanize(k)}</label>
              <ImageInput variant={sub.variant} value={v[k]} onChange={(x) => {
                if (typeof x === 'string') return set(k, x);
                const next = { ...v, [k]: x.url };
                if (sub.sets!.w && x.w) next[sub.sets!.w] = x.w;
                if (sub.sets!.h && x.h) next[sub.sets!.h] = x.h;
                onChange(next);
              }} />
              {sub.help && <p className="fld-help">{sub.help}</p>}
            </div>
          );
        }
        return <FieldEditor key={k} field={sub} value={v[k]} label={humanize(k)} onChange={(x) => set(k, x === '' && sub.opt ? undefined : x)} errorPath={errorPath} path={p} />;
      })}
    </div>
  );
  if (!label) return body;
  return (
    <fieldset className="group">
      <legend>{label}</legend>
      {body}
      {nullable && <button type="button" className="btn btn--sm btn--ghost" onClick={() => onChange(null)}>Remove</button>}
    </fieldset>
  );
}

export function blank(f: Field): any {
  switch (f.t) {
    case 'object': return Object.fromEntries(Object.entries(f.fields).filter(([, x]) => !x.opt).map(([k, x]) => [k, x.nullable ? null : blank(x)]));
    case 'list': return [];
    case 'number': return 0;
    case 'bool': return false;
    case 'photo': return null;
    default: return '';
  }
}

function itemTitle(f: Extract<Field, { t: 'list' }>, item: any, i: number) {
  if (typeof item === 'string') return item;
  if (typeof f.titleKey === 'function') return f.titleKey(item, i);
  if (f.titleKey) return String(item?.[f.titleKey] ?? '');
  return '';
}

function ListEditor({ field, value, onChange, label, errorPath, path, hasError }: { field: Extract<Field, { t: 'list' }>; value: any; onChange: (v: any) => void; label: string; errorPath?: string | null; path: string; hasError: boolean }) {
  const list: any[] = Array.isArray(value) ? value : [];
  const confirm = useConfirm();
  const primitive = field.of.t !== 'object';
  const [open, setOpen] = useState<Record<number, boolean>>({});
  // Open the item that holds a validation error
  useEffect(() => {
    if (!errorPath || !errorPath.startsWith(path + '[')) return;
    const m = /^\[(\d+)\]/.exec(errorPath.slice(path.length));
    if (m) setOpen((o) => ({ ...o, [Number(m[1]) - 1]: true }));
  }, [errorPath, path]);
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setOpen((o) => ({ ...o, [i]: o[j], [j]: o[i] }));
  };
  const remove = async (i: number) => {
    const it = list[i];
    const filled = primitive ? !!it : JSON.stringify(it) !== JSON.stringify(blank(field.of));
    if (filled && !(await confirm({ title: `Remove this ${(field.itemLabel ?? 'item').toLowerCase()}?`, body: itemTitle(field, it, i) || undefined, confirm: 'Remove', danger: true }))) return;
    onChange(list.filter((_, k) => k !== i));
  };
  const add = () => {
    const item = field.newItem ? field.newItem() : blank(field.of);
    onChange([...list, item]);
    setOpen((o) => ({ ...o, [list.length]: true }));
  };
  const collapsedDefault = !!field.collapsed;
  return (
    <fieldset className={`group list${hasError ? ' group--error' : ''}`}>
      {label && <legend>{label} <span className="count">{list.length}</span></legend>}
      {field.help && <p className="fld-help">{field.help}</p>}
      {list.length === 0 && <p className="muted">None yet.</p>}
      <ol className={primitive ? 'plist' : 'olist'}>
        {list.map((it, i) => {
          const p = `${path}[${i + 1}]`;
          const ctrls = (
            <span className="row-ctrls">
              <button type="button" className="btn btn--icon" title="Move up" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><Icon name="up" /></button>
              <button type="button" className="btn btn--icon" title="Move down" aria-label="Move down" disabled={i === list.length - 1} onClick={() => move(i, 1)}><Icon name="down" /></button>
              <button type="button" className="btn btn--icon btn--danger-ghost" title="Remove" aria-label="Remove" onClick={() => remove(i)}><Icon name="trash" /></button>
            </span>
          );
          if (primitive) {
            return (
              <li key={i} className="prow">
                <span className="idx">{i + 1}</span>
                <div className="prow-field"><FieldEditor field={field.of} value={it} onChange={(x) => onChange(list.map((y, k) => (k === i ? x : y)))} errorPath={errorPath} path={p} /></div>
                {ctrls}
              </li>
            );
          }
          const isOpen = open[i] ?? !collapsedDefault;
          return (
            <li key={i} className={`orow${isOpen ? ' is-open' : ''}`}>
              <div className="orow-head">
                <button type="button" className="orow-toggle" aria-expanded={isOpen} onClick={() => setOpen((o) => ({ ...o, [i]: !isOpen }))}>
                  <span className="chev"><Icon name="chev" size={14} /></span>
                  <span className="idx">{i + 1}</span>
                  <span className="orow-title">{itemTitle(field, it, i) || <em className="muted">{field.itemLabel ?? 'Item'} {i + 1}</em>}</span>
                </button>
                {ctrls}
              </div>
              {isOpen && <div className="orow-body"><FieldEditor field={field.of} value={it} onChange={(x) => onChange(list.map((y, k) => (k === i ? x : y)))} errorPath={errorPath} path={p} /></div>}
            </li>
          );
        })}
      </ol>
      <button type="button" className="btn btn--sm" onClick={add}><Icon name="plus" /> Add {(field.itemLabel ?? 'item').toLowerCase()}</button>
    </fieldset>
  );
}

/* ───────── Uploads ───────── */

const ACCEPT_IMG = 'image/jpeg,image/png,image/webp,image/gif,image/avif';
const KIND_NOTE: Record<ImageVariant, string> = {
  portrait: 'Cropped to 4:5 (720×900) + 360 px copy',
  pair: 'Saved as 640 and 1200 px WebP',
  poster: 'Saved full size + 560 px WebP',
  single: 'Saved as WebP, up to 1200 px wide',
  square: 'Cropped to a 256 px square',
};

type Pending = { file: File; url: string; w: number; h: number };

function useUploader(kind: string) {
  const toast = useToast();
  const ctx = useContext(FieldContext);
  const [busy, setBusy] = useState(false);
  const run = async (file: Blob, name: string) => {
    setBusy(true);
    try {
      const { asset } = await api.upload(kind, file, name);
      ctx.onAsset(asset);
      toast({ kind: 'ok', text: 'Uploaded. Remember to save.' });
      return asset;
    } catch (e) {
      toast({ kind: 'error', text: e instanceof ApiError ? e.message : 'Upload failed.' });
      return null;
    } finally {
      setBusy(false);
    }
  };
  return { busy, run };
}

function pick(accept: string, onFile: (f: File) => void) {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = accept;
  inp.onchange = () => { if (inp.files?.[0]) onFile(inp.files[0]); };
  inp.click();
}

function usePending() {
  const toast = useToast();
  const [pending, setPending] = useState<Pending | null>(null);
  useEffect(() => () => { if (pending) URL.revokeObjectURL(pending.url); }, [pending]);
  const choose = (f: File) => {
    if (!/^image\/(jpeg|png|webp|gif|avif)$/.test(f.type)) { toast({ kind: 'error', text: 'Please choose a JPEG, PNG, WebP, GIF or AVIF image.' }); return; }
    if (f.size > 25 * 1024 * 1024) { toast({ kind: 'error', text: 'That image is larger than 25 MB.' }); return; }
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => setPending({ file: f, url, w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => { URL.revokeObjectURL(url); toast({ kind: 'error', text: 'That file could not be read as an image.' }); };
    img.src = url;
  };
  return { pending, setPending, choose };
}

function DropZone({ onFile, accept, children }: { onFile: (f: File) => void; accept: string; children: React.ReactNode }) {
  const [over, setOver] = useState(false);
  return (
    <div className={`drop${over ? ' is-over' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
      onClick={(e) => { if ((e.target as HTMLElement).closest('button,a')) return; pick(accept, onFile); }} role="presentation">
      {children}
    </div>
  );
}

function PendingPreview({ p, note, busy, onUpload, onCancel }: { p: Pending; note: string; busy: boolean; onUpload: () => void; onCancel: () => void }) {
  return (
    <div className="pending">
      <img src={p.url} alt="Preview of the chosen file" />
      <div>
        <p><strong>{p.file.name}</strong></p>
        <p className="muted">{p.w}×{p.h} px · {fmtBytes(p.file.size)}{p.file.size > MAX_UPLOAD ? ' · will be reduced before upload' : ''}</p>
        <p className="muted">{note}</p>
        <div className="actions">
          <button type="button" className="btn btn--primary btn--sm" disabled={busy} onClick={onUpload}>{busy ? 'Uploading…' : 'Upload and use'}</button>
          <button type="button" className="btn btn--sm" disabled={busy} onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export function ImageInput({ variant, value, onChange }: { variant: ImageVariant; value: string; onChange: (v: string | Asset) => void }) {
  const { busy, run } = useUploader(variant);
  const { pending, setPending, choose } = usePending();
  const confirm = useConfirm();
  const upload = async () => {
    if (!pending) return;
    const blob = await prepareImage(pending.file);
    const a = await run(blob, pending.file.name);
    if (a) { onChange(a); setPending(null); }
  };
  if (pending) return <PendingPreview p={pending} note={KIND_NOTE[variant]} busy={busy} onUpload={upload} onCancel={() => setPending(null)} />;
  return (
    <DropZone onFile={choose} accept={ACCEPT_IMG}>
      {value ? <img className={`thumb thumb--${variant}`} src={displayUrl(value, variant)} alt="" /> : <span className="thumb thumb--empty">No image</span>}
      <div className="drop-text">
        <p>{value ? <code className="path">{value}</code> : 'Drop an image here or click to choose.'}</p>
        <p className="muted">{KIND_NOTE[variant]}. Max 4 MB after automatic reduction.</p>
        <div className="actions">
          <button type="button" className="btn btn--sm" onClick={() => pick(ACCEPT_IMG, choose)}><Icon name="upload" /> {value ? 'Replace' : 'Choose image'}</button>
          {value && <button type="button" className="btn btn--sm btn--ghost" onClick={async () => { if (await confirm({ title: 'Remove this image?', body: 'The file stays in the media library until you delete it there.', confirm: 'Remove', danger: true })) onChange(''); }}>Remove</button>}
        </div>
      </div>
    </DropZone>
  );
}

export function PhotoInput({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const { busy, run } = useUploader('portrait');
  const { pending, setPending, choose } = usePending();
  const confirm = useConfirm();
  const upload = async () => {
    if (!pending) return;
    const a = await run(await prepareImage(pending.file), pending.file.name);
    if (!a) return;
    onChange({
      src: a.url, ...(a.extra?.src360 ? { src360: a.extra.src360 } : {}), w: a.w, h: a.h, focus: '50% 30%',
      ...(a.extra?.lowRes ? { lowRes: true } : {}),
      source: `Uploaded in the CMS (${a.originalName})`, license: value?.license ?? 'Provided by the organisers for the conference website',
    });
    setPending(null);
  };
  if (pending) return <PendingPreview p={pending} note={KIND_NOTE.portrait} busy={busy} onUpload={upload} onCancel={() => setPending(null)} />;
  const src = value?.src;
  return (
    <div className="photo">
      <DropZone onFile={choose} accept={ACCEPT_IMG}>
        {src ? <img className="thumb thumb--portrait" src={displayUrl(src)} alt="" style={{ objectPosition: value.focus ?? '50% 30%' }} /> : <span className="thumb thumb--portrait thumb--empty">Portrait to follow</span>}
        <div className="drop-text">
          {src ? <p><code className="path">{src}</code><br /><span className="muted">{value.w}×{value.h}{value.lowRes ? ' · low resolution' : ''}</span></p> : <p>Drop a photo here or click to choose.</p>}
          <p className="muted">{KIND_NOTE.portrait}.</p>
          <div className="actions">
            <button type="button" className="btn btn--sm" onClick={() => pick(ACCEPT_IMG, choose)}><Icon name="upload" /> {src ? 'Replace photo' : 'Choose photo'}</button>
            {src && <button type="button" className="btn btn--sm btn--ghost" onClick={async () => { if (await confirm({ title: 'Remove this photo?', body: 'The guest will show the "Portrait to follow" plate.', confirm: 'Remove', danger: true })) onChange(null); }}>Remove</button>}
          </div>
        </div>
      </DropZone>
      {src && (
        <div className="grid">
          <div className="fld fld--half">
            <label className="fld-label">Crop focus</label>
            <select value={value.focus ?? '50% 30%'} onChange={(e) => onChange({ ...value, focus: e.target.value })}>
              {['50% 0%', '50% 15%', '50% 30%', '50% 50%', '50% 70%'].map((f) => <option key={f} value={f}>{({ '50% 0%': 'Top', '50% 15%': 'Upper', '50% 30%': 'Upper-middle (default)', '50% 50%': 'Centre', '50% 70%': 'Lower' } as Record<string, string>)[f]}</option>)}
            </select>
          </div>
          <div className="fld fld--half">
            <label className="fld-label">Photo source / licence note</label>
            <input type="text" value={value.license ?? ''} onChange={(e) => onChange({ ...value, license: e.target.value })} />
          </div>
        </div>
      )}
    </div>
  );
}

export function FileInput({ value, onChange }: { value: string; onChange: (a: Asset | { url: string }) => void }) {
  const { busy, run } = useUploader('pdf');
  const toast = useToast();
  const confirm = useConfirm();
  const choose = async (f: File) => {
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) return toast({ kind: 'error', text: 'Please choose a PDF file.' });
    if (f.size > MAX_UPLOAD) return toast({ kind: 'error', text: `That PDF is ${fmtBytes(f.size)}; the limit is 4 MB. Compress it first.` });
    if (!(await confirm({ title: 'Upload this PDF?', body: <p><strong>{f.name}</strong> · {fmtBytes(f.size)}</p>, confirm: 'Upload' }))) return;
    const a = await run(f, f.name);
    if (a) onChange(a);
  };
  return (
    <DropZone onFile={choose} accept="application/pdf">
      <span className="thumb thumb--empty">PDF</span>
      <div className="drop-text">
        <p>{value ? <a href={displayUrl(value)} target="_blank" rel="noopener">{value}</a> : 'Drop a PDF here or click to choose (max 4 MB).'}</p>
        <div className="actions">
          <button type="button" className="btn btn--sm" disabled={busy} onClick={() => pick('application/pdf', choose)}><Icon name="upload" /> {busy ? 'Uploading…' : value ? 'Replace' : 'Choose PDF'}</button>
          {value && <button type="button" className="btn btn--sm btn--ghost" onClick={() => onChange({ url: '' })}>Remove</button>}
        </div>
      </div>
    </DropZone>
  );
}

export const useOptions = (content: any): FieldCtx['options'] => useMemo(() => ({
  guests: (content?.guests ?? []).map((g: any) => ({ value: g.id, label: g.placeholder ? `${g.id} (placeholder)` : `${[g.honorific, g.name].filter(Boolean).join(' ')} · ${g.id}` })),
  scheduleItems: (content?.schedule ?? []).flatMap((d: any) => (d.items ?? []).map((it: any) => ({ value: it.id, label: `${d.label} ${it.start} · ${it.title} (${it.id})` }))),
  trackKeys: (content?.tracks ?? []).map((t: any) => ({ value: t.key, label: t.title })),
}), [content?.guests, content?.schedule, content?.tracks]);

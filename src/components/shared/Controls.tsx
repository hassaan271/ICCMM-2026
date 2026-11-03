import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

/* ───────── Accordion ───────── */
export function Accordion({ title, no, children, defaultOpen = false, level = 3 }: { title: string; no?: string; children: ReactNode; defaultOpen?: boolean; level?: 3 | 4 }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const H = level === 3 ? 'h3' : 'h4';
  return (
    <div className={`acc${open ? ' is-open' : ''}`}>
      <H className="acc-h">
        <button type="button" className="acc-btn" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
          <span className="acc-no">{no}</span>
          <span className="acc-title">{title}</span>
          <span className="acc-ico" aria-hidden="true" />
        </button>
      </H>
      <div className="acc-panel" id={id} role="region">
        <div><div className="acc-body">{children}</div></div>
      </div>
    </div>
  );
}

/* ───────── Segmented control (tabs or radios) with a sliding thumb ───────── */
export function Segmented<T extends string>({ options, value, onChange, label, mode = 'radio', size = '' }: { options: { value: T; label: ReactNode }[]; value: T; onChange: (v: T) => void; label: string; mode?: 'radio' | 'tab'; size?: 'sm' | '' }) {
  const ref = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLSpanElement>(null);
  const place = () => {
    const btn = ref.current?.querySelector<HTMLButtonElement>(`[data-value="${value}"]`);
    if (!btn || !thumb.current) return;
    Object.assign(thumb.current.style, { width: `${btn.offsetWidth}px`, height: `${btn.offsetHeight}px`, transform: `translate(${btn.offsetLeft}px, ${btn.offsetTop}px)` });
  };
  useLayoutEffect(place);
  useEffect(() => {
    const ro = new ResizeObserver(place);
    if (ref.current) ro.observe(ref.current);
    return () => ro.disconnect();
  });
  const onKey = (e: KeyboardEvent, i: number) => {
    const n = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? i - 1 : null;
    if (n === null) return;
    e.preventDefault();
    const next = options[(n + options.length) % options.length];
    onChange(next.value);
    requestAnimationFrame(() => ref.current?.querySelector<HTMLButtonElement>(`[data-value="${next.value}"]`)?.focus());
  };
  const attr = mode === 'tab' ? 'aria-selected' : 'aria-checked';
  return (
    <div ref={ref} className={`seg${size ? ' seg--' + size : ''}`} role={mode === 'tab' ? 'tablist' : 'radiogroup'} aria-label={label}>
      <span className="seg-thumb" ref={thumb} aria-hidden="true" />
      {options.map((o, i) => (
        <button key={o.value} type="button" role={mode} data-value={o.value} {...{ [attr]: o.value === value }} tabIndex={o.value === value ? 0 : -1} onClick={() => onChange(o.value)} onKeyDown={(e) => onKey(e, i)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ───────── Numbered rule list ───────── */
export const Rules = ({ items }: { items: string[] }) => (
  <ol className="rules">
    {items.map((x, i) => <li key={i}><span className="rules-no">{String(i + 1).padStart(2, '0')}</span><p>{x}</p></li>)}
  </ol>
);

/* ───────── Copy to clipboard ───────── */
export function CopyButton({ text, label = 'Copy', aria }: { text: string; label?: string; aria?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); } catch {
      const ta = Object.assign(document.createElement('textarea'), { value: text });
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch { /* no clipboard available */ }
      ta.remove();
    }
    const b = ref.current!;
    const l = b.querySelector('span')!;
    b.classList.add('is-done'); l.textContent = 'Copied';
    setTimeout(() => { b.classList.remove('is-done'); l.textContent = label; }, 1800);
  };
  return (
    <button ref={ref} className="copy-btn" type="button" onClick={copy} aria-label={aria ?? `Copy ${text}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
      <span>{label}</span>
    </button>
  );
}

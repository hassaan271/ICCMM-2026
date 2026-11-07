import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

/* ───────── Toasts ───────── */
type Toast = { id: number; kind: 'ok' | 'error' | 'info'; text: string; action?: { label: string; run: () => void } };
const ToastCtx = createContext<(t: Omit<Toast, 'id'>) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random();
    setList((l) => [...l.slice(-3), { ...t, id }]);
    setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), t.kind === 'error' ? 9000 : t.action ? 8000 : 4000);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {list.map((t) => (
          <div key={t.id} className={`toast toast--${t.kind}`}>
            <span>{t.text}</span>
            {t.action && <button type="button" onClick={() => { t.action!.run(); setList((l) => l.filter((x) => x.id !== t.id)); }}>{t.action.label}</button>}
            <button type="button" className="toast-x" aria-label="Dismiss" onClick={() => setList((l) => l.filter((x) => x.id !== t.id))}>×</button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ───────── Confirm dialog ───────── */
type ConfirmOpts = { title: string; body?: ReactNode; confirm?: string; danger?: boolean };
const ConfirmCtx = createContext<(o: ConfirmOpts) => Promise<boolean>>(async () => false);
export const useConfirm = () => useContext(ConfirmCtx);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<(ConfirmOpts & { resolve: (v: boolean) => void }) | null>(null);
  const ask = useCallback((o: ConfirmOpts) => new Promise<boolean>((resolve) => setState({ ...o, resolve })), []);
  const ok = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!state) return;
    ok.current?.focus();
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') { state.resolve(false); setState(null); } };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [state]);
  const close = (v: boolean) => { state?.resolve(v); setState(null); };
  return (
    <ConfirmCtx.Provider value={ask}>
      {children}
      {state && (
        <div className="modal-back" onClick={(e) => { if (e.target === e.currentTarget) close(false); }}>
          <div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="modal-title">
            <h2 id="modal-title">{state.title}</h2>
            {state.body && <div className="modal-body">{state.body}</div>}
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => close(false)}>Cancel</button>
              <button type="button" ref={ok} className={`btn ${state.danger ? 'btn--danger' : 'btn--primary'}`} onClick={() => close(true)}>{state.confirm ?? 'OK'}</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmCtx.Provider>
  );
}

/* ───────── Small icons (inline SVG) ───────── */
const paths: Record<string, string> = {
  up: 'M12 5l-7 7h4v7h6v-7h4z', down: 'M12 19l7-7h-4V5H9v7H5z', trash: 'M6 7h12l-1 13H7zM9 4h6l1 2H8z', edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
  plus: 'M11 5h2v14h-2zM5 11h14v2H5z', copy: 'M8 8h11v12H8zM5 4h11v2H7v10H5z', ext: 'M14 4h6v6h-2V7.4l-7.3 7.3-1.4-1.4L16.6 6H14zM5 6h6v2H7v9h9v-4h2v6H5z',
  chev: 'M9 6l6 6-6 6', search: 'M10 4a6 6 0 104.5 10l4.8 4.8 1.4-1.4-4.8-4.8A6 6 0 0010 4zm0 2a4 4 0 110 8 4 4 0 010-8z', menu: 'M4 6h16v2H4zM4 11h16v2H4zM4 16h16v2H4z',
  upload: 'M12 4l5 5h-3v6h-4V9H7zM5 18h14v2H5z',
};
export const Icon = ({ name, size = 16 }: { name: keyof typeof paths | string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d={paths[name] ?? ''} /></svg>
);

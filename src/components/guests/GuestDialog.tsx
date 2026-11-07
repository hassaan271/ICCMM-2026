import { useEffect, useRef } from 'react';
import { guestById, displayName, guestCategories } from '../../data/guests';
import { href } from '../../utils/routes';
import { lockScroll } from '../../animations/motion';
import { GlassPanel } from '../glass/GlassPanel';
import { Portrait } from './Portrait';
import { rolesOf } from './guest-roles';

/* Full profile in a modal dialog (native <dialog>: focus is trapped and Escape closes it).
   Opened from any guest card; the URL hash (#guest-<id>) makes each profile linkable. */
export function GuestDialog({ id, onClose }: { id: string | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const g = id ? guestById(id) : null;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (g && !d.open) { d.showModal(); lockScroll(true); }
    if (!g && d.open) d.close();
  }, [g]);

  useEffect(() => {
    const d = ref.current!;
    const onCloseEv = () => { lockScroll(false); onClose(); };
    d.addEventListener('close', onCloseEv);
    return () => d.removeEventListener('close', onCloseEv);
  }, [onClose]);

  const cat = g ? guestCategories.find((c) => c.id === g.category) : null;
  const roles = g ? rolesOf(g) : [];

  return (
    <dialog ref={ref} className="gdlg" aria-labelledby="gdlg-name" onClick={(e) => { if (e.target === e.currentTarget) ref.current?.close(); }}>
      {g && (
        <GlassPanel kind="frost" className="gdlg-panel">
          <button type="button" className="gdlg-close" onClick={() => ref.current?.close()} aria-label="Close profile">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
          <figure className="gdlg-photo"><Portrait id={g.id} sizes="(max-width: 760px) 70vw, 340px" eager /></figure>
          <div className="gdlg-body">
            {cat && <p className="label gdlg-cat">{cat.title} {cat.accent.replace(/\.$/, '')}</p>}
            <h2 className="gdlg-name" id="gdlg-name">{displayName(g)}</h2>
            <p className={`gdlg-role${g.designation ? '' : ' is-pending'}`}>{g.designation ?? 'Designation to be confirmed'}</p>
            <p className="gdlg-org">{g.organization}</p>
            {g.location && <p className="gdlg-loc"><svg className="loc-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></svg>{g.location}</p>}
            {g.bio ? <p className="gdlg-bio">{g.bio}</p> : <p className="gdlg-bio is-pending">Biography to be announced.</p>}
            {roles.length > 0 && (
              <div className="gdlg-roles">
                <p className="label">At ICCMM-26</p>
                <ul>
                  {roles.map((r) => (
                    <li key={r.item + r.label}>
                      <a href={href('programme', r.item)}><span className="gdlg-r-t">{r.label}</span><span className="gdlg-r-m">{r.itemTitle} · {r.when}</span></a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </GlassPanel>
      )}
    </dialog>
  );
}

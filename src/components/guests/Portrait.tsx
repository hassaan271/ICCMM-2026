import { guestById, displayName, initials } from '../../data/guests';
import { portraitOf } from '../../data/guests/image-sources';

/* Guest portrait at a fixed 4:5 crop. Without an approved photograph it shows a neutral monogram plate
   (never a stand-in face). `sizes` should match the rendered width so the 360w file is used where possible. */
export function Portrait({ id, sizes = '(max-width: 760px) 80vw, 360px', eager = false, className = '' }: { id: string; sizes?: string; eager?: boolean; className?: string }) {
  const g = guestById(id);
  const p = portraitOf(id);
  if (!g) return null;
  if (!p) {
    return (
      <span className={`portrait portrait--empty ${className}`} role="img" aria-label={g.placeholder ? 'Guest to be announced' : `Portrait of ${displayName(g)} to follow`}>
        <svg className="portrait-circuit" viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path d="M100 0v62M100 188v62M0 125h46M154 125h46M30 0v40h40v30M170 250v-40h-40v-30M0 200h30l20-20M200 50h-30l-20 20" />
          <rect x="62" y="87" width="76" height="76" rx="10" />
          <rect x="80" y="105" width="40" height="40" rx="4" />
        </svg>
        <span className="portrait-mono" aria-hidden="true">{initials(g)}</span>
        <span className="portrait-note" aria-hidden="true">Portrait to follow</span>
      </span>
    );
  }
  return (
    <span className={`portrait${p.lowRes ? ' portrait--lowres' : ''} ${className}`}>
      <img src={p.src} srcSet={p.srcSet} sizes={p.srcSet ? sizes : undefined} width={p.w} height={p.h} alt={`Portrait of ${displayName(g)}`}
        loading={eager ? 'eager' : 'lazy'} decoding="async" style={{ objectPosition: p.focus }} />
    </span>
  );
}

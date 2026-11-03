export const ArrowIcon = ({ external = false }: { external?: boolean }) => (
  <svg className="ico-arrow" viewBox="0 0 24 24" aria-hidden="true">
    <path d={external ? 'M7 17 17 7M9 7h8v8' : 'M5 12h14M13 6l6 6-6 6'} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Chevron = () => (
  <svg className="ico-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

// Stroke-drawn icons for the four research tracks (lines draw on reveal via .draw)
export function TrackIcon({ kind }: { kind: string }) {
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const d = { className: 'draw', pathLength: 1 };
  return (
    <svg className="track-ico" viewBox="0 0 120 120" aria-hidden="true">
      {kind === 'network' && (
        <g {...s}><circle cx="60" cy="60" r="9" /><circle cx="22" cy="28" r="6" /><circle cx="98" cy="26" r="6" /><circle cx="18" cy="88" r="6" /><circle cx="100" cy="92" r="6" /><circle cx="60" cy="14" r="4" /><circle cx="60" cy="106" r="4" />
          <path {...d} d="M52 55 27 32M68 55l25-25M52 65 23 85M68 65l27 23M60 51V18M60 69v33M28 28h64M24 88h70" /></g>
      )}
      {kind === 'chip' && (
        <g {...s}><rect x="32" y="32" width="56" height="56" rx="5" /><rect x="46" y="46" width="28" height="28" rx="2" />
          <path {...d} d="M44 32V16M56 32V16M68 32V16M80 32V20M44 88v16M56 88v16M68 88v16M76 88v16M32 44H16M32 56H16M32 68H16M32 80H20M88 44h16M88 56h16M88 68h16M88 76h16" /></g>
      )}
      {kind === 'robot' && (
        <g {...s}><path d="M22 104h44" /><rect x="32" y="92" width="24" height="12" rx="2" /><circle cx="44" cy="84" r="7" /><circle cx="72" cy="50" r="6" /><path d="m96 30 8 4M96 30l4-8" />
          <path {...d} d="M44 84 70 52M76 46 96 30M44 84 44 92" /></g>
      )}
      {kind === 'converge' && (
        <g {...s}><circle cx="60" cy="60" r="14" /><circle cx="60" cy="60" r="4" fill="currentColor" /><path d="M14 24h10M14 24v10M106 24H96M106 24v10M14 96h10M14 96V86M106 96H96M106 96V86" />
          <path {...d} d="M14 24 48 50M106 24 72 50M14 96l34-26M106 96 72 70" /></g>
      )}
    </svg>
  );
}

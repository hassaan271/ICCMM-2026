import { useEffect, useMemo, useState } from 'react';
import { committee, committeeGuestIds, organizingCommittee, portraits } from '../data/conference';
import { portraitOf } from '../data/guests/image-sources';
import { Eyebrow, Heading } from '../components/shared/Typography';
import { PageHeader } from '../components/shared/PageHeader';
import { GlassPanel } from '../components/glass/GlassPanel';

const initials = (n: string) => n.replace(/^(Dr|Mr|Ms|Mrs|Prof|Janab)\.?\s+/i, '').split(/[\s.]+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
// Supplied committee portrait first, then the member's guest portrait; otherwise the monogram placeholder
const photo = (n: string): { src: string; srcSet?: string; focus?: string } | null => {
  const own = (portraits as Record<string, string>)[n];
  if (own) return { src: own };
  const p = committeeGuestIds[n] ? portraitOf(committeeGuestIds[n]) : null;
  return p ? { src: p.src, srcSet: p.srcSet, focus: p.focus } : null;
};

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q);
  if (i < 0) return <>{text}</>;
  return <>{text.slice(0, i)}<mark>{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>;
}

export function Committee() {
  const [q, setQ] = useState('');
  const [activeRole, setActiveRole] = useState('');
  const query = q.trim().toLowerCase();
  const matches = useMemo(() => organizingCommittee.filter((n) => n.toLowerCase().includes(query)), [query]);

  // Highlight the role currently in view
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setActiveRole(e.target.id); }), { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('.role').forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <PageHeader eyebrow="Committee" title="Conference" accent="committee." crumbs={[{ text: 'Committee' }]}
        intro="Patrons, chairs and committees of ICCMM-26, drawn from MJCET, the IEEE Hyderabad Section and institutions in India and abroad."
        subnav={[{ id: 'conference-committee', text: 'Conference committee' }, { id: 'organizing-committee', text: 'Organizing committee' }]} />

      <section className="section" id="conference-committee" aria-labelledby="cc-title">
        <div className="wrap committee-grid">
          <GlassPanel kind="light" as="aside" className="role-index" aria-label="Committee roles">
            <p className="label">Roles</p>
            <ul>{committee.map((g) => <li key={g.role}><a href={`#role-${slug(g.role)}`} className={activeRole === `role-${slug(g.role)}` ? 'is-active' : ''}>{g.role}</a></li>)}</ul>
          </GlassPanel>
          <div>
            <Eyebrow>Conference committee</Eyebrow>
            <Heading text="The people" accent="behind it." id="cc-title" />
            <div className="roles">
              {committee.map((g) => (
                <div className="role" id={`role-${slug(g.role)}`} key={g.role} data-reveal="">
                  <h3 className="role-name">{g.role}</h3>
                  <ul className="people">
                    {g.people.map(([n, a]) => {
                      const p = photo(n);
                      return (
                      <li className="person" key={n}>
                        {p
                          ? <span className="person-avatar person-avatar--photo"><img src={p.src} srcSet={p.srcSet} sizes={p.srcSet ? '64px' : undefined} alt={`Portrait of ${n}`} width={96} height={96} loading="lazy" decoding="async" style={p.focus ? { objectPosition: p.focus } : undefined} /></span>
                          : <span className="person-avatar" aria-hidden="true">{initials(n)}</span>}
                        <span className="person-text"><span className="person-name">{n}</span><span className="person-aff">{a}</span></span>
                      </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section section--tint" id="organizing-committee" aria-labelledby="org-title">
        <div className="wrap">
          <div className="section-head">
            <div><Eyebrow>Organizing committee</Eyebrow><Heading text="Organizing" accent="committee." id="org-title" /></div>
            <GlassPanel kind="light" as="label" className="search" data-reveal="">
              <span className="visually-hidden">Filter organizing committee by name</span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              <input type="search" placeholder="Search members" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
            </GlassPanel>
          </div>
          <ul className="org-grid">{matches.map((n) => <li key={n}><Highlight text={n} q={query} /></li>)}</ul>
          {!matches.length && <p className="org-empty muted">No member matches that search.</p>}
        </div>
      </section>
    </>
  );
}

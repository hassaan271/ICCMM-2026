import { sponsorTiers, supporters, meta, pageText, fillText } from '../data/conference';
import { Eyebrow, Heading } from '../components/shared/Typography';
import { GlassPanel } from '../components/glass/GlassPanel';
import { LiquidButton } from '../components/buttons/LiquidButton';
import { PageHeader } from '../components/shared/PageHeader';

const allBenefits = [...new Set(sponsorTiers.flatMap((t) => t.benefits))];

export function Sponsors() {
  return (
    <>
      <PageHeader eyebrow={pageText.sponsors.eyebrow} title={pageText.sponsors.title} accent={pageText.sponsors.accent} crumbs={[{ text: 'Registration', url: 'registration.html' }, { text: 'Sponsors & Exhibitors' }]}
        intro={fillText(pageText.sponsors.intro)}
        subnav={[{ id: 'tiers', text: 'Categories' }, { id: 'compare', text: 'Compare' }, { id: 'supporters', text: 'Supporting organisations' }]} />

      <section className="section" id="tiers" aria-labelledby="tiers-title">
        <div className="wrap">
          <div className="section-head">
            <div><Eyebrow>Sponsorship categories</Eyebrow><Heading text="Six" accent="sponsorship tiers." id="tiers-title" /></div>
            <div data-reveal=""><LiquidButton href={`mailto:${meta.email}?subject=${encodeURIComponent('ICCMM-26 Sponsorship enquiry')}`}>Sponsorship enquiry</LiquidButton></div>
          </div>
          <ul className="tiers">
            {sponsorTiers.map((t, i) => (
              <li className="tier" style={{ ['--tier' as string]: i }} key={t.tier} data-reveal="" data-tilt="">
                <div className="tier-metal" aria-hidden="true"><span className="tier-sheen" /></div>
                <div className="tier-body">
                  <h3 className="tier-name">{t.tier}</h3>
                  <p className="tier-amount">{t.amount}</p>
                  <ul className="tier-benefits">{t.benefits.map((b) => <li key={b}>{b}</li>)}</ul>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--tint" id="compare" aria-labelledby="compare-title">
        <div className="wrap">
          <Eyebrow>Compare</Eyebrow>
          <Heading text="Benefits" accent="by tier." id="compare-title" />
          <div className="table-wrap" data-reveal="">
            <table className="fee-table matrix">
              <caption className="visually-hidden">Sponsorship benefits by tier</caption>
              <thead><tr><th scope="col">Benefit</th>{sponsorTiers.map((t) => <th scope="col" key={t.tier}>{t.tier}<span className="matrix-amt">{t.amount}</span></th>)}</tr></thead>
              <tbody>
                {allBenefits.map((b) => (
                  <tr key={b}><th scope="row">{b}</th>{sponsorTiers.map((t) => <td key={t.tier}>{t.benefits.includes(b) ? <span className="tick" aria-label="Included">●</span> : <span className="dash" aria-label="Not included">—</span>}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section" id="supporters" aria-labelledby="sup-title">
        <div className="wrap">
          <Eyebrow>Supporting organisations</Eyebrow>
          <Heading text="Supporting" accent="organisations." id="sup-title" />
          <ul className="sup-grid">
            {supporters.map((s) => (
              <GlassPanel kind="frost" as="li" className="sup" key={s.name} data-reveal="">
                <span className="sup-role label">{s.role}</span>
                <span className={`sup-logo${'dark' in s && s.dark ? ' sup-logo--dark' : ''}`}><img src={s.logo} width={s.w} height={s.h} alt={`${s.name} logo`} loading="lazy" /></span>
                <span className="sup-name">{s.name}</span>
              </GlassPanel>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

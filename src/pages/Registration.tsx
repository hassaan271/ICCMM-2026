import { useEffect, useRef, useState } from 'react';
import { fees, links, meta } from '../data/conference';
import { Eyebrow, Heading } from '../components/shared/Typography';
import { GlassPanel } from '../components/glass/GlassPanel';
import { LiquidButton } from '../components/buttons/LiquidButton';
import { Segmented } from '../components/shared/Controls';
import { ArrowIcon } from '../components/shared/Icons';
import { PageHeader } from '../components/shared/PageHeader';
import { gsap } from '../animations/motion';

const inr = (n: number) => n.toLocaleString('en-IN');

function FeeFinder() {
  const [profile, setProfile] = useState('student');
  const [member, setMember] = useState(false);
  const [currency, setCurrency] = useState<'inr' | 'usd'>('inr');
  const feeRef = useRef<HTMLSpanElement>(null);
  const counter = useRef({ v: 0 });
  const row = fees.rows.find((r) => r.id === profile && r.member === member)!;
  const value = row[currency];

  // Animated count to the new fee (DOM write only, no re-render per frame)
  useEffect(() => {
    if (value == null || !feeRef.current) return;
    const fmt = (n: number) => Math.round(n).toLocaleString(currency === 'inr' ? 'en-IN' : 'en-US');
    if (counter.current.v === 0 || Math.abs(counter.current.v - value) > value) counter.current.v = value * 0.8;
    gsap.to(counter.current, { v: value, duration: 0.9, ease: 'expo.out', overwrite: true, onUpdate: () => { if (feeRef.current) feeRef.current.textContent = fmt(counter.current.v); } });
  }, [value, currency]);

  useEffect(() => {
    document.querySelectorAll<HTMLTableRowElement>('.fee-table [data-row]').forEach((tr) => tr.classList.toggle('is-hl', tr.dataset.row === row.id && tr.dataset.member === (row.member ? '1' : '0')));
  }, [row]);

  return (
    <GlassPanel kind="light" className="explorer" aria-label="Fee finder" data-reveal="">
      <div className="explorer-row">
        <p className="label">Category</p>
        <Segmented label="Category" value={profile} onChange={setProfile} options={fees.profiles.map((p) => ({ value: p.id, label: p.label }))} />
      </div>
      <div className="explorer-row explorer-row--split">
        <label className="switch">
          <input type="checkbox" checked={member} onChange={(e) => setMember(e.target.checked)} />
          <span className="switch-track" aria-hidden="true"><span className="switch-knob" /></span>
          <span>IEEE member</span>
        </label>
        <Segmented size="sm" label="Currency" value={currency} onChange={setCurrency} options={[{ value: 'inr', label: 'INR' }, { value: 'usd', label: 'USD' }]} />
      </div>
      <div className="explorer-out" aria-live="polite">
        <p className="explorer-cat">{row.label}</p>
        {value == null ? (
          <p className="explorer-fee is-na">Not listed — please contact the organisers</p>
        ) : (
          <p className="explorer-fee"><span className="explorer-cur">{currency === 'inr' ? '₹' : '$'}</span><span ref={feeRef}>{value.toLocaleString(currency === 'inr' ? 'en-IN' : 'en-US')}</span></p>
        )}
        <p className="explorer-note">{value == null ? fees.headers.usd : currency === 'inr' ? 'Regular (Indian), + 18% GST' : 'Regular (International), USD'}</p>
      </div>
      <p className="explorer-foot">{fees.gstNote}</p>
    </GlassPanel>
  );
}

export function Registration() {
  return (
    <>
      <PageHeader eyebrow="Registration" title="Registration" accent="categories & fees." crumbs={[{ text: 'Registration' }]}
        intro="Only registered delegates are permitted to attend and present at the conference. At least one author must register and present the paper."
        subnav={[{ id: 'fees', text: 'Fee finder' }, { id: 'tables', text: 'All categories' }, { id: 'register', text: 'How to register' }]} />

      <section className="section" id="fees" aria-labelledby="fees-title">
        <div className="wrap reg-grid">
          <div>
            <Eyebrow>Fee finder</Eyebrow>
            <Heading text="Find your" accent="registration fee." id="fees-title" />
            <p className="section-intro" data-reveal="">Choose your category, IEEE membership and currency. Fees are regular fees as published by the conference.</p>
          </div>
          <FeeFinder />
        </div>
      </section>

      <section className="section section--tint" id="tables" aria-labelledby="tables-title">
        <div className="wrap">
          <Eyebrow>All categories</Eyebrow>
          <Heading text="Registration" accent="categories." id="tables-title" />
          <div className="table-wrap" data-reveal="">
            <table className="fee-table">
              <caption className="visually-hidden">Regular registration fees</caption>
              <thead><tr><th scope="col">S.No</th><th scope="col">Category</th><th scope="col">{fees.headers.inr}</th><th scope="col">{fees.headers.usd}</th></tr></thead>
              <tbody>
                {[...fees.rows, { ...fees.accommodation, id: 'acc', member: false }].map((r, i) => (
                  <tr key={r.label} data-row={r.id} data-member={r.member ? 1 : 0}>
                    <td>{i + 1}</td><th scope="row">{r.label}</th><td>{inr(r.inr)}</td>
                    <td>{r.usd == null ? <span className="muted" title="Not listed in the source">Not listed</span> : r.usd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small muted">{fees.gstNote}</p>
          <div className="cols-2 mt">
            <div data-reveal="">
              <h3 className="h3">Technical event registration</h3>
              <div className="table-wrap">
                <table className="fee-table fee-table--other">
                  <caption className="visually-hidden">Other registration fees</caption>
                  <thead><tr><th scope="col">S.No</th><th scope="col">Category</th><th scope="col">Registration Fee (INR)</th></tr></thead>
                  <tbody>{fees.other.map((r, i) => <tr key={r.label}><td>{i + 1}.</td><th scope="row">{r.label}</th><td>{r.fee}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
            <GlassPanel kind="frost" className="extra" data-reveal="">
              <p className="label">Extra pages</p>
              <p>{fees.extraPages}</p>
              <p className="extra-figs"><span><b>₹1200</b> per page, Indian author</span><span><b>$25</b> per page, foreign author</span></p>
            </GlassPanel>
          </div>
        </div>
      </section>

      <section className="section" id="register" aria-labelledby="register-title">
        <div className="wrap cols-2 cols-2--center">
          <div>
            <Eyebrow>How to register</Eyebrow>
            <Heading text="Register" accent="for ICCMM-26." id="register-title" />
            <a className="link-row" href={links.cmt} target="_blank" rel="noopener noreferrer" data-reveal="">Paper submission: Microsoft CMT <ArrowIcon external /></a>
          </div>
          {/* INTEGRATION POINT: set links.registrationForm in src/data/conference.ts */}
          <GlassPanel kind="light" className="reg-cta-card" data-reveal="">
            <p className="label">Conference registration form</p>
            {links.registrationForm ? (
              <LiquidButton href={links.registrationForm} external>Open registration form</LiquidButton>
            ) : (
              <>
                <p className="reg-cta-t">The online registration form link will be published here.</p>
                <p className="muted">Until it is available, please contact the organisers to register.</p>
                <div className="actions"><LiquidButton href={`mailto:${meta.email}?subject=${encodeURIComponent('ICCMM-26 Registration')}`}>Email the organisers</LiquidButton></div>
              </>
            )}
          </GlassPanel>
        </div>
      </section>
    </>
  );
}

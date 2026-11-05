import { useEffect, useRef, useState, type FormEvent } from 'react';
import { fees, links, meta, eventFee } from '../data/conference';
import { Eyebrow, Heading } from '../components/shared/Typography';
import { GlassPanel } from '../components/glass/GlassPanel';
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
          {/* Additional page charges first, technical event fees second (placement swapped per organiser feedback) */}
          <div className="cols-2 mt">
            <div data-reveal="">
              <h3 className="h3">Additional research paper page charges</h3>
              <GlassPanel kind="frost" className="extra">
                <p>{fees.extraPages}</p>
                <p className="extra-figs"><span><b>₹1,200</b> per page, Indian author</span><span><b>$25</b> per page, foreign author</span></p>
              </GlassPanel>
            </div>
            <div data-reveal="">
              <h3 className="h3">Technical event registration</h3>
              <div className="table-wrap">
                <table className="fee-table fee-table--other">
                  <caption className="visually-hidden">Technical event registration fees</caption>
                  <thead><tr><th scope="col">Category</th><th scope="col">Registration Fee (INR)</th></tr></thead>
                  <tbody>{fees.other.map((r) => {
                    const f = eventFee(r);
                    return (
                      <tr key={r.label}>
                        <th scope="row">{r.label}</th>
                        <td><span className="ev-fee"><strong>{f.price}</strong> {f.unit}</span>{r.note && <span className="ev-fee-note">{r.note}</span>}</td>
                      </tr>
                    );
                  })}</tbody>
                </table>
              </div>
            </div>
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
          <RegisterForm />
        </div>
      </section>
    </>
  );
}

// Indian mobile number: 10 digits starting 6–9, optionally written with +91 / 0 and spaces or dashes
const normaliseMobile = (v: string) => v.replace(/[\s-]/g, '').replace(/^(\+91|0091|91(?=\d{10}$)|0(?=\d{10}$))/, '');
const validate = (name: string, mobile: string) => ({
  name: !name.trim() ? 'Please enter your full name.' : name.trim().length < 3 ? 'Please enter your full name as it should appear on the certificate.' : !/^[\p{L} .'-]+$/u.test(name.trim()) ? 'Names can contain letters, spaces, full stops, hyphens and apostrophes only.' : '',
  mobile: !mobile.trim() ? 'Please enter your mobile number.' : !/^[6-9]\d{9}$/.test(normaliseMobile(mobile)) ? 'Enter a valid 10-digit Indian mobile number, e.g. 98765 43210.' : '',
});

/* Registration details. Nothing is stored or sent by this site: once the Google Form is configured
   (links.registrationForm), a valid entry opens it in a new tab, pre-filled when the field ids are set. */
function RegisterForm() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [touched, setTouched] = useState({ name: false, mobile: false });
  const [status, setStatus] = useState<'' | 'opened' | 'pending'>('');
  const errors = validate(name, mobile);
  const formUrl = links.registrationForm;

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ name: true, mobile: true });
    if (errors.name || errors.mobile) {
      (e.currentTarget.querySelector(errors.name ? '#reg-name' : '#reg-mobile') as HTMLInputElement | null)?.focus();
      return;
    }
    if (!formUrl) { setStatus('pending'); return; }
    const url = new URL(formUrl);
    const ids = links.registrationFormFields;
    if (ids.name) url.searchParams.set(ids.name, name.trim());
    if (ids.mobile) url.searchParams.set(ids.mobile, normaliseMobile(mobile));
    if (ids.name || ids.mobile) url.searchParams.set('usp', 'pp_url');
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
    setStatus('opened');
  };

  const field = (id: 'name' | 'mobile') => ({
    'aria-invalid': touched[id] && !!errors[id],
    'aria-describedby': touched[id] && errors[id] ? `reg-${id}-err` : undefined,
    onBlur: () => setTouched((t) => ({ ...t, [id]: true })),
  });

  return (
    <GlassPanel kind="light" className="reg-form-card" data-reveal="">
      <form className="reg-form" onSubmit={submit} noValidate aria-labelledby="reg-form-title">
        <p className="label" id="reg-form-title">Conference registration</p>
        <div className={`field${touched.name && errors.name ? ' is-invalid' : ''}`}>
          <label htmlFor="reg-name">Full Name</label>
          <input id="reg-name" name="name" type="text" autoComplete="name" value={name} placeholder="Name as on your certificate"
            onChange={(e) => { setName(e.target.value); setStatus(''); }} {...field('name')} />
          {touched.name && errors.name && <p className="field-err" id="reg-name-err">{errors.name}</p>}
        </div>
        <div className={`field${touched.mobile && errors.mobile ? ' is-invalid' : ''}`}>
          <label htmlFor="reg-mobile">Mobile Number</label>
          <div className="field-tel">
            <span className="field-prefix" aria-hidden="true">+91</span>
            <input id="reg-mobile" name="mobile" type="tel" inputMode="tel" autoComplete="tel-national" value={mobile} placeholder="98765 43210" maxLength={16}
              onChange={(e) => { setMobile(e.target.value.replace(/[^\d+\s-]/g, '')); setStatus(''); }} {...field('mobile')} />
          </div>
          {touched.mobile && errors.mobile && <p className="field-err" id="reg-mobile-err">{errors.mobile}</p>}
        </div>
        <button type="submit" className="lbtn lbtn--primary reg-submit">
          <span className="lq" aria-hidden="true"><span className="lq-base" /><span className="lq-blob" /></span>
          <span className="lbtn-label">Register Now</span><ArrowIcon external={!!formUrl} />
        </button>
        <p className="reg-form-note" aria-live="polite">
          {status === 'opened' && 'The registration form has opened in a new tab. Complete and submit it there.'}
          {status === 'pending' && <>The online registration form link has not been published yet. Please <a href={`mailto:${meta.email}?subject=${encodeURIComponent('ICCMM-26 Registration')}`}>email the organisers</a> to register.</>}
          {!status && (formUrl ? 'Registration is completed on the official Google Form, which opens in a new tab.' : 'Your details are not stored by this website. Registration is completed on the official Google Form once its link is published.')}
        </p>
      </form>
    </GlassPanel>
  );
}

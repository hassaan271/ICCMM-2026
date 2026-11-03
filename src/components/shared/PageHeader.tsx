import { href } from '../../utils/routes';
import { Words } from './Typography';

export function PageHeader({ eyebrow, title, accent, intro, crumbs, subnav = [] }: { eyebrow: string; title: string; accent?: string; intro?: string; crumbs: { text: string; url?: string }[]; subnav?: { id: string; text: string }[] }) {
  return (
    <section className="page-head" aria-labelledby="page-title">
      <div className="page-head-bg" aria-hidden="true">
        <div className="page-head-glow" data-depth="0.7" />
      </div>
      <div className="wrap page-head-inner">
        <nav className="crumbs" aria-label="Breadcrumb">
          <ol>
            <li><a href={href('home')}>Home</a></li>
            {crumbs.map((c) => <li key={c.text}>{c.url ? <a href={c.url}>{c.text}</a> : <span aria-current="page">{c.text}</span>}</li>)}
          </ol>
        </nav>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="page-title" id="page-title" data-split="">
          <Words text={title} />
          {accent && <span className="title-accent"><Words text={accent} /></span>}
        </h1>
        {intro && <p className="page-intro" data-reveal="">{intro}</p>}
        {subnav.length > 0 && (
          <nav className="subnav" aria-label="On this page" data-reveal="">
            <ul>{subnav.map((s) => <li key={s.id}><a href={`#${s.id}`}>{s.text}</a></li>)}</ul>
          </nav>
        )}
      </div>
    </section>
  );
}

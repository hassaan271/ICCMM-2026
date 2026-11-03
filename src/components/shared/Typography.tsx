import { Fragment, type ReactNode } from 'react';

// Words wrapped for the mask reveal (.sw/.sw-i). The space sits outside the inline-block mask, otherwise it collapses.
export function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(/\s+/).filter(Boolean).map((w, i) => (
        <Fragment key={i}>
          <span className="sw"><span className="sw-i">{w}</span></span>{' '}
        </Fragment>
      ))}
    </>
  );
}

// Display heading: sans words plus an optional italic serif accent, revealed word by word
export function Heading({ text, accent, as: Tag = 'h2', id, className = 'title' }: { text: string; accent?: string; as?: 'h1' | 'h2' | 'h3'; id?: string; className?: string }) {
  return (
    <Tag className={className} id={id} data-split="">
      <Words text={text} />
      {accent && <span className="title-accent"><Words text={accent} /></span>}
    </Tag>
  );
}

export const Eyebrow = ({ children, light = false }: { children: ReactNode; light?: boolean }) => (
  <p className={`eyebrow${light ? ' eyebrow--light' : ''}`} data-reveal="">{children}</p>
);

export const pad = (n: number) => String(n).padStart(2, '0');

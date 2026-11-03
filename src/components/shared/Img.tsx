import type { CSSProperties } from 'react';

// Responsive image. A `src` without extension uses the -640/-1200 WebP pair; with an extension it is used as-is.
export function Img({ src, w, h, alt, eager = false, sizes = '100vw', className, style }: { src: string; w: number; h: number; alt: string; eager?: boolean; sizes?: string; className?: string; style?: CSSProperties }) {
  const pair = !/\.\w+$/.test(src);
  return pair
    ? <img src={`${src}-1200.webp`} srcSet={`${src}-640.webp 640w, ${src}-1200.webp 1200w`} sizes={sizes} width={w} height={h} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" className={className} style={style} />
    : <img src={src} width={w} height={h} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" className={className} style={style} />;
}

// Shared SVG filters. #goo merges the two pills of the nav hover indicator into one liquid shape.
export function SvgFilters() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <filter id="goo" x="-20%" y="-50%" width="140%" height="200%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b" />
          <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="g" />
          <feComposite in="SourceGraphic" in2="g" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}

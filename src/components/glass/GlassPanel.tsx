import type { CSSProperties, ElementType, ReactNode } from 'react';
import { LiquidGlass, type GlassTint } from './LiquidGlass';

/* Content panel made of the shared glass material.
   kind: 'clear' floating controls · 'frost' information panels and overlays ·
         'light' surfaces on white/light-grey sections · 'dark' surfaces on dark scenes.
   Panels sit over plain backgrounds, so they use the material without the lens by default;
   pass `refraction` where there is imagery or 3D behind the panel. */
export function GlassPanel({ kind = 'frost', as = 'div', className = '', children, style, refraction = 0, blur, ...rest }: {
  kind?: GlassTint; as?: ElementType; className?: string; children: ReactNode; style?: CSSProperties; refraction?: number; blur?: number;
} & Record<string, unknown>) {
  return (
    <LiquidGlass as={as} tint={kind} className={className} style={style} refraction={refraction} blur={blur} {...rest}>
      {children}
    </LiquidGlass>
  );
}

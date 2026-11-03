import { memo, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BoxGeometry, CylinderGeometry, ExtrudeGeometry, Group, InstancedMesh, Object3D, Shape, Path, SphereGeometry, Vector3,
  type Mesh, type MeshPhysicalMaterial,
} from 'three';
import { dieMaps, substrateMaps, ihsMaps, interconnectMap, timMaps } from './textures';
import { story, poseAt } from '../../animations/story';
import { pointer } from '../../animations/motion';

/* Dimensions in scene units (1 unit ≈ 10 mm for a 40 mm package) */
const SUB = 4; // substrate footprint
const SUB_T = 0.11;
const DIE_W = 2.2, DIE_D = 1.5, DIE_T = 0.05;

// Assembled heights (bottom of each part) and exploded offsets
const LAYERS = {
  pads: { y: -0.012, dy: -1.1 },
  substrate: { y: 0, dy: 0 },
  caps: { y: SUB_T, dy: 0.05 },
  bumps: { y: SUB_T, dy: 0.42 },
  rdl1: { y: SUB_T + 0.03, dy: 0.72 },
  rdl2: { y: SUB_T + 0.04, dy: 0.98 },
  die: { y: SUB_T + 0.05, dy: 1.28 },
  tim: { y: SUB_T + 0.1, dy: 1.7 },
  ihs: { y: SUB_T + 0.005, dy: 2.45 },
};

function roundedRect(w: number, d: number, r: number, holes: Path[] = []) {
  const s = new Shape();
  const x = -w / 2, y = -d / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  s.holes.push(...holes);
  return s;
}

// Heat-spreader flange: square with chamfered corners and four retention notches (LGA-style)
function ihsFlangeShape(w: number) {
  const h = w / 2, c = 0.22, n = 0.42, nd = 0.2;
  const s = new Shape();
  s.moveTo(-h + c, -h);
  s.lineTo(-n, -h); s.lineTo(-n, -h + nd); s.lineTo(n, -h + nd); s.lineTo(n, -h);
  s.lineTo(h - c, -h); s.lineTo(h, -h + c);
  s.lineTo(h, -n); s.lineTo(h - nd, -n); s.lineTo(h - nd, n); s.lineTo(h, n);
  s.lineTo(h, h - c); s.lineTo(h - c, h);
  s.lineTo(n, h); s.lineTo(n, h - nd); s.lineTo(-n, h - nd); s.lineTo(-n, h);
  s.lineTo(-h + c, h); s.lineTo(-h, h - c);
  s.lineTo(-h, n); s.lineTo(-h + nd, n); s.lineTo(-h + nd, -n); s.lineTo(-h, -n);
  s.lineTo(-h, -h + c); s.closePath();
  return s;
}

// Extrude a 2D shape upward (Y) with a fine bevel for machined edges
function extrudeUp(shape: Shape, depth: number, bevel = 0.012) {
  const g = new ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3, curveSegments: 10 });
  g.rotateX(-Math.PI / 2);
  // ExtrudeGeometry cap UVs are in shape units; remap to 0…1 over the footprint
  g.computeBoundingBox();
  const bb = g.boundingBox!;
  const uv = g.attributes.uv, pos = g.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) - bb.min.x) / (bb.max.x - bb.min.x), 1 - (pos.getZ(i) - bb.min.z) / (bb.max.z - bb.min.z));
  return g;
}

type LabelDef = { key: string; pos: [number, number, number] };
// Screen labels are plain DOM (see ArchitectureStory); these are their 3D anchor points
export const LABELS: LabelDef[] = [
  { key: 'ihs', pos: [1.95, 0.25, 0] },
  { key: 'die', pos: [1.25, 0.03, -0.6] },
  { key: 'interconnect', pos: [1.45, 0, 0.75] },
  { key: 'substrate', pos: [1.95, 0.06, 1.55] },
  { key: 'pads', pos: [2.1, 0, -1.2] },
];
// Which story focus reveals which labels (at most two at a time)
const LABEL_FOCUS: Record<string, string[]> = {
  ihs: ['ihs'],
  interconnect: ['interconnect'],
  die: ['die'],
  substrate: ['substrate', 'pads'],
};

export const Processor = memo(function Processor() {
  const mobile = story.mobile;
  const T = mobile ? 1024 : 2048;
  const maps = useMemo(() => ({
    die: dieMaps(T),
    sub: substrateMaps(mobile ? 1024 : 2048, 'ICCMM-26'),
    ihs: ihsMaps(mobile ? 1024 : 2048),
    rdl1: interconnectMap(mobile ? 1024 : 2048, 3, true),
    rdl2: interconnectMap(mobile ? 1024 : 2048, 9, false),
    tim: timMaps(512),
  }), [T, mobile]);

  const geo = useMemo(() => {
    const substrate = extrudeUp(roundedRect(SUB, SUB, 0.06), SUB_T - 0.02, 0.008);
    const seal = extrudeUp(roundedRect(3.5, 3.5, 0.1, [roundedRect(3.3, 3.3, 0.08)]), 0.01, 0);
    const flange = extrudeUp(ihsFlangeShape(3.7), 0.05, 0.008);
    const plateau = extrudeUp(roundedRect(3.0, 3.0, 0.16), 0.14, 0.02);
    return { substrate, seal, flange, plateau };
  }, []);

  const groups = {
    root: useRef<Group>(null),
    pads: useRef<Group>(null), substrate: useRef<Group>(null), caps: useRef<Group>(null), bumps: useRef<Group>(null),
    rdl1: useRef<Group>(null), rdl2: useRef<Group>(null), die: useRef<Group>(null), tim: useRef<Group>(null), ihs: useRef<Group>(null),
  };
  const padsRef = useRef<InstancedMesh>(null);
  const bumpsRef = useRef<InstancedMesh>(null);
  const capBody = useRef<InstancedMesh>(null);
  const capEnds = useRef<InstancedMesh>(null);
  const dieMat = useRef<MeshPhysicalMaterial>(null);
  const anchors = useRef<Record<string, Object3D | null>>({});
  const tmp = useMemo(() => new Vector3(), []);

  const padGrid = mobile ? 20 : 32;
  const bumpX = mobile ? 26 : 52, bumpZ = mobile ? 18 : 36;

  useLayoutEffect(() => {
    const d = new Object3D();
    // Land grid pads (skip the centre cavity like real LGA packages)
    let n = 0;
    const pitch = 3.7 / padGrid;
    for (let i = 0; i < padGrid; i++) for (let j = 0; j < padGrid; j++) {
      const x = -1.85 + pitch * (i + 0.5), z = -1.85 + pitch * (j + 0.5);
      if (Math.abs(x) < 0.7 && Math.abs(z) < 0.7) continue;
      d.position.set(x, 0, z); d.updateMatrix();
      padsRef.current!.setMatrixAt(n++, d.matrix);
    }
    padsRef.current!.count = n;
    padsRef.current!.instanceMatrix.needsUpdate = true;
    // C4 bumps under the die
    n = 0;
    for (let i = 0; i < bumpX; i++) for (let j = 0; j < bumpZ; j++) {
      d.position.set(-DIE_W / 2 + 0.06 + (i * (DIE_W - 0.12)) / (bumpX - 1), 0.016, -DIE_D / 2 + 0.06 + (j * (DIE_D - 0.12)) / (bumpZ - 1));
      d.updateMatrix(); bumpsRef.current!.setMatrixAt(n++, d.matrix);
    }
    bumpsRef.current!.instanceMatrix.needsUpdate = true;
    // Decoupling capacitors in rows around the die land
    n = 0;
    let m = 0;
    const place = (x: number, z: number, rot: number) => {
      d.position.set(x, 0.022, z); d.rotation.set(0, rot, 0); d.scale.set(1, 1, 1); d.updateMatrix();
      capBody.current!.setMatrixAt(n++, d.matrix);
      [-1, 1].forEach((s) => {
        d.position.set(x + Math.cos(rot) * s * 0.05, 0.022, z - Math.sin(rot) * s * 0.05); d.updateMatrix();
        capEnds.current!.setMatrixAt(m++, d.matrix);
      });
    };
    for (let i = 0; i < 14; i++) { place(-1.3 + i * 0.2, -1.32, 0); place(-1.3 + i * 0.2, 1.32, 0); }
    for (let i = 0; i < 9; i++) { place(-1.55, -0.8 + i * 0.2, Math.PI / 2); place(1.55, -0.8 + i * 0.2, Math.PI / 2); }
    capBody.current!.count = n; capEnds.current!.count = m;
    capBody.current!.instanceMatrix.needsUpdate = true; capEnds.current!.instanceMatrix.needsUpdate = true;
  }, [padGrid, bumpX, bumpZ]);

  const sm = useRef({ explode: 0, rx: 0, ry: 0, px: 0, py: 0 });

  useFrame((state, dt) => {
    const pose = poseAt(story.progress);
    const s = sm.current;
    const k = 1 - Math.pow(0.0015, Math.min(dt, 0.05)); // frame-rate independent damping
    s.explode += (pose.explode - s.explode) * k;

    // Cursor: rotation, with idle drift when the pointer rests
    const idle = performance.now() - pointer.lastMove > 2500 || !pointer.active;
    const t = state.clock.elapsedTime;
    const tx = idle ? Math.sin(t * 0.35) * 0.18 : pointer.x;
    const ty = idle ? Math.cos(t * 0.27) * 0.12 : pointer.y;
    const kc = 1 - Math.pow(0.02, Math.min(dt, 0.05));
    s.px += (tx - s.px) * kc; s.py += (ty - s.py) * kc;
    const root = groups.root.current!;
    root.rotation.y = pose.rotY + s.px * 0.42;
    root.rotation.x = -s.py * 0.22;
    root.rotation.z = s.px * 0.04;
    root.position.y = story.reduced ? 0 : Math.sin(t * 0.6) * 0.025;

    // Layers: exploded offset plus depth parallax (higher layers drift further with the cursor)
    const e = s.explode * (0.15 + 0.85 * story.intro);
    (Object.keys(LAYERS) as (keyof typeof LAYERS)[]).forEach((name, idx) => {
      const g = groups[name].current;
      if (!g) return;
      const L = LAYERS[name];
      const depth = L.dy * e;
      const lift = name === 'ihs' ? pose.lift : name === 'tim' ? pose.lift * 0.55 : 0;
      g.position.y = L.y + depth + lift * e;
      g.position.x = s.px * depth * 0.09;
      g.position.z = -s.py * depth * 0.07;
      g.rotation.y = e * (idx % 2 ? 0.015 : -0.015) * L.dy;
    });

    // Highlight the layer in focus; fade the labels belonging to the current chapter
    const show = LABEL_FOCUS[pose.focus] ?? [];
    const labelK = Math.min(1, Math.max(0, (s.explode - 0.45) / 0.3));
    const W = state.size.width, H = state.size.height;
    LABELS.forEach((l) => {
      const el = document.querySelector<HTMLElement>(`[data-chip-label="${l.key}"]`);
      const a = anchors.current[l.key];
      if (!el || !a) return;
      // project the 3D anchor to screen space (no extra React roots)
      a.getWorldPosition(tmp).project(state.camera);
      const sx = (tmp.x * 0.5 + 0.5) * W, sy = (-tmp.y * 0.5 + 0.5) * H;
      const target = show.includes(l.key) ? labelK : 0;
      const cur = Number(el.dataset.o ?? 0);
      const next = cur + (target - cur) * k;
      el.dataset.o = String(next);
      el.style.opacity = String(next);
      el.style.transform = `translate3d(${sx.toFixed(1)}px, ${(sy + (1 - next) * 8).toFixed(1)}px, 0) translate(-50%, -50%)`;
    });
    if (dieMat.current) dieMat.current.emissiveIntensity = (pose.focus === 'die' ? 0.12 : 0) * labelK;
  });

  const label = (key: string) => {
    const l = LABELS.find((x) => x.key === key)!;
    return <object3D position={l.pos} ref={(o: Object3D | null) => { anchors.current[key] = o; }} />;
  };

  return (
    <group ref={groups.root}>
      {/* Land grid contact array */}
      <group ref={groups.pads}>
        <mesh position={[0, -0.006, 0]} receiveShadow>
          <boxGeometry args={[SUB - 0.04, 0.012, SUB - 0.04]} />
          <meshStandardMaterial color="#1c2328" roughness={0.6} metalness={0.2} />
        </mesh>
        <instancedMesh ref={padsRef} args={[new CylinderGeometry(0.042, 0.042, 0.008, 18), undefined, padGrid * padGrid]} position={[0, -0.014, 0]} castShadow>
          <meshStandardMaterial color="#d7dde2" metalness={1} roughness={0.22} />
        </instancedMesh>
        {label('pads')}
      </group>

      {/* Package substrate */}
      <group ref={groups.substrate}>
        <mesh geometry={geo.substrate} castShadow receiveShadow>
          <meshStandardMaterial attach="material-0" map={maps.sub.map} normalMap={maps.sub.normalMap} roughness={0.5} metalness={0.25} />
          <meshStandardMaterial attach="material-1" color="#2b3338" roughness={0.45} metalness={0.4} />
        </mesh>
        <mesh geometry={geo.seal} position={[0, SUB_T, 0]}>
          <meshStandardMaterial color="#0e1114" roughness={0.8} />
        </mesh>
        {label('substrate')}
      </group>

      {/* Decoupling capacitors */}
      <group ref={groups.caps} position={[0, SUB_T, 0]}>
        <instancedMesh ref={capBody} args={[new BoxGeometry(0.07, 0.04, 0.05), undefined, 64]} castShadow>
          <meshStandardMaterial color="#5d666e" roughness={0.55} metalness={0.2} />
        </instancedMesh>
        <instancedMesh ref={capEnds} args={[new BoxGeometry(0.03, 0.044, 0.054), undefined, 128]} castShadow>
          <meshStandardMaterial color="#cfd6dc" metalness={1} roughness={0.25} />
        </instancedMesh>
      </group>

      {/* C4 micro-bumps */}
      <group ref={groups.bumps}>
        <instancedMesh ref={bumpsRef} args={[new SphereGeometry(0.016, mobile ? 6 : 10, mobile ? 4 : 8), undefined, bumpX * bumpZ]} castShadow>
          <meshStandardMaterial color="#e3e8ec" metalness={1} roughness={0.18} />
        </instancedMesh>
      </group>

      {/* Interconnect (BEOL) layers */}
      {(['rdl1', 'rdl2'] as const).map((n) => (
        <group ref={groups[n]} key={n}>
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.003, 0]}>
            <planeGeometry args={[DIE_W + 0.2, DIE_D + 0.2]} />
            <meshPhysicalMaterial color="#cfdbe4" alphaMap={maps[n]} transparent metalness={1} roughness={0.2} depthWrite={false} side={2} envMapIntensity={1.4} />
          </mesh>
          <mesh position={[0, 0.0015, 0]}>
            <boxGeometry args={[DIE_W + 0.2, 0.003, DIE_D + 0.2]} />
            <meshPhysicalMaterial color="#e8f1f7" transparent opacity={0.12} roughness={0.1} metalness={0} depthWrite={false} />
          </mesh>
          {n === 'rdl1' && label('interconnect')}
        </group>
      ))}

      {/* Silicon die */}
      <group ref={groups.die}>
        <mesh position={[0, DIE_T / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[DIE_W, DIE_T, DIE_D]} />
          <meshStandardMaterial attach="material-0" color="#3b434a" metalness={0.8} roughness={0.35} />
          <meshStandardMaterial attach="material-1" color="#3b434a" metalness={0.8} roughness={0.35} />
          <meshPhysicalMaterial ref={dieMat} attach="material-2" map={maps.die.map} normalMap={maps.die.normalMap} roughnessMap={maps.die.roughnessMap} metalness={0.75} roughness={1} clearcoat={0.6} clearcoatRoughness={0.12} emissive="#0a6fa5" emissiveIntensity={0} />
          <meshStandardMaterial attach="material-3" color="#2d343a" metalness={0.6} roughness={0.5} />
          <meshStandardMaterial attach="material-4" color="#3b434a" metalness={0.8} roughness={0.35} />
          <meshStandardMaterial attach="material-5" color="#3b434a" metalness={0.8} roughness={0.35} />
        </mesh>
        {label('die')}
      </group>

      {/* Thermal interface material */}
      <group ref={groups.tim}>
        <mesh position={[0, 0.008, 0]} castShadow>
          <boxGeometry args={[DIE_W + 0.06, 0.016, DIE_D + 0.06]} />
          <meshStandardMaterial color="#9da6ad" metalness={0.85} roughness={0.42} normalMap={maps.tim.normalMap} />
        </mesh>
      </group>

      {/* Integrated heat spreader */}
      <group ref={groups.ihs}>
        <mesh geometry={geo.flange} castShadow receiveShadow>
          <meshPhysicalMaterial attach="material-0" color="#d3d9de" metalness={1} roughness={0.32} roughnessMap={maps.ihs.roughnessMap} anisotropy={0.6} />
          <meshPhysicalMaterial attach="material-1" color="#c7cdd2" metalness={1} roughness={0.25} />
        </mesh>
        <mesh geometry={geo.plateau} position={[0, 0.05, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial attach="material-0" color="#dde2e6" map={maps.ihs.map} metalness={1} roughness={1} roughnessMap={maps.ihs.roughnessMap} normalMap={maps.ihs.normalMap} anisotropy={0.7} clearcoat={0.15} />
          <meshPhysicalMaterial attach="material-1" color="#cbd1d6" metalness={1} roughness={0.2} />
        </mesh>
        {label('ihs')}
      </group>
    </group>
  );
});

export type { Mesh };

import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { ACESFilmicToneMapping, AdditiveBlending, BufferGeometry, Color, Float32BufferAttribute, PCFSoftShadowMap, Points, type DirectionalLight, type PerspectiveCamera } from 'three';
import { Processor } from './Processor';
import { story, poseAt } from '../../animations/story';
import { pointer } from '../../animations/motion';

/* Camera follows the scroll pose; the cursor adds a limited orbit on top */
function CameraRig() {
  const { camera, size, scene } = useThree();
  const cur = useRef({ x: 9, y: 9, z: 12, tx: 0, ty: 0.2, tz: 0, shift: 0.24, mx: 0, my: 0 });
  useFrame((_, dt) => {
    const pose = poseAt(story.progress);
    const c = cur.current;
    const k = 1 - Math.pow(0.002, Math.min(dt, 0.05));
    // Opening: start further away and higher, settle into the first pose
    const intro = story.intro;
    const pull = 1 + (1 - intro) * 0.9;
    const narrow = size.width / size.height < 1.05;
    const fit = narrow ? Math.min(1.8, 0.78 / (size.width / size.height)) : 1;
    c.x += (pose.cam[0] * pull * fit - c.x) * k;
    c.y += ((pose.cam[1] + (1 - intro) * 2.5) * pull * fit - c.y) * k;
    c.z += (pose.cam[2] * pull * fit - c.z) * k;
    c.tx += (pose.target[0] - c.tx) * k; c.ty += (pose.target[1] - c.ty) * k; c.tz += (pose.target[2] - c.tz) * k;
    c.shift += ((narrow ? 0 : pose.shift) - c.shift) * k;
    c.mx += (pointer.x - c.mx) * k * 0.6; c.my += (pointer.y - c.my) * k * 0.6;
    camera.position.set(c.x + c.mx * 0.35, c.y + c.my * 0.25, c.z);
    camera.lookAt(c.tx, c.ty, c.tz);
    const cam = camera as PerspectiveCamera;
    // Shift the model left/right (or up on phones) without changing perspective
    cam.setViewOffset(size.width, size.height, -c.shift * size.width, narrow ? size.height * 0.2 : 0, size.width, size.height);
    // Reflections sweep across the metal as the cursor moves
    scene.environmentRotation.set(0, c.mx * 0.9 + pose.rotY * 0.2, 0);
    scene.backgroundRotation.copy(scene.environmentRotation);
  });
  return null;
}

/* Key light orbits gently with the cursor so shadows and highlights move */
function Lights({ shadows }: { shadows: boolean }) {
  const key = useRef<DirectionalLight>(null);
  const rim = useRef<DirectionalLight>(null);
  useFrame(() => {
    const d = poseAt(story.progress).dark;
    if (key.current) {
      key.current.position.set(3 + pointer.x * 3, 6, 3 - pointer.y * 2);
      key.current.intensity = 2.4 - d * 0.9;
    }
    if (rim.current) rim.current.intensity = 0.6 + d * 2.2;
  });
  return (
    <>
      <directionalLight ref={key} castShadow={shadows} intensity={2.4} position={[3, 6, 3]} shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.02}>
        <orthographicCamera attach="shadow-camera" args={[-3.5, 3.5, 3.5, -3.5, 0.5, 20]} />
      </directionalLight>
      <directionalLight ref={rim} color="#bfdcf0" intensity={0.6} position={[-4, 2, -4]} />
      <ambientLight intensity={0.15} />
    </>
  );
}

/* Fine particles at three depths: drift slowly and parallax with the cursor */
function DataField({ count }: { count: number }) {
  const ref = useRef<Points>(null);
  const geo = useMemo(() => {
    const g = new BufferGeometry();
    const p = new Float32Array(count * 3);
    let s = 17;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < count; i++) { p[i * 3] = (r() - 0.5) * 12; p[i * 3 + 1] = r() * 6 - 1.5; p[i * 3 + 2] = (r() - 0.5) * 12; }
    g.setAttribute('position', new Float32BufferAttribute(p, 3));
    return g;
  }, [count]);
  useFrame((st) => {
    if (!ref.current) return;
    ref.current.rotation.y = st.clock.elapsedTime * 0.01 + pointer.x * 0.12;
    ref.current.position.y = -pointer.y * 0.15;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.016} color={new Color('#9fc4dc')} transparent opacity={0.4} depthWrite={false} blending={AdditiveBlending} sizeAttenuation />
    </points>
  );
}

export default function ProcessorScene({ active }: { active: boolean }) {
  const mobile = story.mobile;
  return (
    <Canvas
      className="stage-canvas"
      frameloop={active ? 'always' : 'never'}
      dpr={mobile ? [1, 1.3] : [1, 1.75]}
      shadows={!mobile ? { type: PCFSoftShadowMap } : false}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      camera={{ fov: 32, near: 0.1, far: 60, position: [6, 6, 8] }}
    >
      <Suspense fallback={null}>
        <Environment resolution={mobile ? 128 : 256} frames={1}>
          {/* Studio softboxes: these are what the nickel lid and silicon reflect */}
          <Lightformer form="rect" intensity={2.6} position={[0, 6, -2]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} />
          <Lightformer form="rect" intensity={1.8} position={[-6, 2, 0]} rotation-y={Math.PI / 2} scale={[12, 2, 1]} />
          <Lightformer form="rect" intensity={1.4} color="#d6eaf7" position={[6, 1.5, 1]} rotation-y={-Math.PI / 2} scale={[12, 1.2, 1]} />
          <Lightformer form="rect" intensity={0.9} position={[0, 1, 7]} scale={[8, 1, 1]} />
          <Lightformer form="ring" intensity={1.2} position={[3, 4, 4]} scale={2.5} />
        </Environment>
        <Lights shadows={!mobile} />
        <CameraRig />
        <Processor />
        {!mobile && <DataField count={420} />}
      </Suspense>
    </Canvas>
  );
}

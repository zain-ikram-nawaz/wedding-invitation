'use client';
import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode, type RefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Edges, Environment, Float, Lightformer, RoundedBox, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

type Props = { progress: RefObject<{ value: number }>; reduced: boolean; guest: string };
const paper = '#f3e6d1';

function Panel({ points, color, position = [0, 0, 0] }: { points: number[][]; color: string; position?: [number, number, number] }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    points.forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y));
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { depth: .018, bevelEnabled: false });
  }, [points]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} position={position}><meshStandardMaterial color={color} roughness={.85} side={THREE.DoubleSide} /><Edges color="#c7b79e" threshold={20} /></mesh>;
}
const flapPoints = [[-1.8, 0], [0, -1.35], [1.8, 0]];
const leftPoints = [[-1.8, -1.1], [.08, -.22], [-1.8, 1.1]];
const rightPoints = [[-.08, -.22], [1.8, -1.1], [1.8, 1.1]];
const bottomPoints = [[-1.8, -1.1], [1.8, -1.1], [1.8, -.9], [0, .12], [-1.8, -.9]];

function Card({ guest }: { guest: string }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 700;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fcf7ed'; ctx.fillRect(0, 0, 1024, 700);
    ctx.strokeStyle = '#b39360'; ctx.lineWidth = 2; ctx.strokeRect(24, 24, 976, 652); ctx.strokeRect(34, 34, 956, 632);
    ctx.textAlign = 'center'; ctx.fillStyle = '#6e263c';
    ctx.font = '26px Georgia'; ctx.fillText('TOGETHER WITH OUR FAMILIES', 512, 135);
    ctx.font = 'italic 112px Georgia'; ctx.fillText('Naaz & Hassan', 512, 300);
    ctx.font = '22px Georgia'; ctx.fillText('RESERVED WITH LOVE FOR', 512, 390);
    ctx.font = 'italic 38px Georgia'; ctx.fillText(guest || 'our dear family & friends', 512, 447, 880);
    ctx.font = '24px Georgia'; ctx.fillText('4 NOVEMBER 2026  ·  KARACHI', 512, 520);
    const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; return tex;
  }, [guest]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <group><RoundedBox args={[3.32, 2.18, .025]} radius={.025} smoothness={2}><meshStandardMaterial color="#fcf7ed" /></RoundedBox><mesh position={[0, 0, .014]}><planeGeometry args={[3.32, 2.18]} /><meshStandardMaterial map={texture} roughness={.9} /></mesh></group>;
}

function ModelAsset({ url, ...props }: { url: string; position: [number, number, number]; rotation?: [number, number, number]; scale: number }) {
  const { scene } = useGLTF(url);
  const clone = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={clone} {...props} />;
}

function Envelope({ progress, reduced, guest }: Props) {
  const root = useRef<THREE.Group>(null);
  const flap = useRef<THREE.Group>(null);
  const letter = useRef<THREE.Group>(null);
  const seal = useRef<THREE.Group>(null);
  useFrame(({ clock, pointer }) => {
    const p = reduced ? 1 : progress.current.value;
    if (flap.current) flap.current.rotation.x = Math.PI * .94 * Math.min(p / .65, 1);
    if (letter.current) letter.current.position.y = -.13 + THREE.MathUtils.smoothstep(p, .25, 1) * 1.35;
    if (seal.current) seal.current.scale.setScalar(Math.max(0, 1 - p * 4));
    if (root.current) {
      root.current.rotation.y = -.15 + (reduced ? 0 : pointer.x * .1);
      root.current.rotation.x = .12 + (reduced ? 0 : pointer.y * .06);
      root.current.position.y = reduced ? -.25 : -.25 + Math.sin(clock.elapsedTime * .7) * .07;
    }
  });
  return <group ref={root} rotation={[.12, -.15, -.10]} position={[0, -.25, 0]}>
    <RoundedBox args={[3.6, 2.2, .045]} radius={.035} smoothness={2}><meshStandardMaterial color={paper} roughness={.9} /></RoundedBox>
    <mesh position={[0, 0, .026]}><planeGeometry args={[3.52, 2.12]} /><meshStandardMaterial color="#c69f91" /></mesh>
    <group ref={letter} position={[0, -.13, .065]}><Card guest={guest} /></group>
    <Panel points={leftPoints} color="#eee0ca" position={[0, 0, .11]} />
    <Panel points={rightPoints} color="#f5e9d7" position={[0, 0, .13]} />
    <Panel points={bottomPoints} color={paper} position={[0, 0, .155]} />
    <group ref={flap} position={[0, 1.1, .18]}><Panel points={flapPoints} color="#f4e7d4" /></group>
    <group ref={seal} position={[0, -.24, .235]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.24, .25, .055, 40]} /><meshStandardMaterial color="#8d3347" metalness={.2} roughness={.38} /></mesh>
      <mesh position={[0, 0, .035]}><torusGeometry args={[.18, .008, 8, 40]} /><meshStandardMaterial color="#b58b50" metalness={.6} roughness={.3} /></mesh>
    </group>
  </group>;
}

function Fallback() { return <div className="scene-fallback"><img src="/images/open_envelope.png" alt="An open ivory wedding envelope" /><span>With love, Naaz & Hassan</span></div>; }
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <Fallback /> : this.props.children; }
}
export default function EnvelopeScene(props: Props) {
  return <SceneBoundary><Canvas camera={{ position: [0, 0, 8.6], fov: 42 }} dpr={[1, 1.6]} gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }} fallback={<Fallback />}>
    <ambientLight intensity={1.1} /><directionalLight position={[3, 5, 5]} intensity={2} />
    <Suspense fallback={null}>
      <Environment resolution={128}><Lightformer intensity={3} position={[0, 4, 4]} scale={[8, 5, 1]} /><Lightformer intensity={1.5} position={[-4, 0, 2]} scale={[3, 7, 1]} /></Environment>
      <Envelope {...props} />
      <Float speed={props.reduced ? 0 : 1.3} rotationIntensity={props.reduced ? 0 : .15} floatIntensity={props.reduced ? 0 : .35}>
        <ModelAsset url="/models/floral_wreath.glb" scale={3.3} position={[1.7, 1.55, -.65]} rotation={[Math.PI / 2, .15, -.2]} />
      </Float>
      <Float speed={props.reduced ? 0 : 1} rotationIntensity={props.reduced ? 0 : .12} floatIntensity={props.reduced ? 0 : .3}>
        <ModelAsset url="/models/wedding_ring_box.glb" scale={6} position={[-1.8, -1.55, .7]} rotation={[.3, .35, .1]} />
      </Float>
    </Suspense>
  </Canvas></SceneBoundary>;
}

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export type ZoneState = { ratio: number; answered: number; total: number; active: boolean };
export type ZoneMap = Record<string, ZoneState>;

const COLOR_OFF = new THREE.Color("#3a4a46");
const COLOR_LOW = new THREE.Color("#c96a52");
const COLOR_MID = new THREE.Color("#d3a06a");
const COLOR_HIGH = new THREE.Color("#2f9e8a");

function stateColor(ratio: number, answered: number) {
  if (answered === 0) return COLOR_OFF;
  if (ratio >= 0.7) return COLOR_HIGH;
  if (ratio >= 0.4) return COLOR_MID;
  return COLOR_LOW;
}

const CAMERA_TARGETS: Record<string, [number, number, number]> = {
  F1: [16, 10, 18],
  F2: [-15, 13, 17],
  F3: [1, 7, 19],
  F4: [7, 5, 15],
  F5: [-11, 9, 14],
  F6: [0, 24, 27],
  intro: [15, 13, 21],
};


function CameraRig({ active }: { active: string }) {
  const target = useMemo(() => new THREE.Vector3(...(CAMERA_TARGETS[active] ?? CAMERA_TARGETS["intro"]!)), [active]);
  const look = useRef(new THREE.Vector3(0, 3.2, 0.5));

  useFrame(({ camera }, delta) => {
    const t = 1 - Math.pow(0.008, delta);
    camera.position.lerp(target, t);
    camera.lookAt(look.current);
  });
  return null;
}

function Wall({ zone }: { zone: ZoneState }) {
  const color = stateColor(zone.ratio, zone.answered);
  const height = 0.6 + zone.ratio * 1.4;
  const segments: { pos: [number, number, number]; size: [number, number, number] }[] = [
    { pos: [0, height / 2, 7], size: [14, height, 0.3] },
    { pos: [0, height / 2, -7], size: [14, height, 0.3] },
    { pos: [7, height / 2, 0], size: [0.3, height, 14] },
    { pos: [-7, height / 2, 0], size: [0.3, height, 14] },
  ];
  return (
    <group>
      {segments.map((s, i) => (
        <mesh key={i} position={s.pos} castShadow receiveShadow>
          <boxGeometry args={s.size} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={zone.active ? 0.45 : 0.12}
            roughness={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

function CameraPole({ position, on, active }: { position: [number, number, number]; on: THREE.Color; active: boolean }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (head.current && active) head.current.rotation.y = Math.sin(clock.elapsedTime * 0.8) * 0.7;
  });
  return (
    <group position={position}>
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 2.8, 8]} />
        <meshStandardMaterial color="#4d5f5a" roughness={0.6} />
      </mesh>
      <mesh ref={head} position={[0, 2.9, 0]}>
        <boxGeometry args={[0.55, 0.3, 0.3]} />
        <meshStandardMaterial color={on} emissive={on} emissiveIntensity={active ? 0.8 : 0.3} />
      </mesh>
    </group>
  );
}

function Tech({ zone }: { zone: ZoneState }) {
  const color = stateColor(zone.ratio, zone.answered);
  const count = Math.max(1, Math.round(zone.ratio * 6));
  const spots: [number, number, number][] = [
    [6.2, 0, 6.2],
    [-6.2, 0, 6.2],
    [6.2, 0, -6.2],
    [-6.2, 0, -6.2],
    [0, 0, 6.4],
    [0, 0, -6.4],
  ];
  return (
    <group>
      {spots.slice(0, zone.answered === 0 ? 1 : count).map((p, i) => (
        <CameraPole key={i} position={p} on={color} active={zone.active} />
      ))}
    </group>
  );
}

function Portaria({ zone }: { zone: ZoneState }) {
  const color = stateColor(zone.ratio, zone.answered);
  return (
    <group position={[0, 0, 6.2]}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[2.6, 1.8, 1.8]} />
        <meshStandardMaterial color="#1f3a34" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.05, 0.95]}>
        <boxGeometry args={[2, 0.9, 0.06]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={zone.active ? 0.9 : 0.35} />
      </mesh>
      {/* cancela */}
      <mesh position={[2.4, 1, 0]} rotation={[0, 0, zone.ratio > 0.5 ? -Math.PI / 2.4 : 0]}>
        <boxGeometry args={[2.4, 0.12, 0.12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

function Person({ position, color, active, seed }: { position: [number, number, number]; color: THREE.Color; active: boolean; seed: number }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (g.current && active) g.current.position.y = Math.abs(Math.sin(clock.elapsedTime * 2 + seed)) * 0.12;
  });
  return (
    <group ref={g} position={position}>
      <mesh position={[0, 0.42, 0]}>
        <capsuleGeometry args={[0.16, 0.4, 4, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 0.5 : 0.15} />
      </mesh>
      <mesh position={[0, 0.86, 0]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial color="#e8e2d6" />
      </mesh>
    </group>
  );
}

function Equipe({ zone }: { zone: ZoneState }) {
  const color = stateColor(zone.ratio, zone.answered);
  const count = zone.answered === 0 ? 1 : Math.max(1, Math.round(zone.ratio * 4));
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <Person key={i} seed={i} position={[1.8 + i * 0.7, 0, 5]} color={color} active={zone.active} />
      ))}
    </group>
  );
}

function Moradores({ zone }: { zone: ZoneState }) {
  const color = stateColor(zone.ratio, zone.answered);
  const count = zone.answered === 0 ? 2 : Math.max(2, Math.round(zone.ratio * 7));
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2;
        return (
          <Person
            key={i}
            seed={i * 1.7}
            position={[Math.cos(a) * 3.2, 0, Math.sin(a) * 2.4 - 1]}
            color={color}
            active={zone.active}
          />
        );
      })}
    </group>
  );
}

function Torres() {
  const towers: { pos: [number, number, number]; h: number }[] = [
    { pos: [-3, 0, -2.5], h: 5 },
    { pos: [0.5, 0, -3.5], h: 6.5 },
    { pos: [3.6, 0, -1.8], h: 4.2 },
  ];
  return (
    <group>
      {towers.map((t, i) => (
        <group key={i} position={t.pos}>
          <mesh position={[0, t.h / 2, 0]} castShadow>
            <boxGeometry args={[2.2, t.h, 2.2]} />
            <meshStandardMaterial color="#22403a" roughness={0.85} />
          </mesh>
          <mesh position={[0, t.h / 2, 1.12]}>
            <planeGeometry args={[1.7, t.h * 0.8]} />
            <meshStandardMaterial color="#0f2723" emissive="#a3b5aa" emissiveIntensity={0.15} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Entorno({ zone }: { zone: ZoneState }) {
  const color = stateColor(zone.ratio, zone.answered);
  const blocks: [number, number, number][] = [
    [-11, 0, 4],
    [-11, 0, -4],
    [11, 0, 3],
    [11, 0, -5],
    [-4, 0, 11],
    [5, 0, 11],
    [0, 0, -11],
  ];
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 9.2]}>
        <planeGeometry args={[30, 2.6]} />
        <meshStandardMaterial color="#16211f" />
      </mesh>
      {blocks.map((p, i) => (
        <group key={i} position={p}>
          <mesh position={[0, 1.2, 0]}>
            <boxGeometry args={[2.4, 2.4, 2.4]} />
            <meshStandardMaterial color="#1a2a27" roughness={0.9} />
          </mesh>
          <mesh position={[0, 2.6, 0]}>
            <sphereGeometry args={[0.16, 10, 10]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={zone.active ? 1 : 0.25} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Scene({ zones, active }: { zones: ZoneMap; active: string }) {
  const z = (id: string): ZoneState => zones[id] ?? { ratio: 0, answered: 0, total: 8, active: false };
  return (
    <>
      <color attach="background" args={["#0b1614"]} />
      <fog attach="fog" args={["#0b1614", 22, 46]} />
      <hemisphereLight intensity={0.5} color="#a3b5aa" groundColor="#0b1614" />
      <directionalLight position={[8, 14, 6]} intensity={1.1} castShadow />
      <pointLight position={[0, 6, 6]} intensity={22} color="#2f9e8a" distance={18} />

      <CameraRig active={active} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#101d1a" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#13221f" roughness={1} />
      </mesh>

      <Torres />
      <Wall zone={z("F1")} />
      <Tech zone={z("F2")} />
      <Portaria zone={z("F3")} />
      <Equipe zone={z("F4")} />
      <Moradores zone={z("F5")} />
      <Entorno zone={z("F6")} />
    </>
  );
}

export default function CondoScene({ zones, active }: { zones: ZoneMap; active: string }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      camera={{ position: [8, 9, 13], fov: 42 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Scene zones={zones} active={active} />
    </Canvas>
  );
}

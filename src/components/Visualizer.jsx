import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows, Grid } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Packet colours ───────────── */
const COL_INFLOW = new THREE.Color('#f59e0b');  // yellow/amber
const COL_LEAK   = new THREE.Color('#3b82f6');  // blue
const COL_DROP   = new THREE.Color('#f43f5e');  // rose

/* ─── Bucket dimensions ─────────── */
const R  = 1.3;   // radius
const H  = 2.8;   // height
const HR = H / 2; // half-height

/* liquid Y range: bottom = -HR, top = HR */
const LIQUID_BOTTOM = -HR;

/* ─── Bucket ─────────────────────────────────────────────────────── */
const BucketMesh = ({ queue, capacity, onLiquidTop }) => {
  const liquidRef     = useRef();
  const nozzleLightRef = useRef();
  const liquidScaleYRef = useRef(0.01);

  useFrame(() => {
    const ratio    = Math.min(queue / Math.max(capacity, 1), 1);
    const targetSY = Math.max(0.01, ratio);
    liquidScaleYRef.current = THREE.MathUtils.lerp(liquidScaleYRef.current, targetSY, 0.1);

    if (liquidRef.current) {
      const sy = liquidScaleYRef.current;
      liquidRef.current.scale.y = sy;
      liquidRef.current.position.y = LIQUID_BOTTOM + (sy * H) / 2;
      const liquidTopY = LIQUID_BOTTOM + sy * H;
      onLiquidTop(liquidTopY); 
    }
    if (nozzleLightRef.current) {
      const p = 0.5 + 0.5 * Math.sin(Date.now() * 0.006);
      nozzleLightRef.current.intensity = queue > 0 ? 1.0 + p * 0.8 : 0;
    }
  });

  const ringYs = [HR + 0.15, 0, -HR - 0.15];
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[R, R, H, 52, 1, true]} />
        <meshPhongMaterial
          color="#1e293b" emissive="#f59e0b" emissiveIntensity={0.06}
          transparent opacity={0.28} side={THREE.DoubleSide} shininess={70}
        />
      </mesh>

      {ringYs.map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[R + 0.04, 0.04, 10, 72]} />
          <meshPhongMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.55} />
        </mesh>
      ))}

      <mesh ref={liquidRef} position={[0, LIQUID_BOTTOM, 0]} scale={[1, 0.01, 1]}>
        <cylinderGeometry args={[R - 0.1, R - 0.1, H, 48]} />
        <meshPhongMaterial
          color="#1d4ed8" emissive="#3b82f6" emissiveIntensity={1.4}
          transparent opacity={0.75}
        />
      </mesh>

      <mesh position={[0, -HR - 0.04, 0]}>
        <cylinderGeometry args={[R, R, 0.07, 48]} />
        <meshPhongMaterial color="#1e293b" metalness={1} roughness={0.25} />
      </mesh>

      <mesh position={[0, -HR - 0.55, 0]}>
        <cylinderGeometry args={[0.12, 0.09, 0.55, 14]} />
        <meshPhongMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>
      <pointLight ref={nozzleLightRef} position={[0, -HR - 0.9, 0]} color="#60a5fa" intensity={0} distance={4} />
    </group>
  );
};

/* ─── Inflow Packet ────────────────────────────────────────────── */
const InflowPacket = ({ startPos, liquidTopY, onDone }) => {
  const ref     = useRef();
  const stopped = useRef(false);
  const opacity = useRef(1);

  const speed = useMemo(() => 0.15 + Math.random() * 0.05, []);

  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    if (!stopped.current) {
      m.position.y -= speed;
      const stopAt = Math.max(liquidTopY + 0.1, LIQUID_BOTTOM + 0.12);
      if (m.position.y <= stopAt) {
        stopped.current = true;
      }
    } else {
      opacity.current -= 0.05;
      m.material.opacity = Math.max(0, opacity.current);
      if (opacity.current <= 0) onDone();
    }
  });

  return (
    <mesh ref={ref} position={startPos}>
      <sphereGeometry args={[0.16, 14, 14]} />
      <meshPhongMaterial color="#f59e0b" emissive={COL_INFLOW} emissiveIntensity={2.8} transparent opacity={1} />
    </mesh>
  );
};

/* ─── Overflow packet ─────────────────────────────────────────── */
const DropPacket = ({ startPos, dir, onDone }) => {
  const ref     = useRef();
  const opacity = useRef(1);
  const vx = useMemo(() => dir * (0.18 + Math.random() * 0.1), [dir]);
  const vy = useMemo(() => 0.04 + Math.random() * 0.04, []);

  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    m.position.x += vx;
    m.position.y += vy;
    opacity.current -= 0.035;
    m.material.opacity = Math.max(0, opacity.current);
    if (opacity.current <= 0) onDone();
  });
  return (
    <mesh ref={ref} position={startPos}>
      <sphereGeometry args={[0.15, 12, 12]} />
      <meshPhongMaterial color="#f43f5e" emissive={COL_DROP} emissiveIntensity={3} transparent opacity={1} />
    </mesh>
  );
};

/* ─── Leak line particle ───────────────────────────────────────── */
const LeakParticle = ({ onDone }) => {
  const ref     = useRef();
  const opacity = useRef(0.9);
  
  // Random physics for more natural flow
  const vx = useMemo(() => (Math.random() - 0.5) * 0.015, []);
  const vz = useMemo(() => (Math.random() - 0.5) * 0.015, []);
  const vy = useMemo(() => 0.1 + Math.random() * 0.05, []);
  const scale = useMemo(() => 0.7 + Math.random() * 0.6, []);

  const startY = -HR - 0.8;

  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    m.position.y -= vy;
    m.position.x += vx;
    m.position.z += vz;
    opacity.current -= 0.016;
    m.material.opacity = Math.max(0, opacity.current);
    if (opacity.current <= 0 || m.position.y < -9) onDone();
  });

  return (
    <mesh position={[0, startY, 0]} ref={ref} scale={scale}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshPhongMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={3.5} transparent opacity={0.9} />
    </mesh>
  );
};

/* ─── Scene content ─────────────────────────────────────────────── */
const SceneContent = ({ queue, capacity, packetEvent }) => {
  const [inflow, setInflow] = useState([]);
  const [drops,  setDrops]  = useState([]);
  const [leaks,  setLeaks]  = useState([]);
  const liquidTopRef  = useRef(LIQUID_BOTTOM);
  const leakTimerRef  = useRef(0);

  const onLiquidTop = (y) => { liquidTopRef.current = y; };

  useEffect(() => {
    if (!packetEvent) return;
    const id = packetEvent.id;
    if (packetEvent.type === 'normal') {
      const x = (Math.random() - 0.5) * (R * 1.3);
      const z = (Math.random() - 0.5) * (R * 1.3);
      setInflow(p => [...p, { id, pos: [x, 9, z] }].slice(-60));
    } else {
      const dir = Math.random() > 0.5 ? 1 : -1;
      const x   = dir * (R + 0.1);
      setDrops(p => [...p, { id, pos: [x, HR - 0.2, (Math.random() - 0.5) * 1.0], dir }].slice(-40));
    }
  }, [packetEvent]);

  useFrame((_, delta) => {
    if (queue <= 0) return;
    leakTimerRef.current += delta;
    
    // Smooth emission rate based on current queue
    const baseInterval = 0.05;
    if (leakTimerRef.current >= baseInterval) {
      leakTimerRef.current = 0;
      const id = Math.random();
      setLeaks(p => [...p, { id }].slice(-100));
    }
  });

  return (
    <>
      <BucketMesh queue={queue} capacity={capacity} onLiquidTop={onLiquidTop} />

      {inflow.map(p => (
        <InflowPacket
          key={p.id}
          startPos={p.pos}
          liquidTopY={liquidTopRef.current}
          onDone={() => setInflow(x => x.filter(i => i.id !== p.id))}
        />
      ))}
      {drops.map(p => (
        <DropPacket
          key={p.id}
          startPos={p.pos}
          dir={p.dir}
          onDone={() => setDrops(x => x.filter(i => i.id !== p.id))}
        />
      ))}
      {leaks.map(p => (
        <LeakParticle
          key={p.id}
          onDone={() => setLeaks(x => x.filter(i => i.id !== p.id))}
        />
      ))}
    </>
  );
};

/* ─── Visualizer wrapper ──────────────────────────────────────────── */
const Visualizer = ({ queue, capacity, packetEvent }) => (
  <div style={{ width: '100%', height: '100%' }}>
    <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }} style={{ background: 'transparent' }}>
      <PerspectiveCamera makeDefault position={[0, 1.2, 9]} fov={40} />
      <OrbitControls
        enableZoom={false} enablePan={false}
        minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 1.9}
        autoRotate autoRotateSpeed={0.5}
      />

      <ambientLight intensity={1.2} />
      <pointLight position={[5, 8, 6]}  intensity={4} color="#f59e0b" />
      <pointLight position={[-5, 4, 6]} intensity={3} color="#3b82f6" />
      <pointLight position={[0, -4, 4]} intensity={2} color="#22d3ee" />

      <React.Suspense fallback={null}>
        <group position={[0, 0.5, 0]}>
          <SceneContent queue={queue} capacity={capacity} packetEvent={packetEvent} />
        </group>
        <ContactShadows position={[0, -5.8, 0]} scale={12} blur={2.5} opacity={0.5} />
        <Grid
          position={[0, -5.9, 0]} args={[20, 20]}
          cellColor="#1e293b" cellThickness={0.5}
          sectionColor="#334155" sectionThickness={1.0}
          fadeDistance={20} infiniteGrid
        />
      </React.Suspense>
    </Canvas>
  </div>
);

export default Visualizer;

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import Terrain from './Terrain';
import Trees from './Trees';
import PatrolPaths from './PatrolPaths';
import Facilities from './Facilities';
import Animals from './Animals';
import Rangers from './Rangers';
import Cameras from './Cameras';
import Drones from './Drones';
import HeatMap from './HeatMap';
import PathLines from './PathLines';
import { useState } from 'react';
import type { Position, RescueStatus } from '@/types';

interface SceneProps {
  showHeatMap?: boolean;
  rescueRoute?: Position[] | null;
  rescueStatus?: RescueStatus;
}

export default function Scene({ showHeatMap = true, rescueRoute = null, rescueStatus = 'reported' }: SceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [40, 35, 40], fov: 50 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#0a1628' }}
    >
      <color attach="background" args={['#0a1628']} />

      <Sky
        distance={450000}
        sunPosition={[50, 20, 100]}
        inclination={0.45}
        azimuth={0.25}
        rayleigh={0.5}
        turbidity={8}
      />

      <fog attach="fog" args={['#0a1628', 50, 120]} />

      <ambientLight intensity={0.4} color="#a5b4fc" />
      <directionalLight
        position={[30, 40, 20]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />

      <hemisphereLight args={['#87ceeb', '#2d5016', 0.5]} />

      <Terrain />
      <Trees count={150} areaSize={85} />
      <PatrolPaths />
      <Facilities />
      <Animals />
      <Rangers />
      <Cameras />
      <Drones />
      {showHeatMap && <HeatMap />}
      <PathLines rescueRoute={rescueRoute} />

      {rescueRoute && rescueRoute.length > 1 && (
        <>
          <RescueStationMarker position={rescueRoute[rescueRoute.length - 1]} />
          <RescueStartMarker position={rescueRoute[0]} />
        </>
      )}

      <EffectComposer>
        <Bloom
          intensity={0.6}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <Vignette offset={0.3} darkness={0.5} />
      </EffectComposer>

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={10}
        maxDistance={100}
        maxPolarAngle={Math.PI / 2 - 0.1}
        minPolarAngle={Math.PI / 6}
        enableDamping
        dampingFactor={0.05}
      />
    </Canvas>
  );
}

function RescueStationMarker({ position }: { position: Position }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const scaleRef = useRef(1);
  const alphaRef = useRef(1);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.position.y = 2.5 + Math.sin(Date.now() * 0.003) * 0.15;
    }
    if (ringRef.current) {
      scaleRef.current = 1 + Math.sin(Date.now() * 0.004) * 0.3;
      alphaRef.current = 0.3 + Math.sin(Date.now() * 0.004) * 0.2;
      ringRef.current.scale.set(scaleRef.current, 1, scaleRef.current);
    }
  });

  return (
    <group position={[position[0], 0, position[2]]}>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.8, 1.5, 32]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={alphaRef.current} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={meshRef} castShadow>
        <cylinderGeometry args={[0.3, 0.5, 1, 8]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 3.5, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 3.5, 0]}>
        <pointLight color="#22c55e" intensity={1.5} distance={10} />
      </mesh>
    </group>
  );
}

function RescueStartMarker({ position }: { position: Position }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      meshRef.current.position.y = 1.8 + Math.sin(Date.now() * 0.004) * 0.2;
    }
  });

  return (
    <group position={[position[0], 0, position[2]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.5, 1, 32]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={meshRef} castShadow position={[0, 2, 0]}>
        <coneGeometry args={[0.5, 1, 6]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 2, 0]}>
        <pointLight color="#ef4444" intensity={1.5} distance={8} />
      </mesh>
    </group>
  );
}

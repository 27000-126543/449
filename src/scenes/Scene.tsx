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

interface SceneProps {
  showHeatMap?: boolean;
}

export default function Scene({ showHeatMap = true }: SceneProps) {
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
      <PathLines />

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

import { useMemo } from 'react';
import * as THREE from 'three';

interface FacilitiesProps {
  showLabels?: boolean;
}

export default function Facilities({ showLabels = true }: FacilitiesProps) {
  const commandCenter = useMemo(
    () => ({ position: [0, 0, 0] as [number, number, number] }),
    []
  );

  const dronePads = useMemo(
    () => [
      { position: [5, 0, 3] as [number, number, number] },
      { position: [-5, 0, 3] as [number, number, number] },
      { position: [0, 0, -5] as [number, number, number] },
    ],
    []
  );

  const rescueStations = useMemo(
    () => [
      { position: [30, 0, 15] as [number, number, number], name: '东区救助站' },
      { position: [-30, 0, -15] as [number, number, number], name: '西区救助站' },
    ],
    []
  );

  return (
    <group>
      <CommandCenter position={commandCenter.position} />
      {dronePads.map((pad, i) => (
        <DronePad key={i} position={pad.position} />
      ))}
      {rescueStations.map((station, i) => (
        <RescueStation key={i} position={station.position} name={station.name} />
      ))}
    </group>
  );
}

function CommandCenter({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[6, 3, 5]} />
        <meshStandardMaterial color="#374151" metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[0, 3.5, 0]} castShadow>
        <boxGeometry args={[4, 1, 3.5]} />
        <meshStandardMaterial color="#1f2937" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 2.5, -2.55]}>
        <boxGeometry args={[1.5, 2, 0.1]} />
        <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.5} />
      </mesh>
      <pointLight position={[0, 4, 0]} intensity={0.5} color="#fbbf24" distance={15} />
    </group>
  );
}

function DronePad({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 0.1, 32]} />
        <meshStandardMaterial color="#4b5563" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.11, 0]}>
        <ringGeometry args={[1, 1.2, 32]} />
        <meshBasicMaterial color="#22d3ee" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.5, 4]} />
        <meshBasicMaterial color="#22d3ee" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function RescueStation({ position, name }: { position: [number, number, number]; name: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[4, 2.4, 3]} />
        <meshStandardMaterial color="#fef3c7" metalness={0.1} roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.8, 0]} castShadow>
        <coneGeometry args={[3, 1.2, 4]} />
        <meshStandardMaterial color="#dc2626" metalness={0.2} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.2, -1.55]}>
        <boxGeometry args={[0.8, 1.2, 0.1]} />
        <meshStandardMaterial color="#7c2d12" />
      </mesh>
      <pointLight position={[0, 3, 0]} intensity={0.3} color="#fbbf24" distance={10} />
    </group>
  );
}

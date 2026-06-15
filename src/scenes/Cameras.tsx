import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCameraStore } from '@/store/useCameraStore';

export default function Cameras() {
  const cameras = useCameraStore((state) => state.cameras);
  const selectCamera = useCameraStore((state) => state.selectCamera);
  const selectedCameraId = useCameraStore((state) => state.selectedCameraId);

  return (
    <group>
      {cameras.map((camera) => (
        <CameraMarker
          key={camera.id}
          camera={camera}
          isSelected={selectedCameraId === camera.id}
          onClick={() => selectCamera(camera.id)}
        />
      ))}
    </group>
  );
}

interface CameraMarkerProps {
  camera: ReturnType<typeof useCameraStore.getState>['cameras'][0];
  isSelected: boolean;
  onClick: () => void;
}

function CameraMarker({ camera, isSelected, onClick }: CameraMarkerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (beamRef.current && camera.status === 'online') {
      const opacity = 0.1 + Math.sin(clock.getElapsedTime() * 3) * 0.05;
      (beamRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    }
  });

  const getColor = () => {
    if (camera.status === 'offline') return '#6b7280';
    if (camera.status === 'low_battery') return '#f59e0b';
    if (camera.hasHumanDetection) return '#ef4444';
    return '#22d3ee';
  };

  const color = isSelected || hovered ? '#60a5fa' : getColor();

  if (camera.status === 'offline') {
    return null;
  }

  return (
    <group
      ref={groupRef}
      position={camera.position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 0.3, 8]} />
        <meshStandardMaterial color="#4b5563" metalness={0.7} roughness={0.3} />
      </mesh>

      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.3, 0.2, 0.25]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} emissive={color} emissiveIntensity={isSelected ? 0.5 : 0.2} />
      </mesh>

      <mesh position={[0, 0.4, -0.18]}>
        <sphereGeometry args={[0.08, 16, 12]} />
        <meshStandardMaterial color="#1f2937" metalness={0.9} roughness={0.1} />
      </mesh>

      <mesh
        ref={beamRef}
        position={[0, 0.4, -2]}
        rotation={[0, 0, 0]}
        scale={[0.3, 0.3, 1]}
      >
        <coneGeometry args={[1, 4, 8, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>

      {camera.hasHumanDetection && (
        <pointLight position={[0, 0.5, 0]} color="#ef4444" intensity={1.5} distance={3} />
      )}

      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.3, 0.5, 32]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

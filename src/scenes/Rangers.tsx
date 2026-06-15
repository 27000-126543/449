import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRangerStore } from '@/store/useRangerStore';
import { Billboard, Text } from '@react-three/drei';

export default function Rangers() {
  const rangers = useRangerStore((state) => state.rangers);
  const selectRanger = useRangerStore((state) => state.selectRanger);
  const selectedRangerId = useRangerStore((state) => state.selectedRangerId);

  const patrolRangers = rangers.filter((r) => r.role === 'ranger');

  return (
    <group>
      {patrolRangers.map((ranger) => (
        <RangerMarker
          key={ranger.id}
          ranger={ranger}
          isSelected={selectedRangerId === ranger.id}
          onClick={() => selectRanger(ranger.id)}
        />
      ))}
    </group>
  );
}

interface RangerMarkerProps {
  ranger: ReturnType<typeof useRangerStore.getState>['rangers'][0];
  isSelected: boolean;
  onClick: () => void;
}

function RangerMarker({ ranger, isSelected, onClick }: RangerMarkerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    if (ranger.status === 'patrolling' && !ranger.inBlindZone) {
      const time = clock.getElapsedTime() * 0.5;
      const offset = parseInt(ranger.id.replace(/\D/g, '')) * 0.3;
      groupRef.current.position.x = ranger.position[0] + Math.sin(time + offset) * 1.5;
      groupRef.current.position.z = ranger.position[2] + Math.cos(time * 0.8 + offset) * 1;
    }

    if (ranger.inBlindZone) {
      const flash = Math.sin(clock.getElapsedTime() * 4) > 0;
      groupRef.current.visible = flash;
    } else {
      groupRef.current.visible = true;
    }
  });

  const bodyColor = ranger.inBlindZone ? '#f97316' : isSelected || hovered ? '#3b82f6' : '#22c55e';

  return (
    <group
      ref={groupRef}
      position={ranger.position}
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
      <mesh position={[0, 0.8, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.8, 4, 8]} />
        <meshStandardMaterial color={bodyColor} metalness={0.2} roughness={0.8} />
      </mesh>

      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.18, 16, 12]} />
        <meshStandardMaterial color="#fcd34d" metalness={0.1} roughness={0.9} />
      </mesh>

      <mesh position={[0, 1.85, 0]}>
        <cylinderGeometry args={[0.22, 0.25, 0.1, 8]} />
        <meshStandardMaterial color="#166534" />
      </mesh>

      <Billboard position={[0, 2.2, 0]}>
        <Text
          fontSize={0.15}
          color={bodyColor}
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.02}
          outlineColor="#000"
        >
          {ranger.name}
        </Text>
        <Text
          position={[0, -0.15, 0]}
          fontSize={0.1}
          color="#9ca3af"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.015}
          outlineColor="#000"
        >
          {ranger.shiftDuration.toFixed(1)}h
        </Text>
      </Billboard>

      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[0.5, 0.7, 32]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {ranger.inBlindZone && (
        <pointLight position={[0, 1, 0]} color="#f97316" intensity={1.5} distance={3} />
      )}
    </group>
  );
}

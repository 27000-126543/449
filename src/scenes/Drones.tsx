import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDroneStore } from '@/store/useDroneStore';

export default function Drones() {
  const drones = useDroneStore((state) => state.drones);
  const selectDrone = useDroneStore((state) => state.selectDrone);
  const selectedDroneId = useDroneStore((state) => state.selectedDroneId);

  return (
    <group>
      {drones.map((drone) => (
        <DroneMarker
          key={drone.id}
          drone={drone}
          isSelected={selectedDroneId === drone.id}
          onClick={() => selectDrone(drone.id)}
        />
      ))}
    </group>
  );
}

interface DroneMarkerProps {
  drone: ReturnType<typeof useDroneStore.getState>['drones'][0];
  isSelected: boolean;
  onClick: () => void;
}

function DroneMarker({ drone, isSelected, onClick }: DroneMarkerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const propellerRefs = useRef<THREE.Group[]>([]);
  const [hovered, setHovered] = useState(false);
  const routeIndexRef = useRef(drone.currentRouteIndex);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;

    propellerRefs.current.forEach((prop) => {
      if (prop) prop.rotation.y += delta * 20;
    });

    const bobY = Math.sin(clock.getElapsedTime() * 2) * 0.1;

    if (drone.status === 'patrolling' || drone.status === 'alert') {
      const route = drone.patrolRoute;
      if (route.length > 1) {
        const speed = drone.speed * 0.1;
        let index = routeIndexRef.current;
        const nextIndex = (index + 1) % route.length;
        const current = route[index];
        const next = route[nextIndex];
        const t = (clock.getElapsedTime() * speed) % 1;

        groupRef.current.position.x = current[0] + (next[0] - current[0]) * t;
        groupRef.current.position.y = current[1] + (next[1] - current[1]) * t + bobY;
        groupRef.current.position.z = current[2] + (next[2] - current[2]) * t;

        groupRef.current.rotation.y = Math.atan2(next[0] - current[0], next[2] - current[2]);

        if (t > 0.99) {
          routeIndexRef.current = nextIndex;
        }
      }
    } else {
      groupRef.current.position.x = drone.position[0];
      groupRef.current.position.y = drone.position[1] + bobY;
      groupRef.current.position.z = drone.position[2];
    }
  });

  const getColor = () => {
    if (drone.status === 'alert') return '#ef4444';
    if (drone.status === 'patrolling') return '#22c55e';
    if (drone.status === 'charging') return '#22d3ee';
    return '#6b7280';
  };

  const color = isSelected || hovered ? '#60a5fa' : getColor();

  return (
    <group
      ref={groupRef}
      position={drone.position}
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
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.5, 0.15, 0.5]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} emissive={color} emissiveIntensity={isSelected ? 0.4 : 0.1} />
      </mesh>

      {[[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]].map((pos, i) => (
        <group key={i} ref={(el) => { if (el) propellerRefs.current[i] = el; }} position={[pos[0], 0.1, pos[1]]}>
          <mesh>
            <boxGeometry args={[0.6, 0.02, 0.08]} />
            <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, -0.2, 0]}>
        <sphereGeometry args={[0.1, 16, 12]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} />
      </mesh>

      {drone.status === 'alert' && (
        <pointLight position={[0, 0, 0]} color="#ef4444" intensity={2} distance={5} />
      )}

      {isSelected && (
        <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.6, 32]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

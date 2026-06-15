import { useFrame } from '@react-three/fiber';
import { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useAnimalStore } from '@/store/useAnimalStore';

export default function Animals() {
  const animals = useAnimalStore((state) => state.animals);
  const selectAnimal = useAnimalStore((state) => state.selectAnimal);
  const selectedAnimalId = useAnimalStore((state) => state.selectedAnimalId);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    animals.forEach((animal, index) => {
      const child = groupRef.current?.children[index] as THREE.Group | undefined;
      if (!child) return;

      const speed = 0.5;
      const time = Date.now() * 0.001;
      const offset = index * 0.7;

      if (animal.status === 'normal' || animal.status === 'warning') {
        const newX = animal.position[0] + Math.sin(time * 0.3 + offset) * speed * delta;
        const newZ = animal.position[2] + Math.cos(time * 0.25 + offset) * speed * delta;

        child.position.x = newX;
        child.position.z = newZ;

        child.rotation.y = Math.atan2(
          Math.cos(time * 0.3 + offset) * speed,
          -Math.sin(time * 0.25 + offset) * speed
        );
      }

      const bobY = Math.sin(time * 2 + offset) * 0.05;
      child.position.y = animal.position[1] + bobY;
    });
  });

  const getAnimalColor = (species: string, status: string) => {
    if (status === 'danger' || status === 'lost') return '#ef4444';
    if (status === 'warning') return '#f59e0b';

    const colors: Record<string, string> = {
      tiger: '#f97316',
      elephant: '#9ca3af',
      panda: '#1f2937',
      deer: '#a16207',
      monkey: '#92400e',
      leopard: '#d97706',
    };
    return colors[species] || '#22c55e';
  };

  const getAnimalScale = (species: string) => {
    const scales: Record<string, number> = {
      tiger: 0.8,
      elephant: 1.2,
      panda: 0.7,
      deer: 0.6,
      monkey: 0.4,
      leopard: 0.7,
    };
    return scales[species] || 0.6;
  };

  return (
    <group ref={groupRef}>
      {animals.map((animal) => (
        <AnimalMarker
          key={animal.id}
          animal={animal}
          color={getAnimalColor(animal.species, animal.status)}
          scale={getAnimalScale(animal.species)}
          isSelected={selectedAnimalId === animal.id}
          onClick={() => selectAnimal(animal.id)}
        />
      ))}
    </group>
  );
}

interface AnimalMarkerProps {
  animal: ReturnType<typeof useAnimalStore.getState>['animals'][0];
  color: string;
  scale: number;
  isSelected: boolean;
  onClick: () => void;
}

function AnimalMarker({ animal, color, scale, isSelected, onClick }: AnimalMarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.1;
      ringRef.current.scale.set(scale, scale, scale);
    }
  });

  const displayColor = isSelected || hovered ? '#60a5fa' : color;

  return (
    <group
      position={animal.position}
      scale={scale}
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
      <mesh ref={meshRef} position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.6, 16, 12]} />
        <meshStandardMaterial
          color={displayColor}
          emissive={displayColor}
          emissiveIntensity={isSelected ? 0.5 : 0.2}
          metalness={0.3}
          roughness={0.5}
        />
      </mesh>

      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshBasicMaterial
          color={displayColor}
          transparent
          opacity={isSelected ? 0.6 : 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      <TrajectoryLine points={animal.trajectory} color={displayColor} />

      {isSelected && (
        <pointLight position={[0, 1, 0]} color={displayColor} intensity={1} distance={5} />
      )}
    </group>
  );
}

function TrajectoryLine({ points, color }: { points: [number, number, number][]; color: string }) {
  const lineRef = useRef<THREE.Line>(null);

  const lineGeometry = useMemo(() => {
    const positions = new Float32Array(points.length * 3);
    points.forEach((p, i) => {
      positions[i * 3] = p[0];
      positions[i * 3 + 1] = p[1] + 0.1;
      positions[i * 3 + 2] = p[2];
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.computeBoundingSphere();
    return geo;
  }, [points]);

  const lineMaterial = useMemo(
    () =>
      new THREE.LineDashedMaterial({
        color,
        dashSize: 0.5,
        gapSize: 0.3,
        transparent: true,
        opacity: 0.5,
      }),
    [color]
  );

  return <primitive object={new THREE.Line(lineGeometry, lineMaterial)} ref={lineRef} />;
}

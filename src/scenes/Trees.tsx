import { useMemo } from 'react';
import * as THREE from 'three';

interface TreesProps {
  count?: number;
  areaSize?: number;
}

export default function Trees({ count = 200, areaSize = 80 }: TreesProps) {
  const treeData = useMemo(() => {
    const trees: { position: [number, number, number]; scale: number; type: number }[] = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * areaSize;
      const z = (Math.random() - 0.5) * areaSize;

      const distFromCenter = Math.sqrt(x * x + z * z);
      if (distFromCenter < 8) continue;
      if (Math.abs(x - 20) < 5 && Math.abs(z + 10) < 5) continue;

      const height =
        Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2 +
        Math.sin(x * 0.02 + 1) * Math.cos(z * 0.03 + 2) * 3;

      const scale = 0.5 + Math.random() * 1.5;
      const type = Math.floor(Math.random() * 3);

      trees.push({ position: [x, height, z], scale, type });
    }
    return trees;
  }, [count, areaSize]);

  const trunkGeometry = useMemo(
    () => new THREE.CylinderGeometry(0.1, 0.15, 1, 6),
    []
  );
  const trunkMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 }),
    []
  );

  const foliageGeometries = useMemo(
    () => [
      new THREE.ConeGeometry(0.8, 1.5, 6),
      new THREE.SphereGeometry(0.7, 8, 6),
      new THREE.ConeGeometry(0.6, 2, 5),
    ],
    []
  );
  const foliageMaterials = useMemo(
    () => [
      new THREE.MeshStandardMaterial({ color: 0x1a4d2e, roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0x2d5a3f, roughness: 0.85 }),
      new THREE.MeshStandardMaterial({ color: 0x234d2e, roughness: 0.75 }),
    ],
    []
  );

  return (
    <group>
      {treeData.map((tree, i) => (
        <group key={i} position={tree.position} scale={tree.scale}>
          <mesh
            geometry={trunkGeometry}
            material={trunkMaterial}
            position={[0, 0.5, 0]}
            castShadow
          />
          <mesh
            geometry={foliageGeometries[tree.type]}
            material={foliageMaterials[tree.type]}
            position={[0, 1.5, 0]}
            castShadow
          />
        </group>
      ))}
    </group>
  );
}

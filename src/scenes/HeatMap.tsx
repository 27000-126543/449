import { useMemo } from 'react';
import * as THREE from 'three';
import { heatMapPoints } from '@/data/heatmap';

interface HeatMapProps {
  visible?: boolean;
}

export default function HeatMap({ visible = true }: HeatMapProps) {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];

    const gridSize = 4;
    const halfSize = 40;

    for (let x = -halfSize; x < halfSize; x += gridSize) {
      for (let z = -halfSize; z < halfSize; z += gridSize) {
        const point = heatMapPoints.find(
          (p) =>
            Math.abs(p.position[0] - x - gridSize / 2) < 2 &&
            Math.abs(p.position[2] - z - gridSize / 2) < 2
        );
        const intensity = point?.intensity || 0;
        const riskLevel = point?.riskLevel || 'green';

        let color: THREE.Color;
        if (riskLevel === 'red') {
          color = new THREE.Color(0xef4444);
        } else if (riskLevel === 'yellow') {
          color = new THREE.Color(0xfbbf24);
        } else {
          color = new THREE.Color(0x22c55e);
        }

        const x0 = x;
        const x1 = x + gridSize;
        const z0 = z;
        const z1 = z + gridSize;
        const y = 0.03;

        positions.push(x0, y, z0, x1, y, z0, x1, y, z1, x0, y, z0, x1, y, z1, x0, y, z1);

        const alpha = intensity * 0.7;
        for (let i = 0; i < 6; i++) {
          colors.push(color.r, color.g, color.b);
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    return geo;
  }, []);

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      }),
    []
  );

  if (!visible) return null;

  return <mesh geometry={geometry} material={material} />;
}

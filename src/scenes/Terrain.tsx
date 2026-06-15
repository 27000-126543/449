import { useRef, useMemo } from 'react';
import * as THREE from 'three';

interface TerrainProps {
  size?: number;
  segments?: number;
}

export default function Terrain({ size = 100, segments = 50 }: TerrainProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const positions = geo.attributes.position;
    const colors: number[] = [];

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);

      let height = 0;
      height += Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2;
      height += Math.sin(x * 0.02 + 1) * Math.cos(z * 0.03 + 2) * 3;
      height += Math.sin(x * 0.1) * 0.5;
      height += Math.cos(z * 0.08) * 0.8;

      const distFromCenter = Math.sqrt(x * x + z * z);
      if (distFromCenter > size * 0.4) {
        height -= (distFromCenter - size * 0.4) * 0.05;
      }

      positions.setY(i, height);

      const normalizedHeight = (height + 3) / 8;
      let r, g, b;
      if (normalizedHeight < 0.3) {
        r = 0.1; g = 0.3; b = 0.1;
      } else if (normalizedHeight < 0.6) {
        r = 0.15; g = 0.4; b = 0.15;
      } else {
        r = 0.3; g = 0.35; b = 0.3;
      }
      colors.push(r, g, b);
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    return geo;
  }, [size, segments]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.9,
        metalness: 0.1,
        side: THREE.DoubleSide,
      }),
    []
  );

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} receiveShadow />
  );
}

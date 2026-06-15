import { useRef, useMemo } from 'react';
import * as THREE from 'three';

interface PatrolPathsProps {
  paths?: { points: [number, number, number][]; color?: string }[];
}

export default function PatrolPaths({ paths }: PatrolPathsProps) {
  const defaultPaths = useMemo(() => {
    return [
      {
        points: generatePath([
          [-35, 0, -20],
          [-20, 0, -10],
          [0, 0, -5],
          [20, 0, -15],
          [35, 0, -25],
        ]),
        color: 0x8b7355,
      },
      {
        points: generatePath([
          [-30, 0, 25],
          [-15, 0, 15],
          [-5, 0, 5],
          [10, 0, 10],
          [30, 0, 20],
        ]),
        color: 0x8b7355,
      },
      {
        points: generatePath([
          [-25, 0, -30],
          [-10, 0, -20],
          [5, 0, -15],
          [15, 0, -25],
        ]),
        color: 0x8b7355,
      },
    ];
  }, []);

  const displayPaths = paths || defaultPaths;

  return (
    <group>
      {displayPaths.map((path, i) => (
        <PathLine key={i} points={path.points} color={path.color} />
      ))}
    </group>
  );
}

function PathLine({
  points,
  color = 0x8b7355,
}: {
  points: [number, number, number][];
  color?: number;
}) {
  const lineRef = useRef<THREE.Line>(null);

  const lineGeometry = useMemo(() => {
    const positions = new Float32Array(points.length * 3);
    points.forEach((p, i) => {
      positions[i * 3] = p[0];
      positions[i * 3 + 1] = p[1] + 0.02;
      positions[i * 3 + 2] = p[2];
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.computeBoundingSphere();
    return geo;
  }, [points]);

  const lineMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.8,
      }),
    [color]
  );

  return <primitive object={new THREE.Line(lineGeometry, lineMaterial)} ref={lineRef} />;
}

function generatePath(
  controlPoints: [number, number, number][]
): [number, number, number][] {
  const path: [number, number, number][] = [];
  const segments = 20;

  for (let i = 0; i < controlPoints.length - 1; i++) {
    const start = controlPoints[i];
    const end = controlPoints[i + 1];
    for (let j = 0; j < segments; j++) {
      const t = j / segments;
      const x = start[0] + (end[0] - start[0]) * t + Math.sin(t * Math.PI) * 2;
      const z = start[2] + (end[2] - start[2]) * t + Math.sin(t * Math.PI * 1.5) * 1;
      const y = 0;
      path.push([x, y, z]);
    }
  }
  path.push(controlPoints[controlPoints.length - 1]);
  return path;
}

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAlertStore } from '@/store/useAlertStore';
import { useWorkOrderStore } from '@/store/useWorkOrderStore';
import { useApprovalStore } from '@/store/useApprovalStore';
import type { Position } from '@/types';

interface PathLinesProps {
  rescueRoute?: Position[] | null;
}

export default function PathLines({ rescueRoute = null }: PathLinesProps) {
  const alerts = useAlertStore((state) => state.alerts);
  const workOrders = useWorkOrderStore((state) => state.workOrders);
  const approvals = useApprovalStore((state) => state.approvals);

  const searchPathAlerts = alerts.filter((a) => a.searchPath && a.searchPath.length > 1);
  const pathWorkOrders = workOrders.filter((wo) => wo.routePath && wo.routePath.length > 1);
  const approvedApprovals = approvals.filter((a) => a.status === 'approved' && a.chasePath && a.chasePath.length > 1);

  return (
    <group>
      {searchPathAlerts.map((alert) => (
        <PathLine
          key={`search-${alert.id}`}
          points={alert.searchPath as Position[]}
          color="#3b82f6"
          lineWidth={1}
        />
      ))}

      {pathWorkOrders.map((wo) => (
        <PathLine
          key={`wo-${wo.id}`}
          points={wo.routePath as Position[]}
          color="#22c55e"
          lineWidth={1}
        />
      ))}

      {approvedApprovals.map((approval) => (
        <PathLine
          key={`chase-${approval.id}`}
          points={approval.chasePath as Position[]}
          color="#ef4444"
          lineWidth={1.5}
        />
      ))}

      {rescueRoute && rescueRoute.length > 1 && (
        <PathLine
          points={rescueRoute}
          color="#3b82f6"
          lineWidth={2.5}
          glow={true}
        />
      )}
    </group>
  );
}

interface PathLineProps {
  points: Position[];
  color: string;
  lineWidth?: number;
  glow?: boolean;
}

function PathLine({ points, color, lineWidth = 1, glow = false }: PathLineProps) {
  const lineRef = useRef<THREE.Line>(null);
  const offsetRef = useRef(0);
  const glowLineRef = useRef<THREE.Line>(null);

  const lineObject = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(points.length * 3);
    points.forEach((p, i) => {
      positions[i * 3] = p[0];
      positions[i * 3 + 1] = p[1] + 0.3;
      positions[i * 3 + 2] = p[2];
    });
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.LineDashedMaterial({
      color: new THREE.Color(color),
      dashSize: 1,
      gapSize: 0.5,
      linewidth: lineWidth,
      transparent: true,
      opacity: glow ? 1 : 0.8,
    });

    return new THREE.Line(geometry, material);
  }, [points, color, lineWidth, glow]);

  const glowLineObject = useMemo(() => {
    if (!glow) return null;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(points.length * 3);
    points.forEach((p, i) => {
      positions[i * 3] = p[0];
      positions[i * 3 + 1] = p[1] + 0.2;
      positions[i * 3 + 2] = p[2];
    });
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      linewidth: lineWidth * 3,
      transparent: true,
      opacity: 0.2,
    });

    return new THREE.Line(geometry, material);
  }, [points, color, lineWidth, glow]);

  useEffect(() => {
    if (lineObject) {
      lineObject.computeLineDistances();
    }
  }, [lineObject]);

  useFrame((_, delta) => {
    if (lineRef.current) {
      offsetRef.current += delta * (glow ? 3 : 2);
      const mat = lineRef.current.material as THREE.LineDashedMaterial;
      mat.dashSize = 1;
      mat.gapSize = 0.5;

      const distances = lineRef.current.geometry.attributes.lineDistance as THREE.BufferAttribute;
      if (distances && distances.count > 0) {
        const arr = distances.array as unknown as number[];
        const totalLength = arr[arr.length - 1];
        (mat as any).dashOffset = -(offsetRef.current % totalLength);
      }
    }
  });

  if (points.length < 2) return null;

  return (
    <group>
      <primitive object={lineObject} ref={lineRef} />
      {glowLineObject && <primitive object={glowLineObject} ref={glowLineRef} />}
    </group>
  );
}

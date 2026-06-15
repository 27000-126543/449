import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Position } from '@/types';
import { useAlertStore } from '@/store/useAlertStore';
import { useWorkOrderStore } from '@/store/useWorkOrderStore';
import { useApprovalStore } from '@/store/useApprovalStore';

export default function PathLines() {
  const alerts = useAlertStore((state) => state.alerts);
  const workOrders = useWorkOrderStore((state) => state.workOrders);
  const approvals = useApprovalStore((state) => state.approvals);

  const activeAlerts = alerts.filter(
    (a) => (a.status === 'pending' || a.status === 'processing') && a.searchPath.length > 0
  );

  const activeOrders = workOrders.filter(
    (wo) =>
      (wo.status === 'assigned' || wo.status === 'in_progress') && wo.routePath.length > 0
  );

  const activeApprovals = approvals.filter(
    (a) => a.status === 'approved' && a.chasePath && a.chasePath.length > 0
  );

  return (
    <group>
      {activeAlerts.map((alert) => (
        <AnimatedPath
          key={`alert-${alert.id}`}
          points={alert.searchPath}
          color="#3b82f6"
        />
      ))}

      {activeOrders.map((order) => (
        <AnimatedPath
          key={`order-${order.id}`}
          points={order.routePath}
          color="#22c55e"
        />
      ))}

      {activeApprovals.map((approval) => (
        <AnimatedPath
          key={`approval-${approval.id}`}
          points={approval.chasePath || []}
          color="#ef4444"
        />
      ))}
    </group>
  );
}

interface AnimatedPathProps {
  points: Position[];
  color: string;
}

function AnimatedPath({ points, color }: AnimatedPathProps) {
  const lineRef = useRef<THREE.Line>(null);
  const offsetRef = useRef(0);

  const geometry = useMemo(() => {
    if (points.length < 2) return new THREE.BufferGeometry();

    const curvePoints = points.map(
      (p) => new THREE.Vector3(p[0], p[1] + 0.1, p[2])
    );
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const sampledPoints = curve.getPoints(100);
    const geo = new THREE.BufferGeometry().setFromPoints(sampledPoints);
    geo.computeBoundingSphere();
    return geo;
  }, [points]);

  const material = useMemo(
    () =>
      new THREE.LineDashedMaterial({
        color,
        dashSize: 1,
        gapSize: 0.5,
        transparent: true,
        opacity: 0.8,
      }),
    [color]
  );

  const lineObject = useMemo(() => {
    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    return line;
  }, [geometry, material]);

  useEffect(() => {
    if (lineObject) {
      lineObject.computeLineDistances();
    }
  }, [lineObject]);

  useFrame((_, delta) => {
    if (lineRef.current) {
      offsetRef.current += delta * 2;
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

  return <primitive object={lineObject} ref={lineRef} />;
}

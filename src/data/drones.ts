import type { Drone, Position } from '@/types';

const generatePatrolRoute = (center: Position, radius: number = 15): Position[] => {
  const route: Position[] = [];
  const points = 8;
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const x = center[0] + Math.cos(angle) * radius;
    const z = center[2] + Math.sin(angle) * radius;
    route.push([x, 8 + Math.sin(angle * 2) * 0.5, z]);
  }
  return route;
};

export const mockDrones: Drone[] = [
  {
    id: 'DRONE001',
    name: '无人机-巡鹰1号',
    position: [10, 10, 5],
    status: 'patrolling',
    battery: 78,
    patrolRoute: generatePatrolRoute([15, 10, 10]),
    currentRouteIndex: 3,
    speed: 12,
    altitude: 10,
  },
  {
    id: 'DRONE002',
    name: '无人机-巡鹰2号',
    position: [-12, 8, -8],
    status: 'patrolling',
    battery: 65,
    patrolRoute: generatePatrolRoute([-15, 8, -10]),
    currentRouteIndex: 5,
    speed: 10,
    altitude: 8,
  },
  {
    id: 'DRONE003',
    name: '无人机-猎豹1号',
    position: [0, 2, 0],
    status: 'charging',
    battery: 45,
    patrolRoute: generatePatrolRoute([0, 10, 0], 20),
    currentRouteIndex: 0,
    speed: 15,
    altitude: 2,
  },
  {
    id: 'DRONE004',
    name: '无人机-预警1号',
    position: [25, 12, -15],
    status: 'alert',
    battery: 82,
    patrolRoute: generatePatrolRoute([25, 12, -15], 8),
    currentRouteIndex: 1,
    speed: 8,
    altitude: 12,
  },
];

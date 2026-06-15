import type { WorkOrder, Position } from '@/types';

const generateRoutePath = (start: Position, end: Position): Position[] => {
  const path: Position[] = [];
  const steps = 12;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = start[0] + (end[0] - start[0]) * t;
    const z = start[2] + (end[2] - start[2]) * t + Math.sin(t * Math.PI * 2) * 1.5;
    path.push([x, 0.1, z]);
  }
  return path;
};

export const mockWorkOrders: WorkOrder[] = [
  {
    id: 'WO001',
    type: 'trap_destruction',
    position: [18, 0.2, -10],
    droneId: 'DRONE001',
    assignedRangerId: 'R001',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 90 * 60 * 1000),
    routePath: generateRoutePath([12, 0.1, 8], [18, 0.2, -10]),
    description: '无人机发现钢丝套陷阱，需立即销毁',
    priority: 'high',
  },
  {
    id: 'WO002',
    type: 'trap_destruction',
    position: [-22, 0.2, 8],
    droneId: 'DRONE002',
    status: 'pending',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    routePath: [],
    description: '西区发现疑似兽夹，待指派巡护队处理',
    priority: 'medium',
  },
  {
    id: 'WO003',
    type: 'rescue',
    position: [-20, 0.6, 15],
    assignedRangerId: 'R002',
    status: 'assigned',
    createdAt: new Date(Date.now() - 20 * 60 * 1000),
    routePath: generateRoutePath([-8, 0.1, -12], [-20, 0.6, 15]),
    description: '大熊猫异常静止，前往查看并评估伤情',
    priority: 'high',
  },
  {
    id: 'WO004',
    type: 'investigation',
    position: [28, 0.3, -5],
    assignedRangerId: 'R003',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 10 * 60 * 1000),
    routePath: generateRoutePath([22, 0.1, -18], [28, 0.3, -5]),
    description: '红外相机拍到人形轮廓，前往核实调查',
    priority: 'critical',
  },
  {
    id: 'WO005',
    type: 'patrol',
    position: [0, 0.1, 0],
    status: 'completed',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    routePath: [],
    description: '日常巡护任务-北区',
    priority: 'low',
  },
];

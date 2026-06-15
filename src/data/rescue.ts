import type { RescueStation, Rescue, Approval, Position } from '@/types';

export const mockRescueStations: RescueStation[] = [
  {
    id: 'RS001',
    name: '东区救助站',
    position: [30, 0.5, 15],
    capacity: 10,
    staffCount: 5,
    equipment: ['急救箱', '担架', '运输车', '恒温箱'],
  },
  {
    id: 'RS002',
    name: '西区救助站',
    position: [-30, 0.5, -15],
    capacity: 8,
    staffCount: 4,
    equipment: ['急救箱', '担架', '运输车'],
  },
  {
    id: 'RS003',
    name: '核心区救助中心',
    position: [0, 0.8, 0],
    capacity: 20,
    staffCount: 12,
    equipment: ['手术室', 'ICU', '急救箱', '担架', '运输车', '恒温箱', '检测设备'],
  },
];

const generateRescueRoute = (start: Position, end: Position): Position[] => {
  const path: Position[] = [];
  const steps = 15;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = start[0] + (end[0] - start[0]) * t;
    const z = start[2] + (end[2] - start[2]) * t + Math.sin(t * Math.PI) * 2;
    path.push([x, 0.1, z]);
  }
  return path;
};

export const mockRescues: Rescue[] = [
  {
    id: 'RES001',
    animalId: 'A005',
    injuryType: '疑似骨折',
    severity: 'severe',
    stationId: 'RS003',
    route: generateRescueRoute([-20, 0.6, 15], [0, 0.8, 0]),
    status: 'approved',
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    vetSignoff: true,
    caretakerSignoff: true,
    directorSignoff: true,
  },
  {
    id: 'RES002',
    animalId: 'A003',
    injuryType: '皮肤擦伤',
    severity: 'mild',
    stationId: 'RS001',
    route: generateRescueRoute([25, 1.5, -20], [30, 0.5, 15]),
    status: 'reported',
    createdAt: new Date(Date.now() - 50 * 60 * 1000),
  },
];

export const mockApprovals: Approval[] = [
  {
    id: 'APP001',
    type: 'poaching',
    targetId: 'ALT003',
    status: 'pending_level1',
    createdAt: new Date(Date.now() - 8 * 60 * 1000),
    description: '东区偷猎事件追捕方案审批',
    chasePath: generateRescueRoute([22, 0.1, -18], [28, 0.3, -5]),
  },
  {
    id: 'APP002',
    type: 'rescue',
    targetId: 'RES001',
    status: 'approved',
    level1By: '王兽医',
    level1Comment: '伤情严重，同意紧急救助',
    level1At: new Date(Date.now() - 12 * 60 * 1000),
    level2By: '李保育员',
    level2Comment: '救助站已做好接收准备',
    level2At: new Date(Date.now() - 10 * 60 * 1000),
    level3By: '陈主任',
    level3Comment: '同意，确保运输安全',
    level3At: new Date(Date.now() - 8 * 60 * 1000),
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    description: '大熊猫-001救助方案三级会签',
  },
  {
    id: 'APP003',
    type: 'drone_deployment',
    targetId: 'DRONE004',
    status: 'pending_level2',
    level1By: '张伟',
    level1Comment: '风险等级高，建议无人机加强巡航',
    level1At: new Date(Date.now() - 30 * 60 * 1000),
    createdAt: new Date(Date.now() - 35 * 60 * 1000),
    description: '南区无人机应急调度审批',
  },
];

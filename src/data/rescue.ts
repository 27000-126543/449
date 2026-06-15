import type { RescueStation, Rescue, Approval, Position } from '@/types';

export const mockRescueStations: RescueStation[] = [
  {
    id: 'RS001',
    name: '东区救助站',
    position: [30, 0.5, 15],
    capacity: 10,
    staffCount: 5,
    equipment: ['急救箱', '担架', '运输车', '恒温箱'],
    vehicles: [
      { id: 'V001', name: '急救车-01', type: 'ambulance', status: 'available', plate: '粤B-A1234' },
      { id: 'V002', name: '巡逻SUV', type: 'suv', status: 'in_use', plate: '粤B-B5678' },
    ],
    staff: [
      { id: 'S001', name: '王兽医', role: 'vet', phone: '138****1001' },
      { id: 'S002', name: '李保育员', role: 'caretaker', phone: '138****1002' },
      { id: 'S003', name: '赵司机', role: 'driver', phone: '138****1003' },
    ],
  },
  {
    id: 'RS002',
    name: '西区救助站',
    position: [-30, 0.5, -15],
    capacity: 8,
    staffCount: 4,
    equipment: ['急救箱', '担架', '运输车'],
    vehicles: [
      { id: 'V003', name: '急救车-02', type: 'ambulance', status: 'available', plate: '粤B-C2345' },
    ],
    staff: [
      { id: 'S004', name: '张兽医', role: 'vet', phone: '138****2001' },
      { id: 'S005', name: '刘保育员', role: 'caretaker', phone: '138****2002' },
    ],
  },
  {
    id: 'RS003',
    name: '核心区救助中心',
    position: [0, 0.8, 0],
    capacity: 20,
    staffCount: 12,
    equipment: ['手术室', 'ICU', '急救箱', '担架', '运输车', '恒温箱', '检测设备'],
    vehicles: [
      { id: 'V004', name: '急救车-03', type: 'ambulance', status: 'available', plate: '粤B-D3456' },
      { id: 'V005', name: '急救车-04', type: 'ambulance', status: 'maintenance', plate: '粤B-E7890' },
      { id: 'V006', name: '运输车', type: 'truck', status: 'available', plate: '粤B-F0123' },
    ],
    staff: [
      { id: 'S006', name: '陈主任', role: 'director', phone: '138****3001' },
      { id: 'S007', name: '周兽医', role: 'vet', phone: '138****3002' },
      { id: 'S008', name: '吴兽医', role: 'vet', phone: '138****3003' },
      { id: 'S009', name: '郑保育员', role: 'caretaker', phone: '138****3004' },
      { id: 'S010', name: '孙司机', role: 'driver', phone: '138****3005' },
    ],
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

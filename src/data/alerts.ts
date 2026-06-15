import type { Alert, Position } from '@/types';

const generateSearchPath = (start: Position, end: Position): Position[] => {
  const path: Position[] = [];
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = start[0] + (end[0] - start[0]) * t + Math.sin(t * Math.PI) * 3;
    const z = start[2] + (end[2] - start[2]) * t + Math.sin(t * Math.PI * 1.5) * 2;
    path.push([x, 0.1, z]);
  }
  return path;
};

export const mockAlerts: Alert[] = [
  {
    id: 'ALT001',
    type: 'stationary',
    animalId: 'A005',
    position: [-20, 0.6, 15],
    level: 'high',
    timestamp: new Date(Date.now() - 18 * 60 * 1000),
    status: 'processing',
    assignedRangerId: 'R002',
    searchPath: generateSearchPath([-8, 0.1, -12], [-20, 0.6, 15]),
    description: '大熊猫-001异常静止超过18分钟，可能受伤或被困',
  },
  {
    id: 'ALT002',
    type: 'lost_signal',
    animalId: 'A008',
    position: [8, 0.4, 28],
    level: 'critical',
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    status: 'pending',
    searchPath: generateSearchPath([12, 0.1, 8], [8, 0.4, 28]),
    description: '梅花鹿-002定位信号丢失超过25分钟',
  },
  {
    id: 'ALT003',
    type: 'poaching',
    cameraId: 'CAM002',
    position: [28, 0.3, -5],
    level: 'critical',
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    status: 'pending',
    searchPath: generateSearchPath([22, 0.1, -18], [28, 0.3, -5]),
    description: '红外相机CAM002检测到人形轮廓，疑似偷猎者闯入',
  },
  {
    id: 'ALT004',
    type: 'intrusion',
    cameraId: 'CAM002',
    position: [26, 0.3, -3],
    level: 'high',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    status: 'pending',
    searchPath: [],
    description: '东区边境检测到异常入侵目标',
  },
  {
    id: 'ALT005',
    type: 'injury',
    animalId: 'A003',
    position: [25, 1.5, -20],
    level: 'medium',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    status: 'resolved',
    assignedRangerId: 'R001',
    searchPath: [],
    description: '亚洲象-001心率异常，疑似轻伤，已确认无碍',
  },
];

import type { Ranger, Position } from '@/types';

const generateRangerTrajectory = (start: Position, points: number = 15): Position[] => {
  const trajectory: Position[] = [start];
  let [x, y, z] = start;
  for (let i = 0; i < points; i++) {
    x += (Math.random() - 0.5) * 2;
    z += (Math.random() - 0.5) * 2;
    trajectory.push([x, y, z]);
  }
  return trajectory;
};

export const mockRangers: Ranger[] = [
  {
    id: 'R001',
    name: '张伟',
    role: 'ranger',
    position: [12, 0.1, 8],
    shiftDuration: 4.5,
    inBlindZone: false,
    blindZoneTime: 0,
    trajectory: generateRangerTrajectory([12, 0.1, 8]),
    status: 'patrolling',
  },
  {
    id: 'R002',
    name: '李芳',
    role: 'ranger',
    position: [-8, 0.1, -12],
    shiftDuration: 3.2,
    inBlindZone: false,
    blindZoneTime: 0,
    trajectory: generateRangerTrajectory([-8, 0.1, -12]),
    status: 'patrolling',
  },
  {
    id: 'R003',
    name: '王强',
    role: 'ranger',
    position: [22, 0.1, -18],
    shiftDuration: 5.8,
    inBlindZone: true,
    blindZoneTime: 35,
    trajectory: generateRangerTrajectory([22, 0.1, -18]),
    status: 'patrolling',
  },
  {
    id: 'R004',
    name: '赵敏',
    role: 'ranger',
    position: [-18, 0.1, 10],
    shiftDuration: 2.1,
    inBlindZone: false,
    blindZoneTime: 0,
    trajectory: generateRangerTrajectory([-18, 0.1, 10]),
    status: 'resting',
  },
  {
    id: 'D001',
    name: '陈主任',
    role: 'director',
    position: [0, 0.5, 0],
    shiftDuration: 6.0,
    inBlindZone: false,
    blindZoneTime: 0,
    trajectory: [[0, 0.5, 0]],
    status: 'on_duty',
  },
  {
    id: 'B001',
    name: '刘局长',
    role: 'bureau',
    position: [0, 0.5, 0],
    shiftDuration: 3.0,
    inBlindZone: false,
    blindZoneTime: 0,
    trajectory: [[0, 0.5, 0]],
    status: 'on_duty',
  },
];

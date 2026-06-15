import type { Camera, CaptureRecord } from '@/types';

const generateCaptures = (count: number, hasHuman: boolean): CaptureRecord[] => {
  const captures: CaptureRecord[] = [];
  for (let i = 0; i < count; i++) {
    captures.push({
      id: `C${Date.now()}-${i}`,
      timestamp: new Date(Date.now() - i * 3600 * 1000 * Math.random()),
      imageUrl: '',
      hasHuman: hasHuman && i === 0,
      confidence: hasHuman && i === 0 ? 0.92 : 0.1,
      animalSpecies: i > 0 ? ['deer', 'monkey', 'tiger'][i % 3] : undefined,
    });
  }
  return captures;
};

export const mockCameras: Camera[] = [
  {
    id: 'CAM001',
    name: '红外相机-东区01',
    position: [20, 0.3, 10],
    battery: 85,
    storage: 62,
    captures: generateCaptures(15, false),
    hasHumanDetection: false,
    status: 'online',
  },
  {
    id: 'CAM002',
    name: '红外相机-东区02',
    position: [28, 0.3, -5],
    battery: 45,
    storage: 78,
    captures: generateCaptures(12, true),
    hasHumanDetection: true,
    status: 'online',
  },
  {
    id: 'CAM003',
    name: '红外相机-西区01',
    position: [-25, 0.3, 5],
    battery: 92,
    storage: 35,
    captures: generateCaptures(20, false),
    hasHumanDetection: false,
    status: 'online',
  },
  {
    id: 'CAM004',
    name: '红外相机-西区02',
    position: [-15, 0.3, -22],
    battery: 15,
    storage: 90,
    captures: generateCaptures(8, false),
    hasHumanDetection: false,
    status: 'low_battery',
  },
  {
    id: 'CAM005',
    name: '红外相机-南区01',
    position: [10, 0.3, -28],
    battery: 68,
    storage: 55,
    captures: generateCaptures(18, false),
    hasHumanDetection: false,
    status: 'online',
  },
  {
    id: 'CAM006',
    name: '红外相机-北区01',
    position: [-5, 0.3, 25],
    battery: 75,
    storage: 42,
    captures: generateCaptures(10, false),
    hasHumanDetection: false,
    status: 'online',
  },
  {
    id: 'CAM007',
    name: '红外相机-核心区01',
    position: [0, 0.5, 0],
    battery: 98,
    storage: 28,
    captures: generateCaptures(25, false),
    hasHumanDetection: false,
    status: 'online',
  },
  {
    id: 'CAM008',
    name: '红外相机-边境01',
    position: [35, 0.3, 20],
    battery: 0,
    storage: 0,
    captures: [],
    hasHumanDetection: false,
    status: 'offline',
  },
];

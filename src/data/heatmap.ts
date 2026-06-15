import type { Position, HeatMapPoint } from '@/types';

export const generateHeatMapData = (): HeatMapPoint[] => {
  const points: HeatMapPoint[] = [];
  const hotspots: Position[] = [
    [28, 0, -8],
    [-25, 0, 10],
    [15, 0, 25],
    [-10, 0, -20],
    [30, 0, 15],
  ];

  for (let x = -40; x <= 40; x += 4) {
    for (let z = -40; z <= 40; z += 4) {
      let intensity = 0;
      hotspots.forEach((hs) => {
        const dx = x - hs[0];
        const dz = z - hs[2];
        const dist = Math.sqrt(dx * dx + dz * dz);
        intensity += Math.exp(-dist * dist / 50) * 0.8;
      });
      intensity += Math.random() * 0.1;
      intensity = Math.min(1, intensity);

      let riskLevel: 'green' | 'yellow' | 'red' = 'green';
      if (intensity > 0.7) riskLevel = 'red';
      else if (intensity > 0.3) riskLevel = 'yellow';

      points.push({
        position: [x, 0.05, z],
        intensity,
        riskLevel,
      });
    }
  }
  return points;
};

export const heatMapPoints = generateHeatMapData();

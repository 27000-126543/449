import { create } from 'zustand';
import type { Ranger, Position } from '@/types';
import { mockRangers } from '@/data/rangers';

interface RangerState {
  rangers: Ranger[];
  selectedRangerId: string | null;
  getRangerById: (id: string) => Ranger | undefined;
  selectRanger: (id: string | null) => void;
  updateRangerPosition: (id: string, position: Position) => void;
  updateRangerStatus: (id: string, status: Ranger['status']) => void;
  setBlindZone: (id: string, inBlindZone: boolean, blindZoneTime: number) => void;
  getOnDutyRangers: () => Ranger[];
  getNearestRanger: (position: Position) => Ranger | undefined;
}

const calculateDistance = (p1: Position, p2: Position): number => {
  const dx = p1[0] - p2[0];
  const dz = p1[2] - p2[2];
  return Math.sqrt(dx * dx + dz * dz);
};

export const useRangerStore = create<RangerState>((set, get) => ({
  rangers: mockRangers,
  selectedRangerId: null,

  getRangerById: (id) => get().rangers.find((r) => r.id === id),

  selectRanger: (id) => set({ selectedRangerId: id }),

  updateRangerPosition: (id, position) =>
    set((state) => ({
      rangers: state.rangers.map((r) =>
        r.id === id
          ? {
              ...r,
              position,
              trajectory: [...r.trajectory.slice(-29), position],
            }
          : r
      ),
    })),

  updateRangerStatus: (id, status) =>
    set((state) => ({
      rangers: state.rangers.map((r) => (r.id === id ? { ...r, status } : r)),
    })),

  setBlindZone: (id, inBlindZone, blindZoneTime) =>
    set((state) => ({
      rangers: state.rangers.map((r) =>
        r.id === id ? { ...r, inBlindZone, blindZoneTime } : r
      ),
    })),

  getOnDutyRangers: () => get().rangers.filter((r) => r.status !== 'off_duty'),

  getNearestRanger: (position) => {
    const onDuty = get().getOnDutyRangers().filter((r) => r.role === 'ranger');
    if (onDuty.length === 0) return undefined;
    return onDuty.reduce((nearest, ranger) => {
      const dist = calculateDistance(position, ranger.position);
      const nearestDist = calculateDistance(position, nearest.position);
      return dist < nearestDist ? ranger : nearest;
    });
  },
}));

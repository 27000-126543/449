import { create } from 'zustand';
import type { Drone, Position } from '@/types';
import { mockDrones } from '@/data/drones';

interface DroneState {
  drones: Drone[];
  selectedDroneId: string | null;
  getDroneById: (id: string) => Drone | undefined;
  selectDrone: (id: string | null) => void;
  updateDronePosition: (id: string, position: Position) => void;
  updateDroneStatus: (id: string, status: Drone['status']) => void;
  updateDroneBattery: (id: string, battery: number) => void;
  dispatchDroneToPosition: (droneId: string, target: Position) => void;
  setPatrolRoute: (droneId: string, route: Position[]) => void;
  getIdleDrones: () => Drone[];
}

export const useDroneStore = create<DroneState>((set, get) => ({
  drones: mockDrones,
  selectedDroneId: null,

  getDroneById: (id) => get().drones.find((d) => d.id === id),

  selectDrone: (id) => set({ selectedDroneId: id }),

  updateDronePosition: (id, position) =>
    set((state) => ({
      drones: state.drones.map((d) => (d.id === id ? { ...d, position } : d)),
    })),

  updateDroneStatus: (id, status) =>
    set((state) => ({
      drones: state.drones.map((d) => (d.id === id ? { ...d, status } : d)),
    })),

  updateDroneBattery: (id, battery) =>
    set((state) => ({
      drones: state.drones.map((d) => (d.id === id ? { ...d, battery } : d)),
    })),

  dispatchDroneToPosition: (droneId, target) => {
    const drone = get().getDroneById(droneId);
    if (!drone) return;
    const route: Position[] = [];
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = drone.position[0] + (target[0] - drone.position[0]) * t;
      const z = drone.position[2] + (target[2] - drone.position[2]) * t;
      const y = 10 + Math.sin(t * Math.PI) * 5;
      route.push([x, y, z]);
    }
    set((state) => ({
      drones: state.drones.map((d) =>
        d.id === droneId
          ? { ...d, status: 'alert', patrolRoute: route, currentRouteIndex: 0 }
          : d
      ),
    }));
  },

  setPatrolRoute: (droneId, route) =>
    set((state) => ({
      drones: state.drones.map((d) =>
        d.id === droneId ? { ...d, patrolRoute: route, currentRouteIndex: 0 } : d
      ),
    })),

  getIdleDrones: () => get().drones.filter((d) => d.status === 'idle' || d.status === 'charging'),
}));

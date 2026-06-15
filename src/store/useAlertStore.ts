import { create } from 'zustand';
import type { Alert, Position } from '@/types';
import { mockAlerts } from '@/data/alerts';
import { useRangerStore } from './useRangerStore';

interface AlertState {
  alerts: Alert[];
  selectedAlertId: string | null;
  getAlertById: (id: string) => Alert | undefined;
  selectAlert: (id: string | null) => void;
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp'> & { timestamp?: Date }) => string;
  updateAlertStatus: (id: string, status: Alert['status']) => void;
  updateAlertLevel: (id: string, level: Alert['level']) => void;
  assignRanger: (alertId: string, rangerId: string) => void;
  setSearchPath: (alertId: string, path: Position[]) => void;
  getPendingAlerts: () => Alert[];
  getCriticalAlerts: () => Alert[];
  createAlertFromAnimal: (
    animalId: string,
    type: Alert['type'],
    position: Position,
    description: string
  ) => void;
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: mockAlerts,
  selectedAlertId: null,

  getAlertById: (id) => get().alerts.find((a) => a.id === id),

  selectAlert: (id) => set({ selectedAlertId: id }),

  addAlert: (alertData) => {
    const alertId = `ALT-${Date.now()}`;
    const newAlert: Alert = {
      ...alertData,
      id: alertId,
      timestamp: alertData.timestamp || new Date(),
      searchPath: alertData.searchPath || [],
    } as Alert;
    set((state) => ({
      alerts: [newAlert, ...state.alerts],
    }));
    return alertId;
  },

  updateAlertStatus: (id, status) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, status } : a)),
    })),

  updateAlertLevel: (id, level) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, level } : a)),
    })),

  assignRanger: (alertId, rangerId) => {
    const alert = get().getAlertById(alertId);
    const ranger = useRangerStore.getState().getRangerById(rangerId);
    if (!alert || !ranger) return;

    const searchPath: Position[] = [];
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = ranger.position[0] + (alert.position[0] - ranger.position[0]) * t;
      const z = ranger.position[2] + (alert.position[2] - ranger.position[2]) * t;
      searchPath.push([x, 0.1, z]);
    }

    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId
          ? { ...a, assignedRangerId: rangerId, status: 'processing', searchPath }
          : a
      ),
    }));
  },

  setSearchPath: (alertId, path) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, searchPath: path } : a
      ),
    })),

  getPendingAlerts: () => get().alerts.filter((a) => a.status === 'pending'),

  getCriticalAlerts: () =>
    get().alerts.filter((a) => a.level === 'critical' && a.status !== 'resolved'),

  createAlertFromAnimal: (animalId, type, position, description) => {
    const nearestRanger = useRangerStore.getState().getNearestRanger(position);
    const level = type === 'lost_signal' ? 'critical' : type === 'stationary' ? 'high' : 'medium';

    const newAlert: Alert = {
      id: `ALT-${Date.now()}`,
      type,
      animalId,
      position,
      level,
      timestamp: new Date(),
      status: nearestRanger ? 'processing' : 'pending',
      assignedRangerId: nearestRanger?.id,
      searchPath: [],
      description,
    };

    if (nearestRanger) {
      const searchPath: Position[] = [];
      const steps = 10;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = nearestRanger.position[0] + (position[0] - nearestRanger.position[0]) * t;
        const z = nearestRanger.position[2] + (position[2] - nearestRanger.position[2]) * t;
        searchPath.push([x, 0.1, z]);
      }
      newAlert.searchPath = searchPath;
    }

    set((state) => ({
      alerts: [newAlert, ...state.alerts],
    }));
  },
}));

import { create } from 'zustand';
import type { WorkOrder, Position } from '@/types';
import { mockWorkOrders } from '@/data/workOrders';
import { useRangerStore } from './useRangerStore';
import { useAlertStore } from './useAlertStore';

interface WorkOrderState {
  workOrders: WorkOrder[];
  selectedWorkOrderId: string | null;
  getWorkOrderById: (id: string) => WorkOrder | undefined;
  selectWorkOrder: (id: string | null) => void;
  addWorkOrder: (orderData: Omit<WorkOrder, 'id' | 'createdAt'>) => string;
  updateWorkOrderStatus: (id: string, status: WorkOrder['status']) => void;
  assignRanger: (orderId: string, rangerId: string) => void;
  setRoutePath: (orderId: string, path: Position[]) => void;
  getPendingOrders: () => WorkOrder[];
  getActiveOrders: () => WorkOrder[];
  assignNearestRanger: (orderId: string) => void;
}

export const useWorkOrderStore = create<WorkOrderState>((set, get) => ({
  workOrders: mockWorkOrders,
  selectedWorkOrderId: null,

  getWorkOrderById: (id) => get().workOrders.find((wo) => wo.id === id),

  selectWorkOrder: (id) => set({ selectedWorkOrderId: id }),

  addWorkOrder: (orderData) => {
    const workOrderId = `WO-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newOrder: WorkOrder = {
      ...orderData,
      id: workOrderId,
      createdAt: new Date(),
    } as WorkOrder;
    set((state) => ({
      workOrders: [newOrder, ...state.workOrders],
    }));
    return workOrderId;
  },

  updateWorkOrderStatus: (id, status) =>
    set((state) => {
      const order = state.workOrders.find((wo) => wo.id === id);
      if (order && status === 'completed' && order.alertId) {
        useAlertStore.getState().updateAlertStatus(order.alertId, 'resolved');
      }
      return {
        workOrders: state.workOrders.map((wo) =>
          wo.id === id ? { ...wo, status } : wo
        ),
      };
    }),

  assignRanger: (orderId, rangerId) => {
    const order = get().getWorkOrderById(orderId);
    const ranger = useRangerStore.getState().getRangerById(rangerId);
    if (!order || !ranger) return;

    const routePath: Position[] = [];
    const steps = 12;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = ranger.position[0] + (order.position[0] - ranger.position[0]) * t;
      const z = ranger.position[2] + (order.position[2] - ranger.position[2]) * t;
      routePath.push([x, 0.1, z]);
    }

    set((state) => ({
      workOrders: state.workOrders.map((wo) =>
        wo.id === orderId
          ? { ...wo, assignedRangerId: rangerId, status: 'assigned', routePath }
          : wo
      ),
    }));
  },

  setRoutePath: (orderId, path) =>
    set((state) => ({
      workOrders: state.workOrders.map((wo) =>
        wo.id === orderId ? { ...wo, routePath: path } : wo
      ),
    })),

  getPendingOrders: () => get().workOrders.filter((wo) => wo.status === 'pending'),

  getActiveOrders: () =>
    get().workOrders.filter((wo) => wo.status === 'assigned' || wo.status === 'in_progress'),

  assignNearestRanger: (orderId) => {
    const order = get().getWorkOrderById(orderId);
    if (!order) return;
    const nearestRanger = useRangerStore.getState().getNearestRanger(order.position);
    if (nearestRanger) {
      get().assignRanger(orderId, nearestRanger.id);
    }
  },
}));

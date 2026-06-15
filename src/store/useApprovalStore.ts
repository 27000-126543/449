import { create } from 'zustand';
import type { Approval, Position } from '@/types';
import { mockApprovals } from '@/data/rescue';
import { useAuthStore } from './useAuthStore';

interface ApprovalState {
  approvals: Approval[];
  selectedApprovalId: string | null;
  getApprovalById: (id: string) => Approval | undefined;
  selectApproval: (id: string | null) => void;
  addApproval: (approval: Omit<Approval, 'id' | 'createdAt'>) => string;
  approveLevel1: (id: string, comment: string) => void;
  approveLevel2: (id: string, comment: string) => void;
  approveLevel3: (id: string, comment: string) => void;
  reject: (id: string, level: number, comment: string) => void;
  setChasePath: (id: string, path: Position[]) => void;
  setWorkOrderId: (id: string, workOrderId: string) => void;
  getPendingApprovals: () => Approval[];
  getApprovalsByType: (type: Approval['type']) => Approval[];
}

export const useApprovalStore = create<ApprovalState>((set, get) => ({
  approvals: mockApprovals,
  selectedApprovalId: null,

  getApprovalById: (id) => get().approvals.find((a) => a.id === id),

  selectApproval: (id) => set({ selectedApprovalId: id }),

  addApproval: (approvalData) => {
    const approvalId = `APP-${Date.now()}`;
    const newApproval: Approval = {
      ...approvalData,
      id: approvalId,
      createdAt: new Date(),
      status: 'pending_level1',
    } as Approval;
    set((state) => ({
      approvals: [newApproval, ...state.approvals],
    }));
    return approvalId;
  },

  approveLevel1: (id, comment) => {
    const { currentUser } = useAuthStore.getState();
    set((state) => ({
      approvals: state.approvals.map((a) =>
        a.id === id && a.status === 'pending_level1'
          ? {
              ...a,
              level1By: currentUser?.name || '未知用户',
              level1Comment: comment,
              level1At: new Date(),
              status: 'pending_level2',
            }
          : a
      ),
    }));
  },

  approveLevel2: (id, comment) => {
    const { currentUser } = useAuthStore.getState();
    set((state) => ({
      approvals: state.approvals.map((a) =>
        a.id === id && a.status === 'pending_level2'
          ? {
              ...a,
              level2By: currentUser?.name || '未知用户',
              level2Comment: comment,
              level2At: new Date(),
              status: 'pending_level3',
            }
          : a
      ),
    }));
  },

  approveLevel3: (id, comment) => {
    const { currentUser } = useAuthStore.getState();
    set((state) => ({
      approvals: state.approvals.map((a) =>
        a.id === id && a.status === 'pending_level3'
          ? {
              ...a,
              level3By: currentUser?.name || '未知用户',
              level3Comment: comment,
              level3At: new Date(),
              status: 'approved',
            }
          : a
      ),
    }));
  },

  reject: (id, level, comment) => {
    const { currentUser } = useAuthStore.getState();
    set((state) => ({
      approvals: state.approvals.map((a) => {
        if (a.id !== id) return a;
        const updates: Partial<Approval> = { status: 'rejected' };
        if (level === 1) {
          updates.level1By = currentUser?.name || '未知用户';
          updates.level1Comment = comment;
          updates.level1At = new Date();
        } else if (level === 2) {
          updates.level2By = currentUser?.name || '未知用户';
          updates.level2Comment = comment;
          updates.level2At = new Date();
        } else if (level === 3) {
          updates.level3By = currentUser?.name || '未知用户';
          updates.level3Comment = comment;
          updates.level3At = new Date();
        }
        return { ...a, ...updates };
      }),
    }));
  },

  setChasePath: (id, path) =>
    set((state) => ({
      approvals: state.approvals.map((a) =>
        a.id === id ? { ...a, chasePath: path } : a
      ),
    })),

  setWorkOrderId: (id, workOrderId) =>
    set((state) => ({
      approvals: state.approvals.map((a) =>
        a.id === id ? { ...a, workOrderId } : a
      ),
    })),

  getPendingApprovals: () =>
    get().approvals.filter((a) => a.status.startsWith('pending')),

  getApprovalsByType: (type) => get().approvals.filter((a) => a.type === type),
}));

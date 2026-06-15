import { create } from 'zustand';
import type { User, RangerRole, OperationLog } from '@/types';
import { mockRangers } from '@/data/rangers';

interface AuthState {
  currentUser: User | null;
  isLoggedIn: boolean;
  operationLogs: OperationLog[];
  login: (role: RangerRole, username: string) => boolean;
  logout: () => void;
  addLog: (action: string, targetType: string, targetId: string, details: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  isLoggedIn: false,
  operationLogs: [],

  login: (role, username) => {
    const ranger = mockRangers.find(
      (r) => r.role === role && r.name === username
    );
    if (ranger) {
      const user: User = {
        id: ranger.id,
        name: ranger.name,
        role: ranger.role,
        lastLogin: new Date(),
      };
      set({ currentUser: user, isLoggedIn: true });
      get().addLog('login', 'system', 'auth', `用户 ${username} 登录系统`);
      return true;
    }
    return false;
  },

  logout: () => {
    const { currentUser } = get();
    if (currentUser) {
      get().addLog('logout', 'system', 'auth', `用户 ${currentUser.name} 登出系统`);
    }
    set({ currentUser: null, isLoggedIn: false });
  },

  addLog: (action, targetType, targetId, details) => {
    const { currentUser, operationLogs } = get();
    const log: OperationLog = {
      id: `LOG-${Date.now()}`,
      userId: currentUser?.id || 'system',
      userName: currentUser?.name || '系统',
      action,
      targetType,
      targetId,
      timestamp: new Date(),
      details,
    };
    set({ operationLogs: [log, ...operationLogs].slice(0, 100) });
  },
}));

import type { Position } from '@/types';

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDuration = (hours: number): string => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}小时${m}分`;
};

export const calculateDistance = (p1: Position, p2: Position): number => {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  const dz = p1[2] - p2[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    normal: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-orange-400',
    lost: 'text-red-400',
    pending: 'text-yellow-400',
    processing: 'text-blue-400',
    resolved: 'text-green-400',
    false_alarm: 'text-gray-400',
    online: 'text-green-400',
    offline: 'text-red-400',
    low_battery: 'text-yellow-400',
    patrolling: 'text-blue-400',
    idle: 'text-gray-400',
    charging: 'text-green-400',
    alert: 'text-red-400',
  };
  return colorMap[status] || 'text-gray-400';
};

export const getLevelColor = (level: string): string => {
  const colorMap: Record<string, string> = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500',
  };
  return colorMap[level] || 'bg-gray-500';
};

export const getLevelText = (level: string): string => {
  const textMap: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '严重',
  };
  return textMap[level] || level;
};

export const getAlertTypeText = (type: string): string => {
  const textMap: Record<string, string> = {
    stationary: '异常静止',
    lost_signal: '信号丢失',
    poaching: '偷猎事件',
    intrusion: '非法入侵',
    injury: '受伤预警',
  };
  return textMap[type] || type;
};

export const getWorkOrderTypeText = (type: string): string => {
  const textMap: Record<string, string> = {
    trap_destruction: '销毁陷阱',
    rescue: '动物救助',
    patrol: '日常巡护',
    investigation: '现场调查',
  };
  return textMap[type] || type;
};

export const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * t;
};

export const lerpPosition = (p1: Position, p2: Position, t: number): Position => {
  return [lerp(p1[0], p2[0], t), lerp(p1[1], p2[1], t), lerp(p1[2], p2[2], t)];
};

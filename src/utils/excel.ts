import * as XLSX from 'xlsx';
import type { Animal, Ranger, Camera, Alert, WorkOrder } from '@/types';

interface DailyReportData {
  date: string;
  animals: Animal[];
  rangers: Ranger[];
  cameras: Camera[];
  alerts: Alert[];
  workOrders: WorkOrder[];
}

export const generateDailyReport = (data: DailyReportData): void => {
  const wb = XLSX.utils.book_new();

  const speciesData = data.animals.reduce((acc: Record<string, number>, animal) => {
    acc[animal.species] = (acc[animal.species] || 0) + 1;
    return acc;
  }, {});

  const speciesSheet = XLSX.utils.aoa_to_sheet([
    ['物种分布统计'],
    ['物种', '数量', '占比'],
    ...Object.entries(speciesData).map(([species, count]) => [
      getSpeciesName(species),
      count,
      `${((count / data.animals.length) * 100).toFixed(1)}%`,
    ]),
  ]);
  XLSX.utils.book_append_sheet(wb, speciesSheet, '物种分布');

  const cameraSheet = XLSX.utils.aoa_to_sheet([
    ['红外相机触发统计'],
    ['相机编号', '名称', '抓拍次数', '电池电量', '存储余量', '状态'],
    ...data.cameras.map((cam) => [
      cam.id,
      cam.name,
      cam.captures.length,
      `${cam.battery}%`,
      `${cam.storage}%`,
      getCameraStatusText(cam.status),
    ]),
  ]);
  XLSX.utils.book_append_sheet(wb, cameraSheet, '相机统计');

  const rangerSheet = XLSX.utils.aoa_to_sheet([
    ['巡护员出勤统计'],
    ['编号', '姓名', '角色', '当班时长', '状态'],
    ...data.rangers.map((r) => [
      r.id,
      r.name,
      getRoleText(r.role),
      `${r.shiftDuration.toFixed(1)}小时`,
      getRangerStatusText(r.status),
    ]),
  ]);
  XLSX.utils.book_append_sheet(wb, rangerSheet, '巡护出勤');

  const alertSheet = XLSX.utils.aoa_to_sheet([
    ['预警事件统计'],
    ['编号', '类型', '级别', '时间', '状态', '描述'],
    ...data.alerts.map((a) => [
      a.id,
      getAlertTypeText(a.type),
      getAlertLevelText(a.level),
      new Date(a.timestamp).toLocaleString('zh-CN'),
      getAlertStatusText(a.status),
      a.description,
    ]),
  ]);
  XLSX.utils.book_append_sheet(wb, alertSheet, '预警事件');

  XLSX.writeFile(wb, `生态监测日报_${data.date}.xlsx`);
};

const getSpeciesName = (species: string): string => {
  const map: Record<string, string> = {
    tiger: '华南虎',
    elephant: '亚洲象',
    panda: '大熊猫',
    deer: '梅花鹿',
    monkey: '金丝猴',
    leopard: '金钱豹',
  };
  return map[species] || species;
};

const getCameraStatusText = (status: string): string => {
  const map: Record<string, string> = {
    online: '在线',
    offline: '离线',
    low_battery: '低电量',
  };
  return map[status] || status;
};

const getRoleText = (role: string): string => {
  const map: Record<string, string> = {
    ranger: '巡护员',
    director: '保护区主任',
    bureau: '林业局',
  };
  return map[role] || role;
};

const getRangerStatusText = (status: string): string => {
  const map: Record<string, string> = {
    on_duty: '在岗',
    off_duty: '离岗',
    patrolling: '巡护中',
    resting: '休息中',
  };
  return map[status] || status;
};

const getAlertTypeText = (type: string): string => {
  const map: Record<string, string> = {
    stationary: '异常静止',
    lost_signal: '信号丢失',
    poaching: '偷猎事件',
    intrusion: '非法入侵',
    injury: '受伤预警',
  };
  return map[type] || type;
};

const getAlertLevelText = (level: string): string => {
  const map: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '严重',
  };
  return map[level] || level;
};

const getAlertStatusText = (status: string): string => {
  const map: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决',
    false_alarm: '误报',
  };
  return map[status] || status;
};

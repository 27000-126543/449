import * as XLSX from 'xlsx';
import type { Animal, Ranger, Camera, Alert, WorkOrder, AnimalSpecies } from '@/types';

interface DailyReportData {
  date: string;
  animals: Animal[];
  rangers: Ranger[];
  cameras: Camera[];
  alerts: Alert[];
  workOrders: WorkOrder[];
  speciesFilter?: AnimalSpecies | 'all';
}

export const generateDailyReport = (data: DailyReportData): void => {
  const wb = XLSX.utils.book_new();

  const filteredAnimals = data.speciesFilter && data.speciesFilter !== 'all'
    ? data.animals.filter(a => a.species === data.speciesFilter)
    : data.animals;

  const speciesData = filteredAnimals.reduce((acc: Record<string, number>, animal) => {
    acc[animal.species] = (acc[animal.species] || 0) + 1;
    return acc;
  }, {});

  const speciesSheet = XLSX.utils.aoa_to_sheet([
    ['物种分布统计'],
    [`报告日期: ${data.date}`],
    [`筛选条件: ${data.speciesFilter && data.speciesFilter !== 'all' ? getSpeciesName(data.speciesFilter) : '全部物种'}`],
    [],
    ['物种', '数量', '占比', '正常', '警告', '危险/失联'],
    ...Object.entries(speciesData).map(([species, count]) => {
      const speciesAnimals = filteredAnimals.filter(a => a.species === species);
      const normal = speciesAnimals.filter(a => a.status === 'normal').length;
      const warning = speciesAnimals.filter(a => a.status === 'warning').length;
      const danger = speciesAnimals.filter(a => a.status === 'danger' || a.status === 'lost').length;
      return [
        getSpeciesName(species),
        count,
        `${((count / Math.max(filteredAnimals.length, 1)) * 100).toFixed(1)}%`,
        normal,
        warning,
        danger,
      ];
    }),
    [],
    ['总计', filteredAnimals.length, '100%',
      filteredAnimals.filter(a => a.status === 'normal').length,
      filteredAnimals.filter(a => a.status === 'warning').length,
      filteredAnimals.filter(a => a.status === 'danger' || a.status === 'lost').length
    ],
  ]);
  XLSX.utils.book_append_sheet(wb, speciesSheet, '物种分布');

  const activitySheet = XLSX.utils.aoa_to_sheet([
    ['动物活动分布详情'],
    [`报告日期: ${data.date}`],
    [],
    ['个体编号', '物种', '名称', '性别', '年龄', '心率(bpm)', '体温(°C)', '状态', '静止时长(分钟)', '族群编号'],
    ...filteredAnimals.map((a) => [
      a.id,
      getSpeciesName(a.species),
      a.name,
      a.gender === 'male' ? '雄性' : '雌性',
      `${a.age}岁`,
      a.heartRate,
      a.temperature.toFixed(1),
      getAnimalStatusText(a.status),
      a.stationaryTime.toFixed(0),
      a.groupId,
    ]),
  ]);
  XLSX.utils.book_append_sheet(wb, activitySheet, '动物活动详情');

  const targetSpecies = data.speciesFilter && data.speciesFilter !== 'all' ? [data.speciesFilter] : null;

  const filteredCameras = targetSpecies
    ? data.cameras.filter(cam =>
        cam.captures.some(cap =>
          cap.animalSpecies && targetSpecies.includes(cap.animalSpecies as AnimalSpecies)
        )
      )
    : data.cameras;

  const cameraSheet = XLSX.utils.aoa_to_sheet([
    ['红外相机触发统计'],
    [`报告日期: ${data.date}`],
    [],
    ['相机编号', '名称', '状态', '抓拍总次数', '动物抓拍次数', '人形检测次数', '电池电量', '存储余量'],
    ...filteredCameras.map((cam) => {
      const animalCaptures = targetSpecies
        ? cam.captures.filter(cap =>
            cap.animalSpecies && targetSpecies.includes(cap.animalSpecies as AnimalSpecies)
          ).length
        : cam.captures.filter(cap => cap.animalSpecies && !cap.hasHuman).length;
      const humanCaptures = cam.captures.filter(cap => cap.hasHuman).length;
      return [
        cam.id,
        cam.name,
        getCameraStatusText(cam.status),
        cam.captures.length,
        animalCaptures,
        humanCaptures,
        `${cam.battery}%`,
        `${cam.storage}%`,
      ];
    }),
  ]);
  XLSX.utils.book_append_sheet(wb, cameraSheet, '相机统计');

  const patrolRangers = data.rangers.filter(r => r.role === 'ranger');

  const rangerSheet = XLSX.utils.aoa_to_sheet([
    ['巡护员出勤统计'],
    [`报告日期: ${data.date}`],
    [],
    ['编号', '姓名', '状态', '当班时长(小时)', '是否在岗', '进入信号盲区', '盲区时长(分钟)', '备注'],
    ...patrolRangers.map((r) => [
      r.id,
      r.name,
      getRangerStatusText(r.status),
      r.shiftDuration.toFixed(1),
      r.status !== 'off_duty' ? '是' : '否',
      r.inBlindZone ? '是' : '否',
      r.blindZoneTime > 0 ? r.blindZoneTime.toFixed(0) : '0',
      r.inBlindZone && r.blindZoneTime > 30 ? '⚠ 超时未出盲区' : '正常',
    ]),
    [],
    ['出勤汇总'],
    ['当班人数', patrolRangers.filter(r => r.status !== 'off_duty').length],
    ['巡护中人数', patrolRangers.filter(r => r.status === 'patrolling').length],
    ['盲区预警人数', patrolRangers.filter(r => r.inBlindZone && r.blindZoneTime > 30).length],
    ['平均当班时长', `${(patrolRangers.reduce((sum, r) => sum + r.shiftDuration, 0) / Math.max(patrolRangers.length, 1)).toFixed(1)}小时`],
  ]);
  XLSX.utils.book_append_sheet(wb, rangerSheet, '巡护出勤');

  const filteredAlerts = targetSpecies
    ? data.alerts.filter(a => {
        if (a.animalId) {
          const animal = data.animals.find(an => an.id === a.animalId);
          return animal && targetSpecies.includes(animal.species);
        }
        return !a.animalId;
      })
    : data.alerts;

  const alertSheet = XLSX.utils.aoa_to_sheet([
    ['预警事件统计'],
    [`报告日期: ${data.date}`],
    [],
    ['事件编号', '类型', '级别', '发生时间', '状态', '关联动物', '关联相机', '处置巡护员', '描述'],
    ...filteredAlerts.map((a) => {
      const animal = a.animalId ? data.animals.find(an => an.id === a.animalId) : null;
      const camera = a.cameraId ? data.cameras.find(c => c.id === a.cameraId) : null;
      const ranger = a.assignedRangerId ? data.rangers.find(r => r.id === a.assignedRangerId) : null;
      return [
        a.id,
        getAlertTypeText(a.type),
        getAlertLevelText(a.level),
        new Date(a.timestamp).toLocaleString('zh-CN'),
        getAlertStatusText(a.status),
        animal ? animal.name : '-',
        camera ? camera.name : '-',
        ranger ? ranger.name : '-',
        a.description,
      ];
    }),
    [],
    ['预警汇总'],
    ['预警总数', filteredAlerts.length],
    ['偷猎/入侵事件', filteredAlerts.filter(a => a.type === 'poaching' || a.type === 'intrusion').length],
    ['动物异常事件', filteredAlerts.filter(a => a.type === 'stationary' || a.type === 'lost_signal' || a.type === 'injury').length],
    ['已解决', filteredAlerts.filter(a => a.status === 'resolved').length],
    ['待处理', filteredAlerts.filter(a => a.status === 'pending' || a.status === 'processing').length],
  ]);
  XLSX.utils.book_append_sheet(wb, alertSheet, '预警盗猎事件');

  const woSheet = XLSX.utils.aoa_to_sheet([
    ['工单统计'],
    [`报告日期: ${data.date}`],
    [],
    ['工单编号', '类型', '优先级', '创建时间', '状态', '指派巡护员', '来源无人机', '描述'],
    ...data.workOrders.map((wo) => {
      const ranger = wo.assignedRangerId ? data.rangers.find(r => r.id === wo.assignedRangerId) : null;
      return [
        wo.id,
        getWorkOrderTypeText(wo.type),
        getPriorityText(wo.priority),
        new Date(wo.createdAt).toLocaleString('zh-CN'),
        getWorkOrderStatusText(wo.status),
        ranger ? ranger.name : '待指派',
        wo.droneId || '-',
        wo.description,
      ];
    }),
  ]);
  XLSX.utils.book_append_sheet(wb, woSheet, '工单统计');

  XLSX.writeFile(wb, `生态监测日报_${data.date}${data.speciesFilter && data.speciesFilter !== 'all' ? '_' + data.speciesFilter : ''}.xlsx`);
};

export const getSpeciesName = (species: string): string => {
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

const getAnimalStatusText = (status: string): string => {
  const map: Record<string, string> = {
    normal: '正常',
    warning: '警告',
    danger: '危险',
    lost: '失联',
  };
  return map[status] || status;
};

const getCameraStatusText = (status: string): string => {
  const map: Record<string, string> = {
    online: '在线',
    offline: '离线',
    low_battery: '低电量',
  };
  return map[status] || status;
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

const getWorkOrderTypeText = (type: string): string => {
  const map: Record<string, string> = {
    trap_destruction: '销毁陷阱',
    rescue: '动物救助',
    patrol: '日常巡护',
    investigation: '现场调查',
  };
  return map[type] || type;
};

const getPriorityText = (priority: string): string => {
  const map: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '紧急',
  };
  return map[priority] || priority;
};

const getWorkOrderStatusText = (status: string): string => {
  const map: Record<string, string> = {
    pending: '待指派',
    assigned: '已指派',
    in_progress: '进行中',
    completed: '已完成',
  };
  return map[status] || status;
};

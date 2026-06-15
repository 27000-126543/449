import { useState, useMemo } from 'react';
import { PawPrint, Users, AlertTriangle, ClipboardList, ChevronDown, ChevronRight, FileCheck } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useAnimalStore } from '@/store/useAnimalStore';
import { useRangerStore } from '@/store/useRangerStore';
import { useAlertStore } from '@/store/useAlertStore';
import { useWorkOrderStore } from '@/store/useWorkOrderStore';
import { useApprovalStore } from '@/store/useApprovalStore';
import { getStatusColor, getAlertTypeText, getLevelColor, getLevelText, getWorkOrderTypeText } from '@/utils/helpers';
import { cn } from '@/lib/utils';
import type { ApprovalStatus } from '@/types';

interface LeftPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type TabType = 'animals' | 'rangers' | 'alerts' | 'workorders' | 'approvals';

export default function LeftPanel({ isOpen = true, onClose }: LeftPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('alerts');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    critical: true,
    high: true,
    normal: false,
  });

  const animals = useAnimalStore((state) => state.animals);
  const selectAnimal = useAnimalStore((state) => state.selectAnimal);
  const selectedAnimalId = useAnimalStore((state) => state.selectedAnimalId);

  const rangers = useRangerStore((state) => state.rangers);
  const selectRanger = useRangerStore((state) => state.selectRanger);
  const selectedRangerId = useRangerStore((state) => state.selectedRangerId);

  const alerts = useAlertStore((state) => state.alerts);
  const selectAlert = useAlertStore((state) => state.selectAlert);

  const workOrders = useWorkOrderStore((state) => state.workOrders);
  const selectWorkOrder = useWorkOrderStore((state) => state.selectWorkOrder);

  const approvals = useApprovalStore((state) => state.approvals);
  const selectApproval = useApprovalStore((state) => state.selectApproval);

  const patrolRangers = rangers.filter((r) => r.role === 'ranger');

  const criticalAlerts = alerts.filter((a) => a.level === 'critical' && a.status !== 'resolved');
  const highAlerts = alerts.filter((a) => a.level === 'high' && a.status !== 'resolved');
  const normalAlerts = alerts.filter((a) => (a.level === 'medium' || a.level === 'low') && a.status !== 'resolved');

  const pendingApprovalsCount = useMemo(() => {
    return approvals.filter(a => a.status.startsWith('pending_')).length;
  }, [approvals]);

  const tabs = [
    { id: 'alerts' as TabType, label: '预警', icon: AlertTriangle, count: criticalAlerts.length + highAlerts.length },
    { id: 'animals' as TabType, label: '动物', icon: PawPrint, count: animals.length },
    { id: 'rangers' as TabType, label: '巡护员', icon: Users, count: patrolRangers.length },
    { id: 'workorders' as TabType, label: '工单', icon: ClipboardList, count: workOrders.filter((w) => w.status !== 'completed').length },
    { id: 'approvals' as TabType, label: '审批', icon: FileCheck, count: pendingApprovalsCount },
  ];

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getApprovalTypeText = (type: string) => {
    const map: Record<string, string> = {
      poaching: '偷猎事件处置',
      rescue: '救助方案审批',
      patrol: '巡护任务审批',
      drone_deployment: '无人机部署',
    };
    return map[type] || type;
  };

  const getApprovalStatusText = (status: ApprovalStatus) => {
    const map: Record<ApprovalStatus, string> = {
      pending_level1: '待一级审批',
      pending_level2: '待二级审批',
      pending_level3: '待三级审批',
      approved: '已通过',
      rejected: '已否决',
    };
    return map[status] || status;
  };

  const getApprovalStatusColor = (status: ApprovalStatus) => {
    if (status.startsWith('pending_')) return 'bg-yellow-500/20 text-yellow-400';
    if (status === 'approved') return 'bg-green-500/20 text-green-400';
    if (status === 'rejected') return 'bg-red-500/20 text-red-400';
    return 'bg-gray-500/20 text-gray-400';
  };

  const getSpeciesText = (species: string) => {
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

  const getSpeciesColor = (species: string) => {
    const map: Record<string, string> = {
      tiger: 'text-orange-400',
      elephant: 'text-gray-400',
      panda: 'text-gray-300',
      deer: 'text-amber-600',
      monkey: 'text-amber-700',
      leopard: 'text-yellow-600',
    };
    return map[species] || 'text-green-400';
  };

  if (!isOpen) return null;

  return (
    <div className="w-72 h-full bg-gray-900/90 backdrop-blur-md border-r border-gray-800 flex flex-col">
      <div className="flex border-b border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 py-3 px-2 flex flex-col items-center gap-1 text-xs transition-colors relative',
              activeTab === tab.id
                ? 'text-emerald-400 bg-gray-800/50'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
            )}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={cn(
                  'absolute top-1 right-2 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center',
                  tab.id === 'alerts' && tab.count > 0
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-700 text-gray-300'
                )}
              >
                {tab.count > 99 ? '99+' : tab.count}
              </span>
            )}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeTab === 'alerts' && (
          <>
            <AlertSection
              title="严重预警"
              alerts={criticalAlerts}
              expanded={expandedSections.critical}
              onToggle={() => toggleSection('critical')}
              levelColor="bg-red-500"
              onSelect={selectAlert}
              getAlertTypeText={getAlertTypeText}
              getLevelColor={getLevelColor}
              getLevelText={getLevelText}
            />
            <AlertSection
              title="高优先级"
              alerts={highAlerts}
              expanded={expandedSections.high}
              onToggle={() => toggleSection('high')}
              levelColor="bg-orange-500"
              onSelect={selectAlert}
              getAlertTypeText={getAlertTypeText}
              getLevelColor={getLevelColor}
              getLevelText={getLevelText}
            />
            <AlertSection
              title="一般预警"
              alerts={normalAlerts}
              expanded={expandedSections.normal}
              onToggle={() => toggleSection('normal')}
              levelColor="bg-yellow-500"
              onSelect={selectAlert}
              getAlertTypeText={getAlertTypeText}
              getLevelColor={getLevelColor}
              getLevelText={getLevelText}
            />
          </>
        )}

        {activeTab === 'animals' && (
          <div className="space-y-2">
            {animals.map((animal) => (
              <Card
                key={animal.id}
                hoverable
                onClick={() => selectAnimal(animal.id)}
                className={cn(
                  'transition-all',
                  selectedAnimalId === animal.id && 'ring-2 ring-emerald-500 border-emerald-500/50'
                )}
              >
                <Card.Body className="py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        animal.status === 'danger' || animal.status === 'lost'
                          ? 'bg-red-500/20'
                          : animal.status === 'warning'
                          ? 'bg-yellow-500/20'
                          : 'bg-emerald-500/20'
                      )}
                    >
                      <PawPrint
                        size={20}
                        className={cn(
                          getSpeciesColor(animal.species),
                          animal.status === 'danger' || animal.status === 'lost'
                            ? 'text-red-400'
                            : animal.status === 'warning'
                            ? 'text-yellow-400'
                            : ''
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white text-sm truncate">{animal.name}</span>
                        <span
                          className={cn(
                            'w-2 h-2 rounded-full',
                            animal.status === 'normal' && 'bg-green-500',
                            animal.status === 'warning' && 'bg-yellow-500 animate-pulse',
                            animal.status === 'danger' && 'bg-orange-500 animate-pulse',
                            animal.status === 'lost' && 'bg-red-500 animate-pulse'
                          )}
                        />
                      </div>
                      <div className="text-xs text-gray-400">
                        {getSpeciesText(animal.species)} · {animal.gender === 'male' ? '♂' : '♀'} {animal.age}岁
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="text-emerald-400">{animal.heartRate} <span className="text-gray-500">bpm</span></div>
                      <div className="text-cyan-400">{animal.temperature.toFixed(1)} <span className="text-gray-500">°C</span></div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'rangers' && (
          <div className="space-y-2">
            {patrolRangers.map((ranger) => (
              <Card
                key={ranger.id}
                hoverable
                onClick={() => selectRanger(ranger.id)}
                className={cn(
                  'transition-all',
                  selectedRangerId === ranger.id && 'ring-2 ring-blue-500 border-blue-500/50'
                )}
              >
                <Card.Body className="py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'relative w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center',
                        ranger.inBlindZone
                          ? 'from-orange-500 to-amber-600 animate-pulse'
                          : 'from-blue-500 to-cyan-600'
                      )}
                    >
                      <Users size={18} className="text-white" />
                      {ranger.status === 'patrolling' && !ranger.inBlindZone && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-gray-800" />
                      )}
                      {ranger.inBlindZone && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-orange-500 rounded-full border-2 border-gray-800 animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm">{ranger.name}</div>
                      <div className="text-xs text-gray-400">
                        当班 {ranger.shiftDuration.toFixed(1)} 小时
                      </div>
                    </div>
                    <div className="text-right">
                      {ranger.inBlindZone ? (
                        <span className="text-xs text-orange-400 font-medium">信号盲区</span>
                      ) : (
                        <span className="text-xs text-green-400">在线</span>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'workorders' && (
          <div className="space-y-2">
            {workOrders.filter((w) => w.status !== 'completed').map((order) => (
              <Card
                key={order.id}
                hoverable
                onClick={() => selectWorkOrder(order.id)}
              >
                <Card.Body className="py-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                        order.priority === 'high' || order.priority === 'critical'
                          ? 'bg-red-500/20'
                          : order.priority === 'medium'
                          ? 'bg-yellow-500/20'
                          : 'bg-green-500/20'
                      )}
                    >
                      <ClipboardList
                        size={20}
                        className={cn(
                          order.priority === 'high' || order.priority === 'critical'
                            ? 'text-red-400'
                            : order.priority === 'medium'
                            ? 'text-yellow-400'
                            : 'text-green-400'
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white">{getWorkOrderTypeText(order.type)}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{order.description}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={cn(
                            'px-1.5 py-0.5 rounded text-xs',
                            order.status === 'pending' && 'bg-yellow-500/20 text-yellow-400',
                            order.status === 'assigned' && 'bg-blue-500/20 text-blue-400',
                            order.status === 'in_progress' && 'bg-green-500/20 text-green-400'
                          )}
                        >
                          {order.status === 'pending' && '待指派'}
                          {order.status === 'assigned' && '已指派'}
                          {order.status === 'in_progress' && '进行中'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'approvals' && (
          <div className="space-y-2">
            {approvals.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">
                暂无审批事件
              </div>
            ) : (
              [...approvals]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((approval) => (
                <Card
                  key={approval.id}
                  hoverable
                  onClick={() => selectApproval(approval.id)}
                  className="transition-all"
                >
                  <Card.Body className="py-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                          approval.status.startsWith('pending_')
                            ? 'bg-yellow-500/20'
                            : approval.status === 'approved'
                            ? 'bg-green-500/20'
                            : 'bg-red-500/20'
                        )}
                      >
                        <FileCheck
                          size={20}
                          className={cn(
                            approval.status.startsWith('pending_')
                              ? 'text-yellow-400'
                              : approval.status === 'approved'
                              ? 'text-green-400'
                              : 'text-red-400'
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{approval.description}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {approval.cameraName
                            ? `${approval.cameraName}${approval.cameraId ? ` (${approval.cameraId})` : ''}`
                            : approval.type === 'rescue'
                            ? `救助方案`
                            : approval.type === 'drone_deployment'
                            ? `无人机调度`
                            : `事件编号：${approval.targetId}`}
                        </div>
                        {approval.captureTimestamp && (
                          <div className="text-xs text-cyan-400 mt-0.5 flex items-center gap-2 flex-wrap">
                            <span>抓拍: {new Date(approval.captureTimestamp).toLocaleString('zh-CN', {
                              month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
                            })}</span>
                            {typeof approval.captureConfidence === 'number' && (
                              <span className="text-orange-400">
                                置信度 {Math.round(approval.captureConfidence * 100)}%
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-1 gap-2">
                          <span className="text-xs text-gray-500">
                            {new Date(approval.createdAt).toLocaleString('zh-CN', {
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span
                            className={cn(
                              'px-1.5 py-0.5 rounded text-xs flex-shrink-0',
                              getApprovalStatusColor(approval.status)
                            )}
                          >
                            {getApprovalStatusText(approval.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface AlertSectionProps {
  title: string;
  alerts: ReturnType<typeof useAlertStore.getState>['alerts'];
  expanded: boolean;
  onToggle: () => void;
  levelColor: string;
  onSelect: (id: string) => void;
  getAlertTypeText: (type: string) => string;
  getLevelColor: (level: string) => string;
  getLevelText: (level: string) => string;
}

function AlertSection({
  title,
  alerts,
  expanded,
  onToggle,
  levelColor,
  onSelect,
  getAlertTypeText,
}: AlertSectionProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
      >
        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span className={cn('w-2 h-2 rounded-full', levelColor)} />
        {title}
        <span className="text-gray-500">({alerts.length})</span>
      </button>
      {expanded && (
        <div className="space-y-2 pl-2">
          {alerts.map((alert) => (
            <Card key={alert.id} hoverable onClick={() => onSelect(alert.id)}>
              <Card.Body className="py-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className={cn(
                    'flex-shrink-0 mt-0.5',
                    alert.level === 'critical' && 'text-red-400',
                    alert.level === 'high' && 'text-orange-400',
                    alert.level === 'medium' && 'text-yellow-400',
                    alert.level === 'low' && 'text-green-400',
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">{getAlertTypeText(alert.type)}</div>
                    <div className="text-xs text-gray-400 mt-0.5 truncate">{alert.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(alert.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

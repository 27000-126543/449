import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ClipboardList, MapPin, Clock, User, Plane, Navigation, CheckCircle } from 'lucide-react';
import { useWorkOrderStore } from '@/store/useWorkOrderStore';
import { useRangerStore } from '@/store/useRangerStore';
import { useDroneStore } from '@/store/useDroneStore';
import { cn } from '@/lib/utils';
import { getWorkOrderTypeText } from '@/utils/helpers';

interface WorkOrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WorkOrderDetailModal({ isOpen, onClose }: WorkOrderDetailModalProps) {
  const selectedWorkOrderId = useWorkOrderStore((state) => state.selectedWorkOrderId);
  const workOrder = useWorkOrderStore((state) => state.getWorkOrderById(selectedWorkOrderId || ''));
  const updateWorkOrderStatus = useWorkOrderStore((state) => state.updateWorkOrderStatus);
  const assignNearestRanger = useWorkOrderStore((state) => state.assignNearestRanger);
  const getRangerById = useRangerStore((state) => state.getRangerById);
  const getDroneById = useDroneStore((state) => state.getDroneById);
  const nearestRanger = useRangerStore((state) =>
    workOrder ? state.getNearestRanger(workOrder.position) : undefined
  );

  const [showAssign, setShowAssign] = useState(false);

  if (!workOrder) return null;

  const assignedRanger = workOrder.assignedRangerId
    ? getRangerById(workOrder.assignedRangerId)
    : undefined;
  const sourceDrone = workOrder.droneId ? getDroneById(workOrder.droneId) : undefined;

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: '待指派',
      assigned: '已指派',
      in_progress: '进行中',
      completed: '已完成',
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      assigned: 'bg-blue-500/20 text-blue-400',
      in_progress: 'bg-green-500/20 text-green-400',
      completed: 'bg-gray-500/20 text-gray-400',
    };
    return map[status] || 'bg-gray-500/20 text-gray-400';
  };

  const getPriorityText = (priority: string) => {
    const map: Record<string, string> = {
      low: '低',
      medium: '中',
      high: '高',
      critical: '紧急',
    };
    return map[priority] || priority;
  };

  const getPriorityColor = (priority: string) => {
    const map: Record<string, string> = {
      low: 'bg-green-500/20 text-green-400',
      medium: 'bg-yellow-500/20 text-yellow-400',
      high: 'bg-orange-500/20 text-orange-400',
      critical: 'bg-red-500/20 text-red-400',
    };
    return map[priority] || 'bg-gray-500/20 text-gray-400';
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAssignNearest = () => {
    assignNearestRanger(workOrder.id);
    setShowAssign(false);
  };

  const handleStartProgress = () => {
    updateWorkOrderStatus(workOrder.id, 'in_progress');
  };

  const handleComplete = () => {
    updateWorkOrderStatus(workOrder.id, 'completed');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="工单详情" size="lg">
      <div className="space-y-4">
        <Card>
          <Card.Body>
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'p-3 rounded-xl',
                  workOrder.priority === 'high' || workOrder.priority === 'critical'
                    ? 'bg-red-500/20'
                    : 'bg-blue-500/20'
                )}
              >
                <ClipboardList
                  size={28}
                  className={cn(
                    workOrder.priority === 'high' || workOrder.priority === 'critical'
                      ? 'text-red-400'
                      : 'text-blue-400'
                  )}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white">{getWorkOrderTypeText(workOrder.type)}</h3>
                  <span className={cn('px-2 py-0.5 rounded text-xs font-medium', getStatusColor(workOrder.status))}>
                    {getStatusText(workOrder.status)}
                  </span>
                  <span className={cn('px-2 py-0.5 rounded text-xs font-medium', getPriorityColor(workOrder.priority))}>
                    {getPriorityText(workOrder.priority)}优先级
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-300">{workOrder.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    位置: ({workOrder.position[0].toFixed(1)}, {workOrder.position[2].toFixed(1)})
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    创建: {formatTime(workOrder.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        {sourceDrone && (
          <Card>
            <Card.Header>
              <span className="text-sm font-medium text-white">发现来源</span>
            </Card.Header>
            <Card.Body>
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <Plane size={18} className="text-cyan-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">{sourceDrone.name}</div>
                  <div className="text-xs text-gray-400">无人机巡检发现</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        )}

        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">指派巡护员</span>
              {!assignedRanger && workOrder.status === 'pending' && (
                <button
                  onClick={() => setShowAssign(!showAssign)}
                  className="text-xs text-emerald-400 hover:text-emerald-300"
                >
                  指派
                </button>
              )}
            </div>
          </Card.Header>
          <Card.Body>
            {assignedRanger ? (
              <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                  <User size={18} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">{assignedRanger.name}</div>
                  <div className="text-xs text-gray-400">
                    已指派 · 当班 {assignedRanger.shiftDuration.toFixed(1)} 小时
                  </div>
                </div>
                {workOrder.status === 'in_progress' && (
                  <div className="flex items-center gap-1 text-green-400">
                    <Navigation size={14} />
                    <span className="text-xs">前往中</span>
                  </div>
                )}
              </div>
            ) : showAssign ? (
              <div className="space-y-2">
                {nearestRanger && (
                  <button
                    onClick={handleAssignNearest}
                    className="w-full flex items-center gap-3 p-3 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg border border-emerald-500/30 text-left transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <User size={18} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">{nearestRanger.name}</div>
                      <div className="text-xs text-emerald-400">推荐 · 最近巡护员</div>
                    </div>
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400 text-sm">
                暂未指派巡护员
                {nearestRanger && (
                  <div className="mt-2">
                    最近巡护员: <span className="text-emerald-400">{nearestRanger.name}</span>
                  </div>
                )}
              </div>
            )}
          </Card.Body>
        </Card>

        {workOrder.routePath.length > 0 && (
          <Card>
            <Card.Header>
              <span className="text-sm font-medium text-white">任务路径</span>
            </Card.Header>
            <Card.Body>
              <div className="h-32 bg-gray-900 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 200 100" className="w-full h-full">
                    <path
                      d="M 20 80 Q 60 20, 100 50 T 180 30"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      className="animate-pulse"
                    />
                    <circle cx="20" cy="80" r="4" fill="#3b82f6" />
                    <circle cx="180" cy="30" r="5" fill="#22c55e" className="animate-ping" />
                  </svg>
                </div>
                <div className="absolute bottom-2 left-2 text-xs text-gray-400">
                  路径长度: 约 {(workOrder.routePath.length * 0.5).toFixed(1)} km
                </div>
                <div className="absolute bottom-2 right-2 text-xs text-green-400">
                  预计: {Math.round(workOrder.routePath.length * 0.2)} 分钟
                </div>
              </div>
            </Card.Body>
          </Card>
        )}

        <div className="flex gap-3">
          {workOrder.status === 'assigned' && (
            <Button variant="primary" className="flex-1" onClick={handleStartProgress}>
              <Navigation size={16} className="mr-2" />
              开始执行
            </Button>
          )}
          {(workOrder.status === 'in_progress' || workOrder.status === 'assigned') && (
            <Button variant="success" className="flex-1" onClick={handleComplete}>
              <CheckCircle size={16} className="mr-2" />
              完成工单
            </Button>
          )}
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            关闭
          </Button>
        </div>
      </div>
    </Modal>
  );
}

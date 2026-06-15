import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { AlertTriangle, MapPin, Clock, User, Navigation, Check, X } from 'lucide-react';
import { useAlertStore } from '@/store/useAlertStore';
import { useRangerStore } from '@/store/useRangerStore';
import { cn } from '@/lib/utils';
import { getAlertTypeText, getLevelText } from '@/utils/helpers';

interface AlertDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AlertDetailModal({ isOpen, onClose }: AlertDetailModalProps) {
  const selectedAlertId = useAlertStore((state) => state.selectedAlertId);
  const alert = useAlertStore((state) => state.getAlertById(selectedAlertId || ''));
  const updateAlertStatus = useAlertStore((state) => state.updateAlertStatus);
  const assignRanger = useAlertStore((state) => state.assignRanger);
  const nearestRanger = useRangerStore((state) =>
    alert ? state.getNearestRanger(alert.position) : undefined
  );
  const getRangerById = useRangerStore((state) => state.getRangerById);
  const rangers = useRangerStore((state) => state.rangers);

  const [showAssign, setShowAssign] = useState(false);

  if (!alert) return null;

  const assignedRanger = alert.assignedRangerId ? getRangerById(alert.assignedRangerId) : undefined;

  const getLevelColor = (level: string) => {
    const map: Record<string, string> = {
      low: 'bg-green-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      critical: 'bg-red-500',
    };
    return map[level] || 'bg-gray-500';
  };

  const getLevelBgColor = (level: string) => {
    const map: Record<string, string> = {
      low: 'bg-green-500/20 text-green-400',
      medium: 'bg-yellow-500/20 text-yellow-400',
      high: 'bg-orange-500/20 text-orange-400',
      critical: 'bg-red-500/20 text-red-400',
    };
    return map[level] || 'bg-gray-500/20 text-gray-400';
  };

  const handleAssignRanger = (rangerId: string) => {
    assignRanger(alert.id, rangerId);
    setShowAssign(false);
  };

  const handleResolve = () => {
    updateAlertStatus(alert.id, 'resolved');
    onClose();
  };

  const handleFalseAlarm = () => {
    updateAlertStatus(alert.id, 'false_alarm');
    onClose();
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const patrolRangers = rangers.filter((r) => r.role === 'ranger' && r.status !== 'off_duty');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="预警详情" size="lg">
      <div className="space-y-4">
        <Card>
          <Card.Body>
            <div className="flex items-start gap-4">
              <div className={cn('p-3 rounded-xl', getLevelBgColor(alert.level))}>
                <AlertTriangle size={28} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white">{getAlertTypeText(alert.type)}</h3>
                  <span className={cn('px-2 py-0.5 rounded text-xs font-medium', getLevelBgColor(alert.level))}>
                    {getLevelText(alert.level)}级
                  </span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-xs',
                      alert.status === 'pending' && 'bg-yellow-500/20 text-yellow-400',
                      alert.status === 'processing' && 'bg-blue-500/20 text-blue-400',
                      alert.status === 'resolved' && 'bg-green-500/20 text-green-400',
                      alert.status === 'false_alarm' && 'bg-gray-500/20 text-gray-400'
                    )}
                  >
                    {alert.status === 'pending' && '待处理'}
                    {alert.status === 'processing' && '处理中'}
                    {alert.status === 'resolved' && '已解决'}
                    {alert.status === 'false_alarm' && '误报'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-300">{alert.description}</p>
                <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    位置: ({alert.position[0].toFixed(1)}, {alert.position[2].toFixed(1)})
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    时间: {formatTime(alert.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">指派巡护员</span>
              {!assignedRanger && alert.status === 'pending' && (
                <button
                  onClick={() => setShowAssign(!showAssign)}
                  className="text-xs text-emerald-400 hover:text-emerald-300"
                >
                  {showAssign ? '收起' : '选择巡护员'}
                </button>
              )}
            </div>
          </Card.Header>
          <Card.Body>
            {assignedRanger ? (
              <div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                  <User size={18} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">{assignedRanger.name}</div>
                  <div className="text-xs text-gray-400">
                    已指派 · 当班 {assignedRanger.shiftDuration.toFixed(1)} 小时
                  </div>
                </div>
                <div className="flex items-center gap-1 text-green-400">
                  <Navigation size={14} />
                  <span className="text-xs">前往中</span>
                </div>
              </div>
            ) : showAssign ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {nearestRanger && (
                  <button
                    onClick={() => handleAssignRanger(nearestRanger.id)}
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
                {patrolRangers
                  .filter((r) => r.id !== nearestRanger?.id)
                  .map((ranger) => (
                    <button
                      key={ranger.id}
                      onClick={() => handleAssignRanger(ranger.id)}
                      className="w-full flex items-center gap-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                        <User size={18} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">{ranger.name}</div>
                        <div className="text-xs text-gray-400">
                          当班 {ranger.shiftDuration.toFixed(1)} 小时
                        </div>
                      </div>
                    </button>
                  ))}
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

        {alert.searchPath.length > 0 && (
          <Card>
            <Card.Header>
              <span className="text-sm font-medium text-white">搜救路径</span>
            </Card.Header>
            <Card.Body>
              <div className="h-32 bg-gray-900 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <svg viewBox="0 0 200 100" className="w-full h-full">
                      <path
                        d="M 20 80 Q 60 20, 100 50 T 180 30"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        className="animate-pulse"
                      />
                      <circle cx="20" cy="80" r="4" fill="#22c55e" />
                      <circle cx="180" cy="30" r="5" fill="#ef4444" className="animate-ping" />
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 text-xs text-gray-400">
                  路径长度: 约 {(alert.searchPath.length * 0.5).toFixed(1)} km
                </div>
                <div className="absolute bottom-2 right-2 text-xs text-blue-400">
                  预计到达: {Math.round(alert.searchPath.length * 0.3)} 分钟
                </div>
              </div>
            </Card.Body>
          </Card>
        )}

        {alert.status !== 'resolved' && alert.status !== 'false_alarm' && (
          <div className="flex gap-3">
            <Button variant="success" className="flex-1" onClick={handleResolve}>
              <Check size={16} className="mr-2" />
              标记已解决
            </Button>
            <Button variant="secondary" className="flex-1" onClick={handleFalseAlarm}>
              <X size={16} className="mr-2" />
              标记误报
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

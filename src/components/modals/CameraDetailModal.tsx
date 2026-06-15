import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import { Camera, Battery, HardDrive, Clock, AlertTriangle, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCameraStore } from '@/store/useCameraStore';
import { useApprovalStore } from '@/store/useApprovalStore';
import { useAlertStore } from '@/store/useAlertStore';
import { cn } from '@/lib/utils';

interface CameraDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CameraDetailModal({ isOpen, onClose }: CameraDetailModalProps) {
  const selectedCameraId = useCameraStore((state) => state.selectedCameraId);
  const camera = useCameraStore((state) => state.getCameraById(selectedCameraId || ''));
  const addApproval = useApprovalStore((state) => state.addApproval);
  const addAlert = useAlertStore((state) => state.addAlert);
  const [currentCaptureIndex, setCurrentCaptureIndex] = useState(0);
  const [showApproval, setShowApproval] = useState(false);

  if (!camera) return null;

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      online: '在线',
      offline: '离线',
      low_battery: '低电量',
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      online: 'text-green-400',
      offline: 'text-gray-400',
      low_battery: 'text-yellow-400',
    };
    return map[status] || 'text-gray-400';
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const sortedCaptures = [...camera.captures].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const currentCapture = sortedCaptures[currentCaptureIndex];

  const handlePrevCapture = () => {
    setCurrentCaptureIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextCapture = () => {
    setCurrentCaptureIndex((prev) => Math.min(sortedCaptures.length - 1, prev + 1));
  };

  const handleInitiateApproval = () => {
    if (camera.hasHumanDetection && currentCapture?.hasHuman) {
      addAlert({
        type: 'poaching',
        cameraId: camera.id,
        position: camera.position,
        level: 'critical',
        status: 'pending',
        description: `${camera.name} 检测到人形轮廓，疑似偷猎活动`,
        searchPath: [],
      });

      addApproval({
        type: 'poaching',
        targetId: `CAP-${currentCapture.id}`,
        status: 'pending_level1',
        description: `${camera.name} 人形检测事件审批`,
      });

      setShowApproval(true);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="红外相机详情" size="lg">
      <div className="space-y-4">
        <Card>
          <Card.Body>
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'p-3 rounded-xl',
                  camera.status === 'online' ? 'bg-cyan-500/20' : 'bg-gray-500/20'
                )}
              >
                <Camera size={28} className={cn(camera.status === 'online' ? 'text-cyan-400' : 'text-gray-400')} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white">{camera.name}</h3>
                  <span className={cn('text-sm', getStatusColor(camera.status))}>
                    ● {getStatusText(camera.status)}
                  </span>
                  {camera.hasHumanDetection && (
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-medium animate-pulse">
                      ⚠ 人形检测
                    </span>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                      <Battery size={12} />
                      电池电量
                    </div>
                    <ProgressBar value={camera.battery} size="sm" color="green" />
                    <div className="text-sm text-white mt-1">{camera.battery}%</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                      <HardDrive size={12} />
                      存储空间
                    </div>
                    <ProgressBar value={100 - camera.storage} size="sm" color="cyan" />
                    <div className="text-sm text-white mt-1">剩余 {camera.storage}%</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                      <Clock size={12} />
                      抓拍次数
                    </div>
                    <div className="text-xl font-bold text-white">{camera.captures.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">抓拍记录</span>
              <span className="text-xs text-gray-400">
                {currentCaptureIndex + 1} / {sortedCaptures.length}
              </span>
            </div>
          </Card.Header>
          <Card.Body>
            {sortedCaptures.length > 0 ? (
              <div>
                <div className="relative h-48 bg-gray-900 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Camera size={48} className="text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">抓拍画面预览</p>
                      {currentCapture?.hasHuman && (
                        <p className="text-xs text-red-400 mt-1 font-medium">
                          ⚠ 检测到人形轮廓 (置信度 {Math.round((currentCapture.confidence || 0) * 100)}%)
                        </p>
                      )}
                      {currentCapture?.animalSpecies && (
                        <p className="text-xs text-green-400 mt-1">
                          检测到动物: {currentCapture.animalSpecies}
                        </p>
                      )}
                    </div>
                  </div>
                  {currentCapture?.hasHuman && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-red-500/80 rounded text-xs text-white font-medium">
                      人形检测
                    </div>
                  )}
                  <button
                    onClick={handlePrevCapture}
                    disabled={currentCaptureIndex === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={handleNextCapture}
                    disabled={currentCaptureIndex === sortedCaptures.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    拍摄时间: {currentCapture ? formatTime(currentCapture.timestamp) : '-'}
                  </span>
                  {currentCapture?.hasHuman && (
                    <button
                      onClick={handleInitiateApproval}
                      className="flex items-center gap-1 text-red-400 hover:text-red-300 text-xs font-medium"
                    >
                      <AlertTriangle size={14} />
                      发起审批
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Camera size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无抓拍记录</p>
              </div>
            )}
          </Card.Body>
        </Card>

        {showApproval && (
          <Card className="border-red-500/50">
            <Card.Body>
              <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg">
                <AlertTriangle size={20} className="text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">已提交偷猎事件审批</p>
                  <p className="text-xs text-gray-400 mt-1">
                    等待巡护员初审 → 保护区主任复核 → 林业局终审
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1">
            <Eye size={16} className="mr-2" />
            查看实时画面
          </Button>
          <Button variant="primary" className="flex-1" onClick={onClose}>
            关闭
          </Button>
        </div>
      </div>
    </Modal>
  );
}

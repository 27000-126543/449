import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import { Camera, Battery, HardDrive, Clock, AlertTriangle, Eye, ChevronLeft, ChevronRight, X, Radio, Video, Wifi, Maximize, Minimize } from 'lucide-react';
import { useCameraStore } from '@/store/useCameraStore';
import { useApprovalStore } from '@/store/useApprovalStore';
import { useAlertStore } from '@/store/useAlertStore';
import { cn } from '@/lib/utils';

interface CameraDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToApproval?: (approvalId: string) => void;
}

export default function CameraDetailModal({ isOpen, onClose, onGoToApproval }: CameraDetailModalProps) {
  const selectedCameraId = useCameraStore((state) => state.selectedCameraId);
  const camera = useCameraStore((state) => state.getCameraById(selectedCameraId || ''));
  const addApproval = useApprovalStore((state) => state.addApproval);
  const selectApproval = useApprovalStore((state) => state.selectApproval);
  const addAlert = useAlertStore((state) => state.addAlert);
  const [currentCaptureIndex, setCurrentCaptureIndex] = useState(0);
  const [showApproval, setShowApproval] = useState(false);
  const [showLiveView, setShowLiveView] = useState(false);
  const [lastApprovalId, setLastApprovalId] = useState<string | null>(null);
  const [liveFrame, setLiveFrame] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showLiveView) {
      interval = setInterval(() => {
        setLiveFrame(f => f + 1);
      }, 80);
    }
    return () => clearInterval(interval);
  }, [showLiveView]);

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
      const alertId = addAlert({
        type: 'poaching',
        cameraId: camera.id,
        position: camera.position,
        level: 'critical',
        status: 'pending',
        description: `${camera.name} 检测到人形轮廓，疑似偷猎活动`,
        searchPath: [],
      });

      const approvalId = addApproval({
        type: 'poaching',
        targetId: `CAP-${currentCapture.id}-${Date.now()}`,
        status: 'pending_level1',
        description: `${camera.name} 人形检测事件审批 - 疑似偷猎活动`,
      });

      setLastApprovalId(approvalId);
      setShowApproval(true);
    }
  };

  const handleGoToApproval = () => {
    if (lastApprovalId) {
      if (onGoToApproval) {
        onGoToApproval(lastApprovalId);
      } else {
        selectApproval(lastApprovalId);
        onClose();
      }
    }
  };

  const handleOpenLiveView = () => {
    setShowLiveView(true);
  };

  const handleCloseLiveView = () => {
    setShowLiveView(false);
  };

  const getAnimalSpeciesName = (species?: string) => {
    const map: Record<string, string> = {
      tiger: '华南虎',
      elephant: '亚洲象',
      panda: '大熊猫',
      deer: '梅花鹿',
      monkey: '金丝猴',
      leopard: '金钱豹',
    };
    return species ? map[species] || species : '-';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📷 红外相机详情" size="xl">
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
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-bold text-white">{camera.name}</h3>
                  <span className={cn('text-sm flex items-center gap-1', getStatusColor(camera.status))}>
                    <span className={cn('w-2 h-2 rounded-full',
                      camera.status === 'online' && 'bg-green-500 animate-pulse',
                      camera.status === 'low_battery' && 'bg-yellow-500 animate-pulse',
                      camera.status === 'offline' && 'bg-gray-500'
                    )} />
                    {getStatusText(camera.status)}
                  </span>
                  {camera.hasHumanDetection && (
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-medium animate-pulse border border-red-500/30">
                      ⚠ 人形检测
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-gray-400 flex items-center gap-2">
                  <MapPinInline /> 位置: ({camera.position[0].toFixed(1)}, {camera.position[2].toFixed(1)})
                </div>
                <div className="mt-3 grid grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                      <Battery size={12} />
                      电池电量
                    </div>
                    <ProgressBar value={camera.battery} size="sm" color={camera.battery < 20 ? 'red' : camera.battery < 50 ? 'yellow' : 'green'} />
                    <div className="text-sm text-white mt-1">{camera.battery}%</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                      <HardDrive size={12} />
                      存储空间
                    </div>
                    <ProgressBar value={100 - camera.storage} size="sm" color={camera.storage < 20 ? 'red' : camera.storage < 50 ? 'yellow' : 'cyan'} />
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
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-cyan-400" />
                <span className="text-sm font-medium text-white">抓拍记录</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {currentCaptureIndex + 1} / {sortedCaptures.length}
                </span>
                <Button variant="secondary" size="sm" onClick={handleOpenLiveView}>
                  <Video size={14} className="mr-1" />
                  实时画面
                </Button>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            {sortedCaptures.length > 0 ? (
              <div>
                <div className="relative h-56 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl overflow-hidden border border-gray-700">
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage: `radial-gradient(circle at ${20 + (liveFrame % 20)}% ${30 + (liveFrame % 15)}%, rgba(34,197,94,0.15) 0%, transparent 50%),
                                          radial-gradient(circle at ${70 + (liveFrame % 15)}% ${60 + (liveFrame % 20)}%, rgba(59,130,246,0.12) 0%, transparent 45%)`
                      }}
                    />
                    <div className="absolute inset-0"
                      style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
                        backgroundSize: '20px 20px'
                      }}
                    />
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Camera size={56} className="text-gray-600 mx-auto mb-3 opacity-50" />
                      <p className="text-sm text-gray-500">📷 红外夜视抓拍画面</p>
                      {currentCapture?.hasHuman && (
                        <div className="mt-4 px-6 py-3 bg-red-500/20 border border-red-500/40 rounded-xl mx-auto max-w-sm">
                          <div className="flex items-center justify-center gap-2 text-red-300 font-bold">
                            <AlertTriangle size={18} className="animate-pulse" />
                            检测到人形轮廓
                          </div>
                          <p className="text-xs text-red-400 mt-1">
                            置信度 {Math.round((currentCapture.confidence || 0) * 100)}% · 请人工核查
                          </p>
                          <div className="mt-2 flex items-center justify-center gap-4 text-xs text-red-300">
                            <span className="flex items-center gap-1">
                              <div className="w-4 h-3 border-2 border-red-400 animate-pulse" />
                              目标框 1
                            </span>
                            <span>大小: 182×320px</span>
                          </div>
                        </div>
                      )}
                      {currentCapture?.animalSpecies && !currentCapture.hasHuman && (
                        <div className="mt-4 px-6 py-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl mx-auto max-w-sm">
                          <div className="flex items-center justify-center gap-2 text-emerald-300 font-semibold">
                            🐾 检测到野生动物
                          </div>
                          <p className="text-xs text-emerald-400 mt-1">
                            物种: {getAnimalSpeciesName(currentCapture.animalSpecies)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {currentCapture?.hasHuman && (
                    <div className="absolute top-3 right-3 px-3 py-1.5 bg-red-500/90 rounded-lg text-xs text-white font-bold flex items-center gap-1.5 shadow-lg shadow-red-500/30">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                      人形检测告警
                    </div>
                  )}

                  <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-xs text-gray-300 flex items-center gap-1.5">
                    <Radio size={12} className="text-green-400" />
                    REC · {currentCapture ? formatTime(currentCapture.timestamp) : '-'}
                  </div>

                  <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-xs text-gray-400">
                    CAM-{camera.id} · 1920×1080 · H.264
                  </div>

                  <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-xs text-green-400 flex items-center gap-1.5">
                    <Wifi size={12} /> 信号稳定
                  </div>

                  <button
                    onClick={handlePrevCapture}
                    disabled={currentCaptureIndex === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 disabled:opacity-30 transition-all hover:scale-110 disabled:hover:scale-100"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    onClick={handleNextCapture}
                    disabled={currentCaptureIndex === sortedCaptures.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 disabled:opacity-30 transition-all hover:scale-110 disabled:hover:scale-100"
                  >
                    <ChevronRight size={22} />
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-gray-400 flex items-center gap-2">
                    <Clock size={14} />
                    拍摄时间: {currentCapture ? formatTime(currentCapture.timestamp) : '-'}
                  </div>
                  <div className="flex items-center gap-2">
                    {currentCapture?.animalSpecies && (
                      <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium">
                        🐾 {getAnimalSpeciesName(currentCapture.animalSpecies)}
                      </span>
                    )}
                    {currentCapture?.hasHuman && (
                      <button
                        onClick={handleInitiateApproval}
                        className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-red-500/20 transition-all"
                      >
                        <AlertTriangle size={14} />
                        发起偷猎事件审批
                      </button>
                    )}
                  </div>
                </div>

                {sortedCaptures.length > 1 && (
                  <div className="mt-4">
                    <div className="text-xs text-gray-500 mb-2">快速浏览 (点击切换)</div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {sortedCaptures.map((cap, idx) => (
                        <button
                          key={cap.id}
                          onClick={() => setCurrentCaptureIndex(idx)}
                          className={cn(
                            'flex-shrink-0 w-20 h-16 rounded-lg border-2 transition-all overflow-hidden relative',
                            currentCaptureIndex === idx
                              ? 'border-emerald-500 bg-emerald-500/10'
                              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                          )}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Camera size={20} className={cn(
                              cap.hasHuman ? 'text-red-400/60' : 'text-gray-500/60'
                            )} />
                          </div>
                          {cap.hasHuman && (
                            <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          )}
                          {currentCaptureIndex === idx && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <Camera size={40} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">暂无抓拍记录</p>
              </div>
            )}
          </Card.Body>
        </Card>

        {showApproval && (
          <Card className="border-red-500/40 shadow-lg shadow-red-500/10">
            <Card.Body>
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-red-500/15 via-orange-500/10 to-red-500/15 rounded-xl border border-red-500/30">
                <div className="w-12 h-12 rounded-2xl bg-red-500/30 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={24} className="text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-bold">✅ 偷猎事件审批已提交成功！</p>
                  <p className="text-xs text-gray-400 mt-1">
                    流程: 巡护员初审 → 保护区主任复核 → 林业局终审
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    审批编号: {lastApprovalId}
                  </p>
                </div>
                <Button variant="success" size="sm" onClick={handleGoToApproval}>
                  前往处理 →
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}

        <div className="flex gap-3 pt-1">
          <Button variant="secondary" className="flex-1 py-3" onClick={handleOpenLiveView}>
            <Eye size={18} className="mr-2" />
            查看实时监控画面
          </Button>
          <Button variant="primary" className="flex-1 py-3" onClick={onClose}>
            关闭
          </Button>
        </div>
      </div>

      {showLiveView && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 rounded-2xl w-full max-w-5xl max-h-[90vh] shadow-2xl border border-gray-800 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/30 to-orange-500/30 flex items-center justify-center">
                  <Video size={22} className="text-red-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{camera.name} - 实时监控画面</h3>
                    <span className="px-2.5 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-bold flex items-center gap-1 border border-red-500/30">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                      LIVE
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-3">
                    <span>HD 1080p · 30fps</span>
                    <span className="flex items-center gap-1 text-green-400">
                      <Wifi size={10} /> 信号稳定
                    </span>
                    <span>延迟: {(120 + liveFrame % 50)}ms</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCloseLiveView}
                  className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
                  title="关闭"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div className="flex-1 relative bg-black overflow-hidden min-h-[450px]">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at ${20 + (liveFrame * 3) % 60}% ${25 + Math.sin(liveFrame * 0.05) * 15}%, rgba(34,197,94,0.12) 0%, transparent 45%),
                    radial-gradient(circle at ${70 + Math.cos(liveFrame * 0.03) * 20}% ${60 + Math.sin(liveFrame * 0.04) * 20}%, rgba(59,130,246,0.1) 0%, transparent 40%),
                    radial-gradient(ellipse at center, #0f1a12 0%, #060807 100%)
                  `
                }}
              />

              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
                  backgroundSize: '32px 32px'
                }}
              />

              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 3px)`
                }}
              />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="absolute -inset-4 bg-cyan-500/10 rounded-full animate-ping" />
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center relative">
                      <Camera size={48} className="text-gray-500" />
                    </div>
                  </div>
                  <p className="text-lg text-gray-400 font-medium mb-2">📡 红外夜视实时画面传输中</p>
                  <p className="text-sm text-gray-600">信号正常 · 画面稳定 · 连续运行 {(liveFrame / 10).toFixed(1)}s</p>

                  <div className="mt-8 grid grid-cols-4 gap-4 max-w-md mx-auto">
                    <div className="p-3 bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50">
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider">分辨率</div>
                      <div className="text-white font-bold mt-1">1920×1080</div>
                    </div>
                    <div className="p-3 bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50">
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider">帧率</div>
                      <div className="text-green-400 font-bold mt-1">{28 + liveFrame % 5} fps</div>
                    </div>
                    <div className="p-3 bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50">
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider">码率</div>
                      <div className="text-blue-400 font-bold mt-1">{(4 + (liveFrame % 30) / 10).toFixed(1)} Mbps</div>
                    </div>
                    <div className="p-3 bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50">
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider">压缩</div>
                      <div className="text-purple-400 font-bold mt-1">H.265</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute top-4 left-4 space-y-2">
                <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl text-sm text-white flex items-center gap-2 border border-white/10">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  REC · {new Date().toLocaleString('zh-CN')}
                </div>
                <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl text-xs text-gray-300 border border-white/10">
                  CAM-{camera.id} · 红外夜视模式
                </div>
                <div className="px-4 py-2 bg-emerald-500/20 backdrop-blur-md rounded-xl text-xs text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  AI 智能检测开启中
                </div>
              </div>

              <div className="absolute top-4 right-4 space-y-2 text-right">
                <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl text-xs text-gray-300 border border-white/10 inline-block">
                  <div className="flex items-center justify-end gap-1.5">
                    <span>信号强度</span>
                    <div className="flex items-end gap-0.5 h-3">
                      <div className="w-0.5 bg-green-500 rounded-full" style={{ height: '30%' }} />
                      <div className="w-0.5 bg-green-500 rounded-full" style={{ height: '55%' }} />
                      <div className="w-0.5 bg-green-500 rounded-full" style={{ height: '80%' }} />
                      <div className="w-0.5 bg-green-500 rounded-full" style={{ height: '100%' }} />
                    </div>
                  </div>
                </div>
                <div className="block w-fit ml-auto px-4 py-2 bg-blue-500/20 backdrop-blur-md rounded-xl text-xs text-blue-300 border border-blue-500/30">
                  📍 位置锁定 · GPS精度 1.2m
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button className="p-3 rounded-2xl bg-gray-800/80 hover:bg-gray-700/80 text-white transition-colors border border-gray-700/50">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                    </button>
                    <button className="p-3 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors border border-red-500/30">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
                    </button>
                    <button className="p-3 rounded-2xl bg-gray-800/80 hover:bg-gray-700/80 text-white transition-colors border border-gray-700/50">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Maximize size={14} />
                      全屏显示
                    </span>
                    <span>传输安全: AES-256加密</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-900/80 border-t border-gray-800 flex items-center justify-between gap-4">
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <Eye size={16} className="text-gray-500" />
                监控模式 · 支持录像、截图、AI人形/动物识别
              </div>
              <Button variant="danger" onClick={handleCloseLiveView}>
                <X size={16} className="mr-2" />
                关闭实时画面
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

function MapPinInline() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  );
}

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Heart, MapPin, Clock, User, Stethoscope, Baby, Shield, CheckCircle, XCircle } from 'lucide-react';
import { useAnimalStore } from '@/store/useAnimalStore';
import { mockRescues, mockRescueStations } from '@/data/rescue';
import { cn } from '@/lib/utils';

interface RescueDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RescueDetailModal({ isOpen, onClose }: RescueDetailModalProps) {
  const selectedAnimalId = useAnimalStore((state) => state.selectedAnimalId);
  const animal = useAnimalStore((state) => state.getAnimalById(selectedAnimalId || ''));
  const [rescue, setRescue] = useState(mockRescues[0]);

  const rescueStation = mockRescueStations.find((s) => s.id === rescue.stationId);

  const severityColors: Record<string, string> = {
    mild: 'bg-green-500/20 text-green-400',
    moderate: 'bg-yellow-500/20 text-yellow-400',
    severe: 'bg-orange-500/20 text-orange-400',
    critical: 'bg-red-500/20 text-red-400',
  };

  const severityTexts: Record<string, string> = {
    mild: '轻微',
    moderate: '中等',
    severe: '严重',
    critical: '危急',
  };

  const statusTexts: Record<string, string> = {
    reported: '已上报',
    approved: '已审批',
    in_transit: '运输中',
    treated: '治疗中',
    released: '已放生',
  };

  const signoffs = [
    { key: 'vetSignoff', label: '兽医会签', icon: Stethoscope, name: '王兽医' },
    { key: 'caretakerSignoff', label: '保育员会签', icon: Baby, name: '李保育员' },
    { key: 'directorSignoff', label: '主任会签', icon: Shield, name: '陈主任' },
  ];

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!animal) return null;

  const getSpeciesName = (species: string) => {
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="动物救助详情" size="lg">
      <div className="space-y-4">
        <Card>
          <Card.Body>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <Heart size={28} className="text-red-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white">{animal.name}</h3>
                  <span className={cn('px-2 py-0.5 rounded text-xs font-medium', severityColors[rescue.severity])}>
                    {severityTexts[rescue.severity]}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
                    {statusTexts[rescue.status]}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-300">伤情: {rescue.injuryType}</p>
                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">物种: </span>
                    <span className="text-white">{getSpeciesName(animal.species)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">年龄: </span>
                    <span className="text-white">{animal.age}岁</span>
                  </div>
                  <div>
                    <span className="text-gray-400">心率: </span>
                    <span className="text-white">{animal.heartRate} bpm</span>
                  </div>
                  <div>
                    <span className="text-gray-400">体温: </span>
                    <span className="text-white">{animal.temperature.toFixed(1)}°C</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={12} />
                  上报时间: {formatTime(rescue.createdAt)}
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <span className="text-sm font-medium text-white">救助站点</span>
          </Card.Header>
          <Card.Body>
            {rescueStation && (
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Heart size={18} className="text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">{rescueStation.name}</div>
                  <div className="text-xs text-gray-400">
                    容量: {rescueStation.capacity}只 · 医护人员: {rescueStation.staffCount}人
                  </div>
                </div>
                <div className="text-right">
                  <MapPin size={14} className="text-gray-400 ml-auto" />
                  <div className="text-xs text-gray-400 mt-0.5">
                    约 {(rescue.route.length * 0.3).toFixed(1)} km
                  </div>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <span className="text-sm font-medium text-white">运输路线</span>
          </Card.Header>
          <Card.Body>
            <div className="h-28 bg-gray-900 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 200 100" className="w-full h-full">
                  <path
                    d="M 20 70 Q 60 30, 100 50 T 180 40"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    className="animate-pulse"
                  />
                  <circle cx="20" cy="70" r="5" fill="#ef4444" className="animate-pulse" />
                  <circle cx="180" cy="40" r="5" fill="#22c55e" />
                </svg>
              </div>
              <div className="absolute bottom-2 left-2 text-xs text-red-400 flex items-center gap-1">
                <Heart size={10} /> 受伤动物
              </div>
              <div className="absolute bottom-2 right-2 text-xs text-green-400 flex items-center gap-1">
                <Heart size={10} /> 救助站
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <span className="text-sm font-medium text-white">三级电子会签</span>
          </Card.Header>
          <Card.Body>
            <div className="space-y-3">
              {signoffs.map((signoff, index) => {
                const isSigned = (rescue as any)[signoff.key];
                return (
                  <div
                    key={signoff.key}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                      isSigned
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-gray-800/50 border-gray-700/50'
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        isSigned ? 'bg-green-500/30' : 'bg-gray-700'
                      )}
                    >
                      {isSigned ? (
                        <CheckCircle size={18} className="text-green-400" />
                      ) : (
                        <signoff.icon size={18} className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={cn('font-medium text-sm', isSigned ? 'text-white' : 'text-gray-400')}>
                        {signoff.label}
                      </div>
                      <div className="text-xs text-gray-500">{signoff.name}</div>
                    </div>
                    {index < signoffs.length - 1 && (
                      <div className="text-gray-600">→</div>
                    )}
                    {isSigned && <span className="text-xs text-green-400">已签署</span>}
                    {!isSigned && <span className="text-xs text-gray-500">待签署</span>}
                  </div>
                );
              })}
            </div>
          </Card.Body>
        </Card>

        <div className="flex gap-3">
          <Button variant="primary" className="flex-1">
            启动救助运输
          </Button>
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            关闭
          </Button>
        </div>
      </div>
    </Modal>
  );
}

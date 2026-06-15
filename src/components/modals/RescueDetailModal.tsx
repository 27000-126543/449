import { useState, useEffect, useMemo } from 'react';
import Modal from '@/components/ui/Modal';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Heart, MapPin, Clock, Stethoscope, Baby, Shield, CheckCircle, Play, Car, User, Phone, AlertTriangle, Thermometer, Activity } from 'lucide-react';
import { useAnimalStore } from '@/store/useAnimalStore';
import { mockRescues, mockRescueStations } from '@/data/rescue';
import { cn } from '@/lib/utils';
import type { Rescue, RescueStation, RescueSeverity, RescueStatus, Animal, Position } from '@/types';

interface RescueDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function calcDistance2D(p1: Position, p2: Position): number {
  const dx = p1[0] - p2[0];
  const dz = p1[2] - p2[2];
  return Math.sqrt(dx * dx + dz * dz);
}

function findNearestRescueStation(animalPos: Position) {
  let nearest = mockRescueStations[0];
  let minDist = calcDistance2D(animalPos, nearest.position);
  for (const s of mockRescueStations) {
    const d = calcDistance2D(animalPos, s.position);
    if (d < minDist) {
      minDist = d;
      nearest = s;
    }
  }
  return { station: nearest, distance: minDist };
}

export default function RescueDetailModal({ isOpen, onClose }: RescueDetailModalProps) {
  const getAnimalById = useAnimalStore((state) => state.getAnimalById);
  const selectedAnimalId = useAnimalStore((state) => state.selectedAnimalId);
  const updateAnimalStatus = useAnimalStore((state) => state.updateAnimalStatus);
  const updateAnimalVitals = useAnimalStore((state) => state.updateAnimalVitals);
  const animals = useAnimalStore((state) => state.animals);

  const [rescueAnimalId, setRescueAnimalId] = useState<string | null>(null);
  const animalInRescue = useMemo(() => {
    const id = rescueAnimalId || selectedAnimalId;
    if (!id) return null;
    return getAnimalById(id) || animals.find(a => a.id === id) || null;
  }, [rescueAnimalId, selectedAnimalId, getAnimalById, animals]);

  const [activeRescue, setActiveRescue] = useState<Rescue>(mockRescues[0]);

  useEffect(() => {
    if (!isOpen) return;
    const id = selectedAnimalId || rescueAnimalId;
    if (!id) return;
    const animal = getAnimalById(id) || animals.find(a => a.id === id);
    if (!animal) return;

    if (!rescueAnimalId) setRescueAnimalId(id);

    const { station } = findNearestRescueStation(animal.position);

    setActiveRescue({
      id: `RESC-${Date.now()}`,
      animalId: animal.id,
      stationId: station.id,
      severity: determineSeverity(animal),
      status: 'reported',
      injuryType: `疑似${getInjuryType(animal)}，心率${animal.heartRate}bpm，体温${animal.temperature.toFixed(1)}°C`,
      route: generateRescueRoute(animal.position, station.position),
      vetSignoff: false,
      caretakerSignoff: false,
      directorSignoff: false,
      createdAt: new Date(),
    });
  }, [isOpen, selectedAnimalId, rescueAnimalId, getAnimalById, animals]);

  const rescueStation = mockRescueStations.find((s) => s.id === activeRescue.stationId) || mockRescueStations[0];
  const distance = animalInRescue
    ? calculateDistance(animalInRescue.position, rescueStation.position)
    : 0;

  const severityColors: Record<RescueSeverity, string> = {
    mild: 'bg-green-500/20 text-green-400 border-green-500/30',
    moderate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    severe: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const severityTexts: Record<RescueSeverity, string> = {
    mild: '轻微',
    moderate: '中等',
    severe: '严重',
    critical: '危急',
  };

  const statusTexts: Record<RescueStatus, string> = {
    reported: '已上报',
    approved: '已审批',
    in_transit: '运输中',
    treated: '治疗中',
    released: '已放生',
  };

  const signoffs = [
    {
      key: 'vetSignoff' as const,
      label: '兽医会签',
      icon: Stethoscope,
      name: '王兽医',
      title: '首席野生动物医师',
      role: 'vet',
      contact: '138-****-0001',
    },
    {
      key: 'caretakerSignoff' as const,
      label: '保育员会签',
      icon: Baby,
      name: '李保育员',
      title: '高级动物保育员',
      role: 'caretaker',
      contact: '139-****-0002',
    },
    {
      key: 'directorSignoff' as const,
      label: '保护区主任',
      icon: Shield,
      name: '陈主任',
      title: '自然保护区管理主任',
      role: 'director',
      contact: '137-****-0003',
    },
  ];

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  const handleSignoff = (key: 'vetSignoff' | 'caretakerSignoff' | 'directorSignoff') => {
    setActiveRescue(prev => ({
      ...prev,
      [key]: true,
      status: prev.directorSignoff && key !== 'directorSignoff' ? prev.status :
              key === 'directorSignoff' && prev.vetSignoff && prev.caretakerSignoff ? 'approved' : prev.status,
    }));
  };

  const handleStartTransport = () => {
    setActiveRescue(prev => ({
      ...prev,
      status: 'in_transit',
    }));
  };

  const handleCompleteTreatment = () => {
    setActiveRescue(prev => ({
      ...prev,
      status: 'treated',
    }));
    if (animalInRescue) {
      updateAnimalVitals(
        animalInRescue.id,
        Math.round(animalInRescue.heartRate * 0.85),
        38.2
      );
    }
  };

  const handleReleaseAnimal = () => {
    setActiveRescue(prev => ({
      ...prev,
      status: 'released',
    }));
    if (animalInRescue) {
      updateAnimalStatus(animalInRescue.id, 'warning');
      const normalHR = animalInRescue.species === 'tiger' ? 68 : animalInRescue.species === 'leopard' ? 72 : 78;
      updateAnimalVitals(animalInRescue.id, normalHR, 37.8);
    }
  };

  if (!animalInRescue) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="动物救助详情" size="lg">
        <div className="text-center py-8 text-gray-400">
          <Heart size={48} className="mx-auto mb-3 opacity-50" />
          <p>请先从动物详情中启动救助流程</p>
        </div>
      </Modal>
    );
  }

  const allSignedOff = activeRescue.vetSignoff && activeRescue.caretakerSignoff && activeRescue.directorSignoff;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🚑 动物救助流程中心" size="xl">
      <div className="space-y-4">
        <Card className={cn('border-2', severityColors[activeRescue.severity])}>
          <Card.Body>
            <div className="flex items-start gap-4">
              <div className="p-4 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl">
                <Heart size={40} className="text-red-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-bold text-white">{animalInRescue.name}</h3>
                  <span className={cn('px-3 py-1 rounded-full text-xs font-semibold border', severityColors[activeRescue.severity])}>
                    ⚠ 伤情：{severityTexts[activeRescue.severity]}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {statusTexts[activeRescue.status]}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-300">🩹 {activeRescue.injuryType}</p>

                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-2 bg-gray-800/50 rounded-lg">
                    <div className="text-xs text-gray-500">物种</div>
                    <div className="text-sm font-medium text-white mt-0.5">{getSpeciesName(animalInRescue.species)}</div>
                  </div>
                  <div className="p-2 bg-gray-800/50 rounded-lg">
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Activity size={10} className="text-red-400" /> 心率
                    </div>
                    <div className="text-sm font-medium text-white mt-0.5">{animalInRescue.heartRate} bpm</div>
                  </div>
                  <div className="p-2 bg-gray-800/50 rounded-lg">
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Thermometer size={10} className="text-orange-400" /> 体温
                    </div>
                    <div className="text-sm font-medium text-white mt-0.5">{animalInRescue.temperature.toFixed(1)} °C</div>
                  </div>
                  <div className="p-2 bg-gray-800/50 rounded-lg">
                    <div className="text-xs text-gray-500">年龄/性别</div>
                    <div className="text-sm font-medium text-white mt-0.5">{animalInRescue.age}岁 / {animalInRescue.gender === 'male' ? '雄' : '雌'}</div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-400 flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> 上报时间: {formatTime(activeRescue.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> 事发位置: ({animalInRescue.position[0].toFixed(1)}, {animalInRescue.position[2].toFixed(1)})
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Car size={12} /> 运输距离: {distance.toFixed(1)} km
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700/60">
                  <div className="text-xs font-semibold text-gray-400 mb-3">
                    📍 救助流程状态进度
                  </div>
                  <div className="flex items-center gap-1">
                    {[
                      { key: 'reported', label: '已上报', condition: true, color: 'gray' },
                      { key: 'signoff', label: '三级会签', condition: allSignedOff, color: 'purple' },
                      { key: 'in_transit', label: '运输中', condition: activeRescue.status === 'in_transit' || activeRescue.status === 'treated' || activeRescue.status === 'released', color: 'blue' },
                      { key: 'treated', label: '已送达/治疗中', condition: activeRescue.status === 'treated' || activeRescue.status === 'released', color: 'orange' },
                      { key: 'released', label: '已康复', condition: activeRescue.status === 'released', color: 'emerald' },
                    ].map((step, idx, arr) => {
                      const isLast = idx === arr.length - 1;
                      const colorClasses: Record<string, string> = {
                        gray: 'bg-gray-600 border-gray-500 text-gray-200',
                        purple: 'bg-purple-600 border-purple-400 text-purple-100',
                        blue: 'bg-blue-600 border-blue-400 text-blue-100',
                        orange: 'bg-orange-600 border-orange-400 text-orange-100',
                        emerald: 'bg-emerald-600 border-emerald-400 text-emerald-100',
                      };
                      const fadedClass = step.condition ? colorClasses[step.color] : 'bg-gray-800/80 border-gray-700 text-gray-500';
                      return (
                        <div key={step.key} className="flex items-center flex-1 min-w-0">
                          <div className={cn('w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-[10px] font-bold', fadedClass)}>
                            {step.condition ? '✓' : idx + 1}
                          </div>
                          <div className={cn('ml-1 flex-1 min-w-0 text-[10px] leading-tight truncate', step.condition ? 'text-white font-medium' : 'text-gray-500')}>
                            {step.label}
                          </div>
                          {!isLast && (
                            <div className={cn('w-4 h-0.5 mx-1 flex-shrink-0 rounded',
                              step.condition ? `bg-${step.color === 'gray' && allSignedOff ? 'purple' : step.color}-500` : 'bg-gray-700'
                            )} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart size={16} className="text-emerald-400" />
                  <span className="text-sm font-medium text-white">🏥 推荐救助站点</span>
                </div>
                <span className="text-xs text-emerald-400 font-semibold">✨ 最近的站点</span>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-500/15 to-cyan-500/10 rounded-xl border border-emerald-500/20">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 flex items-center justify-center">
                    <Heart size={28} className="text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white text-lg">{rescueStation.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      容量: {rescueStation.capacity}只 · 医护人员: {rescueStation.staffCount}人
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs flex-wrap">
                      {rescueStation.vehicles.map(v => (
                        <span key={v.id} className={`px-2 py-0.5 rounded text-gray-300 ${
                          v.status === 'available' ? 'bg-emerald-900/50 text-emerald-300' :
                          v.status === 'in_use' ? 'bg-amber-900/50 text-amber-300' :
                          'bg-gray-800'
                        }`}>
                          {v.type === 'ambulance' ? '🚑' : v.type === 'suv' ? '🚙' : '�'} {v.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-emerald-400 text-sm font-semibold justify-end">
                      <MapPin size={14} />
                      {distance.toFixed(1)} km
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">预计 {(distance / 60 * 60).toFixed(0)} 分钟</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                    <User size={10} /> 主要值班人员
                  </div>
                  <div className="space-y-1.5">
                    {rescueStation.staff.map((s, i) => (
                      <div key={s.id || i} className="flex items-center gap-2 p-2 bg-gray-800/30 rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-medium ${
                          s.role === 'vet' ? 'bg-blue-700' :
                          s.role === 'caretaker' ? 'bg-green-700' :
                          s.role === 'director' ? 'bg-purple-700' : 'bg-gray-700'
                        }`}>
                          {s.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white truncate">{s.name}</div>
                          <div className="text-xs text-gray-400">
                            {s.role === 'vet' ? '🐾 兽医' :
                             s.role === 'caretaker' ? '🌿 保育员' :
                             s.role === 'director' ? '🎖 主任' : '🚗 司机'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-blue-400" />
                <span className="text-sm font-medium text-white">🛣️ 最优运输路线</span>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="h-44 bg-gradient-to-br from-gray-900 via-gray-900/90 to-blue-950/30 rounded-xl relative overflow-hidden border border-blue-500/10">
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <svg viewBox="0 0 300 140" className="w-full h-full">
                    <defs>
                      <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>
                    </defs>

                    <path
                      d="M 30 100 Q 80 40, 140 65 T 230 55 Q 265 48, 280 35"
                      fill="none"
                      stroke="url(#routeGradient)"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray="10,6"
                      className="animate-pulse"
                      opacity="0.9"
                    />
                    <path
                      d="M 30 100 Q 80 40, 140 65 T 230 55 Q 265 48, 280 35"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeDasharray="3,4"
                      opacity="0.5"
                    >
                      <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="1s" repeatCount="indefinite" />
                    </path>

                    <g transform="translate(30, 100)">
                      <circle r="12" fill="#ef4444" opacity="0.2" className="animate-ping" />
                      <circle r="8" fill="#ef4444" />
                      <circle r="4" fill="white" />
                    </g>
                    <text x="30" y="130" textAnchor="middle" className="text-xs" fill="#fca5a5" fontSize="9">
                      🚑 受伤动物
                    </text>

                    <g transform="translate(280, 35)">
                      <circle r="12" fill="#22c55e" opacity="0.2" className="animate-ping" />
                      <circle r="8" fill="#22c55e" />
                      <path d="M -3 -1 L -3 -3 L -1 -3 L -1 -1 L 1 -1 L 1 -3 L 3 -3 L 3 -1 L 5 -1 L 5 1 L 3 1 L 3 3 L 1 3 L 1 1 L -1 1 L -1 3 L -3 3 L -3 1 L -5 1 L -5 -1 Z" fill="white" />
                    </g>
                    <text x="280" y="20" textAnchor="middle" className="text-xs" fill="#86efac" fontSize="9">
                      🏥 救助站
                    </text>

                    <circle cx="155" cy="60" r="6" fill="#3b82f6" opacity="0.3">
                      <animate attributeName="r" from="6" to="10" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="155" cy="60" r="3" fill="#3b82f6" />
                  </svg>
                </div>

                <div className="absolute bottom-3 left-3 text-[10px] text-gray-500 bg-gray-900/80 px-2 py-1 rounded">
                  全程 <span className="text-blue-400 font-medium">{distance.toFixed(1)}km</span> · 预计 <span className="text-emerald-400 font-medium">{(distance / 60 * 60).toFixed(0)}min</span>
                </div>
                <div className="absolute top-3 right-3 text-[10px] text-blue-400 bg-blue-500/15 px-2 py-1 rounded border border-blue-500/20">
                  ✨ 实时导航已启动
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-purple-400" />
                <span className="text-sm font-medium text-white">📝 三级电子会签流程</span>
              </div>
              <span className={cn(
                'text-xs px-2.5 py-1 rounded-full font-semibold',
                allSignedOff
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              )}>
                {allSignedOff ? '✅ 全部通过' : `⏳ ${signoffs.filter(s => activeRescue[s.key]).length}/3 已签署`}
              </span>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="grid md:grid-cols-3 gap-4">
              {signoffs.map((signoff, index) => {
                const isSigned = activeRescue[signoff.key];
                const isNext = !isSigned && (index === 0 || activeRescue[signoffs[index - 1].key]);
                return (
                  <div
                    key={signoff.key}
                    className={cn(
                      'relative p-4 rounded-2xl border-2 transition-all duration-300',
                      isSigned
                        ? 'bg-gradient-to-br from-emerald-500/15 to-green-500/5 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                        : isNext
                        ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border-yellow-500/40 animate-pulse shadow-lg shadow-yellow-500/5'
                        : 'bg-gray-800/40 border-gray-700/50 opacity-60'
                    )}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0',
                          isSigned ? 'bg-emerald-500/30' : isNext ? 'bg-yellow-500/30' : 'bg-gray-700'
                        )}
                      >
                        {isSigned ? (
                          <CheckCircle size={26} className="text-emerald-400" />
                        ) : (
                          <signoff.icon size={26} className={isSigned ? 'text-emerald-400' : isNext ? 'text-yellow-400' : 'text-gray-500'} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={cn('font-bold text-base', isSigned ? 'text-emerald-300' : isNext ? 'text-yellow-300' : 'text-gray-400')}>
                          {signoff.label}
                        </div>
                        <div className="text-sm text-white mt-0.5">{signoff.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{signoff.title}</div>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-gray-400 bg-gray-900/40 rounded-lg p-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Phone size={10} /> {signoff.contact}
                      </div>
                    </div>

                    <button
                      onClick={() => isNext && !isSigned && handleSignoff(signoff.key)}
                      disabled={!isNext || isSigned}
                      className={cn(
                        'w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5',
                        isSigned
                          ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                          : isNext
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-400 hover:to-amber-400 shadow-md'
                          : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                      )}
                    >
                      {isSigned ? (
                        <><CheckCircle size={15} /> 已签署通过</>
                      ) : isNext ? (
                        <><Play size={15} /> 点击签署</>
                      ) : (
                        <>⏳ 等待上一步</>
                      )}
                    </button>

                    {index < signoffs.length - 1 && (
                      <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                        <div className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                          isSigned
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-700 text-gray-400'
                        )}>
                          →
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {allSignedOff && (
              <div className="mt-4 p-4 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-emerald-500/20 rounded-2xl border border-emerald-500/40 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={28} className="text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="text-emerald-300 font-bold text-lg">🎉 三级会签全部通过！救助方案已正式生效</div>
                  <div className="text-sm text-gray-400 mt-1">现在可以启动动物运输流程，3D场景将实时显示路线</div>
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  流程生效中
                </div>
              </div>
            )}
          </Card.Body>
        </Card>

        <div className="grid md:grid-cols-4 gap-3">
          <Button
            variant={allSignedOff && activeRescue.status === 'reported' ? 'success' : 'secondary'}
            onClick={handleStartTransport}
            disabled={!allSignedOff || activeRescue.status === 'in_transit' || activeRescue.status === 'treated' || activeRescue.status === 'released'}
            className="py-3 text-base"
          >
            <Car size={18} className="mr-2" />
            {activeRescue.status === 'reported' && !allSignedOff ? '⏳ 等待会签完成' :
             activeRescue.status === 'in_transit' ? '🚛 运输进行中...' :
             activeRescue.status === 'treated' || activeRescue.status === 'released' ? '✅ 已送达' :
             '🚀 启动运输'}
          </Button>
          <Button
            variant={activeRescue.status === 'in_transit' ? 'success' : 'secondary'}
            onClick={handleCompleteTreatment}
            disabled={activeRescue.status !== 'in_transit'}
            className="py-3 text-base"
          >
            <CheckCircle size={18} className="mr-2" />
            {activeRescue.status === 'in_transit' ? '🏥 确认已送达' :
             activeRescue.status === 'treated' || activeRescue.status === 'released' ? '✅ 治疗中' :
             '⏳ 待运输完成'}
          </Button>
          <Button
            variant={activeRescue.status === 'treated' ? 'success' : 'secondary'}
            onClick={handleReleaseAnimal}
            disabled={activeRescue.status !== 'treated'}
            className="py-3 text-base"
          >
            <Heart size={18} className="mr-2" />
            {activeRescue.status === 'treated' ? '💚 完成治疗，动物已康复' :
             activeRescue.status === 'released' ? '✅ 已康复（观察中）' :
             '⏳ 待治疗完成'}
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            className="py-3 text-base"
          >
            关闭面板
          </Button>
        </div>

        <div className="p-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-purple-500/10 rounded-2xl border border-blue-500/20">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-gray-400 leading-relaxed space-y-1">
              <p><span className="text-blue-300 font-semibold">📋 3D场景同步说明：</span></p>
              <p>• 启动救助流程后，3D地图中会出现<span className="text-red-400 font-medium">🚨 红色救助起点</span>标记（受伤动物位置）</p>
              <p>• 终点处会显示<span className="text-emerald-400 font-medium">🏥 绿色救助站</span>标记，带有脉冲光圈和发光效果</p>
              <p>• 蓝色发光的流动路线表示<span className="text-blue-400 font-medium">最优运输路径</span>，支持实时导航</p>
              <p>• 三级会签完成后，运输路线将被正式确认并锁定，防止意外变更</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function calculateDistance(p1: [number, number, number], p2: [number, number, number]): number {
  const dx = p1[0] - p2[0];
  const dz = p1[2] - p2[2];
  return Math.sqrt(dx * dx + dz * dz) * 0.6;
}

function generateRescueRoute(from: [number, number, number], to: [number, number, number]): [number, number, number][] {
  const midX = (from[0] + to[0]) / 2;
  const midZ = (from[2] + to[2]) / 2;
  return [
    from,
    [midX, 0.3, from[2]],
    [midX + 2, 0.3, midZ - 2],
    [to[0], 0.3, midZ],
    to,
  ];
}

function determineSeverity(animal: { heartRate: number; temperature: number; status: string }): RescueSeverity {
  if (animal.status === 'danger' || animal.status === 'lost') return 'critical';
  if (animal.status === 'warning') return 'severe';
  if (animal.heartRate > 120 || animal.heartRate < 40) return 'severe';
  if (animal.temperature > 40 || animal.temperature < 35) return 'moderate';
  return 'mild';
}

function getInjuryType(animal: { heartRate: number; temperature: number; status: string }): string {
  if (animal.status === 'danger') return '外伤导致生命体征异常';
  if (animal.status === 'warning') return '身体异常，需进一步检查';
  if (animal.temperature > 39) return '发热或中暑症状';
  if (animal.temperature < 36) return '体温偏低疑似失温';
  if (animal.heartRate > 110) return '心动过速可能受惊吓';
  if (animal.heartRate < 50) return '心率偏低疑似中毒';
  return '身体不适待查';
}

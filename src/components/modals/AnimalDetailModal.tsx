import Modal from '@/components/ui/Modal';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import { PawPrint, Heart, Thermometer, Clock, MapPin, Users } from 'lucide-react';
import { useAnimalStore } from '@/store/useAnimalStore';
import { useAlertStore } from '@/store/useAlertStore';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { useMemo } from 'react';

interface AnimalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AnimalDetailModal({ isOpen, onClose }: AnimalDetailModalProps) {
  const selectedAnimalId = useAnimalStore((state) => state.selectedAnimalId);
  const animal = useAnimalStore((state) => state.getAnimalById(selectedAnimalId || ''));
  const groupAnimals = useAnimalStore((state) =>
    animal ? state.getAnimalsByGroup(animal.groupId) : []
  );
  const createAlert = useAlertStore((state) => state.createAlertFromAnimal);

  const heartRateData = useMemo(() => {
    const data = [];
    for (let i = 23; i >= 0; i--) {
      const hour = new Date();
      hour.setHours(hour.getHours() - i);
      const baseRate = animal?.heartRate || 70;
      data.push({
        time: `${hour.getHours()}:00`,
        心率: Math.round(baseRate + (Math.random() - 0.5) * 20),
      });
    }
    return data;
  }, [animal]);

  const temperatureData = useMemo(() => {
    const data = [];
    for (let i = 23; i >= 0; i--) {
      const hour = new Date();
      hour.setHours(hour.getHours() - i);
      const baseTemp = animal?.temperature || 37;
      data.push({
        time: `${hour.getHours()}:00`,
        体温: +(baseTemp + (Math.random() - 0.5) * 1).toFixed(1),
      });
    }
    return data;
  }, [animal]);

  const heatMapData = useMemo(() => {
    const data = [];
    const center = animal?.position || [0, 0, 0];
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 10;
      data.push({
        x: center[0] + Math.cos(angle) * dist,
        y: center[2] + Math.sin(angle) * dist,
        intensity: Math.random(),
      });
    }
    return data;
  }, [animal]);

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

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      normal: '正常',
      warning: '警告',
      danger: '危险',
      lost: '失联',
    };
    return map[status] || status;
  };

  if (!animal) return null;

  const handleCreateAlert = () => {
    if (animal) {
      createAlert(
        animal.id,
        'injury',
        animal.position,
        `${animal.name} 状态异常，需人工核查`
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="动物详情" size="xl">
      <div className="space-y-4">
        <Card>
          <Card.Body>
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'w-16 h-16 rounded-xl flex items-center justify-center',
                  animal.status === 'danger' || animal.status === 'lost'
                    ? 'bg-red-500/20'
                    : animal.status === 'warning'
                    ? 'bg-yellow-500/20'
                    : 'bg-emerald-500/20'
                )}
              >
                <PawPrint
                  size={32}
                  className={cn(
                    animal.status === 'danger' || animal.status === 'lost'
                      ? 'text-red-400'
                      : animal.status === 'warning'
                      ? 'text-yellow-400'
                      : 'text-emerald-400'
                  )}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white">{animal.name}</h2>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-xs font-medium',
                      animal.status === 'normal' && 'bg-green-500/20 text-green-400',
                      animal.status === 'warning' && 'bg-yellow-500/20 text-yellow-400',
                      animal.status === 'danger' && 'bg-orange-500/20 text-orange-400',
                      animal.status === 'lost' && 'bg-red-500/20 text-red-400'
                    )}
                  >
                    {getStatusText(animal.status)}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-400">
                  {getSpeciesName(animal.species)} · {animal.gender === 'male' ? '雄性' : '雌性'} · {animal.age}岁
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    位置: ({animal.position[0].toFixed(1)}, {animal.position[2].toFixed(1)})
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    静止: {animal.stationaryTime.toFixed(0)}分钟
                  </span>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <Card.Header>
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-red-400" />
                <span className="text-sm font-medium text-white">心率监测</span>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="text-3xl font-bold text-red-400 mb-2">
                {animal.heartRate} <span className="text-sm font-normal text-gray-400">bpm</span>
              </div>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={heartRateData}>
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="心率"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <div className="flex items-center gap-2">
                <Thermometer size={16} className="text-orange-400" />
                <span className="text-sm font-medium text-white">体温监测</span>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="text-3xl font-bold text-orange-400 mb-2">
                {animal.temperature.toFixed(1)} <span className="text-sm font-normal text-gray-400">°C</span>
              </div>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={temperatureData}>
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} width={30} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="体温"
                      stroke="#f97316"
                      fill="#f97316"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </div>

        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-cyan-400" />
              <span className="text-sm font-medium text-white">24小时活动热区</span>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="h-40 bg-gray-900 rounded-lg relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-50"
                style={{
                  background: 'radial-gradient(circle at 50% 50%, #22c55e 0%, #84cc16 20%, #eab308 40%, #f97316 60%, transparent 70%)',
                  filter: 'blur(8px)',
                }}
              />
              <div
                className="absolute w-4 h-4 bg-white rounded-full border-2 border-emerald-500"
                style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                活动范围: 约 2.5 km²
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-purple-400" />
              <span className="text-sm font-medium text-white">族群动态</span>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="space-y-2">
              {groupAnimals.map((a) => (
                <div
                  key={a.id}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-lg',
                    a.id === animal.id ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-gray-800/50'
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center',
                      a.status === 'normal' && 'bg-green-500/20',
                      a.status === 'warning' && 'bg-yellow-500/20',
                      a.status === 'danger' && 'bg-red-500/20'
                    )}
                  >
                    <PawPrint
                      size={14}
                      className={cn(
                        a.status === 'normal' && 'text-green-400',
                        a.status === 'warning' && 'text-yellow-400',
                        a.status === 'danger' && 'text-red-400'
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{a.name}</div>
                    <div className="text-xs text-gray-400">
                      {a.heartRate} bpm · {a.temperature.toFixed(1)}°C
                    </div>
                  </div>
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full',
                      a.status === 'normal' && 'bg-green-500',
                      a.status === 'warning' && 'bg-yellow-500 animate-pulse',
                      a.status === 'danger' && 'bg-red-500 animate-pulse'
                    )}
                  />
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>

        <div className="flex gap-3">
          <button
            onClick={handleCreateAlert}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
          >
            发起救助预警
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </Modal>
  );
}

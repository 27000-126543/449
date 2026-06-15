import { useState } from 'react';
import { Activity, MapPin, Camera, Plane, BarChart3, Layers, Download } from 'lucide-react';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/Button';
import { useAnimalStore } from '@/store/useAnimalStore';
import { useCameraStore } from '@/store/useCameraStore';
import { useDroneStore } from '@/store/useDroneStore';
import { useAlertStore } from '@/store/useAlertStore';
import { useWorkOrderStore } from '@/store/useWorkOrderStore';
import { cn } from '@/lib/utils';
import { generateDailyReport } from '@/utils/excel';

interface RightPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  showHeatMap: boolean;
  onToggleHeatMap: () => void;
}

export default function RightPanel({ isOpen = true, onClose, showHeatMap, onToggleHeatMap }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'cameras' | 'drones'>('stats');

  const animals = useAnimalStore((state) => state.animals);
  const cameras = useCameraStore((state) => state.cameras);
  const drones = useDroneStore((state) => state.drones);
  const alerts = useAlertStore((state) => state.alerts);
  const workOrders = useWorkOrderStore((state) => state.workOrders);

  const totalAnimals = animals.length;
  const normalAnimals = animals.filter((a) => a.status === 'normal').length;
  const warningAnimals = animals.filter((a) => a.status === 'warning').length;
  const dangerAnimals = animals.filter((a) => a.status === 'danger' || a.status === 'lost').length;

  const onlineCameras = cameras.filter((c) => c.status === 'online').length;
  const lowBatteryCameras = cameras.filter((c) => c.status === 'low_battery').length;
  const offlineCameras = cameras.filter((c) => c.status === 'offline').length;
  const humanDetectionCameras = cameras.filter((c) => c.hasHumanDetection).length;

  const patrollingDrones = drones.filter((d) => d.status === 'patrolling').length;
  const alertDrones = drones.filter((d) => d.status === 'alert').length;
  const idleDrones = drones.filter((d) => d.status === 'idle' || d.status === 'charging').length;

  const pendingAlerts = alerts.filter((a) => a.status === 'pending').length;
  const processingAlerts = alerts.filter((a) => a.status === 'processing').length;

  const activeWorkOrders = workOrders.filter((w) => w.status !== 'completed').length;

  const tabs = [
    { id: 'stats' as const, label: '统计', icon: BarChart3 },
    { id: 'cameras' as const, label: '相机', icon: Camera },
    { id: 'drones' as const, label: '无人机', icon: Plane },
  ];

  const speciesStats = animals.reduce((acc: Record<string, number>, animal) => {
    acc[animal.species] = (acc[animal.species] || 0) + 1;
    return acc;
  }, {});

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

  const handleExportReport = () => {
    const today = new Date().toISOString().split('T')[0];
    generateDailyReport({
      date: today,
      animals,
      rangers: [],
      cameras,
      alerts,
      workOrders,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="w-72 h-full bg-gray-900/90 backdrop-blur-md border-l border-gray-800 flex flex-col">
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
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeTab === 'stats' && (
          <>
            <Card>
              <Card.Header>
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-emerald-400" />
                  <span className="text-sm font-medium text-white">动物状态总览</span>
                </div>
              </Card.Header>
              <Card.Body className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <div className="text-xl font-bold text-green-400">{normalAnimals}</div>
                    <div className="text-xs text-gray-400">正常</div>
                  </div>
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <div className="text-xl font-bold text-yellow-400">{warningAnimals}</div>
                    <div className="text-xs text-gray-400">警告</div>
                  </div>
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <div className="text-xl font-bold text-red-400">{dangerAnimals}</div>
                    <div className="text-xs text-gray-400">危险</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  共计 <span className="text-white font-medium">{totalAnimals}</span> 只动物
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-red-400" />
                  <span className="text-sm font-medium text-white">预警与工单</span>
                </div>
              </Card.Header>
              <Card.Body className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">待处理预警</span>
                  <span className={cn(
                    'font-bold',
                    pendingAlerts > 0 ? 'text-red-400' : 'text-green-400'
                  )}>
                    {pendingAlerts}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">处理中</span>
                  <span className="font-bold text-yellow-400">{processingAlerts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">活跃工单</span>
                  <span className="font-bold text-blue-400">{activeWorkOrders}</span>
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-cyan-400" />
                    <span className="text-sm font-medium text-white">风险热力图</span>
                  </div>
                  <button
                    onClick={onToggleHeatMap}
                    className={cn(
                      'px-2 py-1 text-xs rounded transition-colors',
                      showHeatMap
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    )}
                  >
                    {showHeatMap ? '已开启' : '已关闭'}
                  </button>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" />
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>低风险</span>
                  <span>中风险</span>
                  <span>高风险</span>
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <div className="flex items-center gap-2">
                  <BarChart3 size={16} className="text-purple-400" />
                  <span className="text-sm font-medium text-white">物种分布</span>
                </div>
              </Card.Header>
              <Card.Body className="space-y-2">
                {Object.entries(speciesStats).map(([species, count]) => (
                  <div key={species} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-16">{getSpeciesName(species)}</span>
                    <div className="flex-1">
                      <ProgressBar value={(count / totalAnimals) * 100} size="sm" color="green" />
                    </div>
                    <span className="text-xs text-white font-medium w-6 text-right">{count}</span>
                  </div>
                ))}
              </Card.Body>
            </Card>

            <Button variant="primary" className="w-full" onClick={handleExportReport}>
              <Download size={16} className="mr-2" />
              导出监测日报
            </Button>
          </>
        )}

        {activeTab === 'cameras' && (
          <div className="space-y-3">
            <Card>
              <Card.Body className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">在线相机</span>
                  <span className="font-bold text-green-400">{onlineCameras}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">低电量</span>
                  <span className="font-bold text-yellow-400">{lowBatteryCameras}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">离线</span>
                  <span className="font-bold text-gray-500">{offlineCameras}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">人形检测</span>
                  <span className="font-bold text-red-400">{humanDetectionCameras}</span>
                </div>
              </Card.Body>
            </Card>

            <div className="space-y-2">
              {cameras.map((camera) => (
                <Card key={camera.id} hoverable>
                  <Card.Body className="py-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{camera.name}</span>
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full',
                          camera.status === 'online' && 'bg-green-500',
                          camera.status === 'low_battery' && 'bg-yellow-500 animate-pulse',
                          camera.status === 'offline' && 'bg-gray-500'
                        )}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-10">电量</span>
                        <ProgressBar value={camera.battery} size="sm" color="green" />
                        <span className="text-xs text-gray-300 w-10 text-right">{camera.battery}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-10">存储</span>
                        <ProgressBar value={100 - camera.storage} size="sm" color="cyan" />
                        <span className="text-xs text-gray-300 w-10 text-right">{camera.storage}%</span>
                      </div>
                    </div>
                    {camera.hasHumanDetection && (
                      <div className="mt-2 px-2 py-1 bg-red-500/20 rounded text-xs text-red-400 text-center">
                        ⚠ 检测到人形轮廓
                      </div>
                    )}
                  </Card.Body>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'drones' && (
          <div className="space-y-3">
            <Card>
              <Card.Body className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">巡航中</span>
                  <span className="font-bold text-green-400">{patrollingDrones}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">任务中</span>
                  <span className="font-bold text-red-400">{alertDrones}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">待命/充电</span>
                  <span className="font-bold text-gray-400">{idleDrones}</span>
                </div>
              </Card.Body>
            </Card>

            <div className="space-y-2">
              {drones.map((drone) => (
                <Card key={drone.id} hoverable>
                  <Card.Body className="py-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Plane
                          size={16}
                          className={cn(
                            drone.status === 'alert' && 'text-red-400',
                            drone.status === 'patrolling' && 'text-green-400',
                            drone.status === 'charging' && 'text-cyan-400',
                            drone.status === 'idle' && 'text-gray-400',
                            drone.status === 'returning' && 'text-yellow-400'
                          )}
                        />
                        <span className="text-sm font-medium text-white">{drone.name}</span>
                      </div>
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded',
                          drone.status === 'patrolling' && 'bg-green-500/20 text-green-400',
                          drone.status === 'alert' && 'bg-red-500/20 text-red-400',
                          drone.status === 'charging' && 'bg-cyan-500/20 text-cyan-400',
                          drone.status === 'idle' && 'bg-gray-500/20 text-gray-400'
                        )}
                      >
                        {drone.status === 'patrolling' && '巡航中'}
                        {drone.status === 'alert' && '任务中'}
                        {drone.status === 'charging' && '充电中'}
                        {drone.status === 'idle' && '待命'}
                        {drone.status === 'returning' && '返航'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-10">电量</span>
                      <ProgressBar value={drone.battery} size="sm" color="green" />
                      <span className="text-xs text-gray-300 w-10 text-right">{drone.battery}%</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      高度: {drone.altitude.toFixed(1)}m · 速度: {drone.speed}m/s
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

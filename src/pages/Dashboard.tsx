import { useState, useEffect } from 'react';
import TopBar from '@/components/panels/TopBar';
import LeftPanel from '@/components/panels/LeftPanel';
import RightPanel from '@/components/panels/RightPanel';
import Scene from '@/scenes/Scene';
import AnimalDetailModal from '@/components/modals/AnimalDetailModal';
import AlertDetailModal from '@/components/modals/AlertDetailModal';
import CameraDetailModal from '@/components/modals/CameraDetailModal';
import ApprovalFlowModal from '@/components/modals/ApprovalFlowModal';
import WorkOrderDetailModal from '@/components/modals/WorkOrderDetailModal';
import RescueDetailModal from '@/components/modals/RescueDetailModal';
import { useAnimalStore } from '@/store/useAnimalStore';
import { useAlertStore } from '@/store/useAlertStore';
import { useCameraStore } from '@/store/useCameraStore';
import { useWorkOrderStore } from '@/store/useWorkOrderStore';
import { useApprovalStore } from '@/store/useApprovalStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router-dom';

type ModalType = 'animal' | 'alert' | 'camera' | 'approval' | 'workorder' | 'rescue' | null;

export default function Dashboard() {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [showHeatMap, setShowHeatMap] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const selectedAnimalId = useAnimalStore((state) => state.selectedAnimalId);
  const selectedAlertId = useAlertStore((state) => state.selectedAlertId);
  const selectedCameraId = useCameraStore((state) => state.selectedCameraId);
  const selectedWorkOrderId = useWorkOrderStore((state) => state.selectedWorkOrderId);
  const selectedApprovalId = useApprovalStore((state) => state.selectedApprovalId);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (selectedAnimalId) {
      setActiveModal('animal');
    }
  }, [selectedAnimalId]);

  useEffect(() => {
    if (selectedAlertId) {
      setActiveModal('alert');
    }
  }, [selectedAlertId]);

  useEffect(() => {
    if (selectedCameraId) {
      setActiveModal('camera');
    }
  }, [selectedCameraId]);

  useEffect(() => {
    if (selectedWorkOrderId) {
      setActiveModal('workorder');
    }
  }, [selectedWorkOrderId]);

  useEffect(() => {
    if (selectedApprovalId) {
      setActiveModal('approval');
    }
  }, [selectedApprovalId]);

  const handleCloseModal = () => {
    setActiveModal(null);
    useAnimalStore.getState().selectAnimal(null);
    useAlertStore.getState().selectAlert(null);
    useCameraStore.getState().selectCamera(null);
    useWorkOrderStore.getState().selectWorkOrder(null);
    useApprovalStore.getState().selectApproval(null);
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950 overflow-hidden">
      <TopBar
        onToggleLeftPanel={() => setLeftPanelOpen(!leftPanelOpen)}
        onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <div className="hidden lg:block">
          <LeftPanel isOpen={leftPanelOpen} onClose={() => setLeftPanelOpen(false)} />
        </div>

        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" style={{ display: leftPanelOpen ? 'block' : 'none' }}>
          <div className="absolute inset-y-0 left-0 w-72">
            <LeftPanel isOpen={leftPanelOpen} onClose={() => setLeftPanelOpen(false)} />
          </div>
        </div>

        <div className="flex-1 relative">
          <Scene showHeatMap={showHeatMap} />

          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-700/50">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-300">系统运行中</span>
            <div className="w-px h-4 bg-gray-700" />
            <span className="text-sm text-emerald-400 font-medium">实时监控</span>
          </div>

          <div className="absolute bottom-4 left-4 flex gap-2">
            <button
              onClick={() => setLeftPanelOpen(!leftPanelOpen)}
              className="lg:hidden p-2 bg-gray-800/80 backdrop-blur-sm rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/80 transition-colors border border-gray-700/50"
            >
              <span className="text-sm">📋</span>
            </button>
          </div>

          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              className="lg:hidden p-2 bg-gray-800/80 backdrop-blur-sm rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/80 transition-colors border border-gray-700/50"
            >
              <span className="text-sm">📊</span>
            </button>
          </div>
        </div>

        <div className="hidden lg:block">
          <RightPanel
            isOpen={rightPanelOpen}
            onClose={() => setRightPanelOpen(false)}
            showHeatMap={showHeatMap}
            onToggleHeatMap={() => setShowHeatMap(!showHeatMap)}
          />
        </div>

        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" style={{ display: rightPanelOpen ? 'block' : 'none' }}>
          <div className="absolute inset-y-0 right-0 w-72">
            <RightPanel
              isOpen={rightPanelOpen}
              onClose={() => setRightPanelOpen(false)}
              showHeatMap={showHeatMap}
              onToggleHeatMap={() => setShowHeatMap(!showHeatMap)}
            />
          </div>
        </div>
      </div>

      <AnimalDetailModal isOpen={activeModal === 'animal'} onClose={handleCloseModal} />
      <AlertDetailModal isOpen={activeModal === 'alert'} onClose={handleCloseModal} />
      <CameraDetailModal isOpen={activeModal === 'camera'} onClose={handleCloseModal} />
      <ApprovalFlowModal isOpen={activeModal === 'approval'} onClose={handleCloseModal} />
      <WorkOrderDetailModal isOpen={activeModal === 'workorder'} onClose={handleCloseModal} />
      <RescueDetailModal isOpen={activeModal === 'rescue'} onClose={handleCloseModal} />
    </div>
  );
}

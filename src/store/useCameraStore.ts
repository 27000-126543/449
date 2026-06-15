import { create } from 'zustand';
import type { Camera, CaptureRecord } from '@/types';
import { mockCameras } from '@/data/cameras';

interface CameraState {
  cameras: Camera[];
  selectedCameraId: string | null;
  getCameraById: (id: string) => Camera | undefined;
  selectCamera: (id: string | null) => void;
  updateCameraStatus: (id: string, status: Camera['status']) => void;
  updateCameraBattery: (id: string, battery: number) => void;
  addCapture: (cameraId: string, capture: CaptureRecord) => void;
  setHumanDetection: (id: string, hasHumanDetection: boolean) => void;
  getCamerasWithHumanDetection: () => Camera[];
}

export const useCameraStore = create<CameraState>((set, get) => ({
  cameras: mockCameras,
  selectedCameraId: null,

  getCameraById: (id) => get().cameras.find((c) => c.id === id),

  selectCamera: (id) => set({ selectedCameraId: id }),

  updateCameraStatus: (id, status) =>
    set((state) => ({
      cameras: state.cameras.map((c) => (c.id === id ? { ...c, status } : c)),
    })),

  updateCameraBattery: (id, battery) =>
    set((state) => ({
      cameras: state.cameras.map((c) => (c.id === id ? { ...c, battery } : c)),
    })),

  addCapture: (cameraId, capture) =>
    set((state) => ({
      cameras: state.cameras.map((c) =>
        c.id === cameraId
          ? {
              ...c,
              captures: [capture, ...c.captures].slice(0, 50),
              lastCapture: capture.timestamp,
              hasHumanDetection: capture.hasHuman ? true : c.hasHumanDetection,
            }
          : c
      ),
    })),

  setHumanDetection: (id, hasHumanDetection) =>
    set((state) => ({
      cameras: state.cameras.map((c) => (c.id === id ? { ...c, hasHumanDetection } : c)),
    })),

  getCamerasWithHumanDetection: () =>
    get().cameras.filter((c) => c.hasHumanDetection),
}));

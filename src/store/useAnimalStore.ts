import { create } from 'zustand';
import type { Animal, Position } from '@/types';
import { mockAnimals } from '@/data/animals';

interface AnimalState {
  animals: Animal[];
  selectedAnimalId: string | null;
  getAnimalById: (id: string) => Animal | undefined;
  selectAnimal: (id: string | null) => void;
  updateAnimalPosition: (id: string, position: Position) => void;
  updateAnimalStatus: (id: string, status: Animal['status']) => void;
  getAnimalsBySpecies: (species: string) => Animal[];
  getAnimalsByGroup: (groupId: string) => Animal[];
  updateAnimalVitals: (id: string, heartRate: number, temperature: number) => void;
}

export const useAnimalStore = create<AnimalState>((set, get) => ({
  animals: mockAnimals,
  selectedAnimalId: null,

  getAnimalById: (id) => get().animals.find((a) => a.id === id),

  selectAnimal: (id) => set({ selectedAnimalId: id }),

  updateAnimalPosition: (id, position) =>
    set((state) => ({
      animals: state.animals.map((a) =>
        a.id === id
          ? {
              ...a,
              position,
              trajectory: [...a.trajectory.slice(-19), position],
              lastUpdate: new Date(),
            }
          : a
      ),
    })),

  updateAnimalStatus: (id, status) =>
    set((state) => ({
      animals: state.animals.map((a) => (a.id === id ? { ...a, status } : a)),
    })),

  getAnimalsBySpecies: (species) => get().animals.filter((a) => a.species === species),

  getAnimalsByGroup: (groupId) => get().animals.filter((a) => a.groupId === groupId),

  updateAnimalVitals: (id, heartRate, temperature) =>
    set((state) => ({
      animals: state.animals.map((a) =>
        a.id === id ? { ...a, heartRate, temperature } : a
      ),
    })),
}));

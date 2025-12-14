import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Factory } from '../services/factory';

interface FactoryState {
  currentFactory: Factory | null;
  factories: Factory[];
  setCurrentFactory: (factory: Factory) => void;
  setFactories: (factories: Factory[]) => void;
  clearFactory: () => void;
}

export const useFactoryStore = create<FactoryState>()(
  persist(
    (set) => ({
      currentFactory: null,
      factories: [],

      setCurrentFactory: (factory) =>
        set({
          currentFactory: factory,
        }),

      setFactories: (factories) =>
        set({
          factories,
        }),

      clearFactory: () =>
        set({
          currentFactory: null,
          factories: [],
        }),
    }),
    {
      name: 'factory-storage',
      partialize: (state) => ({
        currentFactory: state.currentFactory,
        factories: state.factories,
      }),
    }
  )
);

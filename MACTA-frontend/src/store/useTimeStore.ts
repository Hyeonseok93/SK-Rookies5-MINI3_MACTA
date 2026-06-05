import { create } from 'zustand';

interface TimeState {
  serverOffset: number;
  setServerOffset: (offset: number) => void;
}

export const useTimeStore = create<TimeState>((set) => ({
  serverOffset: 0,
  setServerOffset: (offset) => set({ serverOffset: offset }),
}));

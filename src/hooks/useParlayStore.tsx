import { create } from 'zustand';

export interface ParlayLeg {
  marketId: string;
  marketLabel: string;
  marketCategory: string;
  outcomeId: string;
  outcomeLabel: string;
  odds: number;
  signalScore?: number;
}

interface ParlayStore {
  legs: ParlayLeg[];
  stake: number;
  isOpen: boolean;
  addLeg: (leg: ParlayLeg) => void;
  removeLeg: (marketId: string) => void;
  setStake: (stake: number) => void;
  clearParlay: () => void;
  toggleDrawer: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

export const useParlayStore = create<ParlayStore>((set) => ({
  legs: [],
  stake: 10,
  isOpen: false,
  
  addLeg: (leg) => set((state) => {
    // Check if market already in parlay - replace it
    const existingIndex = state.legs.findIndex(l => l.marketId === leg.marketId);
    if (existingIndex >= 0) {
      const newLegs = [...state.legs];
      newLegs[existingIndex] = leg;
      return { legs: newLegs };
    }
    return { legs: [...state.legs, leg] };
  }),
  
  removeLeg: (marketId) => set((state) => ({
    legs: state.legs.filter(l => l.marketId !== marketId)
  })),
  
  setStake: (stake) => set({ stake }),
  
  clearParlay: () => set({ legs: [], stake: 10 }),
  
  toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
  openDrawer: () => set({ isOpen: true }),
  closeDrawer: () => set({ isOpen: false }),
}));

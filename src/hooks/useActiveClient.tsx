import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ActiveClientStore {
  activeClientId: string | null;
  activeClientName: string | null;
  setActiveClient: (clientId: string | null, clientName: string | null) => void;
  clearActiveClient: () => void;
}

export const useActiveClient = create<ActiveClientStore>()(
  persist(
    (set) => ({
      activeClientId: null,
      activeClientName: null,
      setActiveClient: (clientId, clientName) => 
        set({ activeClientId: clientId, activeClientName: clientName }),
      clearActiveClient: () => 
        set({ activeClientId: null, activeClientName: null }),
    }),
    {
      name: 'active-client-storage',
    }
  )
);

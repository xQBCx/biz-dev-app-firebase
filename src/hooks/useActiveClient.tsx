import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ActiveClientStore {
  activeClientId: string | null;
  activeClientName: string | null;
  userId: string | null;
  setActiveClient: (clientId: string | null, clientName: string | null, userId: string) => void;
  clearActiveClient: () => void;
}

export const useActiveClient = create<ActiveClientStore>()(
  persist(
    (set) => ({
      activeClientId: null,
      activeClientName: null,
      userId: null,
      setActiveClient: (clientId, clientName, userId) => 
        set({ activeClientId: clientId, activeClientName: clientName, userId }),
      clearActiveClient: () => 
        set({ activeClientId: null, activeClientName: null, userId: null }),
    }),
    {
      name: 'active-client-storage',
    }
  )
);

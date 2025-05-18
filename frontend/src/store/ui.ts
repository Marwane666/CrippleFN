
import { create } from 'zustand';

type StakeModalType = {
  newsId: string | null;
  isOpen: boolean;
};

type WitnessModalType = {
  newsId: string | null;
  isOpen: boolean;
};

type VictimEnrollType = {
  newsId: string | null;
  isOpen: boolean;
};

interface UIState {
  stakeModal: StakeModalType;
  witnessModal: WitnessModalType;
  victimEnroll: VictimEnrollType;
  openStakeModal: (newsId: string) => void;
  closeStakeModal: () => void;
  openWitnessModal: (newsId: string) => void;
  closeWitnessModal: () => void;
  openVictimEnroll: (newsId: string) => void;
  closeVictimEnroll: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  stakeModal: {
    newsId: null,
    isOpen: false,
  },
  witnessModal: {
    newsId: null,
    isOpen: false,
  },
  victimEnroll: {
    newsId: null,
    isOpen: false,
  },
  openStakeModal: (newsId) => set((state) => ({ 
    stakeModal: { newsId, isOpen: true } 
  })),
  closeStakeModal: () => set((state) => ({ 
    stakeModal: { newsId: null, isOpen: false } 
  })),
  openWitnessModal: (newsId) => set((state) => ({ 
    witnessModal: { newsId, isOpen: true } 
  })),
  closeWitnessModal: () => set((state) => ({ 
    witnessModal: { newsId: null, isOpen: false } 
  })),
  openVictimEnroll: (newsId) => set((state) => ({ 
    victimEnroll: { newsId, isOpen: true } 
  })),
  closeVictimEnroll: () => set((state) => ({ 
    victimEnroll: { newsId: null, isOpen: false } 
  })),
}));

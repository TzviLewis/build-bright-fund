import { create } from 'zustand';
import { Donations } from '@/entities';

interface DonationNotification extends Donations {
  pageName?: string;
  originalAmount?: number;
  videoUrl?: string;
}

interface DonationStore {
  notifications: DonationNotification[];
  addNotification: (donation: DonationNotification) => void;
  removeNotification: (id: string) => void;
}

export const useDonationStore = create<DonationStore>((set) => ({
  notifications: [],
  addNotification: (donation) =>
    set((state) => ({
      notifications: [...state.notifications, donation],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n._id !== id),
    })),
}));

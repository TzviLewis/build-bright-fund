import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DonationRecord {
  id: string;
  campaignId: string;
  campaignTitle: string;
  amount: number;
  date: Date;
  donorName?: string;
  message?: string;
}

interface DonationHistoryStore {
  donations: DonationRecord[];
  addDonation: (donation: DonationRecord) => void;
  getDonationsByCampaign: (campaignId: string) => DonationRecord[];
  getTotalDonated: () => number;
  clearHistory: () => void;
}

export const useDonationHistoryStore = create<DonationHistoryStore>()(
  persist(
    (set, get) => ({
      donations: [],
      addDonation: (donation: DonationRecord) => {
        set((state) => ({
          donations: [donation, ...state.donations],
        }));
      },
      getDonationsByCampaign: (campaignId: string) => {
        return get().donations.filter((d) => d.campaignId === campaignId);
      },
      getTotalDonated: () => {
        return get().donations.reduce((sum, d) => sum + d.amount, 0);
      },
      clearHistory: () => {
        set({ donations: [] });
      },
    }),
    {
      name: 'donation-history-store',
    }
  )
);

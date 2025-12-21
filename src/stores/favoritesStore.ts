import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesStore {
  favorites: string[];
  addFavorite: (campaignId: string) => void;
  removeFavorite: (campaignId: string) => void;
  isFavorite: (campaignId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (campaignId: string) => {
        set((state) => ({
          favorites: [...new Set([...state.favorites, campaignId])],
        }));
      },
      removeFavorite: (campaignId: string) => {
        set((state) => ({
          favorites: state.favorites.filter((id) => id !== campaignId),
        }));
      },
      isFavorite: (campaignId: string) => {
        return get().favorites.includes(campaignId);
      },
      clearFavorites: () => {
        set({ favorites: [] });
      },
    }),
    {
      name: 'favorites-store',
    }
  )
);

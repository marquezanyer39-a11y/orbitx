import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ProfileStoreState {
  favoritePairIds: string[];
}

interface ProfileStoreActions {
  toggleFavoritePair: (pairId: string) => void;
  setFavoritePair: (pairId: string, favorite: boolean) => void;
  clearFavorites: () => void;
}

type ProfileStore = ProfileStoreState & ProfileStoreActions;

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      favoritePairIds: [],

      toggleFavoritePair: (pairId) => {
        const normalized = pairId.trim();
        if (!normalized) {
          return;
        }

        const exists = get().favoritePairIds.includes(normalized);
        set((state) => ({
          favoritePairIds: exists
            ? state.favoritePairIds.filter((item) => item !== normalized)
            : [normalized, ...state.favoritePairIds].slice(0, 32),
        }));
      },

      setFavoritePair: (pairId, favorite) => {
        const normalized = pairId.trim();
        if (!normalized) {
          return;
        }

        const exists = get().favoritePairIds.includes(normalized);
        if (favorite === exists) {
          return;
        }

        set((state) => ({
          favoritePairIds: favorite
            ? [normalized, ...state.favoritePairIds].slice(0, 32)
            : state.favoritePairIds.filter((item) => item !== normalized),
        }));
      },

      clearFavorites: () => set({ favoritePairIds: [] }),
    }),
    {
      name: 'orbitx-profile-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        favoritePairIds: state.favoritePairIds,
      }),
    },
  ),
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ConvertExecutionSummary } from '../types/convert';

interface ConvertStoreState {
  favoriteSymbols: string[];
  recentConversions: ConvertExecutionSummary[];
  toggleFavoriteSymbol: (symbol: string) => void;
  recordConversion: (entry: Omit<ConvertExecutionSummary, 'id' | 'createdAt'>) => void;
}

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

export const useConvertStore = create<ConvertStoreState>()(
  persist(
    (set) => ({
      favoriteSymbols: ['BTC', 'ETH', 'USDT', 'SOL'],
      recentConversions: [],

      toggleFavoriteSymbol: (symbol) => {
        const normalized = normalizeSymbol(symbol);
        set((state) => ({
          favoriteSymbols: state.favoriteSymbols.includes(normalized)
            ? state.favoriteSymbols.filter((item) => item !== normalized)
            : [normalized, ...state.favoriteSymbols].slice(0, 12),
        }));
      },

      recordConversion: (entry) => {
        set((state) => ({
          recentConversions: [
            {
              ...entry,
              id: `convert-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
              createdAt: new Date().toISOString(),
            },
            ...state.recentConversions,
          ].slice(0, 24),
        }));
      },
    }),
    {
      name: 'orbitx-convert-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

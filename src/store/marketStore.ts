import { create } from 'zustand';

import type { MarketCoin, MarketPair } from '../types';
import { appConfig } from '../constants/appConfig';
import { getHomeMarketData, getMarketsList, getTradePairData } from '../services/api/market';
import { useOrbitStore } from '../../store/useOrbitStore';
import { findLegacyTokenForTradeId, mapLegacyTokenToMarketPair } from '../utils/tradePairs';

interface MarketState {
  homeMarkets: MarketPair[];
  markets: MarketPair[];
  selectedPair: MarketPair | null;
  selectedCoin: MarketCoin | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  loadHomeMarkets: () => Promise<void>;
  loadMarkets: () => Promise<void>;
  selectPairById: (pairId: string) => Promise<MarketPair | null>;
  refreshSelectedPair: () => Promise<void>;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  homeMarkets: [],
  markets: [],
  selectedPair: null,
  selectedCoin: null,
  loading: false,
  error: null,
  lastUpdated: null,

  loadHomeMarkets: async () => {
    set({ loading: true, error: null });
    try {
      const homeMarkets = await getHomeMarketData();
      set({
        homeMarkets,
        selectedPair: get().selectedPair ?? homeMarkets[0] ?? null,
        selectedCoin: get().selectedCoin ?? homeMarkets[0]?.coin ?? null,
        lastUpdated: new Date().toISOString(),
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'No se pudo cargar el mercado.',
      });
    }
  },

  loadMarkets: async () => {
    set({ loading: true, error: null });
    try {
      const markets = await getMarketsList();
      const fallbackPair = markets.find((pair) => pair.id === appConfig.defaultPairId) ?? markets[0] ?? null;
      set({
        markets,
        selectedPair: get().selectedPair ?? fallbackPair,
        selectedCoin: get().selectedCoin ?? fallbackPair?.coin ?? null,
        lastUpdated: new Date().toISOString(),
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'No se pudo cargar la lista de mercados.',
      });
    }
  },

  selectPairById: async (pairId) => {
    try {
      const current = get().markets.find((pair) => pair.id === pairId) ?? get().homeMarkets.find((pair) => pair.id === pairId);
      const legacyToken = current ? null : findLegacyTokenForTradeId(useOrbitStore.getState().tokens, pairId);
      const selectedPair =
        current ??
        (legacyToken ? mapLegacyTokenToMarketPair(legacyToken) : await getTradePairData(pairId));
      set({
        selectedPair,
        selectedCoin: selectedPair.coin,
        lastUpdated: new Date().toISOString(),
      });
      return selectedPair;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'No se pudo abrir el par seleccionado.',
      });
      return null;
    }
  },

  refreshSelectedPair: async () => {
    const pairId = get().selectedPair?.id ?? appConfig.defaultPairId;
    await get().selectPairById(pairId);
  },
}));

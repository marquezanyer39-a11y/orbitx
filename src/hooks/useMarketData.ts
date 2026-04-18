import { useEffect } from 'react';

import { appConfig } from '../constants/appConfig';
import { useMarketStore } from '../store/marketStore';

export function useMarketData(loadMode: 'home' | 'markets' | 'trade' = 'markets') {
  const {
    homeMarkets,
    markets,
    selectedPair,
    loading,
    error,
    lastUpdated,
    loadHomeMarkets,
    loadMarkets,
    selectPairById,
    refreshSelectedPair,
  } = useMarketStore();

  useEffect(() => {
    const lastUpdatedAt = lastUpdated ? new Date(lastUpdated).getTime() : 0;
    const refreshWindow =
      loadMode === 'home'
        ? appConfig.refreshIntervals.home
        : loadMode === 'trade'
          ? appConfig.refreshIntervals.trade
          : appConfig.refreshIntervals.markets;
    const isFresh = Boolean(lastUpdatedAt) && Date.now() - lastUpdatedAt < refreshWindow;

    if (loadMode === 'home') {
      if (homeMarkets.length && isFresh) {
        return;
      }
      void loadHomeMarkets();
      return;
    }

    if (markets.length && isFresh) {
      return;
    }

    void loadMarkets();
  }, [homeMarkets.length, lastUpdated, loadHomeMarkets, loadMarkets, loadMode, markets.length]);

  return {
    homeMarkets,
    markets,
    selectedPair,
    loading,
    error,
    lastUpdated,
    loadHomeMarkets,
    loadMarkets,
    selectPairById,
    refreshSelectedPair,
  };
}

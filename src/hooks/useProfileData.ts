import { useMemo } from 'react';

import { useAuthStore } from '../store/authStore';
import { useMarketData } from './useMarketData';
import { useTradeStore } from '../store/tradeStore';
import { useWalletStore } from '../store/walletStore';
import { useProfileStore } from '../store/profileStore';
import { buildProfileIdentity, buildProfileMetrics } from '../services/profile/profileData';
import { formatCurrency } from '../utils/formatCurrency';

export function useProfileData() {
  const profile = useAuthStore((state) => state.profile);
  const session = useAuthStore((state) => state.session);
  const authHasHydrated = useAuthStore((state) => state.hasHydrated);
  const authHasBootstrapped = useAuthStore((state) => state.hasBootstrapped);

  const { markets } = useMarketData('markets');
  const recentOrders = useTradeStore((state) => state.recentOrders);
  const openOrders = useTradeStore((state) => state.openOrders);
  const priceAlerts = useTradeStore((state) => state.priceAlerts);

  const hasWalletHydrated = useWalletStore((state) => state.hasHydrated);
  const isWalletReady = useWalletStore((state) => state.isWalletReady);
  const walletAssets = useWalletStore((state) => state.assets);
  const spotBalances = useWalletStore((state) => state.spotBalances);
  const walletHistory = useWalletStore((state) => state.history);
  const createdTokens = useWalletStore((state) => state.createdTokens);

  const favoritePairIds = useProfileStore((state) => state.favoritePairIds);

  const identity = useMemo(
    () => buildProfileIdentity(profile, session),
    [profile, session],
  );

  const metrics = useMemo(() => {
    const seeds = buildProfileMetrics({
      walletAssets,
      spotBalances,
      markets,
      recentOrders,
      openOrders,
    });

    return seeds.map((metric) => ({
      ...metric,
      value:
        metric.format === 'currency'
          ? formatCurrency(metric.rawValue ?? 0, true)
          : metric.format === 'percent'
            ? metric.rawValue === null
              ? 'Sin datos'
              : `${metric.rawValue.toFixed(1)}%`
            : `${Math.round(metric.rawValue ?? 0)}`,
    }));
  }, [markets, openOrders, recentOrders, spotBalances, walletAssets]);

  return {
    loading: !authHasHydrated || !authHasBootstrapped || !hasWalletHydrated,
    identity,
    metrics,
    isWalletReady,
    favoriteCount: favoritePairIds.length,
    historyCount: walletHistory.length + recentOrders.length + openOrders.length,
    alertCount: priceAlerts.filter((alert) => !alert.triggeredAt).length,
    createdTokensCount: createdTokens.length,
  };
}

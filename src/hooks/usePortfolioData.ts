import { useMemo } from 'react';

import { formatCurrencyByLanguage } from '../../constants/i18n';
import { FEATURE_STATUS } from '../constants/featureStatus';
import { useOrbitStore } from '../../store/useOrbitStore';
import { getTotalPortfolioBalanceUsd } from '../utils/portfolioTotals';
import { useExternalWallet } from './useExternalWallet';
import { useExternalWalletBalances } from './useExternalWalletBalances';
import { useWalletStore } from '../store/walletStore';
import { useMarketStore } from '../store/marketStore';

function buildHeroSeries(seriesList: number[][]) {
  const valid = seriesList.filter((series) => series.length);
  if (!valid.length) {
    return [42, 44, 48, 46, 52, 58, 60, 57, 61, 64, 68, 66];
  }

  const targetLength = Math.max(...valid.map((series) => series.length));

  return Array.from({ length: targetLength }, (_, index) => {
    const values = valid.map((series) => {
      const pointer =
        series.length === targetLength
          ? index
          : Math.min(series.length - 1, Math.floor((index / targetLength) * series.length));
      return series[pointer] ?? series[series.length - 1] ?? 0;
    });

    return values.reduce((sum, value) => sum + value, 0) / values.length;
  });
}

export function usePortfolioData() {
  const language = useOrbitStore((state) => state.settings.language);
  const wallet = useWalletStore();
  const externalWallet = useExternalWallet();
  const liveMarkets = useMarketStore((state) => state.homeMarkets);
  const marketsLoading = useMarketStore((state) => state.loading);
  const marketError = useMarketStore((state) => state.error);
  const externalWalletAddress =
    externalWallet.address?.trim() || wallet.externalWallet.address?.trim() || '';
  const externalWalletChainId = externalWallet.chainId ?? wallet.externalWallet.chainId;
  const externalWalletBalances = useExternalWalletBalances({
    address: externalWalletAddress,
    chainId: externalWalletChainId,
    enabled: Boolean(externalWalletAddress),
  });

  const marketMap = useMemo(
    () => new Map(liveMarkets.map((market) => [market.baseSymbol.toUpperCase(), market])),
    [liveMarkets],
  );

  const spotAssets = useMemo(
    () =>
      wallet.spotBalances.map((balance) => {
        const market = marketMap.get(balance.symbol.toUpperCase());
        const price =
          balance.symbol.toUpperCase() === 'USDT' || balance.symbol.toUpperCase() === 'USDC'
            ? 1
            : market?.price ?? 0;

        return {
          symbol: balance.symbol.toUpperCase(),
          usdValue: balance.amount * price,
        };
      }),
    [marketMap, wallet.spotBalances],
  );

  const verifiedSpotAssets = FEATURE_STATUS.trade.isDemoMode ? [] : spotAssets;
  const totalSpot = useMemo(
    () => verifiedSpotAssets.reduce((sum, asset) => sum + asset.usdValue, 0),
    [verifiedSpotAssets],
  );
  const demoSpotTotal = useMemo(
    () => spotAssets.reduce((sum, asset) => sum + asset.usdValue, 0),
    [spotAssets],
  );
  const totalLocalWalletWeb3 = useMemo(
    () => wallet.assets.reduce((sum, asset) => sum + asset.usdValue, 0),
    [wallet.assets],
  );
  const totalExternalWeb3 = externalWalletAddress ? externalWalletBalances.totalUsdEstimate : 0;
  const totalWeb3 = totalLocalWalletWeb3 + totalExternalWeb3;
  const totalBalance = getTotalPortfolioBalanceUsd({
    spotBalanceUsd: totalSpot,
    localAccountBalanceUsd: 0,
    web3BalanceUsd: totalWeb3,
  });

  const holdingsWithChange = useMemo(() => {
    const web3 = wallet.assets.map((asset) => ({
      usdValue: asset.usdValue,
      change24h: marketMap.get(asset.symbol.toUpperCase())?.change24h ?? 0,
    }));
    const externalWeb3 = externalWalletBalances.assets.map((asset) => ({
      usdValue: asset.usdValue,
      change24h: marketMap.get(asset.symbol.toUpperCase())?.change24h ?? 0,
    }));
    const spot = verifiedSpotAssets.map((asset) => ({
      usdValue: asset.usdValue,
      change24h: marketMap.get(asset.symbol.toUpperCase())?.change24h ?? 0,
    }));

    return [...web3, ...externalWeb3, ...spot].filter((item) => item.usdValue > 0);
  }, [externalWalletBalances.assets, marketMap, verifiedSpotAssets, wallet.assets]);

  const changePct = useMemo(() => {
    const weightedUsd = holdingsWithChange.reduce((sum, item) => sum + item.usdValue, 0);
    if (weightedUsd > 0) {
      return holdingsWithChange.reduce(
        (sum, item) => sum + item.usdValue * (item.change24h / 100),
        0,
      ) / weightedUsd * 100;
    }

    const marketAverage =
      liveMarkets.reduce((sum, item) => sum + item.change24h, 0) / Math.max(liveMarkets.length, 1);
    return Number.isFinite(marketAverage) ? marketAverage : 0;
  }, [holdingsWithChange, liveMarkets]);

  const changeUsd = totalBalance * (changePct / 100);
  const series = useMemo(
    () => buildHeroSeries(liveMarkets.map((market) => market.sparkline).filter(Boolean)),
    [liveMarkets],
  );

  return {
    walletReady: wallet.isWalletReady,
    loading:
      !wallet.hasHydrated ||
      (marketsLoading && !liveMarkets.length) ||
      (externalWalletBalances.isLoading && totalBalance === 0),
    marketError,
    totalBalance,
    totalSpot,
    totalLocalAccount: 0,
    totalLocalWalletWeb3,
    totalWeb3,
    totalExternalWeb3,
    demoSpotTotal,
    totalBalanceLabel: formatCurrencyByLanguage(language, totalBalance || 0, 'USD'),
    totalSpotLabel: formatCurrencyByLanguage(language, totalSpot || 0, 'USD'),
    totalWeb3Label: formatCurrencyByLanguage(language, totalWeb3 || 0, 'USD'),
    changeUsd,
    changePct,
    changeLabel: `${changeUsd >= 0 ? '+' : '-'}${formatCurrencyByLanguage(
      language,
      Math.abs(changeUsd),
      'USD',
    )} (${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%)`,
    series,
    cacheLabel: wallet.showingCachedBalances ? 'Mostrando ultimo balance conocido' : null,
  };
}

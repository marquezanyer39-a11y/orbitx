import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  getExternalWalletBalanceNetworkLabel,
  getExternalWalletMultiChainBalanceSnapshot,
  type ExternalWalletBalanceAsset,
  type ExternalWalletBalanceStatus,
  type ExternalWalletNetworkBalanceState,
} from '../services/wallet/externalWalletBalances';

interface UseExternalWalletBalancesOptions {
  address?: string;
  chainId?: number;
  enabled?: boolean;
}

interface ExternalWalletBalancesState {
  status: ExternalWalletBalanceStatus;
  assets: ExternalWalletBalanceAsset[];
  visibleAssets: ExternalWalletBalanceAsset[];
  nativeAsset?: ExternalWalletBalanceAsset;
  tokenAssets: ExternalWalletBalanceAsset[];
  chainLabel: string;
  totalUsdEstimate: number;
  networkStates: ExternalWalletNetworkBalanceState[];
  failedNetworkCount: number;
  failedTokenCount: number;
  discoveryEnabled: boolean;
  hasUnpricedAssets: boolean;
  updatedAt?: string;
  message?: string;
}

const EMPTY_STATE: ExternalWalletBalancesState = {
  status: 'idle',
  assets: [],
  visibleAssets: [],
  tokenAssets: [],
  chainLabel: 'Sin red',
  totalUsdEstimate: 0,
  networkStates: [],
  failedNetworkCount: 0,
  failedTokenCount: 0,
  discoveryEnabled: false,
  hasUnpricedAssets: false,
};

function buildCleanErrorState(
  chainId: number | undefined,
  currentAssets: ExternalWalletBalanceAsset[],
): ExternalWalletBalancesState {
  return {
    status: 'error',
    assets: currentAssets,
    visibleAssets: currentAssets.filter((asset) => asset.amount > 0),
    nativeAsset: currentAssets.find((asset) => asset.type === 'native'),
    tokenAssets: currentAssets.filter((asset) => asset.type === 'erc20'),
    chainLabel: getExternalWalletBalanceNetworkLabel(chainId),
    totalUsdEstimate: currentAssets.reduce(
      (sum, asset) => (asset.amount > 0 ? sum + asset.usdValue : sum),
      0,
    ),
    networkStates: [],
    failedNetworkCount: 1,
    failedTokenCount: 0,
    discoveryEnabled: false,
    hasUnpricedAssets: currentAssets.some((asset) => asset.amount > 0 && !asset.priceAvailable),
    message: 'No se pudo actualizar esta red',
  };
}

export function useExternalWalletBalances({
  address,
  chainId,
  enabled = true,
}: UseExternalWalletBalancesOptions) {
  const [state, setState] = useState<ExternalWalletBalancesState>(EMPTY_STATE);
  const normalizedAddress = useMemo(() => address?.trim() ?? '', [address]);

  const refresh = useCallback(async () => {
    if (!enabled || !normalizedAddress) {
      setState(EMPTY_STATE);
      return;
    }

    setState((current) => ({
      ...current,
      status: 'loading',
      chainLabel: getExternalWalletBalanceNetworkLabel(chainId),
      message: current.assets.length ? 'Actualizando saldos...' : undefined,
    }));

    try {
      const snapshot = await getExternalWalletMultiChainBalanceSnapshot(normalizedAddress);
      setState({
        status: snapshot.status,
        assets: snapshot.assets,
        visibleAssets: snapshot.visibleAssets,
        nativeAsset: snapshot.assets.find(
          (asset) => asset.type === 'native' && asset.chainId === chainId,
        ),
        tokenAssets: snapshot.assets.filter((asset) => asset.type === 'erc20'),
        chainLabel: getExternalWalletBalanceNetworkLabel(chainId),
        totalUsdEstimate: snapshot.totalUsdEstimate,
        networkStates: snapshot.networkStates,
        failedNetworkCount: snapshot.failedNetworkCount,
        failedTokenCount: snapshot.networkStates.reduce(
          (sum, network) => sum + network.failedTokenCount,
          0,
        ),
        discoveryEnabled: snapshot.discoveryEnabled,
        hasUnpricedAssets: snapshot.hasUnpricedAssets,
        updatedAt: snapshot.fetchedAt,
        message: snapshot.message,
      });
    } catch {
      setState((current) => buildCleanErrorState(chainId, current.assets));
    }
  }, [chainId, enabled, normalizedAddress]);

  useEffect(() => {
    let mounted = true;

    if (!enabled || !normalizedAddress) {
      setState(EMPTY_STATE);
      return undefined;
    }

    setState((current) => ({
      ...current,
      status: 'loading',
      chainLabel: getExternalWalletBalanceNetworkLabel(chainId),
    }));

    getExternalWalletMultiChainBalanceSnapshot(normalizedAddress)
      .then((snapshot) => {
        if (!mounted) {
          return;
        }

        setState({
          status: snapshot.status,
          assets: snapshot.assets,
          visibleAssets: snapshot.visibleAssets,
          nativeAsset: snapshot.assets.find(
            (asset) => asset.type === 'native' && asset.chainId === chainId,
          ),
          tokenAssets: snapshot.assets.filter((asset) => asset.type === 'erc20'),
          chainLabel: getExternalWalletBalanceNetworkLabel(chainId),
          totalUsdEstimate: snapshot.totalUsdEstimate,
          networkStates: snapshot.networkStates,
          failedNetworkCount: snapshot.failedNetworkCount,
          failedTokenCount: snapshot.networkStates.reduce(
            (sum, network) => sum + network.failedTokenCount,
            0,
          ),
          discoveryEnabled: snapshot.discoveryEnabled,
          hasUnpricedAssets: snapshot.hasUnpricedAssets,
          updatedAt: snapshot.fetchedAt,
          message: snapshot.message,
        });
      })
      .catch(() => {
        if (!mounted) {
          return;
        }

        setState((current) => buildCleanErrorState(chainId, current.assets));
      });

    return () => {
      mounted = false;
    };
  }, [chainId, enabled, normalizedAddress]);

  return {
    ...state,
    isLoading: state.status === 'loading',
    isAvailable: Boolean(enabled && normalizedAddress),
    refresh,
  };
}

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  getExternalWalletBalanceNetworkLabel,
  getExternalWalletBalanceSnapshot,
  type ExternalWalletBalanceAsset,
  type ExternalWalletBalanceStatus,
} from '../services/wallet/externalWalletBalances';

interface UseExternalWalletBalancesOptions {
  address?: string;
  chainId?: number;
  enabled?: boolean;
}

interface ExternalWalletBalancesState {
  status: ExternalWalletBalanceStatus;
  assets: ExternalWalletBalanceAsset[];
  nativeAsset?: ExternalWalletBalanceAsset;
  tokenAssets: ExternalWalletBalanceAsset[];
  chainLabel: string;
  failedTokenCount: number;
  updatedAt?: string;
  message?: string;
}

const EMPTY_STATE: ExternalWalletBalancesState = {
  status: 'idle',
  assets: [],
  tokenAssets: [],
  chainLabel: 'Sin red',
  failedTokenCount: 0,
};

function buildCleanErrorState(
  chainId: number | undefined,
  currentAssets: ExternalWalletBalanceAsset[],
): ExternalWalletBalancesState {
  return {
    status: 'error',
    assets: currentAssets,
    nativeAsset: currentAssets.find((asset) => asset.type === 'native'),
    tokenAssets: currentAssets.filter((asset) => asset.type === 'erc20'),
    chainLabel: getExternalWalletBalanceNetworkLabel(chainId),
    failedTokenCount: 0,
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
      const snapshot = await getExternalWalletBalanceSnapshot(normalizedAddress, chainId);
      setState({
        status: snapshot.status,
        assets: snapshot.assets,
        nativeAsset: snapshot.nativeAsset,
        tokenAssets: snapshot.tokenAssets,
        chainLabel: snapshot.chainLabel,
        failedTokenCount: snapshot.failedTokenCount,
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

    getExternalWalletBalanceSnapshot(normalizedAddress, chainId)
      .then((snapshot) => {
        if (!mounted) {
          return;
        }

        setState({
          status: snapshot.status,
          assets: snapshot.assets,
          nativeAsset: snapshot.nativeAsset,
          tokenAssets: snapshot.tokenAssets,
          chainLabel: snapshot.chainLabel,
          failedTokenCount: snapshot.failedTokenCount,
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

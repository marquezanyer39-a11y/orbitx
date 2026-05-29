import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useExternalWallet } from '../../../hooks/useExternalWallet';
import { useExternalWalletBalances } from '../../../hooks/useExternalWalletBalances';
import { useWallet } from '../../../hooks/useWallet';
import type { ExternalWalletBalanceAsset } from '../../../services/wallet/externalWalletBalances';
import { normalizeWeb3Error } from '../../../services/web3/web3Errors';
import { getChainConfigById, type Web3ChainKey } from '../../../services/web3/web3NetworkConfig';
import { switchExternalWalletNetwork } from '../../../services/web3/web3TransactionService';
import { copyToClipboard } from '../../../utils/copyToClipboard';
import { COLORS } from './web3WalletStyles';

export const NETWORKS = ['Ethereum', 'Polygon', 'BNB Chain', 'Solana'] as const;
export const ASSET_FILTERS = ['Todos', 'Tokens', 'NFTs'] as const;

export type NetworkLabel = (typeof NETWORKS)[number];
export type AssetFilter = (typeof ASSET_FILTERS)[number];

export type Web3AssetRow = {
  id: string;
  symbol: string;
  name: string;
  chainLabel: string;
  amount: number;
  usdValue: number;
  priceAvailable: boolean;
  type: 'native' | 'token' | 'nft';
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export type Web3ActivityItem = {
  id: string;
  title: string;
  status: 'Completado' | 'Pendiente' | 'Aprobado';
  value: string;
  tone: 'positive' | 'negative' | 'warning' | 'web3';
  icon: keyof typeof Ionicons.glyphMap;
};

const FALLBACK_ASSETS: Web3AssetRow[] = [
  {
    id: 'fallback-eth',
    symbol: 'ETH',
    name: 'Ethereum',
    chainLabel: 'Ethereum',
    amount: 0,
    usdValue: 0,
    priceAvailable: true,
    type: 'native',
    color: COLORS.web3Blue,
    icon: 'sync-circle-outline',
  },
  {
    id: 'fallback-matic',
    symbol: 'MATIC',
    name: 'Polygon',
    chainLabel: 'Polygon',
    amount: 0,
    usdValue: 0,
    priceAvailable: true,
    type: 'native',
    color: COLORS.purpleSoft,
    icon: 'cube-outline',
  },
  {
    id: 'fallback-usdt',
    symbol: 'USDT',
    name: 'Tether',
    chainLabel: 'Ethereum',
    amount: 0,
    usdValue: 0,
    priceAvailable: true,
    type: 'token',
    color: COLORS.green,
    icon: 'logo-usd',
  },
  {
    id: 'fallback-sol',
    symbol: 'SOL',
    name: 'Solana',
    chainLabel: 'Solana',
    amount: 0,
    usdValue: 0,
    priceAvailable: true,
    type: 'native',
    color: COLORS.greenBright,
    icon: 'analytics-outline',
  },
  {
    id: 'fallback-bnb',
    symbol: 'BNB',
    name: 'BNB Chain',
    chainLabel: 'BNB Chain',
    amount: 0,
    usdValue: 0,
    priceAvailable: true,
    type: 'native',
    color: COLORS.warning,
    icon: 'diamond-outline',
  },
];

export const ACTIVITY: Web3ActivityItem[] = [
  {
    id: 'received-eth',
    title: 'Ejemplo demo: Recibido ETH',
    status: 'Completado',
    value: '+0.05 ETH',
    tone: 'positive',
    icon: 'download-outline',
  },
  {
    id: 'send-usdt',
    title: 'Ejemplo demo: Envío USDT',
    status: 'Pendiente',
    value: '-10.00 USDT',
    tone: 'warning',
    icon: 'arrow-up-outline',
  },
  {
    id: 'dapp-connection',
    title: 'Ejemplo demo: Conexión dApp',
    status: 'Aprobado',
    value: 'Uniswap V3',
    tone: 'web3',
    icon: 'link-outline',
  },
];

export function formatUsd(value: number) {
  return `USD ${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)}`;
}

export function formatTokenAmount(value: number) {
  if (!Number.isFinite(value) || value === 0) return '0.0000';
  if (value < 0.000001) return '<0.000001';

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 8 : 6,
  }).format(value);
}

export function maskAddress(address: string) {
  const trimmed = address.trim();
  if (!trimmed) return 'Sin billetera local';
  return `${trimmed.slice(0, 6)}...${trimmed.slice(-4)}`;
}

export function getToneColor(tone: Web3ActivityItem['tone']) {
  if (tone === 'positive') return COLORS.greenBright;
  if (tone === 'negative') return COLORS.red;
  if (tone === 'warning') return COLORS.warning;
  return COLORS.purpleSoft;
}

function getNetworkFromChain(chainLabel: string): NetworkLabel {
  if (chainLabel === 'Polygon') return 'Polygon';
  if (chainLabel === 'BNB Chain') return 'BNB Chain';
  if (chainLabel === 'Solana') return 'Solana';
  return 'Ethereum';
}

function mapNetworkLabelToChainKey(network: NetworkLabel): Web3ChainKey | null {
  if (network === 'Polygon') return 'polygon';
  if (network === 'BNB Chain') return 'bnb';
  if (network === 'Ethereum') return 'ethereum';
  return null;
}

function mapExternalAsset(asset: ExternalWalletBalanceAsset): Web3AssetRow {
  return {
    id: asset.id,
    symbol: asset.symbol,
    name: asset.name,
    chainLabel: asset.chainLabel,
    amount: asset.amount,
    usdValue: asset.usdValue,
    priceAvailable: asset.priceAvailable,
    type: asset.type === 'native' ? 'native' : 'token',
    color: asset.type === 'native' ? COLORS.web3Blue : COLORS.green,
    icon: asset.type === 'native' ? 'sync-circle-outline' : 'logo-usd',
  };
}

export function useWeb3WalletViewModel() {
  const wallet = useWallet();
  const externalWallet = useExternalWallet();
  const [activeNetwork, setActiveNetwork] = useState<NetworkLabel>('Ethereum');
  const [activeFilter, setActiveFilter] = useState<AssetFilter>('Todos');
  const [message, setMessage] = useState<string | null>(null);
  const [connectSheetVisible, setConnectSheetVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);

  const externalAddress = externalWallet.address?.trim() || wallet.externalWallet.address?.trim() || '';
  const externalChainId = externalWallet.chainId ?? wallet.externalWallet.chainId;
  const externalChainConfig = getChainConfigById(externalChainId);
  const localAddress =
    wallet.receiveAddresses.ethereum ||
    wallet.receiveAddresses.base ||
    wallet.receiveAddresses.bnb ||
    wallet.receiveAddresses.solana ||
    wallet.walletAddress ||
    '';
  const displayAddress = externalAddress || localAddress;
  const walletSourceLabel = externalAddress
    ? 'BILLETERA EXTERNA'
    : localAddress
      ? 'BILLETERA LOCAL'
      : 'SIN BILLETERA';
  const chainLabel =
    externalWallet.chainLabel && externalWallet.chainLabel !== 'Sin red'
      ? externalWallet.chainLabel
      : wallet.externalWallet.chainId
        ? `Chain ${wallet.externalWallet.chainId}`
        : activeNetwork;
  const balances = useExternalWalletBalances({
    address: externalAddress,
    chainId: externalChainId,
    enabled: Boolean(externalAddress),
  });

  useEffect(() => {
    setActiveNetwork(getNetworkFromChain(chainLabel));
  }, [chainLabel]);

  const localAssets = useMemo<Web3AssetRow[]>(
    () =>
      wallet.assets.map((asset) => ({
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        chainLabel:
          asset.network === 'bnb'
            ? 'BNB Chain'
            : asset.network === 'base'
              ? 'Ethereum'
              : asset.network === 'ethereum'
                ? 'Ethereum'
                : asset.network === 'solana'
                  ? 'Solana'
                  : String(asset.network),
        amount: asset.amount,
        usdValue: asset.usdValue,
        priceAvailable: true,
        type: 'token',
        color: COLORS.web3Blue,
        icon: 'cube-outline',
      })),
    [wallet.assets],
  );

  const realAssets = useMemo<Web3AssetRow[]>(() => {
    if (externalAddress) return balances.visibleAssets.map(mapExternalAsset);
    return localAssets.filter((asset) => asset.amount > 0);
  }, [balances.visibleAssets, externalAddress, localAssets]);

  const sourceAssets = realAssets.length ? realAssets : FALLBACK_ASSETS;
  const filteredAssets = useMemo(
    () =>
      sourceAssets.filter((asset) => {
        return (
          activeFilter === 'Todos' ||
          (activeFilter === 'Tokens' && asset.type !== 'nft') ||
          (activeFilter === 'NFTs' && asset.type === 'nft')
        );
      }),
    [activeFilter, sourceAssets],
  );

  const localBalanceUsd = localAssets.reduce((sum, asset) => sum + asset.usdValue, 0);
  const externalBalanceUsd = externalAddress ? balances.totalUsdEstimate : 0;
  const totalUsd = externalAddress ? externalBalanceUsd : localBalanceUsd;
  const helperMessage =
    message ??
    (externalAddress
      ? balances.message
      : wallet.isWalletReady
        ? 'Mostrando activos Web3 de tu wallet local.'
        : 'Crea o conecta una wallet para ver tus activos Web3.');

  const handleCopyAddress = useCallback(async () => {
    if (!displayAddress) {
      setMessage('No hay dirección Web3 disponible para copiar.');
      return;
    }

    await copyToClipboard(displayAddress);
    setMessage('Dirección copiada.');
  }, [displayAddress]);

  const handleRefreshBalances = useCallback(async () => {
    if (!externalAddress && !wallet.isWalletReady) {
      setMessage('No hay una wallet disponible para actualizar.');
      return;
    }

    setIsRefreshing(true);
    setMessage('Actualizando saldo...');

    try {
      const tasks: Promise<unknown>[] = [];
      if (wallet.isWalletReady) tasks.push(wallet.refreshBalances());
      if (externalAddress) tasks.push(balances.refresh());

      await Promise.all(tasks);
      setMessage('Saldo actualizado.');
    } catch (error) {
      const normalizedError = normalizeWeb3Error(error, 'No se pudo actualizar el saldo.');
      setMessage(normalizedError.message);
    } finally {
      setIsRefreshing(false);
    }
  }, [balances, externalAddress, wallet]);

  const handleSwitchNetwork = useCallback(
    async (network: NetworkLabel) => {
      setActiveNetwork(network);

      if (!externalAddress) return;

      const nextChainKey = mapNetworkLabelToChainKey(network);
      if (!nextChainKey) {
        setMessage('Esta red aún no está disponible para cambio automático desde la wallet externa.');
        return;
      }

      if (!externalWallet.switchToNetwork) {
        setMessage('La wallet externa no expone un cambio de red compatible.');
        return;
      }

      setIsSwitchingNetwork(true);
      setMessage('Esperando confirmación en tu wallet...');

      try {
        const result = await switchExternalWalletNetwork({
          targetNetwork: nextChainKey,
          currentChainId: externalChainId,
          switchNetwork: externalWallet.switchToNetwork,
        });

        setMessage(result.changed ? 'Red cambiada.' : 'Ya estás en la red seleccionada.');
        if (externalAddress) await balances.refresh();
      } catch (error) {
        const normalizedError = normalizeWeb3Error(error, 'No se pudo cambiar de red.');
        setMessage(normalizedError.message);
      } finally {
        setIsSwitchingNetwork(false);
      }
    },
    [balances, externalAddress, externalChainId, externalWallet.switchToNetwork],
  );

  return {
    activeFilter,
    activeNetwork,
    balances,
    chainLabel,
    connectSheetVisible,
    displayAddress,
    externalAddress,
    externalChainId,
    externalChainName: externalChainConfig?.name ?? chainLabel,
    filteredAssets,
    handleCopyAddress,
    handleRefreshBalances,
    handleSwitchNetwork,
    helperMessage,
    isRefreshing,
    isSwitchingNetwork,
    externalBalanceUsd,
    localBalanceUsd,
    localAddress,
    setActiveFilter,
    setConnectSheetVisible,
    setMessage,
    totalUsd,
    walletSourceLabel,
  };
}

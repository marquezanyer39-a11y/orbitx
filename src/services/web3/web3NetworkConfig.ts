import { EXTERNAL_EVM_NETWORKS } from '../wallet/tokenRegistry';

export type Web3ChainKey = 'ethereum' | 'base' | 'bnb' | 'polygon';

export interface EvmNetworkConfig {
  chainId: number;
  name: string;
  shortName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrl: string;
  explorerUrl: string;
  explorerTxUrl: string;
  explorerAddressUrl: string;
  supportsNativeTransfer: boolean;
  supportsErc20Transfer: boolean;
  supportsSwitchNetwork: boolean;
  isEnabled: boolean;
  isProductionReady: boolean;
}

export interface Web3ChainConfig extends EvmNetworkConfig {
  key: Web3ChainKey;
  symbol: string;
  nativeCurrencyName: string;
  isOperational: boolean;
  supportsExternalWallet: boolean;
  supportsRead: boolean;
  supportsRefresh: boolean;
  supportsSend: boolean;
  supportsSwitch: boolean;
  readOnlyReason?: string;
}

function buildNetworkConfig(params: {
  key: Web3ChainKey;
  shortName: string;
  network: (typeof EXTERNAL_EVM_NETWORKS)[number];
  supportsSwitchNetwork: boolean;
  readOnlyReason?: string;
}): Web3ChainConfig {
  const explorerUrl = params.network.explorerUrl.replace(/\/$/, '');

  return {
    key: params.key,
    chainId: params.network.chainId,
    name: params.network.chainLabel,
    shortName: params.shortName,
    nativeCurrency: {
      name: params.network.nativeName,
      symbol: params.network.nativeSymbol,
      decimals: params.network.nativeDecimals,
    },
    rpcUrl: params.network.rpcUrl,
    explorerUrl,
    explorerTxUrl: `${explorerUrl}/tx`,
    explorerAddressUrl: `${explorerUrl}/address`,
    supportsNativeTransfer: true,
    supportsErc20Transfer: true,
    supportsSwitchNetwork: params.supportsSwitchNetwork,
    isEnabled: true,
    isProductionReady: true,
    symbol: params.network.nativeSymbol,
    nativeCurrencyName: params.network.nativeName,
    isOperational: true,
    supportsExternalWallet: true,
    supportsRead: true,
    supportsRefresh: true,
    supportsSend: true,
    supportsSwitch: params.supportsSwitchNetwork,
    readOnlyReason: params.readOnlyReason,
  };
}

const CHAIN_CONFIGS: Record<Web3ChainKey, Web3ChainConfig> = {
  ethereum: buildNetworkConfig({
    key: 'ethereum',
    shortName: 'ETH',
    network: EXTERNAL_EVM_NETWORKS[1],
    supportsSwitchNetwork: true,
  }),
  base: buildNetworkConfig({
    key: 'base',
    shortName: 'BASE',
    network: EXTERNAL_EVM_NETWORKS[8453],
    supportsSwitchNetwork: true,
  }),
  bnb: buildNetworkConfig({
    key: 'bnb',
    shortName: 'BNB',
    network: EXTERNAL_EVM_NETWORKS[56],
    supportsSwitchNetwork: true,
  }),
  polygon: buildNetworkConfig({
    key: 'polygon',
    shortName: 'POL',
    network: EXTERNAL_EVM_NETWORKS[137],
    supportsSwitchNetwork: false,
    readOnlyReason:
      'Polygon ya se puede leer y enviar si la wallet está conectada en esa red, pero el cambio automático de red aún no está expuesto en QVEX.',
  }),
};

const CHAIN_ID_TO_KEY = Object.values(CHAIN_CONFIGS).reduce<Record<number, Web3ChainKey>>(
  (accumulator, config) => {
    accumulator[config.chainId] = config.key;
    return accumulator;
  },
  {},
);

export function getSupportedChains(): Web3ChainConfig[] {
  return Object.values(CHAIN_CONFIGS);
}

export function getChainConfig(chainKey: Web3ChainKey): Web3ChainConfig {
  return CHAIN_CONFIGS[chainKey];
}

export function getChainConfigById(chainId?: number | null): Web3ChainConfig | null {
  if (!chainId) {
    return null;
  }

  const chainKey = CHAIN_ID_TO_KEY[chainId];
  return chainKey ? CHAIN_CONFIGS[chainKey] : null;
}

export function getNetworkConfig(chainId: number): EvmNetworkConfig | undefined {
  return getChainConfigById(chainId) ?? undefined;
}

export function getSupportedChainIds(): number[] {
  return getSupportedChains().map((chainConfig) => chainConfig.chainId);
}

export function isSupportedChain(chainId?: number | null): boolean {
  return Boolean(getChainConfigById(chainId));
}

export const isChainSupported = isSupportedChain;

function hasValue(value: string): boolean {
  return value.trim().length > 0;
}

export function getExplorerTxUrl(chainId: number, txHash: string): string | null {
  const config = getChainConfigById(chainId);
  const normalized = txHash.trim();

  if (!config || !hasValue(normalized) || !/^0x[a-fA-F0-9]{64}$/.test(normalized)) {
    return null;
  }

  return `${config.explorerTxUrl}/${normalized}`;
}

export function getExplorerAddressUrl(chainId: number, address: string): string | null {
  const config = getChainConfigById(chainId);
  const normalized = address.trim();

  if (!config || !hasValue(normalized) || !/^0x[a-fA-F0-9]{40}$/.test(normalized)) {
    return null;
  }

  return `${config.explorerAddressUrl}/${normalized}`;
}

export function getWeb3ExplorerUrl(
  chainId: number,
  txHashOrAddress: string,
  entity: 'tx' | 'address' = 'tx',
): string | undefined {
  const explorerUrl =
    entity === 'address'
      ? getExplorerAddressUrl(chainId, txHashOrAddress)
      : getExplorerTxUrl(chainId, txHashOrAddress);

  return explorerUrl ?? undefined;
}

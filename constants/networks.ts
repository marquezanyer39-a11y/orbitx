import type {
  DexLaunchNetwork,
  LaunchChain,
  LaunchVenue,
  MarketToken,
  OrbitChainKey,
  WalletNetwork,
} from '../types';

export type OrbitChainPhase = 'active' | 'coming_soon' | 'asset_only';
export type OrbitTradeRouter = '0x' | 'Jupiter';

export interface OrbitChainConfig {
  key: OrbitChainKey;
  label: string;
  shortLabel: string;
  chainId?: number;
  phase: OrbitChainPhase;
  walletEnabled: boolean;
  receiveEnabled: boolean;
  tradingEnabled: boolean;
  tokenCreationEnabled: boolean;
  liquidityEnabled: boolean;
  tradeRouter?: OrbitTradeRouter;
  dexVenue?: LaunchVenue;
  walletNetwork?: WalletNetwork;
  launchChain?: LaunchChain;
  dexNetwork?: DexLaunchNetwork;
  explorerBaseUrl?: string;
  helperText: string;
}

export const ORBIT_CHAIN_CONFIG: OrbitChainConfig[] = [
  {
    key: 'ethereum',
    label: 'Ethereum',
    shortLabel: 'ETH',
    chainId: 1,
    phase: 'active',
    walletEnabled: true,
    receiveEnabled: true,
    tradingEnabled: true,
    tokenCreationEnabled: true,
    liquidityEnabled: true,
    tradeRouter: '0x',
    dexVenue: 'uniswap',
    walletNetwork: 'ethereum',
    launchChain: 'ethereum',
    dexNetwork: 'ethereum',
    explorerBaseUrl: 'https://etherscan.io',
    helperText: 'Activa hoy con routing EVM y salida DEX tipo Uniswap.',
  },
  {
    key: 'base',
    label: 'Base',
    shortLabel: 'BASE',
    chainId: 8453,
    phase: 'active',
    walletEnabled: true,
    receiveEnabled: true,
    tradingEnabled: true,
    tokenCreationEnabled: true,
    liquidityEnabled: false,
    tradeRouter: '0x',
    dexVenue: 'uniswap',
    walletNetwork: 'base',
    launchChain: 'base',
    dexNetwork: 'base',
    explorerBaseUrl: 'https://basescan.org',
    helperText: 'Deploy real activo hoy. Liquidez y protected listing en Base quedan para el siguiente adapter real.',
  },
  {
    key: 'bnb',
    label: 'BNB Chain',
    shortLabel: 'BNB',
    chainId: 56,
    phase: 'active',
    walletEnabled: true,
    receiveEnabled: true,
    tradingEnabled: true,
    tokenCreationEnabled: true,
    liquidityEnabled: true,
    tradeRouter: '0x',
    dexVenue: 'pancakeswap',
    walletNetwork: 'bnb',
    launchChain: 'bnb',
    dexNetwork: 'bnb',
    explorerBaseUrl: 'https://bscscan.com',
    helperText: 'Activa hoy con flujo EVM y salida DEX tipo PancakeSwap.',
  },
  {
    key: 'solana',
    label: 'Solana',
    shortLabel: 'SOL',
    chainId: 101,
    phase: 'active',
    walletEnabled: true,
    receiveEnabled: true,
    tradingEnabled: true,
    tokenCreationEnabled: true,
    liquidityEnabled: true,
    tradeRouter: 'Jupiter',
    dexVenue: 'raydium',
    walletNetwork: 'solana',
    launchChain: 'solana',
    dexNetwork: 'solana',
    explorerBaseUrl: 'https://solscan.io',
    helperText: 'Activa hoy con routing Jupiter y salida DEX tipo Raydium.',
  },
  {
    key: 'tron',
    label: 'TRON',
    shortLabel: 'TRX',
    chainId: 728126428,
    phase: 'coming_soon',
    walletEnabled: false,
    receiveEnabled: false,
    tradingEnabled: false,
    tokenCreationEnabled: false,
    liquidityEnabled: false,
    helperText: 'Disponible cuando la red quede activa en OrbitX.',
  },
  {
    key: 'bitcoin',
    label: 'Bitcoin',
    shortLabel: 'BTC',
    chainId: 0,
    phase: 'asset_only',
    walletEnabled: false,
    receiveEnabled: false,
    tradingEnabled: true,
    tokenCreationEnabled: false,
    liquidityEnabled: false,
    helperText: 'Bitcoin no permite crear este tipo de tokens.',
  },
];

const ORBIT_CHAIN_MAP = new Map(
  ORBIT_CHAIN_CONFIG.map((config) => [config.key, config]),
);

export const ACTIVE_RECEIVE_NETWORKS = ORBIT_CHAIN_CONFIG.filter(
  (config): config is OrbitChainConfig & { walletNetwork: WalletNetwork } =>
    config.receiveEnabled && Boolean(config.walletNetwork),
);

export const ACTIVE_LAUNCH_CHAINS = ORBIT_CHAIN_CONFIG.filter(
  (config): config is OrbitChainConfig & {
    launchChain: LaunchChain;
    dexNetwork: DexLaunchNetwork;
  } => config.tokenCreationEnabled && Boolean(config.launchChain) && Boolean(config.dexNetwork),
);

export const MULTICHAIN_VISIBLE_NETWORKS = ORBIT_CHAIN_CONFIG.filter(
  (config) => config.key !== 'bitcoin',
);

export const WEB3_OVERVIEW_NETWORKS = ORBIT_CHAIN_CONFIG;

export function getOrbitChainConfig(key: OrbitChainKey | LaunchChain | WalletNetwork | DexLaunchNetwork) {
  if (key === 'base' || key === 'bnb' || key === 'solana') {
    return ORBIT_CHAIN_MAP.get(key);
  }

  if (key === 'ethereum') {
    return ORBIT_CHAIN_MAP.get('ethereum');
  }

  return ORBIT_CHAIN_MAP.get(key as OrbitChainKey);
}

export function getLaunchChainConfig(chain: LaunchChain) {
  return ORBIT_CHAIN_CONFIG.find((config) => config.launchChain === chain) ?? null;
}

export function getDexChainConfig(network: DexLaunchNetwork) {
  return ORBIT_CHAIN_CONFIG.find((config) => config.dexNetwork === network) ?? null;
}

export function inferTokenNetworkKey(token: MarketToken): OrbitChainKey | null {
  if (token.networkKey) {
    return token.networkKey;
  }

  if (token.chain) {
    return token.chain;
  }

  if (token.id === 'btc') {
    return 'bitcoin';
  }

  if (token.id === 'bnb') {
    return 'bnb';
  }

  if (token.id === 'trx') {
    return 'tron';
  }

  if (['sol', 'bonk', 'wif', 'popcat'].includes(token.id)) {
    return 'solana';
  }

  if (['usd', 'aero'].includes(token.id)) {
    return 'base';
  }

  if (token.id === 'eth') {
    return 'ethereum';
  }

  return null;
}

export function buildExplorerAddressUrl(
  key: OrbitChainKey | LaunchChain | WalletNetwork | DexLaunchNetwork,
  address?: string | null,
) {
  const config = getOrbitChainConfig(key);
  if (!config?.explorerBaseUrl || !address) {
    return null;
  }

  if (config.key === 'solana') {
    return `${config.explorerBaseUrl}/account/${address}`;
  }

  return `${config.explorerBaseUrl}/address/${address}`;
}

export function buildExplorerTxUrl(
  key: OrbitChainKey | LaunchChain | WalletNetwork | DexLaunchNetwork,
  hash?: string | null,
) {
  const config = getOrbitChainConfig(key);
  if (!config?.explorerBaseUrl || !hash) {
    return null;
  }

  if (config.key === 'solana') {
    return `${config.explorerBaseUrl}/tx/${hash}`;
  }

  return `${config.explorerBaseUrl}/tx/${hash}`;
}

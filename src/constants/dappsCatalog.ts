export type DappCategory = 'dex' | 'lending' | 'nft' | 'portfolio' | 'bridge' | 'staking';
export type DappRiskLevel = 'low' | 'medium' | 'high';

export interface DappDefinition {
  id: string;
  name: string;
  category: DappCategory;
  description: string;
  url: string;
  supportedChains: number[];
  riskLevel: DappRiskLevel;
  isEnabled: boolean;
  isExternal: boolean;
  requiresWallet: boolean;
  icon: string;
  tags: string[];
  officialDomain: string;
}

export const DAPPS_CATALOG: DappDefinition[] = [
  {
    id: 'uniswap',
    name: 'Uniswap',
    category: 'dex',
    description: 'DEX multichain para swaps en Ethereum, Base y Polygon.',
    url: 'https://app.uniswap.org/',
    supportedChains: [1, 8453, 137],
    riskLevel: 'medium',
    isEnabled: true,
    isExternal: true,
    requiresWallet: true,
    icon: 'swap-horizontal-outline',
    tags: ['swap', 'dex', 'ethereum', 'base', 'polygon'],
    officialDomain: 'app.uniswap.org',
  },
  {
    id: 'aave',
    name: 'Aave',
    category: 'lending',
    description: 'Mercado de lending DeFi con posiciones y colateral on-chain.',
    url: 'https://app.aave.com/',
    supportedChains: [1, 8453, 137],
    riskLevel: 'high',
    isEnabled: true,
    isExternal: true,
    requiresWallet: true,
    icon: 'water-outline',
    tags: ['lending', 'defi', 'borrow', 'collateral'],
    officialDomain: 'app.aave.com',
  },
  {
    id: 'opensea',
    name: 'OpenSea',
    category: 'nft',
    description: 'Marketplace NFT para explorar colecciones y activos digitales.',
    url: 'https://opensea.io/',
    supportedChains: [1, 8453, 137],
    riskLevel: 'medium',
    isEnabled: true,
    isExternal: true,
    requiresWallet: false,
    icon: 'images-outline',
    tags: ['nft', 'marketplace', 'collectibles'],
    officialDomain: 'opensea.io',
  },
  {
    id: 'defillama',
    name: 'DeFiLlama',
    category: 'portfolio',
    description: 'Research, TVL y datos públicos de protocolos DeFi.',
    url: 'https://defillama.com/',
    supportedChains: [1, 8453, 56, 137],
    riskLevel: 'low',
    isEnabled: true,
    isExternal: true,
    requiresWallet: false,
    icon: 'analytics-outline',
    tags: ['research', 'defi', 'tvl', 'data'],
    officialDomain: 'defillama.com',
  },
  {
    id: 'stargate',
    name: 'Stargate',
    category: 'bridge',
    description: 'Bridge multichain; requiere revisar red, token y destino con cuidado.',
    url: 'https://stargate.finance/',
    supportedChains: [1, 8453, 56, 137],
    riskLevel: 'high',
    isEnabled: true,
    isExternal: true,
    requiresWallet: true,
    icon: 'git-compare-outline',
    tags: ['bridge', 'multichain', 'transfer'],
    officialDomain: 'stargate.finance',
  },
  {
    id: 'pancakeswap',
    name: 'PancakeSwap',
    category: 'dex',
    description: 'DEX principal de BNB Chain con soporte multichain.',
    url: 'https://pancakeswap.finance/',
    supportedChains: [56, 1, 8453, 137],
    riskLevel: 'medium',
    isEnabled: true,
    isExternal: true,
    requiresWallet: true,
    icon: 'swap-horizontal-outline',
    tags: ['swap', 'dex', 'bnb'],
    officialDomain: 'pancakeswap.finance',
  },
  {
    id: 'lido',
    name: 'Lido',
    category: 'staking',
    description: 'Staking líquido de ETH; requiere entender riesgos de contrato.',
    url: 'https://stake.lido.fi/',
    supportedChains: [1],
    riskLevel: 'high',
    isEnabled: true,
    isExternal: true,
    requiresWallet: true,
    icon: 'leaf-outline',
    tags: ['staking', 'eth', 'defi'],
    officialDomain: 'stake.lido.fi',
  },
  {
    id: 'zapper',
    name: 'Zapper',
    category: 'portfolio',
    description: 'Vista de portafolio Web3 y actividad pública de address.',
    url: 'https://zapper.xyz/',
    supportedChains: [1, 8453, 56, 137],
    riskLevel: 'low',
    isEnabled: true,
    isExternal: true,
    requiresWallet: false,
    icon: 'albums-outline',
    tags: ['portfolio', 'tracker', 'wallet'],
    officialDomain: 'zapper.xyz',
  },
];

export const DAPP_CATEGORIES: DappCategory[] = [
  'dex',
  'lending',
  'nft',
  'portfolio',
  'bridge',
  'staking',
];

export const DAPP_CATEGORY_LABELS: Record<DappCategory, string> = {
  dex: 'DEX',
  lending: 'Lending',
  nft: 'NFT',
  portfolio: 'Portfolio',
  bridge: 'Bridge',
  staking: 'Staking',
};

export const DAPP_RISK_LABELS: Record<DappRiskLevel, string> = {
  low: 'Riesgo bajo',
  medium: 'Riesgo medio',
  high: 'Riesgo alto',
};

export function getEnabledDapps(): DappDefinition[] {
  return DAPPS_CATALOG.filter((dapp) => dapp.isEnabled);
}

export function getDappsByCategory(category: DappCategory): DappDefinition[] {
  return getEnabledDapps().filter((dapp) => dapp.category === category);
}

export function getDappsByChain(chainId: number): DappDefinition[] {
  return getEnabledDapps().filter((dapp) => dapp.supportedChains.includes(chainId));
}

export function getDappById(id: string): DappDefinition | undefined {
  return getEnabledDapps().find((dapp) => dapp.id === id);
}

export function searchDapps(query: string): DappDefinition[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return getEnabledDapps();
  }

  return getEnabledDapps().filter((dapp) => {
    const haystack = [
      dapp.name,
      dapp.description,
      dapp.category,
      dapp.officialDomain,
      ...dapp.tags,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

export function isWhitelistedDappUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return getEnabledDapps().some((dapp) => parsedUrl.hostname === dapp.officialDomain);
  } catch {
    return false;
  }
}

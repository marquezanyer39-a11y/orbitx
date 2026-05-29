export interface TokenDefinition {
  chainId: number;
  symbol: string;
  name: string;
  contractAddress: string | null;
  decimals: number;
  logoUri?: string;
  isNative: boolean;
  isStablecoin: boolean;
  isEnabled: boolean;
  pendingAddress?: boolean;
  canSend: boolean;
  canReceive: boolean;
  canApprove: boolean;
  explorerUrl?: string;
  priceSymbol?: string;
  note?: string;
}

export interface ExternalTokenSpec {
  symbol: string;
  name: string;
  decimals: number;
  contractAddress: string;
  priceSymbol?: string;
  enabled?: boolean;
  note?: string;
  pendingAddress?: boolean;
  canSend?: boolean;
  canReceive?: boolean;
  canApprove?: boolean;
}

export interface ExternalEvmNetworkSpec {
  chainId: number;
  chainLabel: string;
  nativeSymbol: string;
  nativeName: string;
  nativeDecimals: number;
  rpcUrl: string;
  explorerUrl: string;
  priceSymbol?: string;
  tokens: ExternalTokenSpec[];
}

const EXPLORERS: Record<number, string> = {
  1: 'https://etherscan.io',
  8453: 'https://basescan.org',
  56: 'https://bscscan.com',
  137: 'https://polygonscan.com',
};

const NATIVE_TOKENS: TokenDefinition[] = [
  {
    chainId: 1,
    symbol: 'ETH',
    name: 'Ethereum',
    contractAddress: null,
    decimals: 18,
    isNative: true,
    isStablecoin: false,
    isEnabled: true,
    canSend: true,
    canReceive: true,
    canApprove: false,
    explorerUrl: EXPLORERS[1],
    priceSymbol: 'ETH',
  },
  {
    chainId: 8453,
    symbol: 'ETH',
    name: 'Ethereum',
    contractAddress: null,
    decimals: 18,
    isNative: true,
    isStablecoin: false,
    isEnabled: true,
    canSend: true,
    canReceive: true,
    canApprove: false,
    explorerUrl: EXPLORERS[8453],
    priceSymbol: 'ETH',
  },
  {
    chainId: 56,
    symbol: 'BNB',
    name: 'BNB',
    contractAddress: null,
    decimals: 18,
    isNative: true,
    isStablecoin: false,
    isEnabled: true,
    canSend: true,
    canReceive: true,
    canApprove: false,
    explorerUrl: EXPLORERS[56],
    priceSymbol: 'BNB',
  },
  {
    chainId: 137,
    symbol: 'MATIC',
    name: 'Polygon',
    contractAddress: null,
    decimals: 18,
    isNative: true,
    isStablecoin: false,
    isEnabled: true,
    canSend: true,
    canReceive: true,
    canApprove: false,
    explorerUrl: EXPLORERS[137],
    priceSymbol: 'MATIC',
  },
];

function token(params: {
  chainId: number;
  symbol: string;
  name: string;
  decimals: number;
  contractAddress?: string;
  priceSymbol?: string;
  enabled?: boolean;
  pendingAddress?: boolean;
  note?: string;
}): TokenDefinition {
  const hasContract = Boolean(params.contractAddress?.trim());
  const isEnabled = params.enabled !== false && hasContract && params.pendingAddress !== true;

  return {
    chainId: params.chainId,
    symbol: params.symbol,
    name: params.name,
    contractAddress: isEnabled ? params.contractAddress!.trim() : null,
    decimals: params.decimals,
    isNative: false,
    isStablecoin: ['USDT', 'USDC', 'USDC.E', 'USDBC', 'DAI', 'BUSD'].includes(
      params.symbol.toUpperCase(),
    ),
    isEnabled,
    pendingAddress: params.pendingAddress || !hasContract ? true : undefined,
    canSend: isEnabled,
    canReceive: isEnabled,
    canApprove: isEnabled,
    explorerUrl: EXPLORERS[params.chainId],
    priceSymbol: params.priceSymbol,
    note: params.note,
  };
}

export const TOKEN_REGISTRY: TokenDefinition[] = [
  ...NATIVE_TOKENS,

  token({
    chainId: 1,
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  }),
  token({
    chainId: 1,
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  }),
  token({
    chainId: 1,
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    contractAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    priceSymbol: 'ETH',
  }),
  token({
    chainId: 1,
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    contractAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  }),
  token({
    chainId: 1,
    symbol: 'LINK',
    name: 'Chainlink',
    decimals: 18,
    contractAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  }),
  token({
    chainId: 1,
    symbol: 'UNI',
    name: 'Uniswap',
    decimals: 18,
    contractAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  }),
  token({
    chainId: 1,
    symbol: 'AAVE',
    name: 'Aave',
    decimals: 18,
    contractAddress: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
  }),
  token({
    chainId: 1,
    symbol: 'SHIB',
    name: 'Shiba Inu',
    decimals: 18,
    contractAddress: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
  }),
  token({
    chainId: 1,
    symbol: 'PEPE',
    name: 'Pepe',
    decimals: 18,
    contractAddress: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
  }),
  token({
    chainId: 1,
    symbol: 'SAITAMA',
    name: 'Saitama',
    decimals: 18,
    enabled: false,
    pendingAddress: true,
    note: 'SAITAMA requiere contractAddress verificado antes de habilitarse.',
  }),

  token({
    chainId: 8453,
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  }),
  token({
    chainId: 8453,
    symbol: 'USDbC',
    name: 'USD Base Coin',
    decimals: 6,
    contractAddress: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
    priceSymbol: 'USDC',
  }),
  token({
    chainId: 8453,
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    contractAddress: '0x4200000000000000000000000000000000000006',
    priceSymbol: 'ETH',
  }),
  token({
    chainId: 8453,
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    contractAddress: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
  }),

  token({
    chainId: 56,
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 18,
    contractAddress: '0x55d398326f99059fF775485246999027B3197955',
  }),
  token({
    chainId: 56,
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 18,
    contractAddress: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  }),
  token({
    chainId: 56,
    symbol: 'WBNB',
    name: 'Wrapped BNB',
    decimals: 18,
    contractAddress: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    priceSymbol: 'BNB',
  }),
  token({
    chainId: 56,
    symbol: 'CAKE',
    name: 'PancakeSwap',
    decimals: 18,
    contractAddress: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
  }),
  token({
    chainId: 56,
    symbol: 'BUSD',
    name: 'Binance USD Legacy',
    decimals: 18,
    contractAddress: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
  }),
  token({
    chainId: 56,
    symbol: 'BTCB',
    name: 'BTCB Token',
    decimals: 18,
    contractAddress: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    priceSymbol: 'BTC',
  }),

  token({
    chainId: 137,
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    contractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  }),
  token({
    chainId: 137,
    symbol: 'USDC.e',
    name: 'USD Coin Bridged',
    decimals: 6,
    contractAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    priceSymbol: 'USDC',
  }),
  token({
    chainId: 137,
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    contractAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  }),
  token({
    chainId: 137,
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    contractAddress: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    priceSymbol: 'ETH',
  }),
  token({
    chainId: 137,
    symbol: 'WMATIC',
    name: 'Wrapped MATIC',
    decimals: 18,
    contractAddress: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    priceSymbol: 'MATIC',
  }),
  token({
    chainId: 137,
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    contractAddress: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
  }),
  token({
    chainId: 137,
    symbol: 'LINK',
    name: 'Chainlink',
    decimals: 18,
    contractAddress: '0x53E0bca35eC356BD5ddDFebbd1Fc0fD03Fabad39',
  }),
  token({
    chainId: 137,
    symbol: 'AAVE',
    name: 'Aave',
    decimals: 18,
    contractAddress: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B',
  }),
];

export const EXTERNAL_EVM_NETWORKS: Record<number, ExternalEvmNetworkSpec> = {
  1: {
    chainId: 1,
    chainLabel: 'Ethereum',
    nativeSymbol: 'ETH',
    nativeName: 'Ethereum',
    nativeDecimals: 18,
    rpcUrl: process.env.EXPO_PUBLIC_ETHEREUM_RPC_URL || 'https://eth.llamarpc.com',
    explorerUrl: EXPLORERS[1],
    priceSymbol: 'ETH',
    tokens: TOKEN_REGISTRY.filter((item) => item.chainId === 1 && !item.isNative).map(toExternalTokenSpec),
  },
  8453: {
    chainId: 8453,
    chainLabel: 'Base',
    nativeSymbol: 'ETH',
    nativeName: 'Ethereum',
    nativeDecimals: 18,
    rpcUrl: process.env.EXPO_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org',
    explorerUrl: EXPLORERS[8453],
    priceSymbol: 'ETH',
    tokens: TOKEN_REGISTRY.filter((item) => item.chainId === 8453 && !item.isNative).map(toExternalTokenSpec),
  },
  56: {
    chainId: 56,
    chainLabel: 'BNB Chain',
    nativeSymbol: 'BNB',
    nativeName: 'BNB',
    nativeDecimals: 18,
    rpcUrl: process.env.EXPO_PUBLIC_BNB_RPC_URL || 'https://bsc-dataseed.binance.org',
    explorerUrl: EXPLORERS[56],
    priceSymbol: 'BNB',
    tokens: TOKEN_REGISTRY.filter((item) => item.chainId === 56 && !item.isNative).map(toExternalTokenSpec),
  },
  137: {
    chainId: 137,
    chainLabel: 'Polygon',
    nativeSymbol: 'MATIC',
    nativeName: 'Polygon',
    nativeDecimals: 18,
    rpcUrl: process.env.EXPO_PUBLIC_POLYGON_RPC_URL || 'https://polygon-rpc.com',
    explorerUrl: EXPLORERS[137],
    priceSymbol: 'MATIC',
    tokens: TOKEN_REGISTRY.filter((item) => item.chainId === 137 && !item.isNative).map(toExternalTokenSpec),
  },
};

export const EXTERNAL_EVM_NETWORK_ORDER = [1, 8453, 56, 137] as const;
export const EXTERNAL_EVM_SUPPORTED_NETWORKS = EXTERNAL_EVM_NETWORK_ORDER.map(
  (chainId) => EXTERNAL_EVM_NETWORKS[chainId],
);

function toExternalTokenSpec(tokenDefinition: TokenDefinition): ExternalTokenSpec {
  return {
    symbol: tokenDefinition.symbol,
    name: tokenDefinition.name,
    decimals: tokenDefinition.decimals,
    contractAddress: tokenDefinition.contractAddress ?? '',
    priceSymbol: tokenDefinition.priceSymbol,
    enabled: tokenDefinition.isEnabled,
    note: tokenDefinition.note,
    pendingAddress: tokenDefinition.pendingAddress,
    canSend: tokenDefinition.canSend,
    canReceive: tokenDefinition.canReceive,
    canApprove: tokenDefinition.canApprove,
  };
}

export function getTokensByChain(chainId: number): TokenDefinition[] {
  return TOKEN_REGISTRY.filter((tokenDefinition) => tokenDefinition.chainId === chainId);
}

export function getNativeToken(chainId: number): TokenDefinition | undefined {
  return getTokensByChain(chainId).find((tokenDefinition) => tokenDefinition.isNative);
}

export function getTokenBySymbol(
  chainId: number,
  symbol: string,
): TokenDefinition | undefined {
  const normalized = symbol.trim().toUpperCase();
  return getTokensByChain(chainId).find(
    (tokenDefinition) => tokenDefinition.symbol.toUpperCase() === normalized,
  );
}

export function getTokenByAddress(
  chainId: number,
  address: string,
): TokenDefinition | undefined {
  const normalized = address.trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }

  return getTokensByChain(chainId).find(
    (tokenDefinition) => tokenDefinition.contractAddress?.toLowerCase() === normalized,
  );
}

export function getSendableTokens(chainId: number): TokenDefinition[] {
  return getTokensByChain(chainId).filter(
    (tokenDefinition) => tokenDefinition.isEnabled && tokenDefinition.canSend,
  );
}

export function getEnabledTokenSpecs(network: ExternalEvmNetworkSpec) {
  return network.tokens.filter(
    (token) =>
      token.enabled !== false &&
      token.pendingAddress !== true &&
      token.contractAddress.trim().length > 0,
  );
}

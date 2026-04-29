export interface ExternalTokenSpec {
  symbol: string;
  name: string;
  decimals: number;
  contractAddress: string;
  priceSymbol?: string;
  enabled?: boolean;
  note?: string;
}

export interface ExternalEvmNetworkSpec {
  chainId: number;
  chainLabel: string;
  nativeSymbol: string;
  nativeName: string;
  nativeDecimals: number;
  rpcUrl: string;
  priceSymbol?: string;
  tokens: ExternalTokenSpec[];
}

export const EXTERNAL_EVM_NETWORKS: Record<number, ExternalEvmNetworkSpec> = {
  1: {
    chainId: 1,
    chainLabel: 'Ethereum',
    nativeSymbol: 'ETH',
    nativeName: 'Ethereum',
    nativeDecimals: 18,
    rpcUrl: process.env.EXPO_PUBLIC_ETHEREUM_RPC_URL || 'https://ethereum-rpc.publicnode.com',
    priceSymbol: 'ETH',
    tokens: [
      {
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 6,
        contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      },
      {
        symbol: 'WETH',
        name: 'Wrapped Ether',
        decimals: 18,
        contractAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        priceSymbol: 'ETH',
      },
      {
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        decimals: 18,
        contractAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      },
      {
        symbol: 'LINK',
        name: 'Chainlink',
        decimals: 18,
        contractAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      },
      {
        symbol: 'UNI',
        name: 'Uniswap',
        decimals: 18,
        contractAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      },
      {
        symbol: 'AAVE',
        name: 'Aave',
        decimals: 18,
        contractAddress: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
      },
      {
        symbol: 'SHIB',
        name: 'Shiba Inu',
        decimals: 18,
        contractAddress: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
      },
      {
        symbol: 'PEPE',
        name: 'Pepe',
        decimals: 18,
        contractAddress: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
      },
      {
        symbol: 'SAITAMA',
        name: 'Saitama',
        decimals: 18,
        contractAddress: '',
        enabled: false,
        note: 'SAITAMA requiere contractAddress verificado antes de habilitarse.',
      },
    ],
  },
  56: {
    chainId: 56,
    chainLabel: 'BNB Chain',
    nativeSymbol: 'BNB',
    nativeName: 'BNB',
    nativeDecimals: 18,
    rpcUrl: process.env.EXPO_PUBLIC_BNB_RPC_URL || 'https://bsc-dataseed.bnbchain.org',
    priceSymbol: 'BNB',
    tokens: [
      {
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 18,
        contractAddress: '0x55d398326f99059fF775485246999027B3197955',
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 18,
        contractAddress: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      },
      {
        symbol: 'WBNB',
        name: 'Wrapped BNB',
        decimals: 18,
        contractAddress: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
        priceSymbol: 'BNB',
      },
      {
        symbol: 'CAKE',
        name: 'PancakeSwap',
        decimals: 18,
        contractAddress: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
      },
      {
        symbol: 'BUSD',
        name: 'Binance USD Legacy',
        decimals: 18,
        contractAddress: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
      },
      {
        symbol: 'BTCB',
        name: 'BTCB Token',
        decimals: 18,
        contractAddress: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
        priceSymbol: 'BTC',
      },
    ],
  },
  137: {
    chainId: 137,
    chainLabel: 'Polygon',
    nativeSymbol: 'MATIC',
    nativeName: 'Polygon',
    nativeDecimals: 18,
    rpcUrl: process.env.EXPO_PUBLIC_POLYGON_RPC_URL || 'https://polygon-rpc.com',
    priceSymbol: 'MATIC',
    tokens: [
      {
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 6,
        contractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        contractAddress: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
      },
      {
        symbol: 'WETH',
        name: 'Wrapped Ether',
        decimals: 18,
        contractAddress: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
        priceSymbol: 'ETH',
      },
      {
        symbol: 'WMATIC',
        name: 'Wrapped MATIC',
        decimals: 18,
        contractAddress: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
        priceSymbol: 'MATIC',
      },
      {
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        decimals: 18,
        contractAddress: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      },
      {
        symbol: 'LINK',
        name: 'Chainlink',
        decimals: 18,
        contractAddress: '0x53E0bca35eC356BD5ddDFebbd1Fc0fD03Fabad39',
      },
      {
        symbol: 'AAVE',
        name: 'Aave',
        decimals: 18,
        contractAddress: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B',
      },
    ],
  },
  8453: {
    chainId: 8453,
    chainLabel: 'Base',
    nativeSymbol: 'ETH',
    nativeName: 'Ethereum',
    nativeDecimals: 18,
    rpcUrl: process.env.EXPO_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org',
    priceSymbol: 'ETH',
    tokens: [
      {
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      },
      {
        symbol: 'WETH',
        name: 'Wrapped Ether',
        decimals: 18,
        contractAddress: '0x4200000000000000000000000000000000000006',
        priceSymbol: 'ETH',
      },
      {
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        decimals: 18,
        contractAddress: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
      },
    ],
  },
};

export const EXTERNAL_EVM_NETWORK_ORDER = [1, 56, 137, 8453] as const;
export const EXTERNAL_EVM_SUPPORTED_NETWORKS = EXTERNAL_EVM_NETWORK_ORDER.map(
  (chainId) => EXTERNAL_EVM_NETWORKS[chainId],
);

export function getEnabledTokenSpecs(network: ExternalEvmNetworkSpec) {
  return network.tokens.filter(
    (token) => token.enabled !== false && token.contractAddress.trim().length > 0,
  );
}

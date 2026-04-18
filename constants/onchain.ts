import type { WalletNetwork } from '../types';

export type OnchainAssetStandard = 'native' | 'erc20' | 'spl';

export interface OnchainAssetSpec {
  tokenId: string;
  network: WalletNetwork;
  standard: OnchainAssetStandard;
  decimals: number;
  contractAddress?: string;
  mintAddress?: string;
  label: string;
}

export const PUBLIC_RPC_URLS: Record<WalletNetwork, string> = {
  ethereum: process.env.EXPO_PUBLIC_ETHEREUM_RPC_URL || 'https://ethereum-rpc.publicnode.com',
  base: process.env.EXPO_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org',
  bnb: process.env.EXPO_PUBLIC_BNB_RPC_URL || 'https://bsc-dataseed.bnbchain.org',
  solana: process.env.EXPO_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
};

export const ONCHAIN_ASSET_SPECS: OnchainAssetSpec[] = [
  {
    tokenId: 'eth',
    network: 'ethereum',
    standard: 'native',
    decimals: 18,
    label: 'ETH en Ethereum',
  },
  {
    tokenId: 'eth',
    network: 'base',
    standard: 'native',
    decimals: 18,
    label: 'ETH en Base',
  },
  {
    tokenId: 'usd',
    network: 'base',
    standard: 'erc20',
    decimals: 6,
    contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    label: 'USDC en Base',
  },
  {
    tokenId: 'usdt',
    network: 'ethereum',
    standard: 'erc20',
    decimals: 6,
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    label: 'USDT en Ethereum',
  },
  {
    tokenId: 'link',
    network: 'ethereum',
    standard: 'erc20',
    decimals: 18,
    contractAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    label: 'LINK en Ethereum',
  },
  {
    tokenId: 'pepe',
    network: 'ethereum',
    standard: 'erc20',
    decimals: 18,
    contractAddress: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
    label: 'PEPE en Ethereum',
  },
  {
    tokenId: 'bnb',
    network: 'bnb',
    standard: 'native',
    decimals: 18,
    label: 'BNB nativo',
  },
  {
    tokenId: 'usdt',
    network: 'bnb',
    standard: 'erc20',
    decimals: 18,
    contractAddress: '0x55d398326f99059fF775485246999027B3197955',
    label: 'USDT en BNB Chain',
  },
  {
    tokenId: 'sol',
    network: 'solana',
    standard: 'native',
    decimals: 9,
    label: 'SOL nativo',
  },
  {
    tokenId: 'usd',
    network: 'solana',
    standard: 'spl',
    decimals: 6,
    mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    label: 'USDC en Solana',
  },
];

export const REAL_WALLET_TOKEN_IDS = Array.from(
  new Set(ONCHAIN_ASSET_SPECS.map((asset) => asset.tokenId)),
);

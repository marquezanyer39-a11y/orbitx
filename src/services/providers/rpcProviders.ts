import { ethers } from 'ethers';

import type { SupportedNetwork } from '../../types';

export const rpcConfig: Record<SupportedNetwork, { chainId: number; rpcUrl: string; label: string }> = {
  ethereum: {
    chainId: 1,
    rpcUrl: process.env.EXPO_PUBLIC_ETHEREUM_RPC_URL || 'https://ethereum-rpc.publicnode.com',
    label: 'Ethereum',
  },
  base: {
    chainId: 8453,
    rpcUrl: process.env.EXPO_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org',
    label: 'Base',
  },
  bnb: {
    chainId: 56,
    rpcUrl: process.env.EXPO_PUBLIC_BNB_RPC_URL || 'https://bsc-dataseed.bnbchain.org',
    label: 'BNB Chain',
  },
  solana: {
    chainId: 0,
    rpcUrl: process.env.EXPO_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    label: 'Solana',
  },
};

const evmProviders = new Map<'ethereum' | 'base' | 'bnb', ethers.providers.StaticJsonRpcProvider>();

export function getRpcConfig(network: SupportedNetwork) {
  return rpcConfig[network];
}

export function getEvmProvider(network: 'ethereum' | 'base' | 'bnb') {
  const cached = evmProviders.get(network);
  if (cached) {
    return cached;
  }

  const provider = new ethers.providers.StaticJsonRpcProvider(
    rpcConfig[network].rpcUrl,
    rpcConfig[network].chainId,
  );
  evmProviders.set(network, provider);
  return provider;
}

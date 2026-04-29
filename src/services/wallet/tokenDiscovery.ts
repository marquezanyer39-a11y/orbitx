import type { ExternalTokenSpec } from './tokenRegistry';

export interface DiscoveredTokenSpec extends ExternalTokenSpec {
  source: 'moralis' | 'alchemy' | 'covalent';
}

const MORALIS_API_KEY = process.env.EXPO_PUBLIC_MORALIS_API_KEY?.trim() ?? '';
const ALCHEMY_API_KEY = process.env.EXPO_PUBLIC_ALCHEMY_API_KEY?.trim() ?? '';
const COVALENT_API_KEY = process.env.EXPO_PUBLIC_COVALENT_API_KEY?.trim() ?? '';

export function isTokenDiscoveryConfigured() {
  return Boolean(MORALIS_API_KEY || ALCHEMY_API_KEY || COVALENT_API_KEY);
}

export async function discoverTokensByAddress(
  address: string,
  chainId: number,
): Promise<DiscoveredTokenSpec[]> {
  const normalizedAddress = address.trim();

  if (!normalizedAddress || !chainId || !isTokenDiscoveryConfigured()) {
    return [];
  }

  // Future extension point:
  // - Moralis token balances by wallet
  // - Alchemy token balances by owner
  // - Covalent balances endpoint
  // Keep this safe by default: no API keys in logs, no UI errors, no writes.
  return [];
}

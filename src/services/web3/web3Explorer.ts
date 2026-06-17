import { Linking } from 'react-native';

import {
  getExplorerAddressUrl as getConfiguredExplorerAddressUrl,
  getExplorerTxUrl as getConfiguredExplorerTxUrl,
} from './web3NetworkConfig';

export function getExplorerTxUrl(chainId: number, txHash: string): string | null {
  return getConfiguredExplorerTxUrl(chainId, txHash);
}

export function getExplorerAddressUrl(chainId: number, address: string): string | null {
  return getConfiguredExplorerAddressUrl(chainId, address);
}

export async function openExplorerUrl(url: string | null): Promise<void> {
  if (!url) {
    return;
  }

  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
  }
}

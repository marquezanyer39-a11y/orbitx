import type { WalletAccount } from '../../types';
import { createWalletBundle } from '../../../utils/wallet';

export async function createWallet(): Promise<WalletAccount> {
  const bundle = await createWalletBundle();

  return {
    address: bundle.receiveAddresses.base || bundle.receiveAddresses.ethereum,
    mnemonicStored: true,
    walletType: 'orbitx',
    receiveAddresses: bundle.receiveAddresses,
    selectedNetwork: 'base',
  };
}

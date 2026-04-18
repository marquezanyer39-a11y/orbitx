import type { WalletAccount } from '../../types';
import { importWalletBundle } from '../../../utils/wallet';

export async function importWallet(seedPhrase: string): Promise<WalletAccount> {
  const bundle = await importWalletBundle(seedPhrase);

  return {
    address: bundle.receiveAddresses.base || bundle.receiveAddresses.ethereum,
    mnemonicStored: true,
    walletType: 'imported',
    receiveAddresses: bundle.receiveAddresses,
    selectedNetwork: 'base',
  };
}

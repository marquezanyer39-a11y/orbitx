import type { SecurityStatus, WalletAccount } from '../../types';
import { useOrbitStore } from '../../../store/useOrbitStore';
import {
  clearStoredWalletBundle,
  getStoredWalletBundle,
  getWalletSecurityState,
  markWalletSeedRevealed,
  readStoredWalletMnemonic,
} from '../../../utils/wallet';
import { getWalletPinState } from '../../../utils/walletSecurity';

export async function getSecureWallet(): Promise<WalletAccount | null> {
  const bundle = await getStoredWalletBundle();

  if (!bundle) {
    return null;
  }

  return {
    address: bundle.receiveAddresses.base || bundle.receiveAddresses.ethereum,
    mnemonicStored: true,
    walletType: 'orbitx',
    receiveAddresses: bundle.receiveAddresses,
    selectedNetwork: 'base',
  };
}

export async function getWalletSecurityStatus(): Promise<SecurityStatus> {
  const [state, pinState] = await Promise.all([getWalletSecurityState(), getWalletPinState()]);
  const biometricsEnabled = Boolean(useOrbitStore.getState().walletFuture.biometricsEnabled);

  return {
    biometricsEnabled,
    pinEnabled: pinState.enabled,
    seedPhraseConfirmedAt: state.confirmedAt,
    seedPhraseRevealedAt: state.revealedAt,
  };
}

export async function revealSecureSeedPhrase() {
  const mnemonic = await readStoredWalletMnemonic();
  if (!mnemonic) {
    throw new Error('Todavia no existe una billetera guardada.');
  }

  await markWalletSeedRevealed();
  return mnemonic;
}

export async function clearSecureWallet() {
  await clearStoredWalletBundle();
}

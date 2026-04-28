import { useExternalWalletContext } from '../providers/ExternalWalletProvider';

export function useExternalWallet() {
  return useExternalWalletContext();
}

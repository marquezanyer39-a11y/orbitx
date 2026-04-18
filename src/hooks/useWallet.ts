import { useEffect } from 'react';

import { useWalletStore } from '../store/walletStore';

export function useWallet() {
  const hydrateWallet = useWalletStore((state) => state.hydrateWallet);
  const hasHydrated = useWalletStore((state) => state.hasHydrated);
  const store = useWalletStore();

  useEffect(() => {
    if (hasHydrated) {
      return;
    }
    void hydrateWallet();
  }, [hasHydrated, hydrateWallet]);

  return store;
}

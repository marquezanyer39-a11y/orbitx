import { useEffect } from 'react';

import { useAuthStore } from '../store/authStore';
import { useWalletStore } from '../store/walletStore';

export function useWallet() {
  const hydrateWallet = useWalletStore((state) => state.hydrateWallet);
  const hasHydrated = useWalletStore((state) => state.hasHydrated);
  const authHasHydrated = useAuthStore((state) => state.hasHydrated);
  const authHasBootstrapped = useAuthStore((state) => state.hasBootstrapped);
  const sessionStatus = useAuthStore((state) => state.session.status);
  const sessionProvider = useAuthStore((state) => state.session.provider);
  const store = useWalletStore();

  useEffect(() => {
    if (hasHydrated) {
      return;
    }

    if (!authHasHydrated || !authHasBootstrapped) {
      return;
    }

    const shouldHydrate =
      sessionStatus === 'authenticated' || sessionProvider === 'local';

    if (!shouldHydrate) {
      return;
    }

    void hydrateWallet();
  }, [
    authHasBootstrapped,
    authHasHydrated,
    hasHydrated,
    hydrateWallet,
    sessionProvider,
    sessionStatus,
  ]);

  return store;
}

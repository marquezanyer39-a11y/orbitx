import { useEffect, useMemo } from 'react';

import { useAuthStore } from '../store/authStore';
import { useWalletStore } from '../store/walletStore';
import { buildSecurityAlert } from '../services/profile/profileData';

export function useSecurityStatus() {
  const session = useAuthStore((state) => state.session);
  const email = useAuthStore((state) => state.profile.email);
  const resendConfirmationEmail = useAuthStore((state) => state.resendConfirmationEmail);

  const hasHydrated = useWalletStore((state) => state.hasHydrated);
  const hydrateWallet = useWalletStore((state) => state.hydrateWallet);
  const refreshSecurityStatus = useWalletStore((state) => state.refreshSecurityStatus);
  const isWalletReady = useWalletStore((state) => state.isWalletReady);
  const securityStatus = useWalletStore((state) => state.securityStatus);
  const externalWallet = useWalletStore((state) => state.externalWallet);
  const walletError = useWalletStore((state) => state.error);

  useEffect(() => {
    if (hasHydrated) {
      return;
    }

    void hydrateWallet();
  }, [hasHydrated, hydrateWallet]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    void refreshSecurityStatus();
  }, [hasHydrated, refreshSecurityStatus]);

  const alert = useMemo(
    () =>
      buildSecurityAlert({
        session,
        email,
        isWalletReady,
        securityStatus,
      }),
    [email, isWalletReady, securityStatus, session],
  );

  return {
    isWalletReady,
    securityStatus,
    externalWallet,
    walletError,
    alert,
    resendConfirmationEmail,
  };
}

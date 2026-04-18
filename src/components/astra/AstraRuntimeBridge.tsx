import { usePathname } from 'expo-router';
import { useEffect } from 'react';

import { useOrbitStore } from '../../../store/useOrbitStore';
import { useAuthStore } from '../../store/authStore';
import { getLocalizedAstraSurfaceLabel } from '../../services/astra/astraCore';
import { useAstraStore } from '../../store/astraStore';
import type { AstraSurface } from '../../types/astra';
import { useWalletStore } from '../../store/walletStore';

function inferSurface(pathname: string | null): AstraSurface {
  const path = pathname ?? '/';

  if (path.includes('/create-token')) return 'create_token';
  if (path.includes('/bot-futures')) return 'bot_futures';
  if (path.includes('/social')) return 'social';
  if (path.includes('/markets') || path.includes('/market')) return 'market';
  if (path.includes('/security')) return 'security';
  if (path.includes('/settings') || path.includes('/personalization') || path.includes('/language')) return 'settings';
  if (path.includes('/wallet')) return 'wallet';
  if (path.includes('/ramp') || path.includes('/convert')) return 'ramp';
  if (path.includes('/spot') || path.includes('/trade')) return 'trade';
  if (path.includes('/profile')) return 'profile';
  if (path.includes('/error') || path.includes('not-found')) return 'error';
  if (path.includes('/home')) return 'home';
  return 'general';
}

export function AstraRuntimeBridge() {
  const pathname = usePathname();
  const rememberContext = useAstraStore((state) => state.rememberContext);
  const language = useOrbitStore((state) => state.settings.language);
  const walletReady = useWalletStore((state) => state.isWalletReady);
  const externalWalletAddress = useWalletStore((state) => state.externalWallet.address);
  const emailVerified = useAuthStore((state) => state.session.emailConfirmed);

  useEffect(() => {
    const surface = inferSurface(pathname);
    rememberContext({
      surface,
      path: pathname ?? '/',
      language,
      screenName: getLocalizedAstraSurfaceLabel(language, surface),
      walletReady,
      externalWalletConnected: Boolean(externalWalletAddress),
      emailVerified,
    });
  }, [emailVerified, externalWalletAddress, language, pathname, rememberContext, walletReady]);

  return null;
}

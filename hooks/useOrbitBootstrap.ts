import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { AppState, InteractionManager } from 'react-native';

import { useAppTheme } from './useAppTheme';
import { useOrbitStore } from '../store/useOrbitStore';
import { useAuthStore } from '../src/store/authStore';

export function useOrbitBootstrap() {
  const hasHydrated = useOrbitStore((state) => state.hasHydrated);
  const sessionStatus = useAuthStore((state) => state.session.status);
  const portfolioMode = useOrbitStore((state) => state.walletFuture.portfolioMode);
  const syncLiveMarket = useOrbitStore((state) => state.syncLiveMarket);
  const syncOnchainPortfolio = useOrbitStore((state) => state.syncOnchainPortfolio);
  const { colors } = useAppTheme();

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  useEffect(() => {
    if (!hasHydrated) {
      return undefined;
    }

    if (sessionStatus === 'signed_out') {
      return undefined;
    }

    let cancelled = false;
    let bootstrapTimeout: ReturnType<typeof setTimeout> | undefined;
    let liveIntervalId: ReturnType<typeof setInterval> | undefined;
    let onchainIntervalId: ReturnType<typeof setInterval> | undefined;

    const clearPolling = () => {
      if (liveIntervalId) {
        clearInterval(liveIntervalId);
        liveIntervalId = undefined;
      }
      if (onchainIntervalId) {
        clearInterval(onchainIntervalId);
        onchainIntervalId = undefined;
      }
    };

    const startPolling = () => {
      clearPolling();
      liveIntervalId = setInterval(() => {
        void syncLiveMarket();
      }, 90000);

      if (portfolioMode === 'onchain') {
        onchainIntervalId = setInterval(() => {
          void syncOnchainPortfolio();
        }, 120000);
      }
    };

    const bootstrapHandle = InteractionManager.runAfterInteractions(() => {
      bootstrapTimeout = setTimeout(() => {
        if (cancelled) {
          return;
        }

        void syncLiveMarket();
        if (portfolioMode === 'onchain') {
          void syncOnchainPortfolio();
        }
        startPolling();
      }, 1600);
    });

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void syncLiveMarket();
        if (portfolioMode === 'onchain') {
          void syncOnchainPortfolio();
        }
        startPolling();
        return;
      }

      clearPolling();
    });

    return () => {
      cancelled = true;
      bootstrapHandle.cancel();
      if (bootstrapTimeout) {
        clearTimeout(bootstrapTimeout);
      }
      appStateSubscription.remove();
      clearPolling();
    };
  }, [hasHydrated, portfolioMode, sessionStatus, syncLiveMarket, syncOnchainPortfolio]);
}

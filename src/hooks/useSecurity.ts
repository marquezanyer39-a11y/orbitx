import { useCallback } from 'react';

import { useOrbitStore } from '../../store/useOrbitStore';
import { unlockOrbitXWithBiometrics } from '../../utils/biometrics';
import { verifyWalletPin } from '../../utils/walletSecurity';
import {
  getWalletSecurityStatus,
  revealSecureSeedPhrase,
} from '../services/wallet/secureWalletStorage';
import { useUiStore } from '../store/uiStore';
import { useWalletStore } from '../store/walletStore';

interface ReauthenticationResult {
  ok: boolean;
  message: string;
  needsPin?: boolean;
  needsSetup?: boolean;
}

export function useSecurity() {
  const showToast = useUiStore((state) => state.showToast);
  const refreshSecurityStatus = useWalletStore((state) => state.refreshSecurityStatus);

  const reauthenticate = useCallback(async (pin?: string): Promise<ReauthenticationResult> => {
    const status = await getWalletSecurityStatus();

    if (status.biometricsEnabled) {
      const biometricResult = await unlockOrbitXWithBiometrics();
      if (!biometricResult.ok) {
        return {
          ok: false,
          message: biometricResult.message,
        };
      }
    }

    if (status.pinEnabled) {
      if (!pin?.trim()) {
        return {
          ok: false,
          message: 'Ingresa tu PIN para continuar.',
          needsPin: true,
        };
      }

      const validPin = await verifyWalletPin(pin.trim());
      if (!validPin) {
        return {
          ok: false,
          message: 'El PIN no coincide.',
          needsPin: true,
        };
      }
    }

    if (!status.biometricsEnabled && !status.pinEnabled) {
      return {
        ok: false,
        message: 'Configura un PIN o la biometria antes de ver informacion sensible.',
        needsSetup: true,
      };
    }

    return {
      ok: true,
      message: 'Verificacion completada.',
    };
  }, []);

  const revealSeedPhrase = useCallback(async (pin?: string) => {
    const authenticated = await reauthenticate(pin);
    if (!authenticated.ok) {
      showToast(authenticated.message, 'error');
      return null;
    }

    try {
      const seedPhrase = await revealSecureSeedPhrase();
      await refreshSecurityStatus();
      return seedPhrase;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo revelar la frase semilla.';
      showToast(message, 'error');
      return null;
    }
  }, [reauthenticate, refreshSecurityStatus, showToast]);

  const enableBiometrics = useCallback(async () => {
    try {
      const result = await useOrbitStore.getState().toggleBiometrics();
      if (!result.ok) {
        return false;
      }

      await refreshSecurityStatus();
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo actualizar la biometria.';
      showToast(message, 'error');
      return false;
    }
  }, [refreshSecurityStatus, showToast]);

  return {
    reauthenticate,
    revealSeedPhrase,
    enableBiometrics,
    refreshSecurityStatus,
  };
}

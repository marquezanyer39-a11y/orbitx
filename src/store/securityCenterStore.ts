import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ActionResult, SessionState } from '../../types';
import {
  buildCurrentSessionIdentity,
} from '../services/security/securityCenter';
import {
  clearTwoFactorSecret,
  createTwoFactorSetup,
  storeTwoFactorSecret,
  verifyTwoFactorCode,
} from '../services/security/twoFactor';
import type {
  AutoLockMinutes,
  PendingTwoFactorSetup,
  SecurityAlertKey,
  SecurityAlertPreferences,
  SecuritySessionItem,
  TwoFactorProvider,
  TwoFactorStatus,
} from '../types';

interface SecurityCenterStoreState {
  hasHydrated: boolean;
  twoFactor: TwoFactorStatus;
  pendingTwoFactorSetup: PendingTwoFactorSetup | null;
  activeSessions: SecuritySessionItem[];
  autoLockMinutes: AutoLockMinutes;
  alertPreferences: SecurityAlertPreferences;
  startTwoFactorSetup: (
    provider: TwoFactorProvider,
    email?: string,
  ) => Promise<ActionResult>;
  confirmTwoFactorSetup: (code: string) => Promise<ActionResult>;
  disableTwoFactor: () => Promise<ActionResult>;
  dismissTwoFactorSetup: () => void;
  syncCurrentSession: (session: SessionState) => void;
  revokeSession: (sessionId: string) => ActionResult;
  revokeOtherSessions: () => ActionResult;
  setAutoLockMinutes: (minutes: AutoLockMinutes) => void;
  toggleAlertPreference: (key: SecurityAlertKey) => void;
}

interface TwoFactorPendingRuntime {
  secret: string;
}

function buildResult(ok: boolean, message: string, code?: string): ActionResult {
  return { ok, message, code };
}

function mergeCurrentSession(
  sessions: SecuritySessionItem[],
  current: SecuritySessionItem,
): SecuritySessionItem[] {
  const withoutCurrent = sessions.filter((session) => session.id !== current.id).map((session) => ({
    ...session,
    current: false,
  }));

  return [current, ...withoutCurrent].slice(0, 8);
}

let pendingRuntime: TwoFactorPendingRuntime | null = null;

export const useSecurityCenterStore = create<SecurityCenterStoreState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      twoFactor: {
        enabled: false,
        provider: null,
      },
      pendingTwoFactorSetup: null,
      activeSessions: [],
      autoLockMinutes: 5,
      alertPreferences: {
        login: true,
        withdrawal: true,
        settings: true,
      },

      startTwoFactorSetup: async (provider, email) => {
        try {
          const setup = await createTwoFactorSetup({ provider, email });
          pendingRuntime = { secret: setup.secret };
          set({
            pendingTwoFactorSetup: {
              provider: setup.provider,
              manualKey: setup.manualKey,
              otpauthUrl: setup.otpauthUrl,
              qrDataUrl: setup.qrDataUrl,
              startedAt: setup.startedAt,
            },
          });
          return buildResult(true, 'Escanea el codigo y confirma con tu codigo de 6 digitos.', 'two_factor_setup_ready');
        } catch (error) {
          return buildResult(
            false,
            error instanceof Error ? error.message : 'No se pudo preparar el 2FA.',
            'two_factor_setup_error',
          );
        }
      },

      confirmTwoFactorSetup: async (code) => {
        const pending = get().pendingTwoFactorSetup;
        if (!pending || !pendingRuntime?.secret) {
          return buildResult(false, 'Primero genera un codigo QR para activar el 2FA.', 'missing_pending_setup');
        }

        const valid = verifyTwoFactorCode(pendingRuntime.secret, code);
        if (!valid) {
          return buildResult(false, 'El codigo no coincide. Revisa tu app autenticadora.', 'invalid_2fa_code');
        }

        await storeTwoFactorSecret(pendingRuntime.secret);
        const configuredAt = new Date().toISOString();
        pendingRuntime = null;
        set({
          twoFactor: {
            enabled: true,
            provider: pending.provider,
            configuredAt,
            lastVerifiedAt: configuredAt,
          },
          pendingTwoFactorSetup: null,
        });
        return buildResult(true, 'La autenticacion en dos factores quedo activa.', 'two_factor_enabled');
      },

      disableTwoFactor: async () => {
        await clearTwoFactorSecret();
        pendingRuntime = null;
        set({
          twoFactor: {
            enabled: false,
            provider: null,
          },
          pendingTwoFactorSetup: null,
        });
        return buildResult(true, 'La autenticacion en dos factores se desactivo.', 'two_factor_disabled');
      },

      dismissTwoFactorSetup: () => {
        pendingRuntime = null;
        set({ pendingTwoFactorSetup: null });
      },

      syncCurrentSession: (session) => {
        if (session.status !== 'authenticated') {
          return;
        }

        const currentSession = buildCurrentSessionIdentity(session);
        set((state) => ({
          activeSessions: mergeCurrentSession(state.activeSessions, {
            ...currentSession,
            createdAt:
              state.activeSessions.find((item) => item.id === currentSession.id)?.createdAt ??
              currentSession.createdAt,
          }),
        }));
      },

      revokeSession: (sessionId) => {
        const target = get().activeSessions.find((session) => session.id === sessionId);
        if (!target) {
          return buildResult(false, 'La sesion ya no esta disponible.', 'session_missing');
        }

        if (target.current) {
          return buildResult(false, 'No puedes cerrar esta sesion desde aqui.', 'current_session_protected');
        }

        set((state) => ({
          activeSessions: state.activeSessions.filter((session) => session.id !== sessionId),
        }));
        return buildResult(true, 'La sesion se cerro correctamente.', 'session_closed');
      },

      revokeOtherSessions: () => {
        const current = get().activeSessions.find((session) => session.current);
        if (!current) {
          return buildResult(false, 'No encontramos una sesion principal activa.', 'current_session_missing');
        }

        const others = get().activeSessions.filter((session) => !session.current);
        if (!others.length) {
          return buildResult(false, 'No hay otras sesiones para cerrar.', 'no_other_sessions');
        }

        set({ activeSessions: [current] });
        return buildResult(true, 'Cerramos todas las demas sesiones.', 'other_sessions_closed');
      },

      setAutoLockMinutes: (minutes) => set({ autoLockMinutes: minutes }),

      toggleAlertPreference: (key) =>
        set((state) => ({
          alertPreferences: {
            ...state.alertPreferences,
            [key]: !state.alertPreferences[key],
          },
        })),
    }),
    {
      name: 'orbitx-security-center-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        twoFactor: state.twoFactor,
        activeSessions: state.activeSessions,
        autoLockMinutes: state.autoLockMinutes,
        alertPreferences: state.alertPreferences,
      }),
      onRehydrateStorage: () => (state) => {
        pendingRuntime = null;
        if (state) {
          state.hasHydrated = true;
        }
      },
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<SecurityCenterStoreState>),
        hasHydrated: true,
        pendingTwoFactorSetup: null,
      }),
    },
  ),
);

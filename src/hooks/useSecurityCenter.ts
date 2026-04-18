import { useEffect, useMemo } from 'react';

import { useAppTheme } from '../../hooks/useAppTheme';
import { buildSecurityChecklist, computeSecuritySummary } from '../services/security/securityCenter';
import { useAuthStore } from '../store/authStore';
import { useSecurityCenterStore } from '../store/securityCenterStore';
import { useUiStore } from '../store/uiStore';
import { useWalletStore } from '../store/walletStore';
import type { SecurityAlertKey, TwoFactorProvider } from '../types';
import { useSecurity } from './useSecurity';

function formatDateLabel(value?: string) {
  if (!value) {
    return 'Sin configurar aun';
  }

  return new Date(value).toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function useSecurityCenter() {
  const { colors } = useAppTheme();
  const showToast = useUiStore((state) => state.showToast);

  const authProfile = useAuthStore((state) => state.profile);
  const authSession = useAuthStore((state) => state.session);
  const resendConfirmationEmail = useAuthStore((state) => state.resendConfirmationEmail);

  const hydrateWallet = useWalletStore((state) => state.hydrateWallet);
  const hasWalletHydrated = useWalletStore((state) => state.hasHydrated);
  const isWalletReady = useWalletStore((state) => state.isWalletReady);
  const walletError = useWalletStore((state) => state.error);
  const securityStatus = useWalletStore((state) => state.securityStatus);
  const refreshSecurityStatus = useWalletStore((state) => state.refreshSecurityStatus);
  const createWallet = useWalletStore((state) => state.createWallet);

  const hasHydrated = useSecurityCenterStore((state) => state.hasHydrated);
  const twoFactor = useSecurityCenterStore((state) => state.twoFactor);
  const pendingTwoFactorSetup = useSecurityCenterStore((state) => state.pendingTwoFactorSetup);
  const activeSessions = useSecurityCenterStore((state) => state.activeSessions);
  const autoLockMinutes = useSecurityCenterStore((state) => state.autoLockMinutes);
  const alertPreferences = useSecurityCenterStore((state) => state.alertPreferences);
  const startTwoFactorSetup = useSecurityCenterStore((state) => state.startTwoFactorSetup);
  const confirmTwoFactorSetup = useSecurityCenterStore((state) => state.confirmTwoFactorSetup);
  const disableTwoFactor = useSecurityCenterStore((state) => state.disableTwoFactor);
  const dismissTwoFactorSetup = useSecurityCenterStore((state) => state.dismissTwoFactorSetup);
  const syncCurrentSession = useSecurityCenterStore((state) => state.syncCurrentSession);
  const revokeSession = useSecurityCenterStore((state) => state.revokeSession);
  const revokeOtherSessions = useSecurityCenterStore((state) => state.revokeOtherSessions);
  const setAutoLockMinutes = useSecurityCenterStore((state) => state.setAutoLockMinutes);
  const toggleAlertPreference = useSecurityCenterStore((state) => state.toggleAlertPreference);

  const security = useSecurity();

  useEffect(() => {
    if (!hasWalletHydrated) {
      void hydrateWallet();
    }
  }, [hasWalletHydrated, hydrateWallet]);

  useEffect(() => {
    if (!hasWalletHydrated) {
      return;
    }

    void refreshSecurityStatus();
  }, [hasWalletHydrated, refreshSecurityStatus]);

  useEffect(() => {
    if (!hasHydrated && authSession.status === 'authenticated') {
      syncCurrentSession(authSession);
      return;
    }

    if (authSession.status === 'authenticated') {
      syncCurrentSession(authSession);
    }
  }, [authSession, hasHydrated, syncCurrentSession]);

  const checklist = useMemo(
    () =>
      buildSecurityChecklist({
        session: authSession,
        securityStatus,
        twoFactor,
        activeSessions,
      }),
    [activeSessions, authSession, securityStatus, twoFactor],
  );

  const summary = useMemo(
    () =>
      computeSecuritySummary({
        checklist,
        securityStatus,
      }),
    [checklist, securityStatus],
  );

  const pendingAction = useMemo(() => {
    if (authSession.status === 'authenticated' && !authSession.emailConfirmed && authProfile.email) {
      return {
        kind: 'verify_email' as const,
        title: 'Verifica tu correo',
        body: 'Confirma tu email para recuperar acceso sin friccion y reforzar la seguridad.',
        actionLabel: 'Reenviar correo',
      };
    }

    if (isWalletReady && !securityStatus.seedPhraseConfirmedAt) {
      return {
        kind: 'backup_seed' as const,
        title: 'Respalda tu frase semilla',
        body: 'Haz una copia segura para proteger tus fondos ante perdida del dispositivo.',
        actionLabel: 'Respaldar ahora',
      };
    }

    if (!twoFactor.enabled) {
      return {
        kind: 'enable_2fa' as const,
        title: 'Activa autenticacion en dos factores',
        body: 'Agrega una capa extra con codigos temporales desde tu app autenticadora.',
        actionLabel: 'Activar 2FA',
      };
    }

    return null;
  }, [authProfile.email, authSession, isWalletReady, securityStatus.seedPhraseConfirmedAt, twoFactor.enabled]);

  const sessionCountLabel =
    activeSessions.length === 1 ? '1 sesion activa' : `${activeSessions.length} sesiones activas`;

  async function handleStartTwoFactor(provider: TwoFactorProvider) {
    const result = await startTwoFactorSetup(provider, authProfile.email);
    showToast(result.message, result.ok ? 'success' : 'error');
    return result.ok;
  }

  async function handleConfirmTwoFactor(code: string) {
    const result = await confirmTwoFactorSetup(code);
    showToast(result.message, result.ok ? 'success' : 'error');
    return result.ok;
  }

  async function handleDisableTwoFactor() {
    const result = await disableTwoFactor();
    showToast(result.message, result.ok ? 'info' : 'error');
  }

  async function handleResendEmail() {
    const result = await resendConfirmationEmail(authProfile.email);
    showToast(result.message, result.ok ? 'success' : 'error');
  }

  async function handleCreateWallet() {
    const wallet = await createWallet();
    if (wallet) {
      showToast('Tu billetera OrbitX ya esta lista para respaldarse.', 'success');
      return true;
    }

    showToast('No pudimos crear tu billetera en este momento.', 'error');
    return false;
  }

  function handleRevokeSession(sessionId: string) {
    const result = revokeSession(sessionId);
    showToast(result.message, result.ok ? 'info' : 'error');
  }

  function handleRevokeOtherSessions() {
    const result = revokeOtherSessions();
    showToast(result.message, result.ok ? 'info' : 'error');
  }

  function handleToggleAlert(key: SecurityAlertKey) {
    toggleAlertPreference(key);
    showToast('Actualizamos tus alertas de seguridad.', 'success');
  }

  function handleAutoLock(minutes: typeof autoLockMinutes) {
    setAutoLockMinutes(minutes);
    showToast(`Auto-bloqueo configurado en ${minutes} minuto${minutes === 1 ? '' : 's'}.`, 'success');
  }

  async function handleBiometricsToggle() {
    const enabled = await security.enableBiometrics();
    if (enabled) {
      showToast('Actualizamos la biometria de OrbitX.', 'success');
      return;
    }
    showToast('No pudimos cambiar la biometria en este momento.', 'error');
  }

  const metricsTone =
    summary.level === 'Alto' ? colors.profit : summary.level === 'Medio' ? colors.warning : colors.loss;

  return {
    loading: !hasWalletHydrated,
    walletError,
    isWalletReady,
    securityStatus,
    twoFactor,
    pendingTwoFactorSetup,
    activeSessions,
    alertPreferences,
    autoLockMinutes,
    checklist,
    summary,
    pendingAction,
    sessionCountLabel,
    metricsTone,
    formatted: {
      twoFactorConfiguredAt: formatDateLabel(twoFactor.configuredAt),
      seedConfirmedAt: formatDateLabel(securityStatus.seedPhraseConfirmedAt),
      seedRevealedAt: formatDateLabel(securityStatus.seedPhraseRevealedAt),
    },
    actions: {
      refreshSecurityStatus,
      resendConfirmationEmail: handleResendEmail,
      createWallet: handleCreateWallet,
      startTwoFactor: handleStartTwoFactor,
      confirmTwoFactor: handleConfirmTwoFactor,
      disableTwoFactor: handleDisableTwoFactor,
      dismissTwoFactorSetup,
      revokeSession: handleRevokeSession,
      revokeOtherSessions: handleRevokeOtherSessions,
      setAutoLock: handleAutoLock,
      toggleAlert: handleToggleAlert,
      toggleBiometrics: handleBiometricsToggle,
    },
  };
}

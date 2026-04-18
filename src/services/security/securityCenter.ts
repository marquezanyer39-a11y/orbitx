import { Platform } from 'react-native';

import type { SessionState } from '../../../types';
import type { SecurityStatus } from '../../types/wallet';
import type {
  SecurityChecklistItem,
  SecurityLevel,
  SecuritySessionItem,
  TwoFactorStatus,
} from '../../types';

function timezoneLabel() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const chunks = timezone.split('/');
  const city = chunks[chunks.length - 1]?.replace(/_/g, ' ') || timezone;
  const region = chunks[0] || 'Global';
  return `${city} · ${region}`;
}

export function buildCurrentSessionIdentity(session: SessionState): SecuritySessionItem {
  const platform =
    Platform.OS === 'ios' || Platform.OS === 'android' || Platform.OS === 'web'
      ? Platform.OS
      : 'native';
  const deviceLabel =
    platform === 'ios'
      ? 'iPhone'
      : platform === 'android'
        ? 'Android'
        : platform === 'web'
          ? 'Web'
          : 'OrbitX';

  return {
    id: `${platform}-current`,
    deviceLabel: `${deviceLabel} · OrbitX`,
    locationLabel: timezoneLabel(),
    providerLabel: session.provider === 'supabase' ? 'Correo seguro' : 'Acceso local',
    createdAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
    current: true,
    platform,
  };
}

export function buildSecurityChecklist(params: {
  session: SessionState;
  securityStatus: SecurityStatus;
  twoFactor: TwoFactorStatus;
  activeSessions: SecuritySessionItem[];
}): SecurityChecklistItem[] {
  const { session, securityStatus, twoFactor, activeSessions } = params;
  const sessionsControlled = activeSessions.length > 0 && activeSessions.length <= 3;

  return [
    {
      key: 'email',
      label: 'Email verificado',
      ok: session.emailConfirmed,
      helper: session.emailConfirmed ? 'Tu correo esta verificado.' : 'Confirma tu email para recuperar acceso.',
    },
    {
      key: 'seed',
      label: 'Seed respaldada',
      ok: Boolean(securityStatus.seedPhraseConfirmedAt),
      helper: securityStatus.seedPhraseConfirmedAt
        ? 'Tu frase semilla ya se confirmo.'
        : 'Haz una copia segura de tu frase semilla.',
    },
    {
      key: 'twoFactor',
      label: '2FA activo',
      ok: twoFactor.enabled,
      helper: twoFactor.enabled
        ? `${twoFactor.provider === 'authy' ? 'Authy' : 'Google Authenticator'} protege tu acceso.`
        : 'Agrega una capa extra con codigo temporal.',
    },
    {
      key: 'sessions',
      label: 'Sesiones controladas',
      ok: sessionsControlled,
      helper: sessionsControlled
        ? `${activeSessions.length} sesion${activeSessions.length === 1 ? '' : 'es'} activa${activeSessions.length === 1 ? '' : 's'} bajo control.`
        : 'Revisa y cierra sesiones que ya no reconozcas.',
    },
  ];
}

export function computeSecuritySummary(params: {
  checklist: SecurityChecklistItem[];
  securityStatus: SecurityStatus;
}) {
  const { checklist, securityStatus } = params;
  const checklistScore = checklist.filter((item) => item.ok).length * 25;
  const lockBonus = (securityStatus.pinEnabled ? 8 : 0) + (securityStatus.biometricsEnabled ? 12 : 0);
  const score = Math.min(checklistScore + lockBonus, 100);
  const level: SecurityLevel = score >= 80 ? 'Alto' : score >= 50 ? 'Medio' : 'Bajo';

  return {
    score,
    level,
    progress: Math.max(0.12, score / 100),
  };
}

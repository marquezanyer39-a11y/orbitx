export type SecurityLevel = 'Bajo' | 'Medio' | 'Alto';
export type TwoFactorProvider = 'google_authenticator' | 'authy';
export type SecurityAlertKey = 'login' | 'withdrawal' | 'settings';
export type AutoLockMinutes = 1 | 5 | 15 | 30 | 60;

export interface SecurityChecklistItem {
  key: 'email' | 'seed' | 'twoFactor' | 'sessions';
  label: string;
  ok: boolean;
  helper: string;
}

export interface TwoFactorStatus {
  enabled: boolean;
  provider: TwoFactorProvider | null;
  configuredAt?: string;
  lastVerifiedAt?: string;
}

export interface PendingTwoFactorSetup {
  provider: TwoFactorProvider;
  manualKey: string;
  otpauthUrl: string;
  qrDataUrl: string;
  startedAt: string;
}

export interface SecuritySessionItem {
  id: string;
  deviceLabel: string;
  locationLabel: string;
  providerLabel: string;
  lastSeenAt: string;
  createdAt: string;
  current: boolean;
  platform: 'ios' | 'android' | 'web' | 'native';
}

export interface SecurityAlertPreferences {
  login: boolean;
  withdrawal: boolean;
  settings: boolean;
}

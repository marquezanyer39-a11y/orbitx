import { astraConfigService, type AstraFeatureFlags } from './astraFlags';

export type AstraRemoteConfigLifecycleSignal = 'foreground' | 'background';

export type AstraRemoteConfigBootstrapReason =
  | 'refreshed'
  | 'min_interval'
  | 'background'
  | 'error';

export interface AstraRemoteConfigBootstrapOptions {
  minIntervalMs?: number;
  now?: () => number;
}

export interface AstraRemoteConfigBootstrapResult {
  refreshed: boolean;
  reason: AstraRemoteConfigBootstrapReason;
  flags: AstraFeatureFlags;
  attemptedAt: number;
  lastAttemptAt: number | null;
  lastSuccessAt: number | null;
}

export const ASTRA_REMOTE_CONFIG_BOOTSTRAP_MIN_INTERVAL_MS = 1000 * 30;

let inFlightPromise: Promise<AstraRemoteConfigBootstrapResult> | null = null;
let lastAttemptAt: number | null = null;
let lastSuccessAt: number | null = null;

function getNow(options?: AstraRemoteConfigBootstrapOptions): number {
  return options?.now?.() ?? Date.now();
}

function createResult(input: {
  refreshed: boolean;
  reason: AstraRemoteConfigBootstrapReason;
  flags: AstraFeatureFlags;
  attemptedAt: number;
}): AstraRemoteConfigBootstrapResult {
  return {
    refreshed: input.refreshed,
    reason: input.reason,
    flags: input.flags,
    attemptedAt: input.attemptedAt,
    lastAttemptAt,
    lastSuccessAt,
  };
}

export function refreshAstraRemoteConfigOnce(
  options: AstraRemoteConfigBootstrapOptions = {},
): Promise<AstraRemoteConfigBootstrapResult> {
  if (inFlightPromise) {
    return inFlightPromise;
  }

  const attemptedAt = getNow(options);
  const minIntervalMs = options.minIntervalMs ?? ASTRA_REMOTE_CONFIG_BOOTSTRAP_MIN_INTERVAL_MS;

  if (lastAttemptAt !== null && attemptedAt - lastAttemptAt < minIntervalMs) {
    return Promise.resolve(createResult({
      refreshed: false,
      reason: 'min_interval',
      flags: astraConfigService.getFlags(),
      attemptedAt,
    }));
  }

  lastAttemptAt = attemptedAt;
  inFlightPromise = astraConfigService
    .refreshFlags()
    .then((flags) => {
      lastSuccessAt = attemptedAt;
      return createResult({
        refreshed: true,
        reason: 'refreshed',
        flags,
        attemptedAt,
      });
    })
    .catch(() =>
      createResult({
        refreshed: false,
        reason: 'error',
        flags: astraConfigService.getFlags(),
        attemptedAt,
      }),
    )
    .finally(() => {
      inFlightPromise = null;
    });

  return inFlightPromise;
}

export function onAstraRemoteConfigLifecycleSignal(
  signal: AstraRemoteConfigLifecycleSignal,
  options: AstraRemoteConfigBootstrapOptions = {},
): Promise<AstraRemoteConfigBootstrapResult> {
  const attemptedAt = getNow(options);

  if (signal === 'background') {
    return Promise.resolve(createResult({
      refreshed: false,
      reason: 'background',
      flags: astraConfigService.getFlags(),
      attemptedAt,
    }));
  }

  return refreshAstraRemoteConfigOnce(options);
}

export function resetAstraRemoteConfigBootstrapState(): void {
  inFlightPromise = null;
  lastAttemptAt = null;
  lastSuccessAt = null;
}

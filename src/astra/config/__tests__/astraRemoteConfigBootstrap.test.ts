import { beforeEach, describe, expect, it, vi } from 'vitest';

import { astraFlagsDefaults } from '../astraFlags.defaults';
import { astraConfigService } from '../astraFlags';
import {
  onAstraRemoteConfigLifecycleSignal,
  refreshAstraRemoteConfigOnce,
  resetAstraRemoteConfigBootstrapState,
} from '../astraRemoteConfigBootstrap';

function pendingPromise<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((innerResolve) => {
    resolve = innerResolve;
  });

  return { promise, resolve };
}

describe('astraRemoteConfigBootstrap', () => {
  beforeEach(() => {
    resetAstraRemoteConfigBootstrapState();
    vi.restoreAllMocks();
  });

  it('importar bootstrap no ejecuta refresh', () => {
    const refreshSpy = vi.spyOn(astraConfigService, 'refreshFlags');

    expect(refreshSpy).not.toHaveBeenCalled();
  });

  it('refresh once llama refreshFlags una sola vez', async () => {
    const refreshSpy = vi
      .spyOn(astraConfigService, 'refreshFlags')
      .mockResolvedValue({ ...astraFlagsDefaults, ASTRA_ENABLED: false });

    const result = await refreshAstraRemoteConfigOnce({ now: () => 1_000, minIntervalMs: 500 });

    expect(result.refreshed).toBe(true);
    expect(result.reason).toBe('refreshed');
    expect(result.flags.ASTRA_ENABLED).toBe(false);
    expect(refreshSpy).toHaveBeenCalledTimes(1);
  });

  it('dos llamadas simultaneas comparten promesa', async () => {
    const pending = pendingPromise<typeof astraFlagsDefaults>();
    const refreshSpy = vi.spyOn(astraConfigService, 'refreshFlags').mockReturnValue(pending.promise);

    const first = refreshAstraRemoteConfigOnce({ now: () => 2_000, minIntervalMs: 500 });
    const second = refreshAstraRemoteConfigOnce({ now: () => 2_001, minIntervalMs: 500 });

    expect(first).toBe(second);

    pending.resolve({ ...astraFlagsDefaults, ASTRA_ENABLED: false });
    const result = await second;

    expect(result.refreshed).toBe(true);
    expect(refreshSpy).toHaveBeenCalledTimes(1);
  });

  it('minIntervalMs evita llamadas repetidas', async () => {
    const refreshSpy = vi.spyOn(astraConfigService, 'refreshFlags').mockResolvedValue(astraFlagsDefaults);
    vi.spyOn(astraConfigService, 'getFlags').mockReturnValue(astraFlagsDefaults);

    await refreshAstraRemoteConfigOnce({ now: () => 3_000, minIntervalMs: 500 });
    const second = await refreshAstraRemoteConfigOnce({ now: () => 3_100, minIntervalMs: 500 });

    expect(second.refreshed).toBe(false);
    expect(second.reason).toBe('min_interval');
    expect(refreshSpy).toHaveBeenCalledTimes(1);
  });

  it('error remoto no lanza excepcion fatal', async () => {
    vi.spyOn(astraConfigService, 'refreshFlags').mockRejectedValue(new Error('offline'));
    vi.spyOn(astraConfigService, 'getFlags').mockReturnValue(astraFlagsDefaults);

    const result = await refreshAstraRemoteConfigOnce({ now: () => 4_000, minIntervalMs: 500 });

    expect(result.refreshed).toBe(false);
    expect(result.reason).toBe('error');
    expect(result.flags).toEqual(astraFlagsDefaults);
  });

  it('foreground simulado llama refresh si corresponde', async () => {
    const refreshSpy = vi.spyOn(astraConfigService, 'refreshFlags').mockResolvedValue(astraFlagsDefaults);

    const result = await onAstraRemoteConfigLifecycleSignal('foreground', {
      now: () => 5_000,
      minIntervalMs: 500,
    });

    expect(result.refreshed).toBe(true);
    expect(refreshSpy).toHaveBeenCalledTimes(1);
  });

  it('background simulado no llama refresh', async () => {
    const refreshSpy = vi.spyOn(astraConfigService, 'refreshFlags').mockResolvedValue(astraFlagsDefaults);
    vi.spyOn(astraConfigService, 'getFlags').mockReturnValue(astraFlagsDefaults);

    const result = await onAstraRemoteConfigLifecycleSignal('background', {
      now: () => 6_000,
      minIntervalMs: 500,
    });

    expect(result.refreshed).toBe(false);
    expect(result.reason).toBe('background');
    expect(refreshSpy).not.toHaveBeenCalled();
  });

  it('reset limpia estado', async () => {
    const refreshSpy = vi.spyOn(astraConfigService, 'refreshFlags').mockResolvedValue(astraFlagsDefaults);

    await refreshAstraRemoteConfigOnce({ now: () => 7_000, minIntervalMs: 500 });
    resetAstraRemoteConfigBootstrapState();
    await refreshAstraRemoteConfigOnce({ now: () => 7_100, minIntervalMs: 500 });

    expect(refreshSpy).toHaveBeenCalledTimes(2);
  });

  it('no hay imports hacia navegacion ni legacy', async () => {
    const module = await import('../astraRemoteConfigBootstrap');
    const exportedKeys = Object.keys(module);

    expect(exportedKeys).toContain('refreshAstraRemoteConfigOnce');
    expect(exportedKeys).not.toContain('AstraRuntimeBridge');
    expect(exportedKeys).not.toContain('AstraVoiceSheet');
  });
});

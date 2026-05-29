import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { AstraFeatureFlags } from '../astraFlags';
import { astraFlagsDefaults } from '../astraFlags.defaults';
import * as bootstrapModule from '../astraRemoteConfigBootstrap';
import {
  getAstraRemoteConfigRefreshHostChildren,
  runAstraRemoteConfigRefreshHostEffect,
} from '../AstraRemoteConfigRefreshHost';

const bootstrapResult = {
  refreshed: true,
  reason: 'refreshed' as const,
  flags: astraFlagsDefaults as AstraFeatureFlags,
  attemptedAt: 1_000,
  lastAttemptAt: 1_000,
  lastSuccessAt: 1_000,
};

describe('AstraRemoteConfigRefreshHost', () => {
  it('no refresca si enabled=false', async () => {
    const refreshSpy = vi
      .spyOn(bootstrapModule, 'refreshAstraRemoteConfigOnce')
      .mockResolvedValue(bootstrapResult);

    const result = await runAstraRemoteConfigRefreshHostEffect({
      enabled: false,
      refreshOnMount: true,
    });

    expect(result).toBeNull();
    expect(refreshSpy).not.toHaveBeenCalled();
  });

  it('no refresca si refreshOnMount=false', async () => {
    const refreshSpy = vi
      .spyOn(bootstrapModule, 'refreshAstraRemoteConfigOnce')
      .mockResolvedValue(bootstrapResult);

    const result = await runAstraRemoteConfigRefreshHostEffect({
      enabled: true,
      refreshOnMount: false,
    });

    expect(result).toBeNull();
    expect(refreshSpy).not.toHaveBeenCalled();
  });

  it('refresca una vez si enabled=true y refreshOnMount=true', async () => {
    const refreshSpy = vi
      .spyOn(bootstrapModule, 'refreshAstraRemoteConfigOnce')
      .mockResolvedValue(bootstrapResult);

    const result = await runAstraRemoteConfigRefreshHostEffect({
      enabled: true,
      refreshOnMount: true,
      minIntervalMs: 500,
    });

    expect(result).toEqual(bootstrapResult);
    expect(refreshSpy).toHaveBeenCalledTimes(1);
    expect(refreshSpy).toHaveBeenCalledWith({ minIntervalMs: 500 });
  });

  it('renderiza children', () => {
    const child = <span>astra-child</span>;
    const result = getAstraRemoteConfigRefreshHostChildren(child);

    expect(React.isValidElement(result)).toBe(true);
    expect((result as React.ReactElement<{ children?: React.ReactNode }>).props.children).toBe(
      'astra-child',
    );
  });

  it('no lanza error si refresh falla', async () => {
    vi.spyOn(bootstrapModule, 'refreshAstraRemoteConfigOnce').mockRejectedValue(new Error('offline'));

    await expect(
      runAstraRemoteConfigRefreshHostEffect({
        enabled: true,
        refreshOnMount: true,
      }),
    ).resolves.toBeNull();
  });

  it('llama onResult cuando termina', async () => {
    const onResult = vi.fn();
    vi.spyOn(bootstrapModule, 'refreshAstraRemoteConfigOnce').mockResolvedValue(bootstrapResult);

    const result = await runAstraRemoteConfigRefreshHostEffect({
      enabled: true,
      refreshOnMount: true,
      onResult,
    });

    expect(result).toEqual(bootstrapResult);
    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith(bootstrapResult);
  });
});

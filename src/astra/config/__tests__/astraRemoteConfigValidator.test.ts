import { describe, expect, it, vi } from 'vitest';

import { astraFlagsDefaults } from '../astraFlags.defaults';
import {
  applyAstraKillSwitches,
  mergeAstraRemoteConfig,
  validateAstraRemoteConfig,
} from '../astraRemoteConfigValidator';

describe('astraRemoteConfigValidator', () => {
  it('clave desconocida se ignora', () => {
    const result = validateAstraRemoteConfig({
      ASTRA_ENABLED: false,
      UNKNOWN_KEY: true,
    });

    expect(result).toEqual({ ASTRA_ENABLED: false });
  });

  it('tipo invalido se ignora', () => {
    const result = validateAstraRemoteConfig({
      ASTRA_ENABLED: 'nope',
      ASTRA_MEMORY_ENABLED: true,
    });

    expect(result).toEqual({ ASTRA_MEMORY_ENABLED: true });
  });

  it('kill switch desactiva capas correspondientes', () => {
    const merged = mergeAstraRemoteConfig(astraFlagsDefaults, {
      ASTRA_KILL_SWITCH: true,
      ASTRA_ENABLED: true,
      ASTRA_SYNC_READ_ENABLED: true,
      ASTRA_NOTIFICATION_ENGINE_ENABLED: true,
      ASTRA_NOTIFICATION_PUSH_ENABLED: true,
    });

    expect(merged.ASTRA_KILL_SWITCH).toBe(true);
    expect(merged.ASTRA_ENABLED).toBe(false);
    expect(merged.ASTRA_SYNC_READ_ENABLED).toBe(false);
    expect(merged.ASTRA_NOTIFICATION_ENGINE_ENABLED).toBe(false);
    expect(merged.ASTRA_NOTIFICATION_PUSH_ENABLED).toBe(false);
  });

  it('no se ejecuta nada dinamico desde remote config', () => {
    const dynamicValue = vi.fn(() => true);
    const result = validateAstraRemoteConfig({
      ASTRA_ENABLED: dynamicValue,
      ASTRA_MEMORY_ENABLED: true,
    });

    expect(dynamicValue).not.toHaveBeenCalled();
    expect(result).toEqual({ ASTRA_MEMORY_ENABLED: true });
  });

  it('applyAstraKillSwitches deja igual si no esta activo', () => {
    const result = applyAstraKillSwitches({
      ...astraFlagsDefaults,
      ASTRA_ENABLED: true,
    });

    expect(result.ASTRA_ENABLED).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';

import { createAstraQaHubSandboxFlags } from '../astraQaHubModel';
import { canRenderAstraQaHubDevOnly } from '../astraQaDevOnlyGuard';

declare const require: (moduleName: string) => {
  readFileSync?: (path: string, encoding: string) => string;
  join?: (...parts: string[]) => string;
};

const { readFileSync } = require('fs');
const { join } = require('path');
const rootDir = process.cwd();

function readProjectFile(path: string): string {
  if (!readFileSync || !join) {
    return '';
  }

  return readFileSync(join(rootDir, path), 'utf8');
}

function createSafeFlags(overrides = {}) {
  return createAstraQaHubSandboxFlags(overrides);
}

describe('canRenderAstraQaHubDevOnly', () => {
  it('devuelve false cuando isDev=false', () => {
    expect(canRenderAstraQaHubDevOnly({ isDev: false, flags: createSafeFlags() })).toBe(false);
  });

  it('devuelve false si ASTRA_QA_HUB_ENABLED=false', () => {
    expect(
      canRenderAstraQaHubDevOnly({
        isDev: true,
        flags: createSafeFlags({ ASTRA_QA_HUB_ENABLED: false }),
      }),
    ).toBe(false);
  });

  it('devuelve false si ASTRA_KILL_SWITCH=true', () => {
    expect(
      canRenderAstraQaHubDevOnly({
        isDev: true,
        flags: createSafeFlags({ ASTRA_KILL_SWITCH: true }),
      }),
    ).toBe(false);
  });

  it('devuelve false si ASTRA_RISK_REAL_EXECUTION_ENABLED=true', () => {
    expect(
      canRenderAstraQaHubDevOnly({
        isDev: true,
        flags: {
          ...createSafeFlags(),
          ASTRA_RISK_REAL_EXECUTION_ENABLED: true,
        },
      }),
    ).toBe(false);
  });

  it('devuelve false si ASTRA_TOOL_REAL_EXECUTION_ENABLED=true', () => {
    expect(
      canRenderAstraQaHubDevOnly({
        isDev: true,
        flags: {
          ...createSafeFlags(),
          ASTRA_TOOL_REAL_EXECUTION_ENABLED: true,
        },
      }),
    ).toBe(false);
  });

  it('devuelve false si ASTRA_NOTIFICATION_PUSH_ENABLED=true', () => {
    expect(
      canRenderAstraQaHubDevOnly({
        isDev: true,
        flags: {
          ...createSafeFlags(),
          ASTRA_NOTIFICATION_PUSH_ENABLED: true,
        },
      }),
    ).toBe(false);
  });

  it('devuelve false si ASTRA_SYNC_WRITE_ENABLED=true', () => {
    expect(
      canRenderAstraQaHubDevOnly({
        isDev: true,
        flags: {
          ...createSafeFlags(),
          ASTRA_SYNC_WRITE_ENABLED: true,
        },
      }),
    ).toBe(false);
  });

  it('devuelve true solo con combinacion segura', () => {
    expect(canRenderAstraQaHubDevOnly({ isDev: true, flags: createSafeFlags() })).toBe(true);
  });
});

describe('Astra QA dev route isolation', () => {
  it('ruta dev no importa backend, Gemini, WalletConnect/Reown ni providers/RPC', () => {
    const routeSource = readProjectFile('app/dev/astra-qa.tsx');

    expect(routeSource).not.toMatch(/backend/i);
    expect(routeSource).not.toMatch(/gemini/i);
    expect(routeSource).not.toMatch(/walletconnect|reown/i);
    expect(routeSource).not.toMatch(/providers\/rpc|rpc|signer/i);
  });

  it('no hay imports desde Home, Wallet, Trade ni navegacion principal hacia QA Hub', () => {
    const sources = [
      readProjectFile('src/screens/HomeScreen/index.tsx'),
      readProjectFile('src/screens/WalletScreen/index.tsx'),
      readProjectFile('src/screens/TradeScreen/index.tsx'),
      readProjectFile('app/(tabs)/_layout.tsx'),
      readProjectFile('app/_layout.tsx'),
    ].join('\n');

    expect(sources).not.toContain('AstraInternalQaHub');
    expect(sources).not.toContain('astra/qa');
    expect(sources).not.toContain('/dev/astra-qa');
  });
});

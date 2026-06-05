import { describe, expect, it } from 'vitest';

interface FsModuleLike {
  existsSync?: (path: string) => boolean;
  readFileSync?: (path: string, encoding: string) => string;
}

declare const require: (moduleName: string) => FsModuleLike;

const fs = require('fs');
const rootDir = process.cwd();
const routePath = `${rootDir}/app/demo/astra.tsx`;

const FORBIDDEN_REFERENCES = [
  'AstraRuntimeBridge',
  'AstraVoiceSheet',
  'WalletConnect',
  'Reown',
  'AppKit',
  'useAppKit',
  'astraBackendUrl',
  'orbitxBackendUrl',
  'sendTransaction',
  'approve',
  'swap',
  'deploy',
  'placeOrder',
  'createOrder',
  'executeOrder',
  'privateKey',
  'mnemonic',
  'fetch',
  'axios',
  'supabase',
  'realtime',
  'voice',
  'microphone',
  'speech',
];

function readRouteSource() {
  if (!fs.existsSync?.(routePath) || !fs.readFileSync) {
    return '';
  }

  return fs.readFileSync(routePath, 'utf8');
}

describe('AstraDemoScreen isolation audit', () => {
  it('app/demo/astra.tsx no importa ni referencia modulos sensibles', () => {
    const source = readRouteSource();

    FORBIDDEN_REFERENCES.forEach((forbidden) => {
      expect(source).not.toContain(forbidden);
    });
  });
});

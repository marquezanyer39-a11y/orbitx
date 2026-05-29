import { describe, expect, it } from 'vitest';

import { astraFlagsDefaults } from '../../config/astraFlags.defaults';
import { canRenderAstraQaHubDevOnly } from '../astraQaDevOnlyGuard';
import { createAstraQaHubSandboxFlags } from '../astraQaHubModel';

interface DirentLike {
  name: string;
  isDirectory(): boolean;
  isFile(): boolean;
}

declare const require: (moduleName: string) => {
  existsSync?: (path: string) => boolean;
  join?: (...parts: string[]) => string;
  readFileSync?: (path: string, encoding: string) => string;
  readdirSync?: (path: string, options?: { withFileTypes?: boolean }) => DirentLike[];
};

const fs = require('fs');
const path = require('path');
const rootDir = process.cwd();

const qaHubSourceFiles = [
  'src/astra/qa/AstraInternalQaHub.tsx',
  'src/astra/qa/AstraQaChecklistPanel.tsx',
  'src/astra/qa/AstraQaConfirmationBridge.tsx',
  'src/astra/qa/AstraQaHubFlagsPanel.tsx',
  'src/astra/qa/AstraQaHubStatusPanel.tsx',
  'src/astra/qa/AstraQaHubTabBar.tsx',
  'src/astra/qa/AstraQaModuleHealthCard.tsx',
  'src/astra/qa/AstraQaRemoteConfigPanel.tsx',
  'src/astra/qa/AstraQaVisualSummary.tsx',
  'src/astra/qa/astraQaChecklistModel.ts',
  'src/astra/qa/astraQaDevOnlyGuard.ts',
  'src/astra/qa/astraQaHubModel.ts',
  'src/astra/qa/astraQaHub.types.ts',
  'src/astra/qa/index.ts',
];

const protectedAppFiles = [
  'app/_layout.tsx',
  'app/(tabs)/_layout.tsx',
  'src/screens/HomeScreen/index.tsx',
  'src/screens/WalletScreen/index.tsx',
  'src/screens/TradeScreen/index.tsx',
];

function projectPath(filePath: string): string {
  return path.join?.(rootDir, filePath) ?? filePath;
}

function readProjectFile(filePath: string): string {
  const absolutePath = projectPath(filePath);

  if (!fs.readFileSync || !fs.existsSync?.(absolutePath)) {
    return '';
  }

  return fs.readFileSync(absolutePath, 'utf8');
}

function readFiles(filePaths: string[]): string {
  return filePaths.map(readProjectFile).join('\n');
}

function listProjectFiles(dirPath: string): string[] {
  const absoluteDir = projectPath(dirPath);
  if (!fs.existsSync?.(absoluteDir) || !fs.readdirSync) {
    return [];
  }

  return fs.readdirSync(absoluteDir, { withFileTypes: true }).flatMap((entry) => {
    const childPath = `${dirPath}/${entry.name}`;

    if (entry.isDirectory()) {
      return listProjectFiles(childPath);
    }

    if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      return [childPath];
    }

    return [];
  });
}

function importStatements(source: string): string {
  return source
    .split('\n')
    .filter((line) => /^\s*import\s/.test(line))
    .join('\n');
}

function stripAllowedSafetyCopy(source: string): string {
  return source
    .replace(/const HIDDEN_FLAG_PATTERN = .*;\n/g, '')
    .replace(/id: 'no-signatures',/g, '')
    .replace(/No signatures/g, '')
    .replace(/Sin firmas/g, '')
    .replace(/No se ejecuto nada real/g, '');
}

describe('Astra QA security audit', () => {
  it('app/dev/astra-qa.tsx no importa backend, Gemini, WalletConnect/Reown ni providers/RPC', () => {
    const routeImports = importStatements(readProjectFile('app/dev/astra-qa.tsx'));

    expect(routeImports).not.toMatch(/backend/i);
    expect(routeImports).not.toMatch(/gemini/i);
    expect(routeImports).not.toMatch(/walletconnect|reown/i);
    expect(routeImports).not.toMatch(/providers\/rpc|providers\\rpc|rpc|signer/i);
  });

  it('app/dev/astra-qa.tsx no importa Home, Wallet, Trade, tabs ni layout', () => {
    const routeImports = importStatements(readProjectFile('app/dev/astra-qa.tsx'));

    expect(routeImports).not.toMatch(/HomeScreen|WalletScreen|TradeScreen/i);
    expect(routeImports).not.toMatch(/\(tabs\)|tabs|_layout/i);
  });

  it('app/dev/astra-qa.tsx depende de __DEV__', () => {
    expect(readProjectFile('app/dev/astra-qa.tsx')).toContain('__DEV__');
  });

  it('canRenderAstraQaHubDevOnly bloquea produccion', () => {
    expect(
      canRenderAstraQaHubDevOnly({
        isDev: false,
        flags: createAstraQaHubSandboxFlags(),
      }),
    ).toBe(false);
  });

  it('app/_layout.tsx no importa ni monta Astra QA', () => {
    const layoutSource = readProjectFile('app/_layout.tsx');

    expect(layoutSource).not.toContain('AstraInternalQaHub');
    expect(layoutSource).not.toContain('src/astra/qa');
    expect(layoutSource).not.toContain('astra/qa');
    expect(layoutSource).not.toContain('/dev/astra-qa');
  });

  it('los defaults criticos de ejecucion real permanecen apagados', () => {
    expect(astraFlagsDefaults.ASTRA_RISK_REAL_EXECUTION_ENABLED).toBe(false);
    expect(astraFlagsDefaults.ASTRA_TOOL_REAL_EXECUTION_ENABLED).toBe(false);
    expect(astraFlagsDefaults.ASTRA_NOTIFICATION_PUSH_ENABLED).toBe(false);
    expect(astraFlagsDefaults.ASTRA_SYNC_WRITE_ENABLED).toBe(false);
  });

  it('todas las flags QA default quedan apagadas', () => {
    const qaDefaults = Object.entries(astraFlagsDefaults).filter(([key]) =>
      key.startsWith('ASTRA_QA_HUB'),
    );

    expect(qaDefaults.length).toBeGreaterThan(0);
    expect(qaDefaults.every(([, value]) => value === false)).toBe(true);
  });

  it('QA Hub no ejecuta scans, tools, publish ni refresh automaticamente', () => {
    const qaSource = readFiles(qaHubSourceFiles);

    expect(qaSource).not.toMatch(/scanTokenRisk\(/);
    expect(qaSource).not.toMatch(/scanApprovalRisk\(/);
    expect(qaSource).not.toMatch(/executeAstraTool\(/);
    expect(qaSource).not.toMatch(/publishRiskScanEvent\(/);
    expect(qaSource).not.toMatch(/\beventBus\.publish\(/);
    expect(qaSource).not.toMatch(/refreshFlags\(/);
    expect(qaSource).not.toMatch(/refreshAstraRemoteConfigOnce\(/);
  });

  it('Remote Config QA usa refreshOnMount=false', () => {
    const source = readProjectFile('src/astra/qa/AstraQaRemoteConfigPanel.tsx');

    expect(source).toContain('refreshOnMount={false}');
    expect(source).not.toContain('refreshOnMount={true}');
  });

  it('QA Hub no muestra payloads sensibles ni claves crudas', () => {
    const qaSource = stripAllowedSafetyCopy(readFiles(qaHubSourceFiles));

    expect(qaSource).not.toMatch(/privateKey|mnemonic|calldata|rawTransaction/i);
    expect(qaSource).not.toMatch(/seed phrase|seedPhrase|accessToken|refreshToken|session/i);
    expect(qaSource).not.toMatch(/\bsignature\b|\bsignatures\b/i);
    expect(qaSource).not.toMatch(/0x[a-fA-F0-9]{40}/);
  });

  it('no hay imports de navegacion productiva hacia Astra QA', () => {
    const protectedSources = readFiles(protectedAppFiles);

    expect(protectedSources).not.toContain('AstraInternalQaHub');
    expect(protectedSources).not.toContain('src/astra/qa');
    expect(protectedSources).not.toContain('astra/qa');
    expect(protectedSources).not.toContain('/dev/astra-qa');
  });

  it('fuentes QA no importan navegacion, backend, Gemini, WalletConnect/Reown ni providers/RPC', () => {
    const qaImports = listProjectFiles('src/astra/qa')
      .filter((filePath) => !filePath.includes('/__tests__/'))
      .map((filePath) => importStatements(readProjectFile(filePath)))
      .join('\n');

    expect(qaImports).not.toMatch(/from ['"].*(navigation|router|expo-router)/i);
    expect(qaImports).not.toMatch(/from ['"].*(backend|gemini|WalletConnect|Reown)/i);
    expect(qaImports).not.toMatch(/from ['"].*(providers\/rpc|providers\\rpc|rpc|signer)/i);
  });
});

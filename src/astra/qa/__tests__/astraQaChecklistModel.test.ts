import { describe, expect, it } from 'vitest';

import { createAstraQaHubSandboxFlags, getAstraQaModuleHealthItems } from '../astraQaHubModel';
import {
  ASTRA_QA_SAFETY_BANNER_ITEMS,
  buildAstraQaChecklist,
} from '../astraQaChecklistModel';

const rootDir = process.cwd();

declare const require: (moduleName: string) => {
  readFileSync?: (path: string, encoding: string) => string;
  join?: (...parts: string[]) => string;
};

const { readFileSync } = require('fs');
const { join } = require('path');

function getChecklistPass(overrides = {}) {
  return buildAstraQaChecklist(createAstraQaHubSandboxFlags(overrides)).summary.safeToUse;
}

function readProjectFile(path: string): string {
  if (!readFileSync || !join) {
    return '';
  }

  return readFileSync(join(rootDir, path), 'utf8');
}

describe('astraQaChecklistModel', () => {
  it('Checklist marca false si ASTRA_RISK_REAL_EXECUTION_ENABLED=true', () => {
    const flags = createAstraQaHubSandboxFlags();
    expect(
      buildAstraQaChecklist({
        ...flags,
        ASTRA_RISK_REAL_EXECUTION_ENABLED: true,
      }).summary.safeToUse,
    ).toBe(false);
  });

  it('Checklist marca false si ASTRA_TOOL_REAL_EXECUTION_ENABLED=true', () => {
    const flags = createAstraQaHubSandboxFlags();
    expect(
      buildAstraQaChecklist({
        ...flags,
        ASTRA_TOOL_REAL_EXECUTION_ENABLED: true,
      }).summary.safeToUse,
    ).toBe(false);
  });

  it('Checklist marca false si ASTRA_NOTIFICATION_PUSH_ENABLED=true', () => {
    const flags = createAstraQaHubSandboxFlags();
    expect(
      buildAstraQaChecklist({
        ...flags,
        ASTRA_NOTIFICATION_PUSH_ENABLED: true,
      }).summary.safeToUse,
    ).toBe(false);
  });

  it('Checklist marca false si ASTRA_SYNC_WRITE_ENABLED=true', () => {
    const flags = createAstraQaHubSandboxFlags();
    expect(
      buildAstraQaChecklist({
        ...flags,
        ASTRA_SYNC_WRITE_ENABLED: true,
      }).summary.safeToUse,
    ).toBe(false);
  });

  it('Checklist marca false si ASTRA_KILL_SWITCH=true', () => {
    expect(getChecklistPass({ ASTRA_KILL_SWITCH: true })).toBe(false);
  });

  it('Checklist marca true con combinacion segura', () => {
    expect(getChecklistPass()).toBe(true);
  });

  it('ModuleHealthCard muestra disabled_by_flag cuando flag esta apagada', () => {
    const health = getAstraQaModuleHealthItems(
      createAstraQaHubSandboxFlags({ ASTRA_QA_HUB_RISK_SANDBOX_ENABLED: false }),
    );

    expect(health.find((item) => item.id === 'risk')?.status).toBe('disabled_by_flag');
  });

  it('Safety banner mantiene textos obligatorios', () => {
    expect(ASTRA_QA_SAFETY_BANNER_ITEMS).toEqual([
      'No funds',
      'No signatures',
      'No real transactions',
      'No backend execution',
      'No WalletConnect execution',
    ]);
  });

  it('Flags panel sigue siendo read-only', () => {
    const source = readProjectFile('src/astra/qa/AstraQaHubFlagsPanel.tsx');

    expect(source).toContain('Flags read-only');
    expect(source).not.toMatch(/onPress|TextInput|Switch/);
  });

  it('no se agregan imports prohibidos ni ejecuciones automaticas en QA Hub', () => {
    const sources = [
      'src/astra/qa/AstraInternalQaHub.tsx',
      'src/astra/qa/AstraQaChecklistPanel.tsx',
      'src/astra/qa/AstraQaVisualSummary.tsx',
      'src/astra/qa/AstraQaModuleHealthCard.tsx',
      'src/astra/qa/astraQaChecklistModel.ts',
    ].map(readProjectFile).join('\n');

    expect(sources).not.toMatch(/from ['"].*(navigation|router|HomeScreen|WalletScreen|TradeScreen)/i);
    expect(sources).not.toMatch(/from ['"].*(backend|gemini|WalletConnect|Reown|providers\/rpc|rpc|signer)/i);
    expect(sources).not.toMatch(/runRiskQaPipeline\(|publish|executeAstraTool\(|scanTokenRisk\(|scanApprovalRisk\(/);
  });
});

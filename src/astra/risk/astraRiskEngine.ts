import type { AstraFeatureFlags } from '../config/astraFlags';
import type { AstraRiskAdapter } from './adapters/astraRiskAdapter.types';
import { createMockRiskAdapterFailure, mockRiskAdapter } from './adapters/mockRiskAdapter';
import { getAstraRiskFlags } from './astraRiskFlags';
import { buildRiskScanResult } from './astraRiskScoring';
import { truncateRiskAddress } from './astraRiskSanitizer';
import type {
  AstraApprovalRiskInput,
  AstraRiskEngineResult,
  AstraRiskSignal,
  AstraTokenRiskInput,
} from './astraRisk.types';

interface AstraRiskEngineOptions {
  adapter?: AstraRiskAdapter;
  flags?: Partial<AstraFeatureFlags>;
  now?: () => string;
}

function createBlockedRiskResult(
  chainId: number,
  tokenAddress: string,
  messageSignal: AstraRiskSignal,
  now: () => string,
): AstraRiskEngineResult {
  const scan = buildRiskScanResult([messageSignal], 'local', 1, now());

  return {
    ...scan,
    chainId,
    tokenPreview: truncateRiskAddress(tokenAddress) ?? '[invalid-token]',
    blocked: true,
  };
}

function finalizeRiskResult(
  chainId: number,
  tokenAddress: string,
  signals: AstraRiskSignal[],
  source: AstraRiskEngineResult['source'],
  confidence: number,
  now: () => string,
): AstraRiskEngineResult {
  return {
    ...buildRiskScanResult(signals, source, confidence, now()),
    chainId,
    tokenPreview: truncateRiskAddress(tokenAddress) ?? '[invalid-token]',
  };
}

export async function scanTokenRisk(
  input: AstraTokenRiskInput,
  options: AstraRiskEngineOptions = {},
): Promise<AstraRiskEngineResult> {
  const flags = getAstraRiskFlags(options.flags);
  const now = options.now ?? (() => new Date().toISOString());

  if (!flags.engineEnabled || !flags.readOnlyEnabled || !flags.tokenScanEnabled || flags.realExecutionEnabled) {
    return createBlockedRiskResult(
      input.chainId,
      input.tokenAddress,
      {
        code: 'read_only_disabled',
        active: true,
        severity: 'medium',
        weight: 35,
        label: 'ASTRA Risk Engine read-only token scan is disabled.',
      },
      now,
    );
  }

  try {
    const adapter = options.adapter ?? mockRiskAdapter;
    const adapterResult = await adapter.scanToken(input);
    return finalizeRiskResult(
      input.chainId,
      input.tokenAddress,
      adapterResult.signals,
      adapterResult.source,
      adapterResult.confidence,
      now,
    );
  } catch {
    const fallback = createMockRiskAdapterFailure();
    return finalizeRiskResult(
      input.chainId,
      input.tokenAddress,
      fallback.signals,
      fallback.source,
      fallback.confidence,
      now,
    );
  }
}

export async function scanApprovalRisk(
  input: AstraApprovalRiskInput,
  options: AstraRiskEngineOptions = {},
): Promise<AstraRiskEngineResult> {
  const flags = getAstraRiskFlags(options.flags);
  const now = options.now ?? (() => new Date().toISOString());

  if (!flags.engineEnabled || !flags.readOnlyEnabled || !flags.approvalScanEnabled || flags.realExecutionEnabled) {
    return createBlockedRiskResult(
      input.chainId,
      input.tokenAddress,
      {
        code: 'read_only_disabled',
        active: true,
        severity: 'medium',
        weight: 35,
        label: 'ASTRA Risk Engine read-only approval scan is disabled.',
      },
      now,
    );
  }

  try {
    const adapter = options.adapter ?? mockRiskAdapter;
    const adapterResult = await adapter.scanApproval(input);
    return finalizeRiskResult(
      input.chainId,
      input.tokenAddress,
      adapterResult.signals,
      adapterResult.source,
      adapterResult.confidence,
      now,
    );
  } catch {
    const fallback = createMockRiskAdapterFailure();
    return finalizeRiskResult(
      input.chainId,
      input.tokenAddress,
      fallback.signals,
      fallback.source,
      fallback.confidence,
      now,
    );
  }
}

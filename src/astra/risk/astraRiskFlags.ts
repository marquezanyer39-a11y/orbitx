import { astraConfigService, type AstraFeatureFlags } from '../config/astraFlags';

export interface AstraRiskFlags {
  engineEnabled: boolean;
  readOnlyEnabled: boolean;
  tokenScanEnabled: boolean;
  approvalScanEnabled: boolean;
  externalAdaptersEnabled: boolean;
  eventPublishingEnabled: boolean;
  relevanceEnabled: boolean;
  realExecutionEnabled: boolean;
}

export function getAstraRiskFlags(overrides?: Partial<AstraFeatureFlags>): AstraRiskFlags {
  const flags = {
    ...astraConfigService.getFlags(),
    ...overrides,
  };

  return {
    engineEnabled: flags.ASTRA_ENABLED && flags.ASTRA_RISK_ENGINE_ENABLED,
    readOnlyEnabled: flags.ASTRA_RISK_READ_ONLY_ENABLED,
    tokenScanEnabled: flags.ASTRA_RISK_TOKEN_SCAN_ENABLED,
    approvalScanEnabled: flags.ASTRA_RISK_APPROVAL_SCAN_ENABLED,
    externalAdaptersEnabled: flags.ASTRA_RISK_EXTERNAL_ADAPTERS_ENABLED,
    eventPublishingEnabled: flags.ASTRA_RISK_EVENT_PUBLISHING_ENABLED,
    relevanceEnabled: flags.ASTRA_RISK_RELEVANCE_ENABLED,
    realExecutionEnabled: flags.ASTRA_RISK_REAL_EXECUTION_ENABLED,
  };
}

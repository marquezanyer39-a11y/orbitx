import { astraConfigService, type AstraFeatureFlags } from '../config/astraFlags';

export interface AstraToolFlags {
  enabled: boolean;
  registryEnabled: boolean;
  confirmationEnabled: boolean;
  auditEnabled: boolean;
  mockExecutionEnabled: boolean;
}

export function getAstraToolFlags(overrides?: Partial<AstraFeatureFlags>): AstraToolFlags {
  const flags = {
    ...astraConfigService.getFlags(),
    ...overrides,
  };

  return {
    enabled: flags.ASTRA_ENABLED && flags.ASTRA_TOOL_EXECUTION_ENABLED,
    registryEnabled: flags.ASTRA_TOOL_REGISTRY_ENABLED,
    confirmationEnabled: flags.ASTRA_TOOL_CONFIRMATION_ENABLED,
    auditEnabled: flags.ASTRA_TOOL_AUDIT_ENABLED,
    mockExecutionEnabled: flags.ASTRA_TOOL_MOCK_EXECUTION_ENABLED,
  };
}

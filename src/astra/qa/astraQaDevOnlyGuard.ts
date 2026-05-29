import type { AstraFeatureFlags } from '../config/astraFlags';

type AstraQaDevOnlyGuardFlags = Pick<
  AstraFeatureFlags,
  | 'ASTRA_QA_HUB_ENABLED'
  | 'ASTRA_KILL_SWITCH'
  | 'ASTRA_RISK_REAL_EXECUTION_ENABLED'
  | 'ASTRA_TOOL_REAL_EXECUTION_ENABLED'
  | 'ASTRA_NOTIFICATION_PUSH_ENABLED'
  | 'ASTRA_SYNC_WRITE_ENABLED'
>;

export interface AstraQaDevOnlyGuardParams {
  isDev: boolean;
  flags: AstraQaDevOnlyGuardFlags;
}

export function canRenderAstraQaHubDevOnly({
  isDev,
  flags,
}: AstraQaDevOnlyGuardParams): boolean {
  return (
    isDev === true &&
    flags.ASTRA_QA_HUB_ENABLED === true &&
    flags.ASTRA_KILL_SWITCH === false &&
    flags.ASTRA_RISK_REAL_EXECUTION_ENABLED === false &&
    flags.ASTRA_TOOL_REAL_EXECUTION_ENABLED === false &&
    flags.ASTRA_NOTIFICATION_PUSH_ENABLED === false &&
    flags.ASTRA_SYNC_WRITE_ENABLED === false
  );
}

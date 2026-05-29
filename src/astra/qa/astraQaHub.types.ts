import type { AstraFeatureFlags } from '../config/astraFlags';

export type AstraQaHubTabId =
  | 'status'
  | 'risk'
  | 'tools'
  | 'confirmation'
  | 'remoteConfig'
  | 'ui'
  | 'flags'
  | 'checklist';

export type AstraQaHubModuleStatus = 'enabled' | 'disabled' | 'blocked';

export type AstraQaModuleHealthStatus =
  | 'available'
  | 'disabled_by_flag'
  | 'blocked'
  | 'placeholder';

export type AstraQaModuleSafetyLevel = 'safe' | 'caution' | 'blocked';

export interface AstraQaHubTabDefinition {
  id: AstraQaHubTabId;
  label: string;
  description: string;
  requiredFlag: keyof AstraFeatureFlags;
}

export interface AstraQaHubModuleStatusItem {
  id: AstraQaHubTabId;
  label: string;
  status: AstraQaHubModuleStatus;
  detail: string;
}

export interface AstraQaModuleHealthItem {
  id: AstraQaHubTabId;
  name: string;
  status: AstraQaModuleHealthStatus;
  description: string;
  safetyLevel: AstraQaModuleSafetyLevel;
  relatedFlag: keyof AstraFeatureFlags;
}

export interface AstraQaHubFlagRow {
  key: keyof AstraFeatureFlags;
  value: boolean;
  category: 'master' | 'qa' | 'risk' | 'tools' | 'ui' | 'memory' | 'notifications' | 'remote';
}

export interface AstraInternalQaHubProps {
  enabled?: boolean;
  flags?: Partial<AstraFeatureFlags>;
  initialTab?: AstraQaHubTabId;
}

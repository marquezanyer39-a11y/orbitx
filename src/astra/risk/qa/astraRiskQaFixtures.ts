import type { AstraFeatureFlags } from '../../config/astraFlags';
import { astraFlagsDefaults } from '../../config/astraFlags.defaults';
import {
  adapterFailureFixture,
  criticalTokenFixture,
  infiniteApprovalFixture,
  normalApprovalFixture,
  safeTokenFixture,
  suspiciousTokenFixture,
} from '../ui/astraRiskSandboxFixtures';
import type { AstraRiskSandboxScenario } from '../ui/astraRiskSandboxFixtures';

export type AstraRiskQaScenarioId =
  | 'low_token'
  | 'high_token'
  | 'critical_token'
  | 'normal_approval'
  | 'infinite_approval'
  | 'adapter_unavailable'
  | 'flags_disabled'
  | 'dedup_repeated_event'
  | 'cooldown_active'
  | 'cooldown_expired';

export interface AstraRiskQaScenario {
  id: AstraRiskQaScenarioId;
  title: string;
  description: string;
  baseScenario: AstraRiskSandboxScenario;
  mode: 'single' | 'flags_disabled' | 'duplicate' | 'cooldown_active' | 'cooldown_expired';
}

export const ASTRA_RISK_QA_SCENARIOS: AstraRiskQaScenario[] = [
  {
    id: 'low_token',
    title: 'Low token',
    description: 'Token mock seguro para validar low risk y card/silent.',
    baseScenario: safeTokenFixture,
    mode: 'single',
  },
  {
    id: 'high_token',
    title: 'High token',
    description: 'Token sospechoso para validar banner.',
    baseScenario: suspiciousTokenFixture,
    mode: 'single',
  },
  {
    id: 'critical_token',
    title: 'Critical token',
    description: 'Token critico para validar critical alert.',
    baseScenario: criticalTokenFixture,
    mode: 'single',
  },
  {
    id: 'normal_approval',
    title: 'Normal approval',
    description: 'Approval normal mock sin riesgo critico.',
    baseScenario: normalApprovalFixture,
    mode: 'single',
  },
  {
    id: 'infinite_approval',
    title: 'Infinite approval',
    description: 'Approval infinito mock para validar review_approval.',
    baseScenario: infiniteApprovalFixture,
    mode: 'single',
  },
  {
    id: 'adapter_unavailable',
    title: 'Adapter unavailable',
    description: 'Falla mock de adapter para validar fallback no critico.',
    baseScenario: adapterFailureFixture,
    mode: 'single',
  },
  {
    id: 'flags_disabled',
    title: 'Flags disabled',
    description: 'Pipeline bloqueado por flags locales apagadas.',
    baseScenario: safeTokenFixture,
    mode: 'flags_disabled',
  },
  {
    id: 'dedup_repeated_event',
    title: 'Dedup repeated event',
    description: 'Emite dos veces el mismo evento y valida dedup visual.',
    baseScenario: suspiciousTokenFixture,
    mode: 'duplicate',
  },
  {
    id: 'cooldown_active',
    title: 'Cooldown active',
    description: 'Simula evento dentro del cooldown visual.',
    baseScenario: suspiciousTokenFixture,
    mode: 'cooldown_active',
  },
  {
    id: 'cooldown_expired',
    title: 'Cooldown expired',
    description: 'Simula evento despues del cooldown visual.',
    baseScenario: suspiciousTokenFixture,
    mode: 'cooldown_expired',
  },
];

export function createAstraRiskQaFlags(disabled: boolean = false): Partial<AstraFeatureFlags> {
  return {
    ...astraFlagsDefaults,
    ASTRA_ENABLED: true,
    ASTRA_RISK_ENGINE_ENABLED: !disabled,
    ASTRA_RISK_READ_ONLY_ENABLED: true,
    ASTRA_RISK_TOKEN_SCAN_ENABLED: true,
    ASTRA_RISK_APPROVAL_SCAN_ENABLED: true,
    ASTRA_RISK_EVENT_PUBLISHING_ENABLED: !disabled,
    ASTRA_RISK_RELEVANCE_ENABLED: !disabled,
    ASTRA_RISK_INSIGHT_HOST_ENABLED: !disabled,
    ASTRA_RISK_INSIGHT_CARDS_ENABLED: !disabled,
    ASTRA_RISK_INSIGHT_BANNERS_ENABLED: !disabled,
    ASTRA_RISK_INSIGHT_CRITICAL_ENABLED: !disabled,
    ASTRA_RISK_EXTERNAL_ADAPTERS_ENABLED: false,
    ASTRA_RISK_REAL_EXECUTION_ENABLED: false,
  };
}

import type { AstraFeatureFlags } from '../../config/astraFlags';
import { astraFlagsDefaults } from '../../config/astraFlags.defaults';
import type { AstraApprovalRiskInput, AstraTokenRiskInput } from '../astraRisk.types';

export type AstraRiskSandboxScenarioId =
  | 'safe_token'
  | 'suspicious_token'
  | 'critical_token'
  | 'normal_approval'
  | 'infinite_approval'
  | 'adapter_failure';

export type AstraRiskSandboxScenarioKind = 'token' | 'approval';

export interface AstraRiskSandboxScenario {
  id: AstraRiskSandboxScenarioId;
  kind: AstraRiskSandboxScenarioKind;
  title: string;
  description: string;
  tokenInput?: AstraTokenRiskInput;
  approvalInput?: AstraApprovalRiskInput;
}

const DEMO_TOKEN_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';
const DEMO_SPENDER_ADDRESS = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

export const safeTokenFixture: AstraRiskSandboxScenario = {
  id: 'safe_token',
  kind: 'token',
  title: 'Token seguro',
  description: 'Fixture mock con señales inactivas y riesgo bajo.',
  tokenInput: {
    chainId: 1,
    tokenAddress: DEMO_TOKEN_ADDRESS,
    tokenSymbol: 'SAFE',
    scenario: 'safe',
  },
};

export const suspiciousTokenFixture: AstraRiskSandboxScenario = {
  id: 'suspicious_token',
  kind: 'token',
  title: 'Token sospechoso',
  description: 'Fixture mock con ownership activo, concentración e impuestos altos.',
  tokenInput: {
    chainId: 56,
    tokenAddress: DEMO_TOKEN_ADDRESS,
    tokenSymbol: 'RISK',
    scenario: 'suspicious',
  },
};

export const criticalTokenFixture: AstraRiskSandboxScenario = {
  id: 'critical_token',
  kind: 'token',
  title: 'Token crítico',
  description: 'Fixture mock con honeypot, phishing y permisos peligrosos.',
  tokenInput: {
    chainId: 137,
    tokenAddress: DEMO_TOKEN_ADDRESS,
    tokenSymbol: 'SCAM',
    scenario: 'critical',
  },
};

export const normalApprovalFixture: AstraRiskSandboxScenario = {
  id: 'normal_approval',
  kind: 'approval',
  title: 'Approval normal',
  description: 'Fixture mock de allowance sin señales críticas.',
  approvalInput: {
    chainId: 1,
    tokenAddress: DEMO_TOKEN_ADDRESS,
    spenderAddress: DEMO_SPENDER_ADDRESS,
    allowance: 'limited',
    scenario: 'normal',
  },
};

export const infiniteApprovalFixture: AstraRiskSandboxScenario = {
  id: 'infinite_approval',
  kind: 'approval',
  title: 'Infinite approval',
  description: 'Fixture mock con allowance muy alto y spender sospechoso.',
  approvalInput: {
    chainId: 1,
    tokenAddress: DEMO_TOKEN_ADDRESS,
    spenderAddress: DEMO_SPENDER_ADDRESS,
    allowance: 'unlimited',
    scenario: 'infinite_approval',
  },
};

export const adapterFailureFixture: AstraRiskSandboxScenario = {
  id: 'adapter_failure',
  kind: 'token',
  title: 'Adapter failure',
  description: 'Fixture mock que fuerza fallback seguro sin crash.',
  tokenInput: {
    chainId: 8453,
    tokenAddress: DEMO_TOKEN_ADDRESS,
    tokenSymbol: 'FAIL',
    scenario: 'adapter_failure',
  },
};

export const ASTRA_RISK_SANDBOX_SCENARIOS: AstraRiskSandboxScenario[] = [
  safeTokenFixture,
  suspiciousTokenFixture,
  criticalTokenFixture,
  normalApprovalFixture,
  infiniteApprovalFixture,
  adapterFailureFixture,
];

export function createAstraRiskSandboxFlags(
  simulateFlagsDisabled: boolean = false,
): Partial<AstraFeatureFlags> {
  return {
    ...astraFlagsDefaults,
    ASTRA_ENABLED: true,
    ASTRA_RISK_ENGINE_ENABLED: !simulateFlagsDisabled,
    ASTRA_RISK_READ_ONLY_ENABLED: true,
    ASTRA_RISK_TOKEN_SCAN_ENABLED: true,
    ASTRA_RISK_APPROVAL_SCAN_ENABLED: true,
    ASTRA_RISK_EXTERNAL_ADAPTERS_ENABLED: false,
    ASTRA_RISK_REAL_EXECUTION_ENABLED: false,
  };
}

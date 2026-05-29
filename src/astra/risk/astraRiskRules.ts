import type { AstraRiskReason, AstraRiskReasonCode, AstraRiskSignal } from './astraRisk.types';

export const ASTRA_RISK_REASON_LABELS: Record<AstraRiskReasonCode, string> = {
  token_suspicious: 'Token con señales sospechosas',
  contract_unverified: 'Contrato no verificado',
  possible_honeypot: 'Posible honeypot',
  low_liquidity: 'Liquidez baja',
  holder_concentration: 'Alta concentración de holders',
  ownership_not_renounced: 'Ownership no renunciado',
  high_buy_sell_tax: 'Impuestos altos de compra/venta',
  blacklist_whitelist_controls: 'Controles blacklist/whitelist sospechosos',
  proxy_contract: 'Contrato proxy o upgradeable',
  dangerous_permissions: 'Permisos peligrosos detectados',
  infinite_approval: 'Approval infinito o muy alto',
  suspicious_spender: 'Spender sospechoso',
  rug_pull_risk: 'Riesgo agregado de rug pull',
  phishing_or_scam_signals: 'Señales de phishing/scam',
  adapter_unavailable: 'Adapter read-only no disponible',
  read_only_disabled: 'Motor read-only desactivado',
};

export function normalizeRiskReasons(signals: AstraRiskSignal[]): AstraRiskReason[] {
  return signals
    .filter((signal) => signal.active)
    .map((signal) => ({
      code: signal.code,
      label: signal.label ?? ASTRA_RISK_REASON_LABELS[signal.code],
      severity: signal.severity,
      weight: signal.weight,
    }));
}

export function createRiskSignal(
  code: AstraRiskReasonCode,
  active: boolean,
  weight: number,
  severity: AstraRiskSignal['severity'],
  label?: string,
): AstraRiskSignal {
  return {
    code,
    active,
    weight,
    severity,
    label,
  };
}

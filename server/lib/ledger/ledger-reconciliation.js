import { createLedgerDisabledError } from './ledger-errors.js';
import { normalizeAsset, validateNonNegativeAmount } from './ledger-service.js';

export async function reconcileWithProviderBalance(providerId, asset, providerBalance, context = {}) {
  const normalizedAsset = normalizeAsset(asset);
  const providerTotalDecimal = validateNonNegativeAmount(providerBalance);

  if (!context.db) {
    throw createLedgerDisabledError(
      'Reconciliacion preparada, pero requiere DB real y saldo proveedor validado. No hace auto-ajustes.',
    );
  }

  return {
    matched: false,
    providerId,
    asset: normalizedAsset,
    internalTotalDecimal: '0',
    providerTotalDecimal,
    differenceDecimal: providerTotalDecimal,
    severity: 'critical',
    status: 'open',
    message: 'Implementar consulta atomica de totales internos y registro provider_reconciliations.',
    checkedAt: new Date().toISOString(),
  };
}

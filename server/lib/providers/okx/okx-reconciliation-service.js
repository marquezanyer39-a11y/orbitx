import { getOkxProviderStatus } from './okx-config.js';
import { createNotImplementedError, createProviderNotConfiguredError } from './okx-errors.js';

export async function reconcileOkxWithLedger(providerId = 'okx', asset, env = process.env) {
  const status = getOkxProviderStatus(env);
  const normalizedAsset = `${asset ?? ''}`.trim().toUpperCase();

  if (status.status === 'not_configured') {
    throw createProviderNotConfiguredError('Reconciliacion OKX requiere credenciales backend y cuenta broker aprobada.');
  }

  if (!normalizedAsset) {
    throw createNotImplementedError('Reconciliacion OKX requiere asset y ledger backend real.');
  }

  throw createNotImplementedError(
    'Reconciliacion OKX vs QVEX Ledger esta documentada, pero no compara saldos reales en esta fase.',
  );
}

export async function getLastReconciliation(providerId = 'okx', asset) {
  return {
    providerId,
    asset: `${asset ?? ''}`.trim().toUpperCase() || null,
    status: 'not_implemented',
    severity: 'warning',
    message: 'No existe reconciliacion OKX real hasta conectar Ledger Backend y proveedor aprobado.',
    checkedAt: null,
  };
}

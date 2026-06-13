import { getOkxConfigSafe, getOkxProviderStatus } from './okx-config.js';
import { createNotImplementedError } from './okx-errors.js';

export async function getBrokerStatus(env = process.env) {
  const status = getOkxProviderStatus(env);
  const safeConfig = getOkxConfigSafe(env);

  return {
    providerId: 'okx',
    name: 'OKX Broker',
    status: status.status,
    configured: status.configured,
    disabled: status.disabled,
    tradingDisabled: status.tradingDisabled,
    networkRequestsEnabled: status.networkRequestsEnabled,
    environment: status.environment,
    safeConfig,
    capabilities: {
      supportsSpot: true,
      supportsFutures: true,
      supportsOrderBook: true,
      supportsPositions: true,
      supportsSubAccounts: true,
      supportsInternalTransfers: true,
      supportsWithdrawals: false,
      supportsDeposits: true,
      supportsOAuth: true,
      supportsApiKeys: false,
      supportsRealOrders: false,
      requiresBackendSigning: true,
    },
  };
}

export async function getBrokerUserStatus(userId, _env = process.env) {
  const value = `${userId ?? ''}`.trim();

  return {
    providerId: 'okx',
    userId: value || null,
    linked: false,
    status: 'not_configured',
    message: 'Usuario OKX Broker aun no esta vinculado. Requiere OAuth/backend seguro.',
  };
}

export async function getBrokerPermissions(_userId, _env = process.env) {
  throw createNotImplementedError('Permisos OKX Broker requieren cuenta vinculada y tokens cifrados en backend.');
}

export function toTradingProviderStatus(okxStatus) {
  if (okxStatus === 'configured') return 'disconnected';
  if (okxStatus === 'disabled') return 'error';
  return 'not_configured';
}

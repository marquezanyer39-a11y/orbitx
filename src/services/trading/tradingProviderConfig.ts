import Constants from 'expo-constants';

import { FEATURE_STATUS } from '../../constants/featureStatus';
import { TRADING_PROVIDER_DEFINITIONS } from '../../constants/tradingProviders';
import type { TradingProviderConfig, TradingProviderId } from '../../types/trading';

function resolveBackendBaseUrl() {
  const extra = Constants.expoConfig?.extra as
    | { orbitxBackendUrl?: string }
    | undefined;
  return process.env.EXPO_PUBLIC_ORBITX_BACKEND_URL ?? extra?.orbitxBackendUrl ?? '';
}

export function getConfiguredTradingProviderId(): TradingProviderId {
  return FEATURE_STATUS.trade.provider;
}

export function getTradingBackendBaseUrl() {
  return resolveBackendBaseUrl().replace(/\/+$/, '');
}

export function getTradingProviderConfig(providerId: TradingProviderId): TradingProviderConfig {
  const definition = TRADING_PROVIDER_DEFINITIONS[providerId];

  return {
    id: definition.id,
    mode: definition.mode,
    status: definition.isEnabled ? 'connected' : 'not_configured',
    backendBaseUrl: getTradingBackendBaseUrl(),
    isEnabled: definition.isEnabled,
    isProductionReady: definition.isProductionReady,
    capabilities: {
      supportsSpot: definition.supportsSpot,
      supportsFutures: definition.supportsFutures,
      supportsOrderBook: definition.supportsOrderBook,
      supportsPositions: definition.supportsPositions,
      supportsSubAccounts: definition.supportsSubAccounts,
      supportsInternalTransfers: definition.supportsInternalTransfers,
      supportsWithdrawals: definition.supportsWithdrawals,
      supportsDeposits: definition.supportsDeposits,
      supportsOAuth: definition.supportsOAuth,
      supportsApiKeys: definition.supportsApiKeys,
      supportsRealOrders: definition.supportsRealOrders,
      requiresBackendSigning: definition.requiresBackendSigning,
    },
  };
}

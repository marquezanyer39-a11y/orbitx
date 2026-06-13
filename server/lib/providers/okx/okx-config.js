import {
  createNotImplementedError,
  createProviderNotConfiguredError,
  createRealTradingDisabledError,
} from './okx-errors.js';

const DEFAULT_OKX_BASE_URL = 'https://www.okx.com';
const REQUIRED_ENV_KEYS = [
  'OKX_BROKER_CLIENT_ID',
  'OKX_BROKER_CLIENT_SECRET',
  'OKX_BROKER_CODE',
];

function readEnv(env, key) {
  return `${env[key] ?? ''}`.trim();
}

export function maskSecret(value) {
  const text = `${value ?? ''}`.trim();

  if (!text) {
    return null;
  }

  if (text.length <= 8) {
    return '********';
  }

  return `${text.slice(0, 4)}...${text.slice(-4)}`;
}

export function getOkxConfigInternal(env = process.env) {
  const okxEnv = readEnv(env, 'OKX_ENV') === 'production' ? 'production' : 'sandbox';
  const clientId = readEnv(env, 'OKX_BROKER_CLIENT_ID');
  const clientSecret = readEnv(env, 'OKX_BROKER_CLIENT_SECRET');
  const brokerCode = readEnv(env, 'OKX_BROKER_CODE');
  const webhookSecret = readEnv(env, 'OKX_WEBHOOK_SECRET');
  const apiBaseUrl = readEnv(env, 'OKX_API_BASE_URL') || DEFAULT_OKX_BASE_URL;
  const allowProduction = readEnv(env, 'OKX_ALLOW_PRODUCTION') === 'true';
  const enableNetworkRequests = readEnv(env, 'OKX_ENABLE_NETWORK_REQUESTS') === 'true';
  const enableRealTrading = readEnv(env, 'OKX_REAL_TRADING_ENABLED') === 'true';
  const missing = REQUIRED_ENV_KEYS.filter((key) => !readEnv(env, key));
  let providerStatus = 'configured';
  let disabledReason = null;

  if (missing.length) {
    providerStatus = 'not_configured';
    disabledReason = `Faltan variables backend: ${missing.join(', ')}`;
  } else if (okxEnv === 'production' && !allowProduction) {
    providerStatus = 'disabled';
    disabledReason = 'OKX_ENV=production esta bloqueado sin OKX_ALLOW_PRODUCTION=true.';
  }

  return {
    providerId: 'okx',
    providerStatus,
    environment: okxEnv,
    apiBaseUrl,
    clientId,
    clientSecret,
    brokerCode,
    webhookSecret,
    missing,
    disabledReason,
    allowProduction,
    enableNetworkRequests,
    enableRealTrading,
    tradingDisabled: !enableRealTrading,
  };
}

export function getOkxConfigSafe(env = process.env) {
  const config = getOkxConfigInternal(env);

  return {
    providerId: config.providerId,
    providerStatus: config.providerStatus,
    environment: config.environment,
    apiBaseUrl: config.apiBaseUrl,
    clientIdConfigured: Boolean(config.clientId),
    clientIdMasked: maskSecret(config.clientId),
    clientSecretConfigured: Boolean(config.clientSecret),
    brokerCodeConfigured: Boolean(config.brokerCode),
    brokerCodeMasked: maskSecret(config.brokerCode),
    webhookSecretConfigured: Boolean(config.webhookSecret),
    missing: config.missing,
    disabledReason: config.disabledReason,
    allowProduction: config.allowProduction,
    networkRequestsEnabled: config.enableNetworkRequests,
    tradingEnabled: config.enableRealTrading,
    tradingDisabled: config.tradingDisabled,
  };
}

export function getOkxProviderStatus(env = process.env) {
  const safeConfig = getOkxConfigSafe(env);

  return {
    providerId: 'okx',
    status: safeConfig.providerStatus,
    configured: safeConfig.providerStatus === 'configured',
    disabled: safeConfig.providerStatus === 'disabled',
    tradingDisabled: safeConfig.tradingDisabled,
    networkRequestsEnabled: safeConfig.networkRequestsEnabled,
    environment: safeConfig.environment,
    missing: safeConfig.missing,
    disabledReason: safeConfig.disabledReason,
  };
}

export function assertOkxConfigured(env = process.env) {
  const config = getOkxConfigInternal(env);

  if (config.providerStatus === 'not_configured') {
    throw createProviderNotConfiguredError(config.disabledReason);
  }

  if (config.providerStatus === 'disabled') {
    throw createNotImplementedError(config.disabledReason);
  }

  return config;
}

export function assertOkxNetworkEnabled(env = process.env) {
  const config = assertOkxConfigured(env);

  if (!config.enableNetworkRequests) {
    throw createNotImplementedError(
      'OKX HTTP client esta preparado, pero las llamadas de red estan bloqueadas por defecto.',
    );
  }

  return config;
}

export function assertOkxRealTradingEnabled(env = process.env) {
  const config = assertOkxConfigured(env);

  if (!config.enableRealTrading) {
    throw createRealTradingDisabledError('Trading real OKX requiere aprobacion y flag backend explicito.');
  }

  return config;
}

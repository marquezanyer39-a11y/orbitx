import { assertOkxNetworkEnabled } from './okx-config.js';
import {
  createOkxError,
  createProviderNotConfiguredError,
  createRealTradingDisabledError,
  createNotImplementedError,
  OKX_ERROR_CODES,
  sanitizeOkxMetadata,
} from './okx-errors.js';

function buildOkxUrl(baseUrl, path, query = {}) {
  const url = new URL(path, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

export function sanitizeOkxHeaders(headers = {}) {
  return sanitizeOkxMetadata(headers);
}

export async function requestOkx({
  path,
  method = 'GET',
  query,
  body,
  accessToken,
  requiresTrading = false,
  env = process.env,
} = {}) {
  if (requiresTrading) {
    throw createRealTradingDisabledError();
  }

  let config;
  try {
    config = assertOkxNetworkEnabled(env);
  } catch (error) {
    if (error?.code === OKX_ERROR_CODES.PROVIDER_NOT_CONFIGURED) {
      throw createProviderNotConfiguredError(error.message);
    }
    throw error;
  }

  if (!accessToken) {
    throw createOkxError(
      OKX_ERROR_CODES.OKX_AUTH_REQUIRED,
      'OKX requiere token de usuario guardado en backend seguro. No se expone al frontend.',
      undefined,
      401,
    );
  }

  const url = buildOkxUrl(config.apiBaseUrl, path, query);
  void body;

  throw createNotImplementedError(
    `Cliente OKX preparado para ${method} ${new URL(url).pathname}, pero las llamadas reales no se activan en esta fase.`,
  );

  // Futuro productivo:
  // - Firmar o adjuntar OAuth token solo desde backend.
  // - Usar timeout, retries controlados e idempotency.
  // - Sanitizar headers antes de logging.
  // - Nunca devolver payload crudo OKX al frontend.
}

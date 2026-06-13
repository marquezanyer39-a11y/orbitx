import { assertOkxConfigured, getOkxConfigSafe } from './okx-config.js';
import {
  createNotImplementedError,
  createOkxError,
  createProviderNotConfiguredError,
  OKX_ERROR_CODES,
} from './okx-errors.js';

function validateUserId(userId) {
  const value = `${userId ?? ''}`.trim();
  if (!value) {
    throw createOkxError(OKX_ERROR_CODES.OKX_AUTH_REQUIRED, 'userId requerido para iniciar OAuth OKX.', undefined, 422);
  }
  return value;
}

export async function getOkxConnectUrl(userId, redirectUri, env = process.env) {
  validateUserId(userId);
  const redirect = `${redirectUri ?? ''}`.trim();

  if (!redirect) {
    throw createOkxError(OKX_ERROR_CODES.OKX_AUTH_REQUIRED, 'redirectUri backend requerido para OAuth OKX.', undefined, 422);
  }

  try {
    assertOkxConfigured(env);
  } catch (error) {
    if (error?.code === OKX_ERROR_CODES.NOT_IMPLEMENTED) {
      throw error;
    }
    throw createProviderNotConfiguredError(error.message);
  }

  throw createNotImplementedError(
    'OAuth OKX queda preparado, pero no se genera connect URL real hasta tener backend seguro, DB cifrada y aprobacion OKX.',
  );
}

export async function handleOkxCallback(_code, _state, env = process.env) {
  assertOkxConfigured(env);
  throw createNotImplementedError('Callback OAuth OKX requiere intercambio seguro de token y DB cifrada.');
}

export async function refreshOkxToken(_providerUserId, env = process.env) {
  assertOkxConfigured(env);
  throw createNotImplementedError('Refresh token OKX requiere token cifrado en backend. No disponible en esta fase.');
}

export async function disconnectOkxAccount(_userId, env = process.env) {
  const safeConfig = getOkxConfigSafe(env);

  return {
    providerId: 'okx',
    disconnected: false,
    status: safeConfig.providerStatus,
    message: 'OKX no esta vinculado en esta fase. No hay tokens que revocar desde frontend.',
  };
}

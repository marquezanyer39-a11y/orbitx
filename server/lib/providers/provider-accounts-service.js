import {
  PROVIDER_ACCOUNT_ERROR_CODES,
  createProviderAccountsError,
} from './provider-accounts-errors.js';

const PROVIDER_ID_PATTERN = /^[a-z0-9_-]{2,32}$/;
const PROVIDER_ACCOUNT_STATUSES = new Set([
  'pending',
  'connected',
  'disconnected',
  'suspended',
  'error',
]);

function assertProviderAccountsEnabled(context = {}) {
  const enabled = `${process.env.PROVIDER_ACCOUNTS_ENABLED ?? 'false'}` === 'true';

  if (!enabled || !context.db) {
    throw createProviderAccountsError(
      PROVIDER_ACCOUNT_ERROR_CODES.PROVIDER_ACCOUNTS_DISABLED,
      'Provider Accounts requiere DB real, auth y cifrado de tokens antes de produccion.',
    );
  }
}

export function normalizeProviderId(providerId) {
  const normalized = `${providerId ?? ''}`.trim().toLowerCase();

  if (!PROVIDER_ID_PATTERN.test(normalized)) {
    throw createProviderAccountsError(
      PROVIDER_ACCOUNT_ERROR_CODES.PROVIDER_ACCOUNT_INPUT_INVALID,
      'providerId invalido.',
    );
  }

  return normalized;
}

export function validateProviderAccountStatus(status) {
  const normalized = `${status ?? ''}`.trim().toLowerCase();

  if (!PROVIDER_ACCOUNT_STATUSES.has(normalized)) {
    throw createProviderAccountsError(
      PROVIDER_ACCOUNT_ERROR_CODES.PROVIDER_ACCOUNT_STATUS_INVALID,
      'Estado de cuenta proveedor invalido.',
      { status },
    );
  }

  return normalized;
}

export function validateUserId(userId) {
  const value = `${userId ?? ''}`.trim();

  if (!value) {
    throw createProviderAccountsError(
      PROVIDER_ACCOUNT_ERROR_CODES.PROVIDER_ACCOUNT_INPUT_INVALID,
      'userId backend requerido. No debe confiarse en userId enviado por cliente para operaciones reales.',
    );
  }

  return value;
}

export async function getProviderAccount(userId, providerId, context = {}) {
  validateUserId(userId);
  normalizeProviderId(providerId);
  assertProviderAccountsEnabled(context);
  throw createProviderAccountsError(
    PROVIDER_ACCOUNT_ERROR_CODES.PROVIDER_ACCOUNTS_NOT_IMPLEMENTED,
    'getProviderAccount debe leer provider_accounts desde DB real.',
  );
}

export async function createProviderAccount(userId, providerId, metadata = {}, context = {}) {
  validateUserId(userId);
  normalizeProviderId(providerId);
  assertProviderAccountsEnabled(context);
  throw createProviderAccountsError(
    PROVIDER_ACCOUNT_ERROR_CODES.PROVIDER_ACCOUNTS_NOT_IMPLEMENTED,
    'createProviderAccount debe persistir provider_accounts sin guardar tokens.',
    { metadata },
  );
}

export async function updateProviderAccountStatus(providerAccountId, status, context = {}) {
  const accountId = `${providerAccountId ?? ''}`.trim();

  if (!accountId) {
    throw createProviderAccountsError(
      PROVIDER_ACCOUNT_ERROR_CODES.PROVIDER_ACCOUNT_INPUT_INVALID,
      'providerAccountId requerido.',
    );
  }

  validateProviderAccountStatus(status);
  assertProviderAccountsEnabled(context);
  throw createProviderAccountsError(
    PROVIDER_ACCOUNT_ERROR_CODES.PROVIDER_ACCOUNTS_NOT_IMPLEMENTED,
    'updateProviderAccountStatus debe auditar cambios de estado.',
  );
}

export async function linkProviderUser(userId, providerId, providerUserId, context = {}) {
  validateUserId(userId);
  normalizeProviderId(providerId);

  if (!`${providerUserId ?? ''}`.trim()) {
    throw createProviderAccountsError(
      PROVIDER_ACCOUNT_ERROR_CODES.PROVIDER_ACCOUNT_INPUT_INVALID,
      'providerUserId debe venir del proveedor via backend/OAuth, no del cliente.',
    );
  }

  assertProviderAccountsEnabled(context);
  throw createProviderAccountsError(
    PROVIDER_ACCOUNT_ERROR_CODES.PROVIDER_ACCOUNTS_NOT_IMPLEMENTED,
    'linkProviderUser debe vincular identidad proveedor despues de OAuth backend.',
  );
}

export async function disconnectProviderAccount(userId, providerId, context = {}) {
  validateUserId(userId);
  normalizeProviderId(providerId);
  assertProviderAccountsEnabled(context);
  throw createProviderAccountsError(
    PROVIDER_ACCOUNT_ERROR_CODES.PROVIDER_ACCOUNTS_NOT_IMPLEMENTED,
    'disconnectProviderAccount debe revocar estado y auditar la desconexion.',
  );
}

export async function getProviderPermissions(userId, providerId, context = {}) {
  validateUserId(userId);
  normalizeProviderId(providerId);
  assertProviderAccountsEnabled(context);
  throw createProviderAccountsError(
    PROVIDER_ACCOUNT_ERROR_CODES.PROVIDER_ACCOUNTS_NOT_IMPLEMENTED,
    'getProviderPermissions debe leer permissions normalizados desde DB.',
  );
}

export async function getProviderAccountStatus(userId, providerId, context = {}) {
  validateUserId(userId);
  normalizeProviderId(providerId);
  assertProviderAccountsEnabled(context);
  throw createProviderAccountsError(
    PROVIDER_ACCOUNT_ERROR_CODES.PROVIDER_ACCOUNTS_NOT_IMPLEMENTED,
    'getProviderAccountStatus debe devolver estado real desde provider_accounts.',
  );
}

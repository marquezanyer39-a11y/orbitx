export {
  AUTH_ERROR_CODES,
  AuthBackendError,
  createAuthError,
  toAuthErrorResponse,
} from './auth-errors.js';
export {
  getAuthRuntimeConfig,
  getRequestActor,
  requireAdmin,
  requireAuth,
  requireRole,
} from './auth-middleware.js';
export {
  ADMIN_ROLES,
  BACKEND_ROLES,
  FINANCE_OPERATION_ROLES,
  READONLY_BACKOFFICE_ROLES,
  RECONCILIATION_ROLES,
  getAllowedRolesForOperation,
  hasRequiredRole,
  normalizeRole,
  normalizeRoles,
} from './roles.js';

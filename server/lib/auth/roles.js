export const BACKEND_ROLES = Object.freeze({
  USER: 'user',
  ADMIN: 'admin',
  COMPLIANCE: 'compliance',
  FINANCE: 'finance',
  SUPPORT: 'support',
  DEVELOPER_READONLY: 'developer_readonly',
});

export const ADMIN_ROLES = Object.freeze([
  BACKEND_ROLES.ADMIN,
]);

export const FINANCE_OPERATION_ROLES = Object.freeze([
  BACKEND_ROLES.ADMIN,
  BACKEND_ROLES.FINANCE,
]);

export const RECONCILIATION_ROLES = Object.freeze([
  BACKEND_ROLES.ADMIN,
  BACKEND_ROLES.FINANCE,
  BACKEND_ROLES.COMPLIANCE,
]);

export const READONLY_BACKOFFICE_ROLES = Object.freeze([
  BACKEND_ROLES.ADMIN,
  BACKEND_ROLES.COMPLIANCE,
  BACKEND_ROLES.FINANCE,
  BACKEND_ROLES.SUPPORT,
  BACKEND_ROLES.DEVELOPER_READONLY,
]);

const ALL_ROLES = new Set(Object.values(BACKEND_ROLES));

export function normalizeRole(role) {
  const normalized = `${role ?? ''}`.trim().toLowerCase();
  return ALL_ROLES.has(normalized) ? normalized : null;
}

export function normalizeRoles(roles) {
  const source = Array.isArray(roles) ? roles : [roles];
  return source.map((role) => normalizeRole(role)).filter(Boolean);
}

export function hasRequiredRole(actor, requiredRoles) {
  const actorRoles = new Set(normalizeRoles(actor?.roles ?? actor?.role));
  const required = normalizeRoles(requiredRoles);

  if (!required.length) {
    return true;
  }

  return required.some((role) => actorRoles.has(role));
}

export function getAllowedRolesForOperation(operation) {
  const normalized = `${operation ?? ''}`.trim().toLowerCase();

  if (normalized.includes('reconcile')) {
    return RECONCILIATION_ROLES;
  }

  if (
    normalized.includes('reward') ||
    normalized.includes('fee') ||
    normalized.includes('adjustment')
  ) {
    return FINANCE_OPERATION_ROLES;
  }

  if (normalized.includes('admin')) {
    return ADMIN_ROLES;
  }

  return READONLY_BACKOFFICE_ROLES;
}

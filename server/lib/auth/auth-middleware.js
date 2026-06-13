import { AUTH_ERROR_CODES, createAuthError, toAuthErrorResponse } from './auth-errors.js';
import { ADMIN_ROLES, hasRequiredRole } from './roles.js';

export function getAuthRuntimeConfig(env = process.env) {
  return {
    authRequired: `${env.AUTH_REQUIRED ?? 'false'}` === 'true',
    rbacEnabled: `${env.RBAC_ENABLED ?? 'false'}` === 'true',
    providerConfigured: Boolean(env.AUTH_JWT_ISSUER || env.SUPABASE_JWT_SECRET),
  };
}

export function getRequestActor(req) {
  const actor = req.actor ?? req.auth?.actor ?? null;

  if (!actor) {
    return null;
  }

  const userId = `${actor.userId ?? actor.id ?? ''}`.trim();
  const roles = Array.isArray(actor.roles) ? actor.roles : [actor.role].filter(Boolean);

  if (!userId) {
    throw createAuthError(
      AUTH_ERROR_CODES.INVALID_ACTOR,
      'Actor backend invalido: falta userId validado por servidor.',
    );
  }

  return {
    userId,
    roles,
    provider: actor.provider ?? 'backend',
  };
}

function sendAuthError(res, error) {
  const safeError = toAuthErrorResponse(error);
  res.status(safeError.status).json(safeError.body);
}

export function requireAuth(req, res, next) {
  try {
    const actor = getRequestActor(req);

    if (actor) {
      req.actor = actor;
      next();
      return;
    }

    const config = getAuthRuntimeConfig();

    if (!config.providerConfigured || !config.authRequired) {
      throw createAuthError(
        AUTH_ERROR_CODES.AUTH_NOT_IMPLEMENTED,
        'Auth backend real aun no esta habilitado. Endpoints financieros permanecen cerrados.',
      );
    }

    throw createAuthError(
      AUTH_ERROR_CODES.AUTH_REQUIRED,
      'Autenticacion backend requerida.',
    );
  } catch (error) {
    sendAuthError(res, error);
  }
}

export function requireRole(requiredRoles) {
  return (req, res, next) => {
    try {
      const config = getAuthRuntimeConfig();

      if (!config.rbacEnabled) {
        throw createAuthError(
          AUTH_ERROR_CODES.RBAC_DISABLED,
          'RBAC aun no esta habilitado. Accion administrativa bloqueada por seguridad.',
        );
      }

      const actor = getRequestActor(req);

      if (!actor) {
        throw createAuthError(
          AUTH_ERROR_CODES.AUTH_REQUIRED,
          'Autenticacion backend requerida para validar roles.',
        );
      }

      if (!hasRequiredRole(actor, requiredRoles)) {
        throw createAuthError(
          AUTH_ERROR_CODES.ROLE_REQUIRED,
          'El actor no tiene rol suficiente para esta operacion.',
          { requiredRoles },
        );
      }

      req.actor = actor;
      next();
    } catch (error) {
      sendAuthError(res, error);
    }
  };
}

export const requireAdmin = requireRole(ADMIN_ROLES);

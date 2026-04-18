import { buildStructuredResponse } from './astra-schemas.js';

function containsPattern(message, patterns) {
  const normalized = `${message ?? ''}`.toLowerCase();
  return patterns.some((pattern) => pattern.test(normalized));
}

function buildSensitiveBlockResponse(reason) {
  if (reason === 'secrets') {
    return buildStructuredResponse({
      reply:
        'No puedo procesar seeds, frases de recuperacion, private keys ni secret keys. Nunca las compartas. Si quieres, te llevo a Seguridad o a la wallet para seguir de forma segura.',
      actions: ['review_security', 'wallet_open'],
      mood: 'critical',
    });
  }

  return buildStructuredResponse({
    reply:
      'No puedo ayudarte a desactivar protecciones de seguridad ni a debilitar tu cuenta. Si algo te bloquea, puedo ayudarte a revisarlo de forma segura dentro de OrbitX.',
    actions: ['review_security', 'diagnose_issue'],
    mood: 'warning',
  });
}

export function runAstraGuards(input) {
  const message = `${input?.message ?? ''}`;

  const secretPatterns = [
    /\bseed\b/,
    /\bseed phrase\b/,
    /\bfrase semilla\b/,
    /\brecovery phrase\b/,
    /\bmnemonic\b/,
    /\bprivate key\b/,
    /\bclave privada\b/,
    /\bsecret key\b/,
    /\bapi key\b/,
  ];

  const securityDisablePatterns = [
    /\bdisable 2fa\b/,
    /\bdesactiva(r)? 2fa\b/,
    /\bdesactivar seguridad\b/,
    /\bremove passcode\b/,
    /\bquitar bloqueo\b/,
    /\bdeshabilita(r)? biometr/i,
  ];

  if (containsPattern(message, secretPatterns)) {
    return {
      blocked: true,
      reason: 'secrets',
      response: buildSensitiveBlockResponse('secrets'),
    };
  }

  if (containsPattern(message, securityDisablePatterns)) {
    return {
      blocked: true,
      reason: 'security_disable',
      response: buildSensitiveBlockResponse('security_disable'),
    };
  }

  return {
    blocked: false,
    reason: null,
    response: null,
  };
}

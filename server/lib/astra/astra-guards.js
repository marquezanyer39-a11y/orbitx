import { buildStructuredResponse } from './astra-schemas.js';

function normalizeMessage(message) {
  return `${message ?? ''}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function containsPattern(message, patterns) {
  return patterns.some((pattern) => pattern.test(message));
}

function buildSensitiveBlockResponse(reason) {
  if (reason === 'secrets') {
    return buildStructuredResponse({
      reply:
        'Puedo explicarte que es una seed phrase o una private key, pero no puedo mostrar, revelar, exportar ni procesar secretos reales. Nunca compartas esas credenciales. Si quieres, te llevo a Seguridad o a la wallet para seguir de forma segura.',
      actions: ['review_security', 'wallet_open'],
      mood: 'critical',
    });
  }

  return buildStructuredResponse({
    reply:
      'No puedo ayudarte a desactivar protecciones de seguridad ni a debilitar tu cuenta. Si algo te bloquea, puedo orientarte para revisarlo con seguridad dentro de OrbitX.',
    actions: ['review_security', 'diagnose_issue'],
    mood: 'warning',
  });
}

function looksLikeSeedPhraseOrKey(message) {
  const normalized = normalizeMessage(message);
  const mnemonicPattern =
    /^(?:[a-z]{3,12}\s+){11,23}[a-z]{3,12}$/;
  const hexKeyPattern = /\b0x[a-f0-9]{64}\b/;

  return mnemonicPattern.test(normalized) || hexKeyPattern.test(normalized);
}

function isSensitiveConceptQuestion(message) {
  const normalized = normalizeMessage(message);
  const explanationTerms = [
    /\bque es\b/,
    /\bwhat is\b/,
    /\bexplica\b/,
    /\bexplain\b/,
    /\bdefine\b/,
    /\bsignifica\b/,
    /\bcomo funciona\b/,
    /\bhow does\b/,
    /\bpara que sirve\b/,
  ];

  return containsPattern(normalized, explanationTerms);
}

function isCredentialRevealRequest(message) {
  const normalized = normalizeMessage(message);
  const sensitiveTerms = [
    /\bseed\b/,
    /\bseed phrase\b/,
    /\bfrase semilla\b/,
    /\brecovery phrase\b/,
    /\bfrase de recuperacion\b/,
    /\bmnemonic\b/,
    /\bprivate key\b/,
    /\bclave privada\b/,
    /\bsecret key\b/,
    /\bapi secret\b/,
    /\bapi key\b/,
  ];
  const revealTerms = [
    /\bshow\b/,
    /\bdisplay\b/,
    /\breveal\b/,
    /\bgive\b/,
    /\btell\b/,
    /\bsend\b/,
    /\bshare\b/,
    /\bexport\b/,
    /\bcopy\b/,
    /\bview\b/,
    /\bsee\b/,
    /\bmostrar\b/,
    /\bmuestrame\b/,
    /\brevela\b/,
    /\bdame\b/,
    /\bensename\b/,
    /\benvia\b/,
    /\bcompart\b/,
    /\bexporta\b/,
    /\bcopia\b/,
    /\bver\b/,
  ];
  const ownershipTerms = [
    /\bmy\b/,
    /\bmine\b/,
    /\bmi\b/,
    /\bmis\b/,
    /\bde mi\b/,
    /\bdel usuario\b/,
    /\bde la cuenta\b/,
  ];

  if (looksLikeSeedPhraseOrKey(message)) {
    return true;
  }

  if (!containsPattern(normalized, sensitiveTerms)) {
    return false;
  }

  if (isSensitiveConceptQuestion(normalized)) {
    return false;
  }

  return (
    containsPattern(normalized, revealTerms) ||
    containsPattern(normalized, ownershipTerms)
  );
}

function isSecurityDisableRequest(message) {
  const normalized = normalizeMessage(message);
  const disablePatterns = [
    /\bdisable 2fa\b/,
    /\bturn off 2fa\b/,
    /\bremove passcode\b/,
    /\bdisable biometrics\b/,
    /\bturn off biometrics\b/,
    /\bdisable auto[- ]?lock\b/,
    /\bdesactiva(?:r)? 2fa\b/,
    /\bdesactivar seguridad\b/,
    /\bquitar bloqueo\b/,
    /\bdeshabilita(?:r)? biometr/i,
    /\bquitar biometr/i,
    /\bdesactivar auto[- ]?lock\b/,
  ];

  return containsPattern(normalized, disablePatterns);
}

export function runAstraGuards(input) {
  const message = `${input?.message ?? ''}`;

  if (isCredentialRevealRequest(message)) {
    return {
      blocked: true,
      reason: 'secrets',
      response: buildSensitiveBlockResponse('secrets'),
    };
  }

  if (isSecurityDisableRequest(message)) {
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

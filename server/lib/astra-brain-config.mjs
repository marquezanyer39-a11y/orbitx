function readString(value, fallback = '') {
  const normalized = `${value ?? ''}`.trim();
  return normalized || fallback;
}

function readSecret(value, fallback = '') {
  const normalized = readString(value, fallback);
  if (!normalized) {
    return '';
  }

  if (
    normalized.includes('pega_aqui') ||
    normalized.includes('your-') ||
    normalized.includes('tu_')
  ) {
    return '';
  }

  return normalized;
}

function readNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function createAstraBrainConfig(env = process.env) {
  return {
    apiKey: readSecret(env.GEMINI_API_KEY),
    model: readString(env.GEMINI_MODEL, 'gemini-2.5-flash'),
    timeoutMs: readNumber(env.GEMINI_TIMEOUT_MS, 18_000),
    maxQuestionLength: readNumber(env.GEMINI_MAX_QUESTION_LENGTH, 900),
    maxResponseLength: readNumber(env.GEMINI_MAX_RESPONSE_LENGTH, 700),
  };
}

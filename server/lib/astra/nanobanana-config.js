const DEFAULT_GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com';
const DEFAULT_GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-image';
const DEFAULT_PROVIDER_LABEL = 'Astra + Gemini Nano Banana';
const DEFAULT_TIMEOUT_MS = 30000;

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeBaseUrl(value) {
  const normalized = `${value ?? ''}`.trim().replace(/\/$/, '');
  return normalized || DEFAULT_GEMINI_BASE_URL;
}

export function resolveApiKey(env = process.env) {
  const geminiApiKey = `${env.GEMINI_API_KEY ?? ''}`.trim();
  if (geminiApiKey) {
    return {
      apiKey: geminiApiKey,
      apiKeySource: 'GEMINI_API_KEY',
    };
  }

  const nanobananaApiKey = `${env.NANOBANANA_API_KEY ?? ''}`.trim();
  if (nanobananaApiKey) {
    return {
      apiKey: nanobananaApiKey,
      apiKeySource: 'NANOBANANA_API_KEY',
    };
  }

  return {
    apiKey: '',
    apiKeySource: null,
  };
}

export function createNanobananaConfig(env = process.env) {
  const { apiKey, apiKeySource } = resolveApiKey(env);
  const apiUrl = normalizeBaseUrl(
    env.NANOBANANA_API_URL ?? env.GEMINI_NEXT_GEN_API_BASE_URL ?? '',
  );
  const model = `${env.NANOBANANA_MODEL ?? env.GEMINI_IMAGE_MODEL ?? DEFAULT_GEMINI_IMAGE_MODEL}`
    .trim();
  const timeoutMs = toNumber(env.NANOBANANA_TIMEOUT_MS, DEFAULT_TIMEOUT_MS);

  return {
    apiKey,
    apiKeySource,
    apiUrl,
    endpoint: `${apiUrl}/v1beta/models/${model}:generateContent`,
    model,
    timeoutMs,
    providerLabel: DEFAULT_PROVIDER_LABEL,
  };
}

export function isNanobananaConfigured(config) {
  return Boolean(config?.apiKey && config?.apiUrl && config?.model);
}

export function describeNanobananaAvailability(config) {
  if (!isNanobananaConfigured(config)) {
    return {
      available: false,
      configured: false,
      enabled: false,
      providerLabel: config?.providerLabel ?? DEFAULT_PROVIDER_LABEL,
      model: config?.model ?? DEFAULT_GEMINI_IMAGE_MODEL,
      endpoint: config?.endpoint ?? `${DEFAULT_GEMINI_BASE_URL}/v1beta/models/${DEFAULT_GEMINI_IMAGE_MODEL}:generateContent`,
      apiKeySource: config?.apiKeySource ?? null,
      message:
        'La generacion visual de Astra necesita una API key de Gemini o Nanobanana para activarse en este entorno.',
    };
  }

  const enabled =
    `${process.env.ASTRA_BACKEND_VISUAL_MODEL_ENABLED ?? 'false'}`.trim().toLowerCase() ===
    'true';

  if (!enabled) {
    return {
      available: false,
      configured: true,
      enabled: false,
      providerLabel: config.providerLabel,
      model: config.model,
      endpoint: config.endpoint,
      apiKeySource: config.apiKeySource,
      message:
        'La generacion visual real de Astra esta desactivada por defecto en este entorno seguro.',
    };
  }

  return {
    available: true,
    configured: true,
    enabled: true,
    providerLabel: config.providerLabel,
    model: config.model,
    endpoint: config.endpoint,
    apiKeySource: config.apiKeySource,
    message: `La generacion visual esta lista con ${config.model}.`,
  };
}


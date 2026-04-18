import { GoogleGenAI } from '@google/genai';

import { AstraSystemError } from './astra-schemas.js';

const DEFAULT_GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com';
const DEFAULT_GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-image';
const DEFAULT_PROVIDER_LABEL = 'Astra + Gemini Nano Banana';
const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_ASPECT_RATIO = '1:1';
const DEFAULT_IMAGE_SIZE = '1K';

function sanitizePrompt(value) {
  return `${value ?? ''}`.replace(/\s+/g, ' ').trim().slice(0, 800);
}

function sanitizeOptionalText(value, maxLength) {
  return `${value ?? ''}`.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function sanitizeImageMimeType(value) {
  const normalized = `${value ?? ''}`.trim().toLowerCase();
  if (!normalized) {
    return 'image/png';
  }

  if (normalized === 'image/png' || normalized === 'image/jpeg' || normalized === 'image/webp') {
    return normalized;
  }

  return 'image/png';
}

function sanitizeBase64(value) {
  return `${value ?? ''}`.replace(/^data:[^;]+;base64,/, '').replace(/\s+/g, '').trim();
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeBaseUrl(value) {
  const normalized = `${value ?? ''}`.trim().replace(/\/$/, '');
  return normalized || DEFAULT_GEMINI_BASE_URL;
}

function resolveApiKey(env) {
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

function buildPrompt(prompt, context) {
  const lines = [sanitizePrompt(prompt)];

  const tokenName = sanitizeOptionalText(context?.tokenName, 80);
  const tokenSymbol = sanitizeOptionalText(context?.tokenSymbol, 24).toUpperCase();
  const description = sanitizeOptionalText(context?.description, 240);
  const language = sanitizeOptionalText(context?.language, 8) || 'es';

  if (tokenName) {
    lines.push(`Token name: ${tokenName}`);
  }

  if (tokenSymbol) {
    lines.push(`Token symbol: ${tokenSymbol}`);
  }

  if (description) {
    lines.push(`Creative direction: ${description}`);
  }

  lines.push(
    language === 'es'
      ? 'Entrega una imagen utilizable para branding de memecoin dentro de OrbitX.'
      : 'Deliver an image that is usable for memecoin branding inside OrbitX.',
  );

  return lines.filter(Boolean).join('\n');
}

function getResponseParts(response) {
  const partsFromCandidates =
    response?.candidates?.flatMap((candidate) => candidate?.content?.parts ?? []) ?? [];

  if (partsFromCandidates.length) {
    return partsFromCandidates;
  }

  return response?.parts ?? [];
}

function normalizeImages(response, prompt) {
  const parts = getResponseParts(response);
  const images = [];

  parts.forEach((part, index) => {
    const inlineData = part?.inlineData ?? part?.inline_data ?? null;
    const base64Data = sanitizeBase64(inlineData?.data ?? '');
    if (!base64Data) {
      return;
    }

    const mimeType = sanitizeImageMimeType(inlineData?.mimeType ?? inlineData?.mime_type);
    images.push({
      id: `nanobanana-${index + 1}`,
      imageUrl: `data:${mimeType};base64,${base64Data}`,
      prompt,
      mimeType,
      width: null,
      height: null,
    });
  });

  return images;
}

function extractErrorDetails(error) {
  const status =
    Number(error?.status ?? error?.cause?.status ?? error?.response?.status ?? 0) || null;
  const rawMessage =
    error instanceof Error
      ? error.message
      : `${error?.error?.message ?? error?.message ?? 'Unknown Gemini image error'}`;
  const normalized = rawMessage.toLowerCase();

  return {
    status,
    rawMessage,
    normalized,
  };
}

function classifyNanobananaError(error) {
  const details = extractErrorDetails(error);

  console.error('[OrbitX][AstraImage] Gemini image request failed', {
    status: details.status,
    reason: details.rawMessage,
  });

  if (
    details.normalized.includes('resource_exhausted') ||
    details.normalized.includes('quota') ||
    details.status === 429
  ) {
    return new AstraSystemError(
      'La generacion visual de Astra llego a su limite temporal en Gemini. Intenta de nuevo en unos minutos.',
      {
        code: 'NANOBANANA_UPSTREAM_QUOTA',
        status: 503,
        retryable: true,
        exposeMessage: true,
      },
    );
  }

  if (
    details.normalized.includes('api key not valid') ||
    details.normalized.includes('permission_denied') ||
    details.normalized.includes('unauthenticated') ||
    details.status === 401 ||
    details.status === 403
  ) {
    return new AstraSystemError(
      'La clave de Gemini para generacion visual no es valida o no tiene acceso a este modelo.',
      {
        code: 'NANOBANANA_AUTH_FAILED',
        status: 502,
        retryable: false,
        exposeMessage: true,
      },
    );
  }

  if (
    details.normalized.includes('timed out') ||
    details.normalized.includes('timeout') ||
    details.status === 408
  ) {
    return new AstraSystemError('La generacion visual tardo demasiado. Intenta de nuevo.', {
      code: 'NANOBANANA_TIMEOUT',
      status: 504,
      retryable: true,
      exposeMessage: true,
    });
  }

  if (
    details.normalized.includes('unavailable') ||
    details.normalized.includes('overloaded') ||
    details.status === 503
  ) {
    return new AstraSystemError(
      'Gemini esta ocupado ahora mismo y no pudo generar la imagen. Intenta otra vez en unos minutos.',
      {
        code: 'NANOBANANA_UPSTREAM_UNAVAILABLE',
        status: 503,
        retryable: true,
        exposeMessage: true,
      },
    );
  }

  if (details.status === 400) {
    return new AstraSystemError(details.rawMessage, {
      code: 'NANOBANANA_INVALID_REQUEST',
      status: 400,
      retryable: false,
      exposeMessage: true,
    });
  }

  return new AstraSystemError('No pudimos conectar con Gemini para generar la imagen.', {
    code: 'NANOBANANA_UNKNOWN_ERROR',
    status: 502,
    retryable: true,
    exposeMessage: true,
  });
}

function createGeminiImageClient(config) {
  return new GoogleGenAI({
    apiKey: config.apiKey,
    apiVersion: 'v1beta',
    httpOptions: {
      baseUrl: config.apiUrl,
      timeout: config.timeoutMs,
    },
  });
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
      providerLabel: config.providerLabel,
      model: config.model,
      endpoint: config.endpoint,
      apiKeySource: config.apiKeySource,
      message:
        'La generacion visual de Astra necesita una API key de Gemini o Nanobanana para activarse en este entorno.',
    };
  }

  try {
    createGeminiImageClient(config);

    return {
      available: true,
      configured: true,
      providerLabel: config.providerLabel,
      model: config.model,
      endpoint: config.endpoint,
      apiKeySource: config.apiKeySource,
      message: `La generacion visual esta lista con ${config.model}.`,
    };
  } catch (error) {
    const details = extractErrorDetails(error);
    return {
      available: false,
      configured: false,
      providerLabel: config.providerLabel,
      model: config.model,
      endpoint: config.endpoint,
      apiKeySource: config.apiKeySource,
      message: `No pudimos inicializar Gemini para imagen: ${details.rawMessage}`,
    };
  }
}

export async function generateNanobananaImages({
  config,
  prompt,
  context,
  referenceImage = null,
}) {
  const cleanedPrompt = sanitizePrompt(prompt);
  if (!cleanedPrompt) {
    throw new AstraSystemError('Astra necesita un prompt visual para generar la imagen.', {
      code: 'NANOBANANA_EMPTY_PROMPT',
      status: 400,
      exposeMessage: true,
    });
  }

  if (!isNanobananaConfigured(config)) {
    throw new AstraSystemError(
      'La generacion visual con Astra todavia no esta conectada en este entorno.',
      {
        code: 'NANOBANANA_NOT_CONFIGURED',
        status: 503,
        exposeMessage: true,
      },
    );
  }

  const runtime = describeNanobananaAvailability(config);
  if (!runtime.available) {
    throw new AstraSystemError(runtime.message, {
      code: 'NANOBANANA_INIT_FAILED',
      status: 503,
      exposeMessage: true,
    });
  }

  const ai = createGeminiImageClient(config);
  const enrichedPrompt = buildPrompt(cleanedPrompt, context);

  const contents =
    referenceImage?.data && referenceImage?.mimeType
      ? [
          { text: enrichedPrompt },
          {
            inlineData: {
              mimeType: sanitizeImageMimeType(referenceImage.mimeType),
              data: sanitizeBase64(referenceImage.data),
            },
          },
        ]
      : enrichedPrompt;

  console.info('[OrbitX][AstraImage] Gemini image request', {
    providerLabel: config.providerLabel,
    endpoint: config.endpoint,
    model: config.model,
    apiKeySource: config.apiKeySource,
    usingGeminiApiKey: config.apiKeySource === 'GEMINI_API_KEY',
    usingNanobananaFallbackKey: config.apiKeySource === 'NANOBANANA_API_KEY',
  });

  try {
    const response = await ai.models.generateContent({
      model: config.model,
      contents,
      config: {
        imageConfig: {
          aspectRatio: DEFAULT_ASPECT_RATIO,
          imageSize: DEFAULT_IMAGE_SIZE,
        },
      },
    });

    const images = normalizeImages(response, cleanedPrompt);
    if (!images.length) {
      throw new AstraSystemError(
        response?.text?.trim() || 'Gemini no devolvio imagenes utilizables para Astra.',
        {
          code: 'NANOBANANA_EMPTY_RESULT',
          status: 502,
          exposeMessage: true,
        },
      );
    }

    return {
      prompt: cleanedPrompt,
      providerLabel: config.providerLabel,
      model: config.model,
      endpoint: config.endpoint,
      images,
    };
  } catch (error) {
    if (error instanceof AstraSystemError) {
      throw error;
    }

    throw classifyNanobananaError(error);
  }
}

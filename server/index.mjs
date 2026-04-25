import './bootstrap-env.mjs';

import cors from 'cors';
import express from 'express';

import { createAstraBrainConfig } from './lib/astra-brain-config.mjs';
import { createAstraChatController } from './lib/astra/astra-controller.js';
import { createAstraImageController } from './lib/astra/astra-image-controller.js';
import {
  createNanobananaConfig,
  describeNanobananaAvailability,
} from './lib/astra/nanobanana-client.js';
import {
  createAstraVoiceConfig,
  isValidAstraVoiceContext,
  isValidAstraVoicePresetId,
  resolveFallbackPreset,
  resolvePreset,
} from './lib/astra-voice-config.mjs';
import { ElevenLabsVoiceError, synthesizeAstraSpeech } from './lib/elevenlabs-client.mjs';

const app = express();
const host = `${process.env.HOST || '0.0.0.0'}`.trim() || '0.0.0.0';
const port = Number(process.env.PORT || 8788);
const config = createAstraVoiceConfig(process.env);
const brainConfig = createAstraBrainConfig(process.env);
const astraChatController = createAstraChatController(brainConfig);
const astraImageController = createAstraImageController();
const allowedCorsOrigins = `${process.env.CORS_ALLOWED_ORIGINS ?? '*'}`;

function isAstraVoiceRuntimeConfigured(currentConfig) {
  const primaryPreset = resolvePreset(currentConfig, currentConfig.defaultPresetId);
  const fallbackPreset = resolveFallbackPreset(currentConfig, currentConfig.fallbackPresetId);

  return Boolean(
    currentConfig.apiKey && (primaryPreset?.voiceId || fallbackPreset?.voiceId),
  );
}

function createCorsOriginResolver(rawValue) {
  const normalized = rawValue
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (!normalized.length || normalized.includes('*')) {
    return true;
  }

  const allowedOrigins = new Set(normalized);
  return (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    console.warn('[OrbitX][AstraCore] blocked CORS origin', {
      origin,
      allowedOrigins: Array.from(allowedOrigins),
    });
    callback(new Error('CORS origin is not allowed.'));
  };
}

function sanitizeText(value, maxLength) {
  return `${value ?? ''}`
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function getSafeVoiceError(error) {
  if (error instanceof ElevenLabsVoiceError) {
    return {
      status: error.status,
      body: {
        error:
          error.status >= 500
            ? 'No pudimos generar la voz de Astra ahora mismo.'
            : error.message,
        code: error.code,
        retryable: error.retryable,
      },
      log: {
        code: error.code,
        retryable: error.retryable,
        meta: error.meta,
      },
    };
  }

  return {
    status: 500,
    body: {
      error: 'No pudimos generar la voz de Astra ahora mismo.',
      code: 'VOICE_UNKNOWN_ERROR',
      retryable: false,
    },
    log: {
      code: 'VOICE_UNKNOWN_ERROR',
    },
  };
}

app.use(
  cors({
    origin: createCorsOriginResolver(allowedCorsOrigins),
    credentials: false,
  }),
);
app.use(express.json({ limit: '32kb' }));

app.get('/health', (_request, response) => {
  const nanobananaConfig = createNanobananaConfig(process.env);
  const nanobananaAvailability = describeNanobananaAvailability(nanobananaConfig);
  const voiceRuntimeConfigured = isAstraVoiceRuntimeConfigured(config);

  response.json({
    ok: true,
    service: 'orbitx-astra-core',
    elevenlabsConfigured: voiceRuntimeConfigured,
    elevenlabsApiKeyConfigured: Boolean(config.apiKey),
    astraBrainConfigured: Boolean(brainConfig.apiKey),
    nanobananaConfigured: nanobananaAvailability.available,
    nanobanana: nanobananaAvailability,
    defaultPresetId: config.defaultPresetId,
    fallbackPresetId: config.fallbackPresetId,
  });
});

app.post('/api/astra/realtime-session', (request, response) => {
  const userId = `${request.body?.context?.userId ?? 'astra-user'}`.trim() || 'astra-user';
  const voiceRuntimeConfigured = isAstraVoiceRuntimeConfigured(config);

  response.json({
    sessionId: `astra-${userId}-${Date.now()}`,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    state: 'ready',
    transport: 'turn_based_voice',
    voiceOutput: voiceRuntimeConfigured ? 'server_tts' : 'device_tts',
    speechInput: 'native_stt',
    model: brainConfig.model,
  });
});

app.post('/api/astra/chat', astraChatController);
app.post('/api/astra/generate-image', astraImageController);

app.post('/api/voice/astra/speak', async (request, response) => {
  const rawText = request.body?.text;
  const requestedContext = request.body?.context;
  const requestedPresetId = request.body?.presetId;
  const text = sanitizeText(rawText, config.maxTextLength);
  const context = isValidAstraVoiceContext(requestedContext) ? requestedContext : 'explain';
  const presetId = isValidAstraVoicePresetId(requestedPresetId)
    ? requestedPresetId
    : config.defaultPresetId;

  if (!text) {
    response.status(400).json({
      error: 'Astra necesita texto para generar audio.',
    });
    return;
  }

  try {
    console.info('[OrbitX][AstraVoiceServer] tts request', {
      provider: 'elevenlabs',
      presetId,
      context,
      defaultPresetId: config.defaultPresetId,
      fallbackPresetId: config.fallbackPresetId,
    });

    const audioBuffer = await synthesizeAstraSpeech({
      config,
      text,
      context,
      presetId,
    });

    response.setHeader('Content-Type', 'audio/mpeg');
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Content-Length', String(audioBuffer.byteLength));
    response.status(200).send(audioBuffer);
  } catch (error) {
    const safeError = getSafeVoiceError(error);
    console.error('[OrbitX][AstraVoiceServer]', safeError.log);
    response.status(safeError.status).json(safeError.body);
  }
});

app.listen(port, host, () => {
  const nanobananaRuntime = describeNanobananaAvailability(createNanobananaConfig(process.env));
  console.log(
    `[OrbitX][AstraVoiceServer] listening on http://${host}:${port} (configured=${Boolean(
      config.apiKey,
    )})`,
  );
  console.info('[OrbitX][AstraImageServer] runtime', {
    available: nanobananaRuntime.available,
    providerLabel: nanobananaRuntime.providerLabel,
    model: nanobananaRuntime.model,
    endpoint: nanobananaRuntime.endpoint,
    apiKeySource: nanobananaRuntime.apiKeySource ?? null,
    corsAllowedOrigins: allowedCorsOrigins,
  });
});

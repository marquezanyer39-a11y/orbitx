import { resolveFallbackPreset, resolvePreset } from './astra-voice-config.mjs';

export class ElevenLabsVoiceError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'ElevenLabsVoiceError';
    this.code = options.code ?? 'ELEVENLABS_TTS_ERROR';
    this.status = options.status ?? 502;
    this.retryable = Boolean(options.retryable);
    this.meta = options.meta ?? {};
  }
}

function withContextSettings(baseSettings, context) {
  switch (context) {
    case 'welcome':
      return {
        ...baseSettings,
        stability: Math.min(1, baseSettings.stability + 0.02),
        style: Math.min(1, baseSettings.style + 0.04),
        speed: Math.max(0.88, baseSettings.speed - 0.02),
      };
    case 'confirm':
      return {
        ...baseSettings,
        stability: Math.min(1, baseSettings.stability + 0.04),
        style: Math.max(0, baseSettings.style - 0.02),
      };
    case 'alert':
      return {
        ...baseSettings,
        stability: Math.min(1, baseSettings.stability + 0.06),
        similarity_boost: Math.min(1, baseSettings.similarity_boost + 0.04),
        speed: Math.min(1.08, baseSettings.speed + 0.02),
      };
    case 'explain':
    default:
      return {
        ...baseSettings,
        stability: Math.min(1, baseSettings.stability + 0.03),
        speed: Math.max(0.9, baseSettings.speed - 0.03),
      };
  }
}

async function readErrorPayload(response) {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.toLowerCase().includes('application/json')) {
    const payload = await response.json().catch(() => null);
    return {
      message:
        payload?.detail?.message ??
        payload?.detail?.status ??
        payload?.detail ??
        payload?.message ??
        'No pudimos generar la voz de Astra.',
      providerStatus:
        payload?.detail?.status ??
        payload?.detail?.code ??
        payload?.status ??
        payload?.code ??
        null,
      rawPayload: payload,
    };
  }

  return {
    message: await response.text().catch(() => 'No pudimos generar la voz de Astra.'),
    providerStatus: null,
    rawPayload: null,
  };
}

function classifyVoiceError(response, errorPayload) {
  const providerStatus = `${errorPayload.providerStatus ?? ''}`.trim().toLowerCase();

  if (providerStatus === 'quota_exceeded') {
    return {
      code: 'VOICE_QUOTA_EXCEEDED',
      status: 429,
      retryable: false,
      message:
        'La voz premium de Astra no esta disponible porque la cuenta de ElevenLabs se quedo sin creditos.',
    };
  }

  if (response.status === 401) {
    return {
      code: 'VOICE_AUTH_FAILED',
      status: 502,
      retryable: false,
      message:
        errorPayload.message || 'No pudimos autenticar la voz premium de Astra con ElevenLabs.',
    };
  }

  return {
    code: 'VOICE_UPSTREAM_FAILED',
    status: response.status,
    retryable: response.status >= 500 || response.status === 429,
    message: errorPayload.message || 'No pudimos generar la voz de Astra.',
  };
}

function createVoiceRequestBody(text, profile, context) {
  return {
    text,
    model_id: profile.modelId,
    voice_settings: withContextSettings(profile.voiceSettings, context),
  };
}

async function requestSpeech(config, profile, text, context) {
  if (!profile?.voiceId) {
    throw new ElevenLabsVoiceError(
      'Configura un voiceId de ElevenLabs antes de usar la voz oficial de Astra.',
      {
        code: 'VOICE_NOT_CONFIGURED',
        status: 500,
        retryable: false,
      },
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.requestTimeoutMs);

  try {
    const response = await fetch(
      `${config.baseUrl}/text-to-speech/${profile.voiceId}?output_format=${encodeURIComponent(
        config.outputFormat,
      )}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': config.apiKey,
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createVoiceRequestBody(text, profile, context)),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const errorPayload = await readErrorPayload(response);
      const classifiedError = classifyVoiceError(response, errorPayload);
      throw new ElevenLabsVoiceError(classifiedError.message, {
        code: classifiedError.code,
        status: classifiedError.status,
        retryable: classifiedError.retryable,
        meta: {
          providerStatus: errorPayload.providerStatus,
          providerHttpStatus: response.status,
          providerMessage: errorPayload.message,
          providerPayload: errorPayload.rawPayload,
          requestedVoiceId: profile.voiceId,
          requestedModelId: profile.modelId,
        },
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    if (!arrayBuffer.byteLength) {
      throw new ElevenLabsVoiceError('ElevenLabs no devolvió audio para Astra.', {
        code: 'VOICE_EMPTY_AUDIO',
        status: 502,
        retryable: true,
      });
    }

    return Buffer.from(arrayBuffer);
  } catch (error) {
    if (error instanceof ElevenLabsVoiceError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ElevenLabsVoiceError('La voz de Astra tardó demasiado en responder.', {
        code: 'VOICE_TIMEOUT',
        status: 504,
        retryable: true,
      });
    }

    throw new ElevenLabsVoiceError('No pudimos conectar con ElevenLabs.', {
      code: 'VOICE_NETWORK_ERROR',
      status: 502,
      retryable: true,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function synthesizeAstraSpeech({ config, text, context, presetId }) {
  if (!config.apiKey) {
    throw new ElevenLabsVoiceError(
      'Falta ELEVENLABS_API_KEY en el backend de Astra Voice.',
      {
        code: 'VOICE_BACKEND_NOT_CONFIGURED',
        status: 500,
        retryable: false,
      },
    );
  }

  const primaryProfile = resolvePreset(config, presetId);
  const fallbackProfile = resolveFallbackPreset(config, config.fallbackPresetId);
  const shouldUseFallbackProfileFirst =
    !primaryProfile?.voiceId &&
    Boolean(fallbackProfile?.voiceId) &&
    (fallbackProfile.voiceId !== primaryProfile?.voiceId ||
      fallbackProfile.modelId !== primaryProfile?.modelId);

  if (shouldUseFallbackProfileFirst) {
    console.warn('[OrbitX][AstraVoiceServer] voice preset missing, using fallback profile', {
      requestedPresetId: presetId,
      primaryVoiceId: primaryProfile?.voiceId ?? null,
      primaryModelId: primaryProfile?.modelId ?? null,
      fallbackVoiceId: fallbackProfile?.voiceId ?? null,
      fallbackModelId: fallbackProfile?.modelId ?? null,
    });

    return requestSpeech(config, fallbackProfile, text, context);
  }

  try {
    return await requestSpeech(config, primaryProfile, text, context);
  } catch (error) {
    const canRetry =
      error instanceof ElevenLabsVoiceError &&
      error.retryable &&
      fallbackProfile &&
      (fallbackProfile.voiceId !== primaryProfile.voiceId ||
        fallbackProfile.modelId !== primaryProfile.modelId);

    if (!canRetry) {
      throw error;
    }

    console.warn('[OrbitX][AstraVoiceServer] voice fallback triggered', {
      requestedPresetId: presetId,
      primaryVoiceId: primaryProfile?.voiceId,
      primaryModelId: primaryProfile?.modelId,
      fallbackVoiceId: fallbackProfile?.voiceId,
      fallbackModelId: fallbackProfile?.modelId,
      reason: error instanceof ElevenLabsVoiceError ? error.code : 'UNKNOWN',
    });

    return requestSpeech(config, fallbackProfile, text, context);
  }
}

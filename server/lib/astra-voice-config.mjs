const VOICE_PRESET_IDS = ['astra_core', 'astra_edge', 'astra_nova', 'astra_pulse'];
const VOICE_CONTEXTS = ['welcome', 'confirm', 'alert', 'explain'];

const DEFAULT_MODEL_ID = 'eleven_flash_v2_5';
const DEFAULT_FALLBACK_MODEL_ID = 'eleven_flash_v2';
const DEFAULT_OUTPUT_FORMAT = 'mp3_44100_128';
const DEFAULT_TIMEOUT_MS = 20_000;
const DEFAULT_MAX_TEXT_LENGTH = 520;

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

function readBoolean(value, fallback = true) {
  const normalized = `${value ?? ''}`.trim().toLowerCase();
  if (!normalized) {
    return fallback;
  }

  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return fallback;
}

function readVoiceSettings(env, prefix) {
  return {
    stability: readNumber(env[`${prefix}_STABILITY`], readNumber(env.ELEVENLABS_STABILITY, 0.68)),
    similarity_boost: readNumber(
      env[`${prefix}_SIMILARITY_BOOST`],
      readNumber(env.ELEVENLABS_SIMILARITY_BOOST, 0.82),
    ),
    style: readNumber(env[`${prefix}_STYLE`], readNumber(env.ELEVENLABS_STYLE, 0.14)),
    speed: readNumber(env[`${prefix}_SPEED`], readNumber(env.ELEVENLABS_SPEED, 0.96)),
    use_speaker_boost: readBoolean(
      env[`${prefix}_USE_SPEAKER_BOOST`],
      readBoolean(env.ELEVENLABS_USE_SPEAKER_BOOST, true),
    ),
  };
}

function buildPreset(env, presetId) {
  const presetEnvKey = `ELEVENLABS_${presetId.toUpperCase()}`;
  return {
    id: presetId,
    voiceId: readString(env[`${presetEnvKey}_VOICE_ID`], readString(env.ELEVENLABS_VOICE_ID)),
    fallbackVoiceId: readString(
      env[`${presetEnvKey}_FALLBACK_VOICE_ID`],
      readString(env.ELEVENLABS_FALLBACK_VOICE_ID),
    ),
    modelId: readString(
      env[`${presetEnvKey}_MODEL_ID`],
      readString(env.ELEVENLABS_MODEL_ID, DEFAULT_MODEL_ID),
    ),
    fallbackModelId: readString(
      env[`${presetEnvKey}_FALLBACK_MODEL_ID`],
      readString(env.ELEVENLABS_FALLBACK_MODEL_ID, DEFAULT_FALLBACK_MODEL_ID),
    ),
    voiceSettings: readVoiceSettings(env, presetEnvKey),
  };
}

export function createAstraVoiceConfig(env = process.env) {
  const apiKey = readString(env.ELEVENLABS_API_KEY);
  const safeApiKey = readSecret(env.ELEVENLABS_API_KEY);

  return {
    apiKey: safeApiKey,
    baseUrl: readString(env.ELEVENLABS_BASE_URL, 'https://api.elevenlabs.io/v1'),
    outputFormat: readString(env.ELEVENLABS_OUTPUT_FORMAT, DEFAULT_OUTPUT_FORMAT),
    requestTimeoutMs: readNumber(env.ELEVENLABS_REQUEST_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
    maxTextLength: readNumber(env.ELEVENLABS_MAX_TEXT_LENGTH, DEFAULT_MAX_TEXT_LENGTH),
    defaultPresetId: readString(env.ELEVENLABS_DEFAULT_PRESET_ID, 'astra_nova'),
    fallbackPresetId: readString(env.ELEVENLABS_FALLBACK_PRESET_ID, 'astra_pulse'),
    presets: Object.fromEntries(VOICE_PRESET_IDS.map((presetId) => [presetId, buildPreset(env, presetId)])),
  };
}

export function isValidAstraVoicePresetId(value) {
  return VOICE_PRESET_IDS.includes(value);
}

export function isValidAstraVoiceContext(value) {
  return VOICE_CONTEXTS.includes(value);
}

export function resolvePreset(config, presetId) {
  const safePresetId = isValidAstraVoicePresetId(presetId) ? presetId : config.defaultPresetId;
  return config.presets[safePresetId] ?? config.presets[config.defaultPresetId];
}

export function resolveFallbackPreset(config, presetId) {
  const safePresetId = isValidAstraVoicePresetId(presetId) ? presetId : config.fallbackPresetId;
  return config.presets[safePresetId] ?? config.presets[config.fallbackPresetId];
}

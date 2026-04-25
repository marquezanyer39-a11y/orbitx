import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { Buffer } from 'buffer';

import { devWarn } from '../utils/devLog';
import {
  LEGACY_ASTRA_BACKEND_URL_ENV_NAME,
  ORBITX_BACKEND_URL_ENV_NAME,
  getAstraVoiceRuntimeConfig,
  hasPremiumAstraVoiceBackend,
} from './astra/astraRuntimeConfig';

export type AstraTTSContext = 'welcome' | 'confirm' | 'alert' | 'explain';
export type AstraTTSStatus = 'idle' | 'loading' | 'speaking' | 'error';

export interface AstraTTSSpeakOptions {
  presetId?: string;
}

export interface AstraTTSState {
  status: AstraTTSStatus;
  isLoading: boolean;
  isSpeaking: boolean;
  error: string | null;
  currentText: string | null;
  currentContext: AstraTTSContext | null;
}

type AstraTTSListener = (state: AstraTTSState) => void;
type PlayerSubscription = { remove: () => void };

export class AstraTTSBackendError extends Error {
  code: string;

  retryable: boolean;

  constructor(message: string, code = 'VOICE_BACKEND_ERROR', retryable = false) {
    super(message);
    this.name = 'AstraTTSBackendError';
    this.code = code;
    this.retryable = retryable;
  }
}

const MAX_TEXT_LENGTH = 520;
const DEFAULT_TIMEOUT_MS = 25_000;
const FILE_PREFIX = 'orbitx-astra-tts';
const TRANSIENT_RETRY_DELAY_MS = 700;

function createInitialState(): AstraTTSState {
  return {
    status: 'idle',
    isLoading: false,
    isSpeaking: false,
    error: null,
    currentText: null,
    currentContext: null,
  };
}

function normalizeText(text: string) {
  return text.replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT_LENGTH);
}

async function readResponseError(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.toLowerCase().includes('application/json')) {
    const data = (await response.json().catch(() => null)) as
      | { error?: string; message?: string; code?: string; retryable?: boolean }
      | null;
    return {
      message: data?.error ?? data?.message ?? 'No pudimos generar la voz de Astra.',
      code: data?.code ?? 'VOICE_BACKEND_ERROR',
      retryable: Boolean(data?.retryable),
    };
  }

  return {
    message: await response.text().catch(() => 'No pudimos generar la voz de Astra.'),
    code: 'VOICE_BACKEND_ERROR',
    retryable: response.status >= 500,
  };
}

class AstraTTSService {
  private readonly listeners = new Set<AstraTTSListener>();

  private readonly preloaded = new Map<string, string>();

  private state = createInitialState();

  private player: AudioPlayer | null = null;

  private playerSubscription: PlayerSubscription | null = null;

  private currentFileUri: string | null = null;

  private requestVersion = 0;

  subscribe(listener: AstraTTSListener) {
    this.listeners.add(listener);
    listener(this.state);

    return () => {
      this.listeners.delete(listener);
    };
  }

  getState() {
    return this.state;
  }

  async speak(
    text: string,
    context: AstraTTSContext = 'explain',
    options: AstraTTSSpeakOptions = {},
  ) {
    const normalizedText = normalizeText(text);
    if (!normalizedText) {
      throw new Error('Astra necesita texto para hablar.');
    }

    const requestVersion = ++this.requestVersion;
    await this.cleanupPlayer();
    const runtimeConfig = getAstraVoiceRuntimeConfig();
    devWarn('[OrbitX][AstraTTS] provider selected', {
      provider: runtimeConfig.provider,
      presetId: options.presetId ?? runtimeConfig.selectedPresetId,
      context,
      backendConfigured: runtimeConfig.premiumBackendConfigured,
    });
    this.setState({
      status: 'loading',
      isLoading: true,
      isSpeaking: false,
      error: null,
      currentText: normalizedText,
      currentContext: context,
    });

    try {
      const cacheKey = this.buildCacheKey(normalizedText, context, options.presetId);
      const cachedUri = this.preloaded.get(cacheKey);
      const fileUri =
        cachedUri ?? (await this.fetchSpeechFile(normalizedText, context, options.presetId));

      if (requestVersion !== this.requestVersion) {
        if (!cachedUri) {
          await this.deleteFileIfExists(fileUri);
        }
        devWarn('[OrbitX][AstraTTS] playback request superseded before audio start', {
          requestVersion,
        });
        return;
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: 'duckOthers',
        shouldPlayInBackground: false,
        allowsRecording: false,
        shouldRouteThroughEarpiece: false,
      });

      const player = createAudioPlayer(
        { uri: fileUri },
        {
          updateInterval: 180,
          keepAudioSessionActive: false,
          preferredForwardBufferDuration: 4,
        },
      );

      player.loop = false;
      player.volume = 1;

      this.player = player;
      this.currentFileUri = fileUri;
      this.playerSubscription = player.addListener('playbackStatusUpdate', (status) => {
        if (requestVersion !== this.requestVersion) {
          return;
        }

        if (status.didJustFinish) {
          void this.finishPlayback();
        }
      });

      this.setState({
        status: 'speaking',
        isLoading: false,
        isSpeaking: true,
        error: null,
        currentText: normalizedText,
        currentContext: context,
      });
      player.play();
    } catch (error) {
      if (requestVersion !== this.requestVersion) {
        return;
      }

      await this.cleanupPlayer();
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : 'No pudimos reproducir la voz de Astra.';
      this.setState({
        status: 'error',
        isLoading: false,
        isSpeaking: false,
        error: message,
        currentText: normalizedText,
        currentContext: context,
      });
      throw error;
    }
  }

  async stop() {
    this.requestVersion += 1;
    devWarn('[OrbitX][AstraTTS] playback interrupted', {
      requestVersion: this.requestVersion,
      currentText: this.state.currentText,
      currentContext: this.state.currentContext,
    });
    await this.cleanupPlayer();
    this.setState(createInitialState());
  }

  async preload(
    text: string,
    context: AstraTTSContext = 'explain',
    options: AstraTTSSpeakOptions = {},
  ) {
    const normalizedText = normalizeText(text);
    if (!normalizedText) {
      return null;
    }

    const cacheKey = this.buildCacheKey(normalizedText, context, options.presetId);
    const cachedUri = this.preloaded.get(cacheKey);
    if (cachedUri) {
      return cachedUri;
    }

    const fileUri = await this.fetchSpeechFile(normalizedText, context, options.presetId);
    this.preloaded.set(cacheKey, fileUri);
    return fileUri;
  }

  private setState(nextState: AstraTTSState) {
    this.state = nextState;
    this.listeners.forEach((listener) => listener(this.state));
  }

  private buildCacheKey(text: string, context: AstraTTSContext, presetId?: string) {
    return `${presetId ?? 'default'}:${context}:${text}`;
  }

  private async finishPlayback() {
    devWarn('[OrbitX][AstraTTS] playback finished', {
      currentText: this.state.currentText,
      currentContext: this.state.currentContext,
    });
    await this.cleanupPlayer();
    this.setState(createInitialState());
  }

  private async cleanupPlayer() {
    if (this.playerSubscription) {
      this.playerSubscription.remove();
      this.playerSubscription = null;
    }

    if (this.player) {
      try {
        this.player.pause();
      } catch {
        // noop
      }

      try {
        this.player.remove();
      } catch {
        // noop
      }

      this.player = null;
    }

    const currentFileUri = this.currentFileUri;
    this.currentFileUri = null;

    if (currentFileUri && !Array.from(this.preloaded.values()).includes(currentFileUri)) {
      await this.deleteFileIfExists(currentFileUri);
    }
  }

  private async fetchSpeechFile(text: string, context: AstraTTSContext, presetId?: string) {
    const runtimeConfig = getAstraVoiceRuntimeConfig();
    const baseUrl = runtimeConfig.backendBaseUrl;
    if (!baseUrl) {
      throw new Error(
        `Configura ${ORBITX_BACKEND_URL_ENV_NAME} para usar la voz oficial de Astra. ${LEGACY_ASTRA_BACKEND_URL_ENV_NAME} queda solo como compatibilidad heredada.`,
      );
    }

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, DEFAULT_TIMEOUT_MS);

      try {
        const response = await fetch(`${baseUrl}/api/voice/astra/speak`, {
          method: 'POST',
          headers: {
            Accept: 'audio/mpeg',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, context, presetId }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorPayload = await readResponseError(response);
          throw new AstraTTSBackendError(
            errorPayload.message,
            errorPayload.code,
            errorPayload.retryable,
          );
        }

        const arrayBuffer = await response.arrayBuffer();
        if (!arrayBuffer.byteLength) {
          throw new Error('Astra no recibio audio desde el servidor.');
        }

        const base64Audio = Buffer.from(arrayBuffer).toString('base64');
        const directory = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
        if (!directory) {
          throw new Error('No pudimos preparar el cache de audio en este dispositivo.');
        }

        const fileUri = `${directory}${FILE_PREFIX}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}.mp3`;

        await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
          encoding: FileSystem.EncodingType.Base64,
        });

        return fileUri;
      } catch (error) {
        const isAbortError = error instanceof Error && error.name === 'AbortError';
        const isNetworkError = error instanceof TypeError;
        const canRetry = attempt === 0 && (isAbortError || isNetworkError);

        if (canRetry) {
          await new Promise<void>((resolve) => {
            setTimeout(resolve, TRANSIENT_RETRY_DELAY_MS);
          });
          continue;
        }

        if (isAbortError) {
          throw new Error('La voz de Astra tardo demasiado. Intenta otra vez.');
        }

        throw error;
      } finally {
        clearTimeout(timeoutId);
      }
    }

    throw new Error('No pudimos generar la voz de Astra.');
  }

  private async deleteFileIfExists(fileUri: string) {
    try {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    } catch {
      // noop
    }
  }
}

export const astraTTS = new AstraTTSService();

export function hasAstraTTSBackend() {
  return hasPremiumAstraVoiceBackend();
}

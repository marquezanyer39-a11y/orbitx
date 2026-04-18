import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';
import type {
  ExpoSpeechRecognitionErrorEvent,
  ExpoSpeechRecognitionResultEvent,
} from 'expo-speech-recognition';

import { getLocaleTag } from '../../constants/i18n';
import { useOrbitStore } from '../../store/useOrbitStore';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { useWalletStore } from '../store/walletStore';
import { executeAstraAction } from '../services/astra/astraActions';
import { hasAstraBrainBackend, requestAstraBrainResponse } from '../services/astra/astraApi';
import { getAstraCapabilities } from '../services/astra/astraCapabilities';
import { buildAstraUnavailableResponse } from '../services/astra/astraCore';
import { getAstraVoiceCopy } from '../services/astra/astraVoiceCopy';
import { getAstraVoiceRuntimeConfig } from '../services/astra/astraRuntimeConfig';
import {
  DEFAULT_ASTRA_VOICE_PRESET_ID,
  buildAstraVoicePresetCatalog,
  getDefaultAstraVoicePresets,
} from '../services/astra/astraVoiceProfiles';
import {
  astraTTS,
  hasAstraTTSBackend,
  AstraTTSBackendError,
  type AstraTTSContext,
  type AstraTTSState,
} from '../services/astraTTS';
import {
  createAstraVoiceSession,
  hasAstraVoiceBackend,
} from '../services/astra/astraVoiceApi';
import {
  mapAstraActionToVoicePayload,
  mapVoiceActionToAstraAction,
} from '../services/astra/astraVoiceActions';
import { useAstraStore } from '../store/astraStore';
import type { AstraResponse, AstraSupportContext } from '../types/astra';
import type {
  AstraResolvedVoicePreset,
  AstraVoiceActionPayload,
  AstraVoiceContextPayload,
  AstraVoiceFeatureFlags,
  AstraVoiceSession,
  AstraVoiceState,
} from '../types/astraVoice';
import { devWarn } from '../utils/devLog';

type SpeechRecognitionModuleType =
  typeof import('expo-speech-recognition').ExpoSpeechRecognitionModule;
type SpeechModuleType = typeof import('expo-speech');
type ListenerHandle = { remove: () => void };
type AstraVoicePermissionResult = { granted: boolean };
type RecognitionPreflightResult = {
  chosenServicePackage: string | null;
};

const PREFERRED_ANDROID_RECOGNITION_SERVICES = [
  'com.google.android.as',
  'com.google.android.googlequicksearchbox',
  'com.samsung.android.bixby.agent',
  'com.google.android.tts',
] as const;

function createFriendlyVoiceError(message: string) {
  return message.trim() || 'No pudimos conectar con Astra. Intenta otra vez.';
}

function buildStaleVoiceBuildMessage(language: AstraSupportContext['language']) {
  return language === 'es'
    ? 'Tu app instalada no incluye el modulo de voz actual. Reinstala la Development Build de OrbitX.'
    : 'Your installed app does not include the current voice module. Reinstall the OrbitX development build.';
}

function buildMissingRecognitionServiceMessage(language: AstraSupportContext['language']) {
  return language === 'es'
    ? 'No encontramos un servicio de reconocimiento de voz disponible en tu Android. Instala o activa Google Speech Services y vuelve a intentarlo.'
    : 'We could not find a speech recognition service on your Android device. Install or enable Google Speech Services and try again.';
}

function buildRecognitionUnavailableMessage(language: AstraSupportContext['language']) {
  return language === 'es'
    ? 'El reconocimiento de voz no esta disponible en este dispositivo. Revisa que Google Speech Services este activo.'
    : 'Speech recognition is not available on this device. Check that Google Speech Services is enabled.';
}

function chooseRecognitionService(
  installedServices: string[],
  defaultServicePackage: string | null,
) {
  if (defaultServicePackage && installedServices.includes(defaultServicePackage)) {
    return defaultServicePackage;
  }

  const preferredService = PREFERRED_ANDROID_RECOGNITION_SERVICES.find((servicePackage) =>
    installedServices.includes(servicePackage),
  );

  return preferredService ?? installedServices[0] ?? null;
}

function buildFeatureFlags(context: AstraSupportContext | null): AstraVoiceFeatureFlags {
  if (!context) {
    return {
      wallet: false,
      createWallet: false,
      importWallet: false,
      externalWallet: false,
      trade: false,
      markets: true,
      convert: false,
      buy: false,
      sell: false,
      pay: false,
      social: false,
      pool: false,
      p2p: false,
      security: false,
    };
  }

  const capabilities = getAstraCapabilities(context);
  return {
    wallet: capabilities.hasWalletModule,
    createWallet: capabilities.hasWalletCreate,
    importWallet: capabilities.hasWalletImport,
    externalWallet: capabilities.hasExternalWalletConnect,
    trade: capabilities.hasTradeModule,
    markets: true,
    convert: capabilities.hasRampConvert,
    buy: capabilities.hasRampBuy,
    sell: capabilities.hasRampSell,
    pay: capabilities.hasRampPay,
    social: capabilities.hasSocial,
    pool: capabilities.hasMonthlyRewardsPool,
    p2p: capabilities.hasP2P,
    security: capabilities.hasSecurityCenter,
  };
}

function mapSurfaceToVoiceScreen(
  surface?: AstraSupportContext['surface'],
): AstraVoiceContextPayload['screen'] {
  switch (surface) {
    case 'create_token':
      return 'create_token';
    case 'wallet':
      return 'wallet';
    case 'trade':
      return 'trade';
    case 'market':
      return 'market';
    case 'social':
      return 'social';
    case 'bot_futures':
      return 'bot_futures';
    case 'security':
      return 'security';
    case 'settings':
      return 'settings';
    case 'profile':
      return 'profile';
    case 'pool':
      return 'pool';
    case 'ramp':
      return 'ramp';
    case 'home':
      return 'home';
    default:
      return 'general';
  }
}

function findSpeechLocale(language: AstraSupportContext['language']) {
  return getLocaleTag(language);
}

function inferTtsContext(text: string): AstraTTSContext {
  const normalized = text.toLowerCase();

  if (/alerta|riesgo|confirma|revisa|cuidado|warning|atencion/.test(normalized)) {
    return 'alert';
  }

  if (/listo|confirm|complet|hecho|correctamente/.test(normalized)) {
    return 'confirm';
  }

  if (/hola|bienvenido|soy astra/.test(normalized)) {
    return 'welcome';
  }

  return 'explain';
}

function isExpoGoLikeEnvironment() {
  return Constants.executionEnvironment === 'storeClient';
}

function isExpired(session: AstraVoiceSession | null) {
  if (!session) {
    return true;
  }

  return new Date(session.expiresAt).getTime() <= Date.now() + 30_000;
}

function buildFallbackSession(): AstraVoiceSession {
  const runtimeConfig = getAstraVoiceRuntimeConfig();
  return {
    sessionId: `astra-local-${Date.now()}`,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    state: 'ready',
    transport: 'turn_based_voice',
    voiceOutput: runtimeConfig.outputMode,
    speechInput: 'native_stt',
    model: hasAstraBrainBackend() ? 'orbitx-astra-brain' : 'local-astra-fallback',
  };
}

function buildFallbackSuggestions(response: AstraResponse) {
  const suggestions = [
    ...response.actions.map((action) => action.label),
    ...(response.steps ?? []),
  ];

  return Array.from(new Set(suggestions.filter(Boolean))).slice(0, 4);
}

export function useAstraVoice() {
  const context = useAstraStore((state) => state.context);
  const isVoiceOpen = useAstraStore((state) => state.isVoiceOpen);
  const voiceAutoStartRequested = useAstraStore((state) => state.voiceAutoStartRequested);
  const voicePreferences = useAstraStore((state) => state.voicePreferences);
  const consumeVoiceAutoStart = useAstraStore((state) => state.consumeVoiceAutoStart);
  const setSelectedVoicePresetId = useAstraStore((state) => state.setSelectedVoicePresetId);
  const closeVoice = useAstraStore((state) => state.closeVoice);
  const appendUserMessage = useAstraStore((state) => state.appendUserMessage);
  const pushAssistantResponse = useAstraStore((state) => state.pushAssistantResponse);
  const language = useOrbitStore((state) => state.settings.language);
  const profile = useAuthStore((state) => state.profile);
  const walletReady = useWalletStore((state) => state.isWalletReady);
  const web3Assets = useWalletStore((state) => state.assets);
  const spotBalances = useWalletStore((state) => state.spotBalances);
  const emailVerified = useAuthStore((state) => state.session.emailConfirmed);
  const showToast = useUiStore((state) => state.showToast);
  const copy = getAstraVoiceCopy(language);

  const [state, setState] = useState<AstraVoiceState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [responseText, setResponseText] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [responseActions, setResponseActions] = useState<AstraVoiceActionPayload[]>([]);
  const [inputLevel, setInputLevel] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [voicePresets, setVoicePresets] = useState<AstraResolvedVoicePreset[]>(
    getDefaultAstraVoicePresets(),
  );
  const [ttsState, setTtsState] = useState<AstraTTSState>(() => astraTTS.getState());

  const recognitionModuleRef = useRef<SpeechRecognitionModuleType | null>(null);
  const speechModuleRef = useRef<SpeechModuleType | null>(null);
  const listenerHandlesRef = useRef<ListenerHandle[]>([]);
  const sessionRef = useRef<AstraVoiceSession | null>(null);
  const finalTranscriptRef = useRef('');
  const isMountedRef = useRef(true);
  const startConversationRef = useRef<(() => Promise<void>) | null>(null);
  const resumeConversationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef<AstraVoiceState>('idle');
  const pendingAutoResumeRef = useRef(false);
  const speechPlaybackActiveRef = useRef(false);
  const deviceSpeechPlaybackIdRef = useRef(0);
  const premiumVoiceBlockedUntilRef = useRef(0);
  const premiumVoiceFailureCodeRef = useRef<string | null>(null);
  const voiceFallbackNoticeShownRef = useRef(false);

  const hasFunds = useMemo(
    () =>
      web3Assets.some((asset) => asset.usdValue > 0) ||
      spotBalances.some((asset) => asset.amount > 0),
    [spotBalances, web3Assets],
  );

  const portfolioValue = useMemo(
    () =>
      web3Assets.reduce((sum, asset) => sum + asset.usdValue, 0) +
      spotBalances.reduce((sum, asset) => sum + asset.amount, 0),
    [spotBalances, web3Assets],
  );

  const voiceContext = useMemo<AstraVoiceContextPayload | null>(() => {
    if (!context) {
      return null;
    }

    return {
      userId: profile.orbitId,
      screen: mapSurfaceToVoiceScreen(context.surface),
      hasWallet: Boolean(walletReady),
      isVerified: Boolean(emailVerified),
      hasFunds,
      language,
      username: profile.name,
      portfolioValue,
      selectedToken: context.currentPairSymbol ?? null,
      summary: context.summary,
      errorTitle: context.errorTitle,
      errorBody: context.errorBody,
      features: buildFeatureFlags(context),
    };
  }, [context, emailVerified, hasFunds, language, portfolioValue, profile.name, walletReady]);

  const astraBrainSnapshot = useMemo(
    () => ({
      userId: profile.orbitId,
      username: profile.name,
      language,
      hasWallet: Boolean(walletReady),
      isVerified: Boolean(emailVerified),
      hasFunds,
      portfolioValue,
    }),
    [emailVerified, hasFunds, language, portfolioValue, profile.name, profile.orbitId, walletReady],
  );

  const selectedVoicePreset = useMemo(
    () =>
      voicePresets.find((preset) => preset.id === voicePreferences.selectedPresetId) ??
      voicePresets.find((preset) => preset.id === DEFAULT_ASTRA_VOICE_PRESET_ID) ??
      voicePresets[0] ??
      getDefaultAstraVoicePresets().find((preset) => preset.id === DEFAULT_ASTRA_VOICE_PRESET_ID) ??
      getDefaultAstraVoicePresets()[0],
    [voicePreferences.selectedPresetId, voicePresets],
  );

  const setVoiceState = useCallback(
    (nextState: AstraVoiceState, reason: string) => {
      setState((current) => {
        if (current !== nextState) {
          devWarn('[OrbitX][AstraVoice] state transition', {
            from: current,
            to: nextState,
            reason,
          });
        } else {
          devWarn('[OrbitX][AstraVoice] state reaffirmed', {
            state: nextState,
            reason,
          });
        }

        stateRef.current = nextState;
        return nextState;
      });
    },
    [],
  );

  const resetTransientState = useCallback(() => {
    pendingAutoResumeRef.current = false;
    speechPlaybackActiveRef.current = false;
    voiceFallbackNoticeShownRef.current = false;
    setVoiceState('idle', 'reset-transient-state');
    setErrorMessage(null);
    setTranscript('');
    setResponseText('');
    setInputLevel(0);
    setSuggestions([]);
    setResponseActions([]);
  }, [setVoiceState]);

  const clearResumeConversationTimeout = useCallback(() => {
    if (resumeConversationTimeoutRef.current) {
      clearTimeout(resumeConversationTimeoutRef.current);
      resumeConversationTimeoutRef.current = null;
      devWarn('[OrbitX][AstraVoice] cleared auto-resume timer');
    }
  }, []);

  const cleanupListeners = useCallback(() => {
    listenerHandlesRef.current.forEach((subscription) => {
      subscription.remove();
    });
    listenerHandlesRef.current = [];
  }, []);

  const ensureSpeechModule = useCallback(async () => {
    if (speechModuleRef.current) {
      return speechModuleRef.current;
    }

    const module = await import('expo-speech');
    speechModuleRef.current = module;
    return module;
  }, []);

  const stopSpeaking = useCallback(async () => {
    const wasPlaybackActive = speechPlaybackActiveRef.current;
    pendingAutoResumeRef.current = false;
    speechPlaybackActiveRef.current = false;
    deviceSpeechPlaybackIdRef.current += 1;
    clearResumeConversationTimeout();

    if (wasPlaybackActive) {
      devWarn('[OrbitX][AstraVoice] audio playback interrupted', {
        state: stateRef.current,
      });
    }

    try {
      if (hasAstraTTSBackend()) {
        await astraTTS.stop();
      } else {
        const speechModule = speechModuleRef.current;
        if (speechModule) {
          await speechModule.stop();
        }
      }
    } catch (error) {
      devWarn('[OrbitX][AstraVoice] stopSpeaking failed', error);
    }
  }, [clearResumeConversationTimeout]);

  const setFriendlyError = useCallback((message: string) => {
    if (!isMountedRef.current) {
      return;
    }

    clearResumeConversationTimeout();
    pendingAutoResumeRef.current = false;
    speechPlaybackActiveRef.current = false;
    setErrorMessage(createFriendlyVoiceError(message));
    setVoiceState('error', 'friendly-error');
  }, [clearResumeConversationTimeout, setVoiceState]);

  const ensureRecognitionModule = useCallback(async () => {
    if (recognitionModuleRef.current) {
      return recognitionModuleRef.current;
    }

    if (isExpoGoLikeEnvironment()) {
      throw new Error(copy.unavailableInExpoGo);
    }

    try {
      const module = await import('expo-speech-recognition');
      const recognitionModule = module.ExpoSpeechRecognitionModule;
      if (!recognitionModule) {
        throw new Error(buildStaleVoiceBuildMessage(language));
      }

      recognitionModuleRef.current = recognitionModule;
      return recognitionModule;
    } catch (error) {
      devWarn('[OrbitX][AstraVoice] recognition module unavailable', error);
      throw new Error(buildStaleVoiceBuildMessage(language));
    }
  }, [copy.unavailableInExpoGo, language]);

  const inspectRecognitionEnvironment = useCallback(
    async (
      recognitionModule: SpeechRecognitionModuleType,
    ): Promise<RecognitionPreflightResult> => {
      let installedServices: string[] = [];
      let defaultServicePackage: string | null = null;
      let recognitionAvailable = true;

      try {
        installedServices = recognitionModule.getSpeechRecognitionServices() ?? [];
      } catch (error) {
        devWarn('[OrbitX][AstraVoice] getSpeechRecognitionServices failed', error);
      }

      try {
        defaultServicePackage =
          recognitionModule.getDefaultRecognitionService?.().packageName ?? null;
      } catch (error) {
        devWarn('[OrbitX][AstraVoice] getDefaultRecognitionService failed', error);
      }

      try {
        recognitionAvailable = recognitionModule.isRecognitionAvailable();
      } catch (error) {
        devWarn('[OrbitX][AstraVoice] isRecognitionAvailable failed', error);
      }

      devWarn('[OrbitX][AstraVoice] recognition diagnostics', {
        installedServices,
        defaultServicePackage,
        recognitionAvailable,
        supportsOnDeviceRecognition: recognitionModule.supportsOnDeviceRecognition?.(),
        supportsRecording: recognitionModule.supportsRecording?.(),
      });

      if (!recognitionAvailable) {
        if (!installedServices.length) {
          throw new Error(buildMissingRecognitionServiceMessage(language));
        }

        throw new Error(buildRecognitionUnavailableMessage(language));
      }

      return {
        chosenServicePackage:
          Platform.OS === 'android'
            ? chooseRecognitionService(installedServices, defaultServicePackage)
            : null,
      };
    },
    [language],
  );

  const loadVoicePresets = useCallback(async () => {
    try {
      const runtimeConfig = getAstraVoiceRuntimeConfig();
      const speechModule = await ensureSpeechModule();
      const deviceVoices = await speechModule.getAvailableVoicesAsync();
      if (!isMountedRef.current) {
        return;
      }

      const presets = buildAstraVoicePresetCatalog(deviceVoices, language);
      setVoicePresets(presets);
      if (!presets.some((preset) => preset.id === voicePreferences.selectedPresetId)) {
        setSelectedVoicePresetId(DEFAULT_ASTRA_VOICE_PRESET_ID);
      }
      devWarn('[OrbitX][AstraVoice] runtime voice configured', {
        provider: runtimeConfig.provider,
        presetId: voicePreferences.selectedPresetId,
        allowDeviceFallback: runtimeConfig.allowDeviceFallback,
      });
    } catch (error) {
      devWarn('[OrbitX][AstraVoice] getAvailableVoicesAsync failed', error);
      setVoicePresets(getDefaultAstraVoicePresets());
    }
  }, [
    ensureSpeechModule,
    language,
    setSelectedVoicePresetId,
    voicePreferences.selectedPresetId,
  ]);

  const ensureSession = useCallback(async (): Promise<AstraVoiceSession> => {
    if (!voiceContext) {
      throw new Error('Astra context is not available.');
    }

    if (!isExpired(sessionRef.current)) {
      return sessionRef.current as AstraVoiceSession;
    }

    setVoiceState('processing', 'ensure-session');
    let session: AstraVoiceSession;

    try {
      session = hasAstraVoiceBackend()
        ? await createAstraVoiceSession(voiceContext)
        : buildFallbackSession();
    } catch (error) {
      devWarn('[OrbitX][AstraVoice] session creation failed, using fallback', error);
      session = buildFallbackSession();
    }

    sessionRef.current = session;
    return session;
  }, [voiceContext]);

  const pauseForSilence = useCallback(() => {
    clearResumeConversationTimeout();
    pendingAutoResumeRef.current = false;
    finalTranscriptRef.current = '';
    setTranscript('');
    setInputLevel(0);
    setErrorMessage(null);
    setVoiceState('paused', 'pause-for-silence');
    setSuggestions([]);
    setResponseActions([]);
    setResponseText(copy.silencePaused);
  }, [clearResumeConversationTimeout, copy.silencePaused, setVoiceState]);

  const scheduleConversationResume = useCallback(
    (reason: string, delayMs: number) => {
      clearResumeConversationTimeout();
      resumeConversationTimeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current || !useAstraStore.getState().isVoiceOpen) {
          return;
        }

        if (speechPlaybackActiveRef.current || stateRef.current === 'speaking') {
          devWarn('[OrbitX][AstraVoice] skipped auto-resume while still speaking', {
            reason,
            state: stateRef.current,
          });
          return;
        }

        finalTranscriptRef.current = '';
        setTranscript('');
        setInputLevel(0);
        setErrorMessage(null);
        devWarn('[OrbitX][AstraVoice] auto-resume listening', { reason });
        void startConversationRef.current?.();
      }, delayMs);
    },
    [clearResumeConversationTimeout],
  );

  const handleSpeechPlaybackFinished = useCallback(
    (reason: string) => {
      const shouldContinueListening =
        pendingAutoResumeRef.current &&
        useAstraStore.getState().isVoiceOpen &&
        voicePreferences.voiceInputEnabled;

      devWarn('[OrbitX][AstraVoice] speech playback finished', {
        reason,
        shouldContinueListening,
      });

      pendingAutoResumeRef.current = false;
      speechPlaybackActiveRef.current = false;
      finalTranscriptRef.current = '';
      setTranscript('');
      setInputLevel(0);
      setErrorMessage(null);
      setVoiceState('idle', `${reason}:speech-ended`);

      if (shouldContinueListening) {
        scheduleConversationResume(`${reason}:after-speech`, 180);
      }
    },
    [scheduleConversationResume, setVoiceState, voicePreferences.voiceInputEnabled],
  );

  const speakResponse = useCallback(
    async (text: string, contextHint?: AstraTTSContext) => {
      if (!voicePreferences.voiceOutputEnabled || voicePreferences.muted || !text.trim()) {
        return;
      }

      const runtimeConfig = getAstraVoiceRuntimeConfig();
      devWarn('[OrbitX][AstraVoice] TTS runtime selected', {
        provider: runtimeConfig.provider,
        presetId: selectedVoicePreset.id,
        allowDeviceFallback: runtimeConfig.allowDeviceFallback,
      });

      const notifyExplicitFallback = (reason: string) => {
        if (voiceFallbackNoticeShownRef.current) {
          return;
        }

        voiceFallbackNoticeShownRef.current = true;
        showToast(
          reason === 'VOICE_QUOTA_EXCEEDED'
            ? language === 'es'
              ? 'La voz premium de Astra no esta disponible porque ElevenLabs se quedo sin creditos. Usaremos una voz local temporalmente.'
              : 'Astra premium voice is unavailable because the ElevenLabs account is out of credits. We will use a temporary local voice.'
            : language === 'es'
              ? 'La voz premium de Astra no esta disponible. Usaremos una voz local temporalmente.'
              : 'Astra premium voice is unavailable. We will use a temporary local voice.',
          'info',
        );
        devWarn('[OrbitX][AstraVoice] explicit device fallback notice', { reason });
      };

      const playWithDeviceSpeech = async () => {
        const playbackId = deviceSpeechPlaybackIdRef.current + 1;
        deviceSpeechPlaybackIdRef.current = playbackId;
        speechPlaybackActiveRef.current = true;
        const locale = selectedVoicePreset.language ?? findSpeechLocale(language);
        devWarn('[OrbitX][AstraVoice] device TTS selected', {
          presetId: selectedVoicePreset.id,
          matchedVoiceName: selectedVoicePreset.matchedVoiceName,
          voiceIdentifier: selectedVoicePreset.voiceIdentifier,
          locale,
        });
        setVoiceState('speaking', 'device-speech-start');

        const speechModule = await ensureSpeechModule();

        speechModule.speak(text, {
          language: locale,
          pitch: selectedVoicePreset.pitch,
          rate: selectedVoicePreset.rate,
          voice: selectedVoicePreset.voiceIdentifier ?? undefined,
          onDone: () => {
            if (isMountedRef.current && playbackId === deviceSpeechPlaybackIdRef.current) {
              handleSpeechPlaybackFinished('device-tts-done');
            }
          },
          onStopped: () => {
            if (isMountedRef.current && playbackId === deviceSpeechPlaybackIdRef.current) {
              handleSpeechPlaybackFinished('device-tts-stopped');
            }
          },
          onError: () => {
            if (playbackId !== deviceSpeechPlaybackIdRef.current) {
              return;
            }

            speechPlaybackActiveRef.current = false;
            pendingAutoResumeRef.current = false;
            if (isMountedRef.current) {
              setFriendlyError(
                language === 'es'
                  ? 'No pudimos reproducir la voz de Astra.'
                  : 'We could not play Astra voice.',
              );
            }
          },
        });
      };

      const premiumVoiceBlocked =
        premiumVoiceBlockedUntilRef.current > Date.now() &&
        premiumVoiceFailureCodeRef.current !== null;

      if (premiumVoiceBlocked) {
        devWarn('[OrbitX][AstraVoice] premium TTS temporarily bypassed', {
          code: premiumVoiceFailureCodeRef.current,
          blockedUntil: premiumVoiceBlockedUntilRef.current,
        });
        if (!runtimeConfig.allowDeviceFallback) {
          setFriendlyError(
            language === 'es'
              ? 'La voz premium de Astra sigue no disponible en este momento.'
              : 'Astra premium voice is still unavailable right now.',
          );
          return;
        }

        notifyExplicitFallback('premium-bypassed');
        await playWithDeviceSpeech();
        return;
      }

      if (hasAstraTTSBackend()) {
        try {
          speechPlaybackActiveRef.current = true;
          setVoiceState('processing', 'tts-request-start');
          await astraTTS.speak(text, contextHint ?? inferTtsContext(text), {
            presetId: selectedVoicePreset.id,
          });
          return;
        } catch (error) {
          speechPlaybackActiveRef.current = false;
          pendingAutoResumeRef.current = false;
          devWarn('[OrbitX][AstraVoice] premium voice failed', error);
          if (error instanceof AstraTTSBackendError) {
            premiumVoiceFailureCodeRef.current = error.code;
            premiumVoiceBlockedUntilRef.current = Date.now() + (error.retryable ? 60_000 : 10 * 60_000);
          } else {
            premiumVoiceFailureCodeRef.current = 'VOICE_UNKNOWN_ERROR';
            premiumVoiceBlockedUntilRef.current = Date.now() + 60_000;
          }

          if (!runtimeConfig.allowDeviceFallback) {
            setFriendlyError(
              language === 'es'
                ? 'La voz premium de Astra no esta disponible en este momento. Intenta de nuevo en unos segundos.'
                : 'Astra premium voice is not available right now. Try again in a few seconds.',
            );
            return;
          }

          notifyExplicitFallback(
            error instanceof AstraTTSBackendError ? error.code : 'VOICE_UNKNOWN_ERROR',
          );
        }
      }

      if (!runtimeConfig.allowDeviceFallback) {
        setFriendlyError(
          language === 'es'
            ? 'La voz premium de Astra no esta configurada para esta build.'
            : 'Astra premium voice is not configured for this build.',
        );
        return;
      }

      devWarn('[OrbitX][AstraVoice] device TTS fallback triggered', {
        provider: runtimeConfig.provider,
        presetId: selectedVoicePreset.id,
        premiumFailureCode: premiumVoiceFailureCodeRef.current,
      });
      await playWithDeviceSpeech();
    },
    [
      ensureSpeechModule,
      language,
      showToast,
      selectedVoicePreset.id,
      selectedVoicePreset.language,
      selectedVoicePreset.pitch,
      selectedVoicePreset.rate,
      selectedVoicePreset.voiceIdentifier,
      handleSpeechPlaybackFinished,
      setFriendlyError,
      setVoiceState,
      voicePreferences.muted,
      voicePreferences.voiceOutputEnabled,
    ],
  );

  const runVoiceAction = useCallback(
    (action: AstraVoiceActionPayload) => {
      if (!context) {
        return;
      }

      const mappedAction = mapVoiceActionToAstraAction(action, language);
      if (!mappedAction) {
        return;
      }

      executeAstraAction({
        action: mappedAction,
        context,
        router,
      });
    },
    [context, language],
  );

  const resolveReply = useCallback(
    async (spokenText: string): Promise<AstraResponse> => {
      await ensureSession();
      if (!context || !voiceContext) {
        throw new Error('Astra context is not available.');
      }

      if (hasAstraBrainBackend()) {
        try {
          return await requestAstraBrainResponse({
            question: spokenText,
            context,
            memory: useAstraStore.getState().memory,
            snapshot: astraBrainSnapshot,
            channel: 'voice',
          });
        } catch (error) {
          devWarn('[OrbitX][AstraVoice] backend voice reply failed, using unavailable response', error);

          return buildAstraUnavailableResponse({
            context,
            channel: 'voice',
            reason:
              error instanceof Error
                ? error.message
                : language === 'es'
                  ? 'No pudimos conectar con Astra.'
                  : 'We could not connect to Astra.',
            retryQuestion: spokenText,
          });
        }
      }

      return buildAstraUnavailableResponse({
        context,
        channel: 'voice',
        reason: 'Astra backend is not configured.',
        retryQuestion: spokenText,
      });
    },
    [astraBrainSnapshot, context, ensureSession, language, voiceContext],
  );

  const sendTranscript = useCallback(
    async (spokenText: string) => {
      const cleaned = spokenText.trim();
      if (!voiceContext || !cleaned) {
        setVoiceState('idle', 'empty-transcript');
        return;
      }

      try {
        appendUserMessage(cleaned);
        setVoiceState('processing', 'send-transcript');
        setErrorMessage(null);
        const astraResponse = await resolveReply(cleaned);
        if (!isMountedRef.current) {
          return;
        }

        pushAssistantResponse(astraResponse);
        setResponseText(astraResponse.body);
        setSuggestions(buildFallbackSuggestions(astraResponse));
        setResponseActions(
          astraResponse.actions
            .map((action) => mapAstraActionToVoicePayload(action))
            .filter((action): action is AstraVoiceActionPayload => Boolean(action)),
        );

        const shouldContinueListening =
          useAstraStore.getState().isVoiceOpen && voicePreferences.voiceInputEnabled;

        if (voicePreferences.autoPlayResponses && voicePreferences.voiceOutputEnabled) {
          pendingAutoResumeRef.current = shouldContinueListening;
          devWarn('[OrbitX][AstraVoice] waiting for speech completion before resume', {
            shouldContinueListening,
          });
          setVoiceState('processing', 'awaiting-tts-playback');
          void speakResponse(astraResponse.body);
        } else {
          pendingAutoResumeRef.current = false;
          setVoiceState('idle', 'response-ready-without-tts');
          if (shouldContinueListening) {
            scheduleConversationResume('response-without-tts', 900);
          }
        }
      } catch (error) {
        devWarn('[OrbitX][AstraVoice] sendTranscript failed', error);
        const message =
          error instanceof Error
            ? error.message
            : language === 'es'
              ? 'No pudimos conectar con Astra. Intenta otra vez.'
              : 'We could not connect to Astra. Try again.';
        setFriendlyError(message);
      }
    },
    [
      appendUserMessage,
      language,
      pushAssistantResponse,
      resolveReply,
      scheduleConversationResume,
      setFriendlyError,
      setVoiceState,
      speakResponse,
      voiceContext,
      voicePreferences.voiceInputEnabled,
      voicePreferences.autoPlayResponses,
      voicePreferences.voiceOutputEnabled,
    ],
  );

  const stopListening = useCallback(async () => {
    clearResumeConversationTimeout();
    const recognitionModule = recognitionModuleRef.current;
    if (!recognitionModule) {
      setVoiceState('idle', 'stop-listening-without-module');
      return;
    }

    try {
      recognitionModule.stop();
    } catch (error) {
      devWarn('[OrbitX][AstraVoice] stopListening failed', error);
    }
    setVoiceState('idle', 'stop-listening');
  }, [clearResumeConversationTimeout, setVoiceState]);

  const attachRecognitionListeners = useCallback(
    async (recognitionModule: SpeechRecognitionModuleType) => {
      cleanupListeners();

      listenerHandlesRef.current = [
        recognitionModule.addListener('result', (event: ExpoSpeechRecognitionResultEvent) => {
          const latestResult = event.results.at(-1)?.transcript?.trim() ?? '';
          if (!latestResult) {
            return;
          }

          finalTranscriptRef.current = latestResult;
          setTranscript(latestResult);

          if (event.isFinal) {
            setVoiceState('processing', 'recognition-final-result');
            void sendTranscript(latestResult);
          }
        }),
        recognitionModule.addListener('error', (event: ExpoSpeechRecognitionErrorEvent) => {
          if (event.error === 'aborted') {
            if (speechPlaybackActiveRef.current || stateRef.current === 'speaking') {
              devWarn('[OrbitX][AstraVoice] ignored aborted recognition during playback');
              return;
            }

            setVoiceState('idle', 'recognition-aborted');
            return;
          }

          devWarn('[OrbitX][AstraVoice] recognition error', event);

          if (event.error === 'not-allowed') {
            setPermissionDenied(true);
            setFriendlyError(copy.permissionBody);
            return;
          }

          if (event.error === 'service-not-allowed') {
            setFriendlyError(buildRecognitionUnavailableMessage(language));
            return;
          }

          if (event.error === 'busy') {
            setFriendlyError(
              language === 'es'
                ? 'Astra ya esta usando el microfono. Espera un momento e intenta otra vez.'
                : 'Astra is already using the microphone. Wait a moment and try again.',
            );
            return;
          }

          if (event.error === 'no-speech') {
            if (speechPlaybackActiveRef.current || stateRef.current === 'speaking') {
              devWarn('[OrbitX][AstraVoice] ignored no-speech while Astra playback was active');
              return;
            }

            pauseForSilence();
            return;
          }

          setFriendlyError(
            language === 'es'
              ? 'Se perdio la conexion de voz. Intenta otra vez.'
              : 'The voice connection was lost. Try again.',
          );
        }),
        recognitionModule.addListener('volumechange', (event: { value: number }) => {
          setInputLevel(Math.max(0, Math.min((event.value + 2) / 12, 1)));
        }),
        recognitionModule.addListener('end', () => {
          setInputLevel(0);
          if (speechPlaybackActiveRef.current || stateRef.current === 'speaking') {
            devWarn('[OrbitX][AstraVoice] ignored recognition end while speaking');
            return;
          }

          if (finalTranscriptRef.current.trim()) {
            return;
          }

          pauseForSilence();
        }),
      ];
    },
    [
      cleanupListeners,
      copy.permissionBody,
      language,
      pauseForSilence,
      sendTranscript,
      setFriendlyError,
      setVoiceState,
    ],
  );

  const requestPermission = useCallback(async () => {
    const recognitionModule = await ensureRecognitionModule();
    setVoiceState('processing', 'request-microphone-permission');

    const permissionResult: AstraVoicePermissionResult =
      await recognitionModule.requestPermissionsAsync();

    if (!permissionResult.granted) {
      setPermissionDenied(true);
      setFriendlyError(copy.permissionBody);
      return false;
    }

    setPermissionDenied(false);
    return true;
  }, [copy.permissionBody, ensureRecognitionModule, setFriendlyError, setVoiceState]);

  const startConversation = useCallback(async () => {
    if (!voicePreferences.voiceInputEnabled) {
      setFriendlyError(
        language === 'es'
          ? 'La entrada por voz esta desactivada. Actívala para hablar con Astra.'
          : 'Voice input is disabled. Enable it to talk to Astra.',
      );
      return;
    }

    if (speechPlaybackActiveRef.current || stateRef.current === 'speaking') {
      devWarn('[OrbitX][AstraVoice] startConversation blocked while Astra is still speaking', {
        state: stateRef.current,
      });
      return;
    }

    if (stateRef.current === 'listening') {
      devWarn('[OrbitX][AstraVoice] startConversation ignored because listening is already active');
      return;
    }

    try {
      clearResumeConversationTimeout();
      await stopSpeaking();
      setErrorMessage(null);
      finalTranscriptRef.current = '';
      setTranscript('');
      setInputLevel(0);

      const granted = await requestPermission();
      if (!granted) {
        return;
      }

      const recognitionModule = await ensureRecognitionModule();
      const { chosenServicePackage } = await inspectRecognitionEnvironment(recognitionModule);
      await attachRecognitionListeners(recognitionModule);

      setVoiceState('listening', 'recognition-started');
      recognitionModule.start({
        lang: findSpeechLocale(language),
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
        addsPunctuation: true,
        contextualStrings: [
          'OrbitX',
          'Astra',
          'Wallet',
          'Spot',
          'Mercados',
          'Transak',
          'MoonPay',
          'BTC',
          'ETH',
          'USDT',
        ],
        volumeChangeEventOptions: {
          enabled: true,
          intervalMillis: 90,
        },
        ...(chosenServicePackage
          ? { androidRecognitionServicePackage: chosenServicePackage }
          : {}),
      });
    } catch (error) {
      devWarn('[OrbitX][AstraVoice] startConversation failed', error);
      setFriendlyError(
        error instanceof Error ? error.message : copy.unavailableInExpoGo,
      );
    }
  }, [
    attachRecognitionListeners,
    clearResumeConversationTimeout,
    copy.unavailableInExpoGo,
    ensureRecognitionModule,
    inspectRecognitionEnvironment,
    language,
    requestPermission,
    setFriendlyError,
    setVoiceState,
    stopSpeaking,
    voicePreferences.voiceInputEnabled,
  ]);

  useEffect(() => {
    startConversationRef.current = startConversation;
  }, [startConversation]);

  const cancelConversation = useCallback(async () => {
    clearResumeConversationTimeout();
    const recognitionModule = recognitionModuleRef.current;

    if (recognitionModule) {
      try {
        recognitionModule.abort();
      } catch (error) {
        devWarn('[OrbitX][AstraVoice] abort failed', error);
      }
    }

    await stopSpeaking();
    finalTranscriptRef.current = '';
    setInputLevel(0);
    setVoiceState('idle', 'cancel-conversation');
  }, [clearResumeConversationTimeout, setVoiceState, stopSpeaking]);

  const replayLastResponse = useCallback(async () => {
    if (!responseText.trim()) {
      showToast(copy.emptyResponse, 'info');
      return;
    }

    await stopSpeaking();
    await speakResponse(responseText);
  }, [copy.emptyResponse, responseText, showToast, speakResponse, stopSpeaking]);

  const submitSuggestion = useCallback(
    async (question: string) => {
      await stopSpeaking();
      setTranscript(question);
      finalTranscriptRef.current = question;
      await sendTranscript(question);
    },
    [sendTranscript, stopSpeaking],
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => astraTTS.subscribe(setTtsState), []);

  useEffect(() => {
    if (!hasAstraTTSBackend()) {
      return;
    }

    if (ttsState.status === 'loading') {
      speechPlaybackActiveRef.current = true;
      setVoiceState('processing', 'tts-loading');
      return;
    }

    if (ttsState.status === 'speaking') {
      speechPlaybackActiveRef.current = true;
      setVoiceState('speaking', 'tts-speaking');
      return;
    }

    if (ttsState.status === 'idle') {
      if (speechPlaybackActiveRef.current || stateRef.current === 'speaking') {
        handleSpeechPlaybackFinished('tts-backend-idle');
      }
      return;
    }

    if (ttsState.status === 'error' && ttsState.error) {
      speechPlaybackActiveRef.current = false;
      pendingAutoResumeRef.current = false;
      setFriendlyError(ttsState.error);
    }
  }, [handleSpeechPlaybackFinished, setFriendlyError, setVoiceState, ttsState.error, ttsState.status]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background' || nextState === 'inactive') {
        void cancelConversation();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [cancelConversation]);

  useEffect(() => {
    if (!isVoiceOpen) {
      void cancelConversation();
      clearResumeConversationTimeout();
      cleanupListeners();
      return;
    }

    resetTransientState();
    void loadVoicePresets();
    return () => {
      cleanupListeners();
    };
  }, [
    cancelConversation,
    clearResumeConversationTimeout,
    cleanupListeners,
    isVoiceOpen,
    loadVoicePresets,
    resetTransientState,
  ]);

  useEffect(() => {
    if (!isVoiceOpen || !voiceAutoStartRequested) {
      return;
    }

    consumeVoiceAutoStart();
    void startConversation();
  }, [consumeVoiceAutoStart, isVoiceOpen, startConversation, voiceAutoStartRequested]);

  const openSettings = useCallback(async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      devWarn('[OrbitX][AstraVoice] openSettings failed', error);
    }
  }, []);

  const speakText = useCallback(
    async (text: string, contextHint?: AstraTTSContext) => {
      await stopSpeaking();
      await speakResponse(text, contextHint);
    },
    [speakResponse, stopSpeaking],
  );

  return {
    isVoiceOpen,
    state,
    errorMessage,
    transcript,
    responseText,
    suggestions,
    responseActions,
    inputLevel,
    permissionDenied,
    waitingPrompt: copy.waitingPrompt,
    voiceContext,
    voicePreferences,
    voicePresets,
    selectedVoicePreset,
    ttsState,
    startConversation,
    stopListening,
    cancelConversation,
    replayLastResponse,
    speakText,
    stopSpeechPlayback: stopSpeaking,
    submitSuggestion,
    runVoiceAction,
    openSettings,
    closeVoice,
    setSelectedVoicePresetId,
  };
}

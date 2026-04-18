import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { useOrbitStore } from '../../store/useOrbitStore';
import type {
  AstraFlowMemory,
  AstraGuideId,
  AstraGuideProgress,
  AstraMemorySnapshot,
  AstraMessage,
  AstraRecentError,
  AstraResponse,
  AstraSupportContext,
} from '../types/astra';
import type { AstraVoicePresetId } from '../types/astraVoice';
import { useAuthStore } from './authStore';
import {
  buildAstraBootstrapResponse,
  buildAstraUnavailableResponse,
  createAstraMessage,
} from '../services/astra/astraCore';
import {
  hasAstraBrainBackend,
  requestAstraBrainResponse,
} from '../services/astra/astraApi';
import { useWalletStore } from './walletStore';

interface AstraState {
  isOpen: boolean;
  isExpanded: boolean;
  isVoiceOpen: boolean;
  voiceAutoStartRequested: boolean;
  isTyping: boolean;
  context: AstraSupportContext | null;
  messages: AstraMessage[];
  activeRequestId: string | null;
  memory: AstraMemorySnapshot;
  activeGuide: AstraGuideProgress | null;
  voicePreferences: {
    voiceInputEnabled: boolean;
    voiceOutputEnabled: boolean;
    autoPlayResponses: boolean;
    muted: boolean;
    selectedPresetId: AstraVoicePresetId;
  };
  open: (context: AstraSupportContext) => void;
  close: () => void;
  openVoice: (mode?: 'idle' | 'listen') => void;
  closeVoice: () => void;
  consumeVoiceAutoStart: () => void;
  ask: (question: string) => Promise<AstraResponse | null>;
  clearConversation: () => void;
  markFeedback: (messageId: string, helpful: boolean) => void;
  setExpanded: (value: boolean) => void;
  setVoiceInputEnabled: (value: boolean) => void;
  setVoiceOutputEnabled: (value: boolean) => void;
  setVoiceAutoPlayResponses: (value: boolean) => void;
  setVoiceMuted: (value: boolean) => void;
  setSelectedVoicePresetId: (value: AstraVoicePresetId) => void;
  rememberContext: (context: AstraSupportContext) => void;
  recordError: (error: Omit<AstraRecentError, 'id' | 'occurredAt'>) => void;
  recordWalletFlow: (
    guideId: AstraGuideId,
    status: AstraFlowMemory['status'],
    error?: string,
  ) => void;
  startGuide: (guideId: AstraGuideId) => void;
  resumeGuide: (guideId?: AstraGuideId) => void;
  advanceGuide: (maxSteps?: number) => void;
  retreatGuide: () => void;
  cancelGuide: () => void;
  pauseGuide: () => void;
  appendUserMessage: (text: string) => void;
  pushAssistantResponse: (response: AstraResponse) => void;
  primeConversation: (
    context: AstraSupportContext,
    messages: AstraMessage[],
    activeGuide?: AstraGuideProgress | null,
  ) => void;
}

function buildInitialMemory(): AstraMemorySnapshot {
  return {
    recentSurfaces: [],
    lastIntent: null,
    lastQuestion: null,
    lastTopic: null,
    lastError: null,
    lastGuideId: null,
    walletFlow: null,
  };
}

function buildIntro(
  context: AstraSupportContext,
  _memory: AstraMemorySnapshot,
  _activeGuide: AstraGuideProgress | null,
) {
  const response = buildAstraBootstrapResponse(context);
  return [createAstraMessage('assistant', response.body, response)];
}

function contextKey(context: AstraSupportContext | null) {
  if (!context) {
    return '';
  }

  return [
    context.surface,
    context.path,
    context.screenName,
    context.currentPairSymbol,
    context.rampMode,
    context.rampProviderLabel,
    context.errorTitle,
    context.errorBody,
    context.walletReady,
    context.seedBackedUp,
    context.externalWalletConnected,
    context.emailVerified,
  ].join('|');
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function nowIso() {
  return new Date().toISOString();
}

function getPortfolioValue() {
  const walletState = useWalletStore.getState();
  return (
    walletState.assets.reduce((sum, asset) => sum + asset.usdValue, 0) +
    walletState.spotBalances.reduce((sum, asset) => sum + asset.amount, 0)
  );
}

function hasFundsAvailable() {
  const walletState = useWalletStore.getState();
  return (
    walletState.assets.some((asset) => asset.usdValue > 0) ||
    walletState.spotBalances.some((asset) => asset.amount > 0)
  );
}

function extractTopic(question: string, response: AstraResponse): string | null {
  const normalized = question.toLowerCase();

  if (response.guideId) {
    return response.guideId;
  }

  if (normalized.includes('p2p')) {
    return 'p2p';
  }

  if (normalized.includes('wallet') || normalized.includes('billetera')) {
    return 'wallet';
  }

  if (normalized.includes('idioma') || normalized.includes('language')) {
    return 'language';
  }

  if (normalized.includes('grafico') || normalized.includes('chart')) {
    return 'chart';
  }

  if (normalized.includes('libro') || normalized.includes('order book')) {
    return 'order_book';
  }

  if (normalized.includes('seguridad') || normalized.includes('security')) {
    return 'security';
  }

  return null;
}

function buildMemoryFromAssistantResponse(
  memory: AstraMemorySnapshot,
  response: AstraResponse,
): AstraMemorySnapshot {
  const lastQuestion = memory.lastQuestion ?? '';
  const lastTopic = extractTopic(lastQuestion, response);

  return {
    ...memory,
    lastIntent: response.intent,
    lastTopic: lastTopic ?? memory.lastTopic,
    lastGuideId: response.guideId ?? memory.lastGuideId,
  };
}

function clampGuideIndex(stepIndex: number, maxSteps: number) {
  if (maxSteps <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(stepIndex, maxSteps - 1));
}

export const useAstraStore = create<AstraState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      isExpanded: false,
      isVoiceOpen: false,
      voiceAutoStartRequested: false,
      isTyping: false,
      context: null,
      messages: [],
      activeRequestId: null,
      memory: buildInitialMemory(),
      activeGuide: null,
      voicePreferences: {
        voiceInputEnabled: true,
        voiceOutputEnabled: true,
        autoPlayResponses: true,
        muted: false,
        selectedPresetId: 'astra_nova',
      },

      open: (nextContext) => {
        const current = get().context;
        const shouldReset = contextKey(current) !== contextKey(nextContext);
        const currentMessages = get().messages;
        const memory = get().memory;
        const activeGuide = get().activeGuide;

        get().rememberContext(nextContext);

        set({
          isOpen: true,
          isExpanded: false,
          isTyping: false,
          activeRequestId: null,
          context: nextContext,
          messages:
            shouldReset || !currentMessages.length
              ? buildIntro(nextContext, memory, activeGuide)
              : currentMessages,
        });
      },

      close: () => {
        const activeGuide = get().activeGuide;

        set({
          isOpen: false,
          isExpanded: false,
          isVoiceOpen: false,
          voiceAutoStartRequested: false,
          isTyping: false,
          activeRequestId: null,
          activeGuide:
            activeGuide && activeGuide.status === 'active'
              ? {
                  ...activeGuide,
                  status: 'paused',
                  updatedAt: nowIso(),
                }
              : activeGuide,
        });
      },

      openVoice: (mode = 'idle') => {
        set({
          isVoiceOpen: true,
          voiceAutoStartRequested: mode === 'listen',
        });
      },

      closeVoice: () => {
        set({ isVoiceOpen: false, voiceAutoStartRequested: false });
      },

      consumeVoiceAutoStart: () => {
        set({ voiceAutoStartRequested: false });
      },

      ask: async (question) => {
        const trimmed = question.trim();
        const context = get().context;

        if (!trimmed || !context || get().isTyping) {
          return null;
        }

        const requestId = `astra-${Date.now()}`;
        const userMessage = createAstraMessage('user', trimmed);

        set((state) => ({
          messages: [...state.messages, userMessage],
          isTyping: true,
          activeRequestId: requestId,
        }));

        await wait(220);

        if (get().activeRequestId !== requestId) {
          return null;
        }

        const response = hasAstraBrainBackend()
          ? await requestAstraBrainResponse({
              question: trimmed,
              context: get().context ?? context,
              memory: get().memory,
              snapshot: {
                userId: useAuthStore.getState().profile.orbitId,
                username: useAuthStore.getState().profile.name,
                language: useOrbitStore.getState().settings.language,
                hasWallet: Boolean(useWalletStore.getState().isWalletReady),
                isVerified: Boolean(useAuthStore.getState().session.emailConfirmed),
                hasFunds: hasFundsAvailable(),
                portfolioValue: getPortfolioValue(),
              },
              channel: 'text',
            }).catch((error) => {
              const errorMessage =
                error instanceof Error ? error.message : 'No pudimos conectar con la IA de Astra.';

              if (errorMessage.includes('GEMINI_API_KEY')) {
                return buildAstraUnavailableResponse({
                  context: get().context ?? context,
                  channel: 'text',
                  reason: errorMessage,
                  retryQuestion: trimmed,
                });
              }

              return buildAstraUnavailableResponse({
                context: get().context ?? context,
                channel: 'text',
                reason: errorMessage,
                retryQuestion: trimmed,
              });
            })
          : buildAstraUnavailableResponse({
              context: get().context ?? context,
              channel: 'text',
              reason: 'Astra backend is not configured.',
              retryQuestion: trimmed,
            });
        const assistantMessage = createAstraMessage('assistant', response.body, response);

        set((state) => ({
          messages: [...state.messages, assistantMessage],
          isTyping: false,
          activeRequestId: null,
          memory: buildMemoryFromAssistantResponse(
            {
              ...state.memory,
              lastQuestion: trimmed,
            },
            response,
          ),
        }));

        return response;
      },

      clearConversation: () => {
        const context = get().context;
        const memory = get().memory;
        const activeGuide = get().activeGuide;
        if (!context) {
          set({ messages: [], isTyping: false, activeRequestId: null, isExpanded: false });
          return;
        }

        set({
          messages: buildIntro(context, memory, activeGuide),
          isTyping: false,
          activeRequestId: null,
          isExpanded: false,
        });
      },

      markFeedback: (messageId, helpful) => {
        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === messageId ? { ...message, helpful } : message,
          ),
        }));
      },

      setExpanded: (value) => {
        set({ isExpanded: value });
      },

      setVoiceInputEnabled: (value) => {
        set((state) => ({
          voicePreferences: {
            ...state.voicePreferences,
            voiceInputEnabled: value,
          },
        }));
      },

      setVoiceOutputEnabled: (value) => {
        set((state) => ({
          voicePreferences: {
            ...state.voicePreferences,
            voiceOutputEnabled: value,
          },
        }));
      },

      setVoiceAutoPlayResponses: (value) => {
        set((state) => ({
          voicePreferences: {
            ...state.voicePreferences,
            autoPlayResponses: value,
          },
        }));
      },

      setVoiceMuted: (value) => {
        set((state) => ({
          voicePreferences: {
            ...state.voicePreferences,
            muted: value,
          },
        }));
      },

      setSelectedVoicePresetId: (value) => {
        set((state) => ({
          voicePreferences: {
            ...state.voicePreferences,
            selectedPresetId: value,
          },
        }));
      },

      rememberContext: (context) => {
        const visitedAt = nowIso();
        const nextEntry = {
          id: `${context.surface}-${context.path}-${visitedAt}`,
          surface: context.surface,
          path: context.path,
          screenName: context.screenName ?? context.surfaceTitle ?? context.surface,
          pairSymbol: context.currentPairSymbol,
          visitedAt,
        };

        set((state) => {
          const filtered = state.memory.recentSurfaces.filter(
            (item) =>
              !(
                item.path === nextEntry.path &&
                item.screenName === nextEntry.screenName &&
                item.pairSymbol === nextEntry.pairSymbol
              ),
          );

          return {
            memory: {
              ...state.memory,
              recentSurfaces: [nextEntry, ...filtered].slice(0, 6),
            },
          };
        });
      },

      recordError: (error) => {
        set((state) => {
          const previous = state.memory.lastError;
          if (previous && previous.title === error.title && previous.body === error.body) {
            return state;
          }

          return {
            memory: {
              ...state.memory,
              lastError: {
                id: `astra-error-${Date.now()}`,
                occurredAt: nowIso(),
                ...error,
              },
            },
          };
        });
      },

      recordWalletFlow: (guideId, status, error) => {
        set((state) => ({
          memory: {
            ...state.memory,
            lastGuideId: guideId,
            walletFlow: {
              guideId,
              status,
              updatedAt: nowIso(),
              error,
            },
            lastError:
              status === 'failed' && error
                ? {
                    id: `astra-wallet-${Date.now()}`,
                    surface: 'wallet',
                    title: 'Wallet flow',
                    body: error,
                    occurredAt: nowIso(),
                    linkedGuideId: guideId,
                  }
                : state.memory.lastError,
          },
        }));
      },

      startGuide: (guideId) => {
        set((state) => ({
          activeGuide: {
            guideId,
            stepIndex: 0,
            status: 'active',
            startedAt: nowIso(),
            updatedAt: nowIso(),
          },
          memory: {
            ...state.memory,
            lastGuideId: guideId,
          },
        }));
      },

      resumeGuide: (guideId) => {
        const current = get().activeGuide;
        const nextGuideId = guideId ?? current?.guideId ?? get().memory.lastGuideId;
        if (!nextGuideId) {
          return;
        }

        set((state) => ({
          activeGuide: state.activeGuide && state.activeGuide.guideId === nextGuideId
            ? {
                ...state.activeGuide,
                status: 'active',
                updatedAt: nowIso(),
              }
            : {
                guideId: nextGuideId,
                stepIndex: 0,
                status: 'active',
                startedAt: nowIso(),
                updatedAt: nowIso(),
              },
          memory: {
            ...state.memory,
            lastGuideId: nextGuideId,
          },
        }));
      },

      advanceGuide: (maxSteps) => {
        const activeGuide = get().activeGuide;
        if (!activeGuide) {
          return;
        }

        set({
          activeGuide: {
            ...activeGuide,
            stepIndex: clampGuideIndex(activeGuide.stepIndex + 1, maxSteps ?? activeGuide.stepIndex + 2),
            status: 'active',
            updatedAt: nowIso(),
          },
        });
      },

      retreatGuide: () => {
        const activeGuide = get().activeGuide;
        if (!activeGuide) {
          return;
        }

        set({
          activeGuide: {
            ...activeGuide,
            stepIndex: Math.max(0, activeGuide.stepIndex - 1),
            status: 'active',
            updatedAt: nowIso(),
          },
        });
      },

      cancelGuide: () => {
        set({ activeGuide: null });
      },

      pauseGuide: () => {
        const activeGuide = get().activeGuide;
        if (!activeGuide) {
          return;
        }

        set({
          activeGuide: {
            ...activeGuide,
            status: 'paused',
            updatedAt: nowIso(),
          },
        });
      },

      appendUserMessage: (text) => {
        const trimmed = text.trim();
        if (!trimmed) {
          return;
        }

        set((state) => ({
          messages: [...state.messages, createAstraMessage('user', trimmed)],
          memory: {
            ...state.memory,
            lastQuestion: trimmed,
          },
        }));
      },

      pushAssistantResponse: (response) => {
        const assistantMessage = createAstraMessage('assistant', response.body, response);
        set((state) => ({
          messages: [...state.messages, assistantMessage],
          memory: buildMemoryFromAssistantResponse(state.memory, response),
        }));
      },

      primeConversation: (context, messages, activeGuide = null) => {
        get().rememberContext(context);
        set({
          context,
          messages,
          activeGuide,
          isOpen: false,
          isExpanded: false,
          isTyping: false,
          activeRequestId: null,
        });
      },
    }),
    {
      name: 'orbitx-astra-memory-v2',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        memory: state.memory,
        activeGuide: state.activeGuide,
        voicePreferences: state.voicePreferences,
      }),
    },
  ),
);

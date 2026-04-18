import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type BotFuturesExchangeId = 'binance' | 'okx' | 'bybit' | 'other';
export type BotFuturesModeId = 'simulated' | 'testnet' | 'real';
export type BotFuturesConnectionStatus = 'idle' | 'validating' | 'connected' | 'error';
export type BotFuturesRuntimeStatus = 'paused' | 'active' | 'stopping' | 'error';
export type BotFuturesRiskProfile = 'conservative' | 'moderate' | 'aggressive';
export type BotFuturesStrategyPreset = 'trend' | 'range' | 'breakout';
export type BotFuturesCadence = '15m' | '1h';
export type BotFuturesProtectionMode = 'dynamic' | 'strict';

interface BotFuturesState {
  selectedExchange: BotFuturesExchangeId | null;
  selectedMode: BotFuturesModeId | null;
  apiKey: string;
  secretKey: string;
  apiKeyMasked: string | null;
  hasCredentials: boolean;
  connectionStatus: BotFuturesConnectionStatus;
  validationError: string | null;
  wizardStep: 1 | 2 | 3 | 4 | 5;
  guideCompleted: boolean;
  keysValidated: boolean;
  botStatus: BotFuturesRuntimeStatus;
  pair: string;
  capitalAllocatedUsd: number;
  capitalReferenceUsd: number;
  leverageMax: number;
  maxTradesPerDay: number;
  protectionMode: BotFuturesProtectionMode;
  cadence: BotFuturesCadence;
  riskProfile: BotFuturesRiskProfile;
  strategyPreset: BotFuturesStrategyPreset;
  entryStyle: 'conservative' | 'aggressive';
  dailyPnlUsd: number;
  openPositionsCount: number;
  pendingSignalsCount: number;
  activityCount: number;
  lastSyncAt: string | null;
  setSelectedExchange: (exchange: BotFuturesExchangeId | null) => void;
  setSelectedMode: (mode: BotFuturesModeId) => void;
  setApiKey: (value: string) => void;
  setSecretKey: (value: string) => void;
  setConnectionStatus: (status: BotFuturesConnectionStatus, error?: string | null) => void;
  setWizardStep: (step: 1 | 2 | 3 | 4 | 5) => void;
  completeGuide: () => void;
  completeValidation: (maskedKey?: string) => void;
  resetConnectionState: () => void;
  resetWizard: () => void;
  setBotStatus: (status: BotFuturesRuntimeStatus) => void;
  startBot: () => void;
  pauseBot: () => void;
  requestEmergencyStop: () => void;
  setPair: (pair: string) => void;
  setCapitalAllocatedUsd: (value: number) => void;
  setCapitalReferenceUsd: (value: number) => void;
  setLeverageMax: (value: number) => void;
  setMaxTradesPerDay: (value: number) => void;
  setProtectionMode: (value: BotFuturesProtectionMode) => void;
  setCadence: (value: BotFuturesCadence) => void;
  setRiskProfile: (value: BotFuturesRiskProfile) => void;
  setStrategyPreset: (value: BotFuturesStrategyPreset) => void;
  setEntryStyle: (value: 'conservative' | 'aggressive') => void;
  patchTelemetry: (payload: Partial<Pick<
    BotFuturesState,
    'dailyPnlUsd' | 'openPositionsCount' | 'pendingSignalsCount' | 'activityCount' | 'lastSyncAt'
  >>) => void;
}

export const BOT_FUTURES_EXCHANGE_DEFINITIONS: Record<
  BotFuturesExchangeId,
  {
    name: string;
    status: string;
    description: string;
    shortName: string;
    accent: 'gold' | 'blue' | 'slate' | 'muted';
  }
> = {
  binance: {
    name: 'Binance Futures',
    status: 'Disponible',
    description: 'Principal exchange para futuros con alta liquidez.',
    shortName: 'BN',
    accent: 'gold',
  },
  okx: {
    name: 'OKX',
    status: 'Disponible',
    description: 'Trading avanzado de derivados y futuros.',
    shortName: 'OKX',
    accent: 'blue',
  },
  bybit: {
    name: 'Bybit',
    status: 'Disponible',
    description: 'Especialistas en trading de futuros perpetuos.',
    shortName: 'BY',
    accent: 'slate',
  },
  other: {
    name: 'Otros exchanges proximamente',
    status: 'Proximamente',
    description: 'Kraken, Coinbase Pro y nuevas integraciones luego.',
    shortName: '...',
    accent: 'muted',
  },
};

export const BOT_FUTURES_MODE_DEFINITIONS: Record<
  BotFuturesModeId,
  {
    name: string;
    description: string;
    riskLabel: string;
    accent: 'blue' | 'slate' | 'danger';
  }
> = {
  simulated: {
    name: 'Simulado',
    description: 'Prueba tus estrategias sin riesgo. Usando datos reales.',
    riskLabel: 'Nivel de Riesgo: Ninguno',
    accent: 'blue',
  },
  testnet: {
    name: 'Testnet',
    description: 'Entorno de prueba con fondos simulados en una red de prueba.',
    riskLabel: 'Nivel de Riesgo: Muy Bajo',
    accent: 'slate',
  },
  real: {
    name: 'Real',
    description: 'Opera con fondos reales en el mercado vivo. Requiere maxima precaucion.',
    riskLabel: 'Nivel de Riesgo: Extremo',
    accent: 'danger',
  },
};

function getAutoConnectionStatus(
  exchange: BotFuturesExchangeId | null,
  mode: BotFuturesModeId | null,
): BotFuturesConnectionStatus {
  if (exchange && exchange !== 'other' && mode === 'simulated') {
    return 'connected';
  }

  return 'idle';
}

function maskApiKey(value: string) {
  const normalized = value.trim();

  if (normalized.length <= 8) {
    return normalized || null;
  }

  return `${normalized.slice(0, 4)}••••${normalized.slice(-4)}`;
}

function normalizePair(value: string) {
  const normalized = value.trim().toUpperCase();
  return normalized.length > 0 ? normalized : 'SOL/USDT';
}

export const useBotFuturesStore = create<BotFuturesState>()(
  persist(
    (set, get) => ({
      selectedExchange: null,
      selectedMode: null,
      apiKey: '',
      secretKey: '',
      apiKeyMasked: null,
      hasCredentials: false,
      connectionStatus: 'idle',
      validationError: null,
      wizardStep: 1,
      guideCompleted: false,
      keysValidated: false,
      botStatus: 'paused',
      pair: 'SOL/USDT',
      capitalAllocatedUsd: 7,
      capitalReferenceUsd: 10000,
      leverageMax: 10,
      maxTradesPerDay: 15,
      protectionMode: 'dynamic',
      cadence: '15m',
      riskProfile: 'moderate',
      strategyPreset: 'trend',
      entryStyle: 'conservative',
      dailyPnlUsd: 0,
      openPositionsCount: 0,
      pendingSignalsCount: 0,
      activityCount: 0,
      lastSyncAt: null,
      setSelectedExchange: (exchange) =>
        set((state) => {
          const nextStatus = getAutoConnectionStatus(exchange, state.selectedMode);
          const isSimulatedReady = nextStatus === 'connected' && state.selectedMode === 'simulated';
          return {
            selectedExchange: exchange,
            connectionStatus: nextStatus,
            validationError: null,
            apiKey: '',
            secretKey: '',
            apiKeyMasked: null,
            hasCredentials: false,
            keysValidated: isSimulatedReady,
            botStatus: exchange ? state.botStatus : 'paused',
          };
        }),
      setSelectedMode: (mode) =>
        set((state) => {
          const nextStatus = getAutoConnectionStatus(state.selectedExchange, mode);
          const isSimulatedReady = nextStatus === 'connected' && mode === 'simulated';
          return {
            selectedMode: mode,
            connectionStatus: nextStatus,
            validationError: null,
            apiKey: isSimulatedReady ? '' : state.apiKey,
            secretKey: isSimulatedReady ? '' : state.secretKey,
            apiKeyMasked: isSimulatedReady ? null : state.apiKeyMasked,
            hasCredentials: isSimulatedReady ? false : state.hasCredentials,
            keysValidated: isSimulatedReady,
          };
        }),
      setApiKey: (value) =>
        set({
          apiKey: value,
          connectionStatus: 'idle',
          validationError: null,
          keysValidated: false,
          apiKeyMasked: null,
          hasCredentials: false,
        }),
      setSecretKey: (value) =>
        set({
          secretKey: value,
          connectionStatus: 'idle',
          validationError: null,
          keysValidated: false,
          apiKeyMasked: null,
          hasCredentials: false,
        }),
      setConnectionStatus: (status, error = null) =>
        set((state) => ({
          connectionStatus: status,
          validationError: error,
          keysValidated: status === 'connected',
          hasCredentials:
            status === 'connected' && state.selectedMode !== 'simulated',
          apiKeyMasked:
            status === 'connected' && state.selectedMode !== 'simulated'
              ? maskApiKey(state.apiKey)
              : state.selectedMode === 'simulated'
                ? null
                : state.apiKeyMasked,
        })),
      setWizardStep: (step) => set({ wizardStep: step }),
      completeGuide: () => set({ guideCompleted: true }),
      completeValidation: (maskedKey) =>
        set((state) => ({
          connectionStatus: 'connected',
          validationError: null,
          keysValidated: true,
          hasCredentials: state.selectedMode !== 'simulated',
          apiKeyMasked:
            state.selectedMode === 'simulated'
              ? null
              : maskedKey ?? maskApiKey(state.apiKey),
        })),
      resetConnectionState: () =>
        set((state) => {
          const nextStatus = getAutoConnectionStatus(state.selectedExchange, state.selectedMode);
          return {
            apiKey: '',
            secretKey: '',
            apiKeyMasked: null,
            hasCredentials: false,
            connectionStatus: nextStatus,
            validationError: null,
            keysValidated: nextStatus === 'connected',
          };
        }),
      resetWizard: () =>
        set({
          selectedExchange: null,
          selectedMode: null,
          apiKey: '',
          secretKey: '',
          apiKeyMasked: null,
          hasCredentials: false,
          connectionStatus: 'idle',
          validationError: null,
          wizardStep: 1,
          guideCompleted: false,
          keysValidated: false,
        }),
      setBotStatus: (status) => set({ botStatus: status }),
      startBot: () => set({ botStatus: 'active' }),
      pauseBot: () => set({ botStatus: 'paused' }),
      requestEmergencyStop: () => set({ botStatus: 'stopping' }),
      setPair: (pair) => set({ pair: normalizePair(pair) }),
      setCapitalAllocatedUsd: (value) => set({ capitalAllocatedUsd: Math.max(value, 0) }),
      setCapitalReferenceUsd: (value) => set({ capitalReferenceUsd: Math.max(value, 0) }),
      setLeverageMax: (value) => set({ leverageMax: Math.max(value, 1) }),
      setMaxTradesPerDay: (value) => set({ maxTradesPerDay: Math.max(value, 1) }),
      setProtectionMode: (value) => set({ protectionMode: value }),
      setCadence: (value) => set({ cadence: value }),
      setRiskProfile: (value) => set({ riskProfile: value }),
      setStrategyPreset: (value) => set({ strategyPreset: value }),
      setEntryStyle: (value) => set({ entryStyle: value }),
      patchTelemetry: (payload) => set(payload),
    }),
    {
      name: 'orbitx-bot-futures-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selectedExchange: state.selectedExchange,
        selectedMode: state.selectedMode,
        apiKeyMasked: state.apiKeyMasked,
        hasCredentials: state.hasCredentials,
        connectionStatus:
          state.connectionStatus === 'connected'
            ? 'connected'
            : getAutoConnectionStatus(state.selectedExchange, state.selectedMode),
        wizardStep: state.wizardStep,
        guideCompleted: state.guideCompleted,
        keysValidated:
          state.connectionStatus === 'connected' || state.selectedMode === 'simulated',
        botStatus: state.botStatus === 'active' ? 'active' : 'paused',
        pair: state.pair,
        capitalAllocatedUsd: state.capitalAllocatedUsd,
        capitalReferenceUsd: state.capitalReferenceUsd,
        leverageMax: state.leverageMax,
        maxTradesPerDay: state.maxTradesPerDay,
        protectionMode: state.protectionMode,
        cadence: state.cadence,
        riskProfile: state.riskProfile,
        strategyPreset: state.strategyPreset,
        entryStyle: state.entryStyle,
        dailyPnlUsd: state.dailyPnlUsd,
        openPositionsCount: state.openPositionsCount,
        pendingSignalsCount: state.pendingSignalsCount,
        activityCount: state.activityCount,
        lastSyncAt: state.lastSyncAt,
      }),
    },
  ),
);

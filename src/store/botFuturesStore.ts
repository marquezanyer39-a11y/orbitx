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
  connectionStatus: BotFuturesConnectionStatus;
  validationError: string | null;
  wizardStep: 1 | 2 | 3 | 4 | 5;
  guideCompleted: boolean;
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
  setConnectionStatus: (status: BotFuturesConnectionStatus, error?: string | null) => void;
  setWizardStep: (step: 1 | 2 | 3 | 4 | 5) => void;
  completeGuide: () => void;
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
    status: 'Backend seguro pendiente',
    description: 'Flujo visual listo; la conexion real se habilitara desde backend QVEX.',
    shortName: 'BN',
    accent: 'gold',
  },
  okx: {
    name: 'OKX',
    status: 'Backend seguro pendiente',
    description: 'Proveedor preparado para futuro broker, sin credenciales dentro de la app.',
    shortName: 'OKX',
    accent: 'blue',
  },
  bybit: {
    name: 'Bybit',
    status: 'Backend seguro pendiente',
    description: 'Conexion futura mediante backend QVEX y permisos minimos.',
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
    description: 'Prueba tus estrategias sin riesgo y sin credenciales de exchange.',
    riskLabel: 'Nivel de Riesgo: Ninguno',
    accent: 'blue',
  },
  testnet: {
    name: 'Testnet',
    description: 'Entorno de ensayo pendiente de autorizacion segura desde backend.',
    riskLabel: 'Nivel de Riesgo: Muy Bajo',
    accent: 'slate',
  },
  real: {
    name: 'Real',
    description: 'Reservado para una futura activacion con backend seguro y controles aprobados.',
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

function normalizePair(value: string) {
  const normalized = value.trim().toUpperCase();
  return normalized.length > 0 ? normalized : 'SOL/USDT';
}

// Bot Futures nunca debe capturar API secrets ni firmar requests privadas en frontend.
// La integracion futura debe usar backend QVEX u OAuth seguro con permisos minimos.
export const useBotFuturesStore = create<BotFuturesState>()(
  persist(
    (set) => ({
      selectedExchange: null,
      selectedMode: null,
      connectionStatus: 'idle',
      validationError: null,
      wizardStep: 1,
      guideCompleted: false,
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
        set((state) => ({
          selectedExchange: exchange,
          connectionStatus: getAutoConnectionStatus(exchange, state.selectedMode),
          validationError: null,
          botStatus: exchange ? state.botStatus : 'paused',
        })),
      setSelectedMode: (mode) =>
        set((state) => ({
          selectedMode: mode,
          connectionStatus: getAutoConnectionStatus(state.selectedExchange, mode),
          validationError: null,
        })),
      setConnectionStatus: (status, error = null) =>
        set({
          connectionStatus: status,
          validationError: error,
        }),
      setWizardStep: (step) => set({ wizardStep: step }),
      completeGuide: () => set({ guideCompleted: true }),
      resetConnectionState: () =>
        set((state) => ({
          connectionStatus: getAutoConnectionStatus(state.selectedExchange, state.selectedMode),
          validationError: null,
        })),
      resetWizard: () =>
        set({
          selectedExchange: null,
          selectedMode: null,
          connectionStatus: 'idle',
          validationError: null,
          wizardStep: 1,
          guideCompleted: false,
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
      name: 'orbitx-bot-futures-store-v2',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selectedExchange: state.selectedExchange,
        selectedMode: state.selectedMode,
        connectionStatus:
          state.connectionStatus === 'connected'
            ? 'connected'
            : getAutoConnectionStatus(state.selectedExchange, state.selectedMode),
        wizardStep: state.wizardStep,
        guideCompleted: state.guideCompleted,
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

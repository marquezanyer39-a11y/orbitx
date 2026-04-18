import type { LanguageCode } from '../../types';

export type AstraVoiceScreen =
  | 'home'
  | 'wallet'
  | 'trade'
  | 'market'
  | 'social'
  | 'create_token'
  | 'bot_futures'
  | 'security'
  | 'settings'
  | 'profile'
  | 'pool'
  | 'ramp'
  | 'general';

export type AstraVoiceState =
  | 'idle'
  | 'paused'
  | 'requesting_permission'
  | 'connecting'
  | 'listening'
  | 'transcribing'
  | 'processing'
  | 'responding'
  | 'speaking'
  | 'error'
  | 'reconnecting';

export type AstraVoicePresetId =
  | 'astra_core'
  | 'astra_edge'
  | 'astra_nova'
  | 'astra_pulse';

export interface AstraVoicePresetDefinition {
  id: AstraVoicePresetId;
  label: string;
  description: string;
  tone: string;
  gender: 'masculine' | 'feminine';
  pitch: number;
  rate: number;
}

export interface AstraResolvedVoicePreset extends AstraVoicePresetDefinition {
  voiceIdentifier: string | null;
  language: string | null;
  matchedVoiceName?: string | null;
}

export type AstraVoiceActionType =
  | 'navigate'
  | 'open_chart'
  | 'change_language'
  | 'open_settings'
  | 'noop';

export interface AstraVoiceFeatureFlags {
  wallet: boolean;
  createWallet: boolean;
  importWallet: boolean;
  externalWallet: boolean;
  trade: boolean;
  markets: boolean;
  convert: boolean;
  buy: boolean;
  sell: boolean;
  pay: boolean;
  social: boolean;
  pool: boolean;
  p2p: boolean;
  security: boolean;
}

export interface AstraVoiceContextPayload {
  userId: string;
  screen: AstraVoiceScreen;
  hasWallet: boolean;
  isVerified: boolean;
  hasFunds: boolean;
  language: LanguageCode;
  username: string;
  portfolioValue?: number;
  selectedToken?: string | null;
  summary?: string;
  errorTitle?: string;
  errorBody?: string;
  features: AstraVoiceFeatureFlags;
}

export interface AstraVoiceSession {
  sessionId: string;
  expiresAt: string;
  state: 'ready';
  transport: 'turn_based_voice';
  voiceOutput: 'device_tts' | 'server_tts';
  speechInput: 'native_stt';
  model: string;
}

export interface AstraVoiceActionPayload {
  type: AstraVoiceActionType;
  target?: string;
  value?: string;
}

export interface AstraVoiceResponsePayload {
  message: string;
  suggestions: string[];
  actions: AstraVoiceActionPayload[];
}

export interface AstraVoiceReplyEnvelope {
  sessionId: string;
  response: AstraVoiceResponsePayload;
}

export interface AstraVoiceErrorPayload {
  code: string;
  message: string;
  retryable?: boolean;
}

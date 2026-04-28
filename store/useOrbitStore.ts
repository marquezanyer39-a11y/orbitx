import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getLanguageMetadata, normalizeLanguageCode, translate } from '../constants/i18n';
import { getDexChainConfig, getLaunchChainConfig } from '../constants/networks';
import { ORBITX_STORAGE_KEY } from '../constants/storage';
import { createInitialOrbitState } from '../mocks/data';
import { devWarn } from '../src/utils/devLog';
import { buildTokenTransparency } from '../services/listing/orbitxListing';
import type {
  ActionResult,
  ActivityEntry,
  ActivityKind,
  AppLayoutMode,
  AppearanceMode,
  BotMarketType,
  BotRisk,
  CreateTokenPayload,
  ExternalWalletProvider,
  LaunchTokenPayload,
  LanguageCode,
  MarketFilter,
  MarketToken,
  OrbitAccentPreset,
  OrbitMotionPreset,
  OrbitUsageMode,
  OrbitTextPreset,
  OrbitPersistedState,
  OrbitStore,
  PrivacyMode,
  QuickAccessAction,
  ReactionKey,
  ToastTone,
  UiDensity,
  WalletAsset,
} from '../types';
import { fetchLiveMarketRows, mergeLiveRows } from '../utils/liveMarket';
import { fetchOnchainPortfolio } from '../utils/onchainPortfolio';
import { enableBiometricsForOrbitX } from '../utils/biometrics';
import {
  clamp,
  createSparkline,
  normalizeTicker,
  randomBetween,
  roundAdaptivePrice,
  roundTo,
  sample,
  simulateBot,
} from '../utils/simulate';
import { getOrCreateWalletBundle, getStoredWalletBundle, getWalletSecurityState } from '../utils/wallet';
import { isValidWalletAddress } from '../utils/validation';

const initialPersistedState = createInitialOrbitState();
let liveMarketSyncInFlight = false;
let onchainSyncInFlight = false;
const COMMUNITY_POST_LIMIT = 200;
const COMMUNITY_POST_COOLDOWN_MS = 45_000;
const COMMUNITY_KEYWORDS = [
  'btc',
  'bitcoin',
  'eth',
  'ethereum',
  'sol',
  'solana',
  'bnb',
  'trx',
  'tron',
  'xrp',
  'doge',
  'ltc',
  'avax',
  'arb',
  'op',
  'base',
  'polygon',
  'pol',
  'token',
  'crypto',
  'mercado',
  'market',
  'trade',
  'trading',
  'setup',
  'volumen',
  'volume',
  'precio',
  'price',
  'alcista',
  'bajista',
  'bullish',
  'bearish',
  'rally',
  'dump',
  'breakout',
  'soporte',
  'resistencia',
  'noticia',
  'noticias',
  'news',
];

function fireFeedback(tone: ToastTone) {
  if (tone === 'error') {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    return;
  }

  if (tone === 'success') {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return;
  }

  void Haptics.selectionAsync();
}

function buildResult(ok: boolean, message: string, code?: string): ActionResult {
  return { ok, message, code };
}

function initialsFromName(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? '')
    .join('');

  return initials || 'OX';
}

function handleFromIdentity(name: string, email: string) {
  const base =
    name.trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase() ||
    email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

  return `@${base.slice(0, 14) || 'orbitxuser'}`;
}

function sanitizeUsername(value: string) {
  const cleaned = value
    .trim()
    .replace(/^@+/, '')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .slice(0, 18);

  return cleaned;
}

function normalizeCommunityText(text: string) {
  return text.trim().replace(/\s+/g, ' ');
}

function hasCryptoContext(text: string, tokenSymbol?: string) {
  if (tokenSymbol?.trim()) {
    return true;
  }

  const normalized = text.toLowerCase();
  return COMMUNITY_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function buildActivity(
  kind: ActivityKind,
  title: string,
  description: string,
): ActivityEntry {
  return {
    id: `activity-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    kind,
    title,
    description,
    timestamp: new Date().toISOString(),
  };
}

function prependActivity(entries: ActivityEntry[], nextEntry: ActivityEntry) {
  return [nextEntry, ...entries].slice(0, 24);
}

function updateAssetBalance(
  assets: WalletAsset[],
  tokenId: string,
  amountDelta: number,
  referencePrice: number,
) {
  let updated = false;

  const nextAssets = assets.map((asset) => {
    if (asset.tokenId !== tokenId) {
      return asset;
    }

    updated = true;
    const nextAmount = Math.max(asset.amount + amountDelta, 0);
    const nextAverageCost =
      amountDelta > 0 && nextAmount > 0
        ? (asset.amount * asset.averageCost + amountDelta * referencePrice) / nextAmount
        : asset.averageCost;

    return {
      ...asset,
      amount: nextAmount,
      averageCost: amountDelta > 0 ? roundAdaptivePrice(nextAverageCost) : asset.averageCost,
    };
  });

  if (!updated && amountDelta > 0) {
    nextAssets.push({
      tokenId,
      amount: amountDelta,
      averageCost: referencePrice,
    });
  }

  return nextAssets.filter((asset) => asset.amount > 0.0000001 || asset.tokenId === 'usd');
}

function getTokenOrNull(tokens: MarketToken[], tokenId: string) {
  return tokens.find((token) => token.id === tokenId) ?? null;
}

function mapReferenceCosts(assets: WalletAsset[], tokens: MarketToken[]) {
  return assets.map((asset) => ({
    ...asset,
    averageCost: getTokenOrNull(tokens, asset.tokenId)?.price ?? asset.averageCost,
  }));
}

function getLaunchLabel(language: LanguageCode, value: string) {
  return translate(language, `launchpad.${value}`);
}

function getTransferNetwork(token: MarketToken): 'ethereum' | 'base' | 'bnb' | 'solana' | 'generic' {
  if (
    token.chain === 'ethereum' ||
    token.chain === 'base' ||
    token.chain === 'bnb' ||
    token.chain === 'solana'
  ) {
    return token.chain;
  }

  if (token.networkKey === 'ethereum') {
    return 'ethereum';
  }

  if (token.id === 'bnb') {
    return 'bnb';
  }

  if (['sol', 'bonk', 'wif', 'popcat'].includes(token.id)) {
    return 'solana';
  }

  if (['usd', 'usdt', 'eth', 'aero'].includes(token.id)) {
    return 'base';
  }

  return 'generic';
}

function maskTransferDestination(destination: string) {
  const normalized = destination.trim();

  if (normalized.length <= 12) {
    return normalized;
  }

  return `${normalized.slice(0, 6)}...${normalized.slice(-6)}`;
}

function externalWalletProviderLabel(provider: ExternalWalletProvider) {
  if (provider === 'metamask') {
    return 'MetaMask';
  }

  if (provider === 'trust') {
    return 'Trust Wallet';
  }

  if (provider === 'coinbase') {
    return 'Coinbase Wallet';
  }

  if (provider === 'other') {
    return 'Wallet externa';
  }

  return 'WalletConnect';
}

function inferVenueFromDexNetwork(network?: LaunchTokenPayload['dexNetwork']) {
  if (network === 'bnb') {
    return 'pancakeswap' as const;
  }

  if (network === 'solana') {
    return 'raydium' as const;
  }

  return 'uniswap' as const;
}

function getLifecycleCategories(liquidityPoolUsd: number): MarketFilter[] {
  if (liquidityPoolUsd >= 3_000) {
    return ['new', 'trending', 'popular'];
  }

  if (liquidityPoolUsd >= 750) {
    return ['new', 'trending'];
  }

  if (liquidityPoolUsd > 0) {
    return ['new'];
  }

  return [];
}

function buildCreatorPost(
  language: LanguageCode,
  name: string,
  symbol: string,
  handle: string,
  avatar: string,
  chain: string,
  venue: string,
) {
  return {
    id: `post-${Date.now()}`,
    author: 'OrbitX Launchpad',
    handle,
    avatar,
    content: `${name} (${symbol}) ya existe on-chain en ${getLaunchLabel(language, chain)} y queda listo para su siguiente fase de liquidez en ${getLaunchLabel(language, venue)}.`,
    timestamp: new Date().toISOString(),
    tokenSymbols: [symbol],
    reactions: { fire: 3, rocket: 8, diamond: 2 },
    comments: [],
  };
}

function buildTransparencyPayload(token: {
  chain?: MarketToken['chain'];
  chainId?: number | null;
  contractAddress?: string | null;
  deployerAddress?: string | null;
  deploymentTxHash?: string | null;
  poolAddress?: string | null;
  liquidityTxHash?: string | null;
  liquidityLock?: MarketToken['liquidityLock'] | null;
}) {
  return buildTokenTransparency({
    chain: token.chain ?? 'base',
    chainId: token.chainId ?? undefined,
    contractAddress: token.contractAddress ?? undefined,
    deployerAddress: token.deployerAddress ?? undefined,
    deploymentTxHash: token.deploymentTxHash ?? undefined,
    poolAddress: token.poolAddress ?? undefined,
    liquidityTxHash: token.liquidityTxHash ?? undefined,
    liquidityLock: token.liquidityLock ?? null,
  });
}

function getActivityCopy(language: LanguageCode, title: string, description: string) {
  if (language === 'en' || language === 'pt' || language === 'es') {
    return { title, description };
  }

  return { title, description };
}

function mergePersistedState(
  persistedState: unknown,
  currentState: OrbitStore,
): OrbitStore {
  const persisted = (persistedState as Partial<OrbitPersistedState>) ?? {};

  return {
    ...currentState,
    profile: {
      ...currentState.profile,
      ...persisted.profile,
    },
    settings: {
      ...currentState.settings,
      ...persisted.settings,
      language: normalizeLanguageCode(persisted.settings?.language ?? currentState.settings.language),
    },
    walletFuture: {
      ...currentState.walletFuture,
      ...persisted.walletFuture,
      receiveAddresses: {
        ...currentState.walletFuture.receiveAddresses,
        ...(persisted.walletFuture?.receiveAddresses ?? {}),
      },
      externalWallet: {
        ...currentState.walletFuture.externalWallet,
        ...(persisted.walletFuture?.externalWallet ?? {}),
      },
      onchainAssets: persisted.walletFuture?.onchainAssets ?? currentState.walletFuture.onchainAssets,
      supportedRealTokenIds:
        persisted.walletFuture?.supportedRealTokenIds ?? currentState.walletFuture.supportedRealTokenIds,
    },
    bot: {
      ...currentState.bot,
      ...persisted.bot,
      history: persisted.bot?.history ?? currentState.bot.history,
    },
    tokens: persisted.tokens ?? currentState.tokens,
    assets: persisted.assets ?? currentState.assets,
    feed: persisted.feed ?? currentState.feed,
    activity: persisted.activity ?? currentState.activity,
    hasHydrated: currentState.hasHydrated,
    toast: currentState.toast,
  };
}

export const useOrbitStore = create<OrbitStore>()(
  persist(
    (set, get) => ({
      ...initialPersistedState,
      hasHydrated: false,
      toast: null,

      setHasHydrated: (value) => {
        set({ hasHydrated: value });
      },

      showToast: (message, tone = 'info') => {
        fireFeedback(tone);
        set({
          toast: {
            id: `${Date.now()}`,
            message,
            tone,
          },
        });
      },

      hideToast: () => {
        set({ toast: null });
      },

      setLanguage: (language) => {
        const nextLanguage = normalizeLanguageCode(language);
        set((state) => ({
          settings: {
            ...state.settings,
            language: nextLanguage,
          },
          activity: prependActivity(
            state.activity,
            buildActivity(
              'settings',
              'Language updated',
              `OrbitX interface switched to ${getLanguageMetadata(nextLanguage).nativeLabel}.`,
            ),
          ),
          toast: {
            id: `${Date.now()}`,
            message: translate(nextLanguage, 'toast.languageUpdated'),
            tone: 'success',
          },
        }));
        fireFeedback('success');
      },

      setAppearanceMode: (mode: AppearanceMode) => {
        set((state) => ({
          settings: {
            ...state.settings,
            appearanceMode: mode,
          },
          activity: prependActivity(
            state.activity,
            buildActivity(
              'settings',
              'Theme updated',
              `OrbitX visual theme switched to ${mode}.`,
            ),
          ),
          toast: {
            id: `${Date.now()}`,
            message: translate(state.settings.language, 'toast.themeUpdated', {
              mode: translate(state.settings.language, `theme.${mode}`),
            }),
            tone: 'success',
          },
        }));
        fireFeedback('success');
      },

      setOrbitAccentPreset: (preset: OrbitAccentPreset) => {
        set((state) => ({
          settings: {
            ...state.settings,
            appearanceMode: 'orbit',
            orbitAccentPreset: preset,
          },
          activity: prependActivity(
            state.activity,
            buildActivity('settings', 'Accent updated', `Orbit accent switched to ${preset}.`),
          ),
          toast: {
            id: `${Date.now()}`,
            message: `Acento ${preset} activado`,
            tone: 'success',
          },
        }));
        fireFeedback('success');
      },

      setOrbitTextPreset: (preset: OrbitTextPreset) => {
        set((state) => ({
          settings: {
            ...state.settings,
            appearanceMode: 'orbit',
            orbitTextPreset: preset,
          },
          activity: prependActivity(
            state.activity,
            buildActivity('settings', 'Text tone updated', `Orbit text tone switched to ${preset}.`),
          ),
          toast: {
            id: `${Date.now()}`,
            message: `Texto ${preset} activado`,
            tone: 'success',
          },
        }));
        fireFeedback('success');
      },

      toggleOrbitMotion: () => {
        set((state) => {
          const nextValue = !state.settings.orbitMotionEnabled;

          return {
            settings: {
              ...state.settings,
              orbitMotionEnabled: nextValue,
            },
            activity: prependActivity(
              state.activity,
              buildActivity(
                'settings',
                'Background motion updated',
                `Orbit motion background ${nextValue ? 'enabled' : 'disabled'}.`,
              ),
            ),
            toast: {
              id: `${Date.now()}`,
              message: nextValue ? 'Fondo Orbit animado activo' : 'Fondo Orbit animado pausado',
              tone: 'info',
            },
          };
        });
        fireFeedback('info');
      },

      setOrbitMotionPreset: (_preset: OrbitMotionPreset) => {
        const preset: OrbitMotionPreset =
          _preset === 'bear' ? 'bear' : _preset === 'battle' ? 'battle' : 'bull';
        set((state) => ({
          settings: {
            ...state.settings,
            appearanceMode: 'orbit',
            orbitMotionEnabled: true,
            orbitMotionPreset: preset,
          },
          activity: prependActivity(
            state.activity,
            buildActivity('settings', 'Motion preset updated', `Orbit motion preset switched to ${preset}.`),
          ),
          toast: {
            id: `${Date.now()}`,
            message: `${translate(state.settings.language, 'profile.motionPresetTitle')}: ${translate(
              state.settings.language,
              `profile.motion${preset.charAt(0).toUpperCase()}${preset.slice(1)}`,
            )}`,
            tone: 'success',
          },
        }));
        fireFeedback('success');
      },

      applyOrbitThemePreset: (
        accentPreset: OrbitAccentPreset,
        textPreset: OrbitTextPreset,
        _motionPreset: OrbitMotionPreset,
      ) => {
        const motionPreset: OrbitMotionPreset =
          _motionPreset === 'bear' ? 'bear' : _motionPreset === 'battle' ? 'battle' : 'bull';
        set((state) => ({
          settings: {
            ...state.settings,
            appearanceMode: 'orbit',
            orbitAccentPreset: accentPreset,
            orbitTextPreset: textPreset,
            orbitMotionEnabled: true,
            orbitMotionPreset: motionPreset,
          },
          activity: prependActivity(
            state.activity,
            buildActivity(
              'settings',
              'Orbit theme preset updated',
              `Orbit preset applied with ${accentPreset}, ${textPreset} and ${motionPreset}.`,
            ),
          ),
          toast: {
            id: `${Date.now()}`,
            message: `Tema Orbit actualizado`,
            tone: 'success',
          },
        }));
        fireFeedback('success');
      },

      setNotificationsEnabled: (enabled: boolean) => {
        set((state) => ({
          settings: {
            ...state.settings,
            notificationsEnabled: enabled,
          },
          activity: prependActivity(
            state.activity,
            buildActivity(
              'settings',
              'Notifications updated',
              `OrbitX notifications ${enabled ? 'enabled' : 'disabled'}.`,
            ),
          ),
          toast: {
            id: `${Date.now()}`,
            message: enabled ? 'Notificaciones activadas' : 'Notificaciones pausadas',
            tone: 'info',
          },
        }));
        fireFeedback('info');
      },

      setUsageMode: (mode: OrbitUsageMode) => {
        set((state) => ({
          settings: {
            ...state.settings,
            usageMode: mode,
          },
          activity: prependActivity(
            state.activity,
            buildActivity('settings', 'Usage mode updated', `OrbitX switched to ${mode} mode.`),
          ),
          toast: {
            id: `${Date.now()}`,
            message: mode === 'pro' ? 'Modo Pro activado' : 'Modo Basico activado',
            tone: 'success',
          },
        }));
        fireFeedback('success');
      },

      setUiDensity: (density: UiDensity) => {
        set((state) => ({
          settings: {
            ...state.settings,
            uiDensity: density,
          },
          activity: prependActivity(
            state.activity,
            buildActivity('settings', 'UI density updated', `OrbitX UI density switched to ${density}.`),
          ),
          toast: {
            id: `${Date.now()}`,
            message: density === 'compact' ? 'Vista compacta activa' : 'Vista comoda activa',
            tone: 'success',
          },
        }));
        fireFeedback('success');
      },

      setPrivacyMode: (mode: PrivacyMode) => {
        set((state) => ({
          settings: {
            ...state.settings,
            privacyMode: mode,
          },
          activity: prependActivity(
            state.activity,
            buildActivity('settings', 'Privacy mode updated', `OrbitX privacy mode switched to ${mode}.`),
          ),
          toast: {
            id: `${Date.now()}`,
            message: mode === 'strict' ? 'Privacidad reforzada activa' : 'Privacidad estandar activa',
            tone: 'info',
          },
        }));
        fireFeedback('info');
      },

      setAppLayoutMode: (mode: AppLayoutMode) => {
        set((state) => ({
          settings: {
            ...state.settings,
            appLayoutMode: mode,
          },
          activity: prependActivity(
            state.activity,
            buildActivity('settings', 'Layout mode updated', `OrbitX layout switched to ${mode}.`),
          ),
          toast: {
            id: `${Date.now()}`,
            message: mode === 'reordered' ? 'Layout reordenado listo' : 'Layout clasico activo',
            tone: 'success',
          },
        }));
        fireFeedback('success');
      },

      setQuickAccessAction: (action: QuickAccessAction) => {
        set((state) => ({
          settings: {
            ...state.settings,
            quickAccessAction: action,
          },
          activity: prependActivity(
            state.activity,
            buildActivity('settings', 'Quick access updated', `Quick access now opens ${action}.`),
          ),
          toast: {
            id: `${Date.now()}`,
            message: 'Acceso rapido actualizado',
            tone: 'success',
          },
        }));
        fireFeedback('success');
      },

      updateProfileIdentity: (username: string) => {
        const state = get();
        const language = state.settings.language;
        const normalized = sanitizeUsername(username);

        if (normalized.length < 3) {
          state.showToast(translate(language, 'toast.invalidUsername'), 'error');
          return buildResult(false, 'Invalid username');
        }

        const nextDisplay = normalized.replace(/_/g, ' ');
        set((currentState) => ({
          profile: {
            ...currentState.profile,
            name: nextDisplay,
            handle: `@${normalized}`,
            avatar: initialsFromName(nextDisplay),
          },
          activity: prependActivity(
            currentState.activity,
            buildActivity('settings', 'Profile updated', `OrbitX username switched to @${normalized}.`),
          ),
          toast: {
            id: `${Date.now()}`,
            message: translate(language, 'toast.profileUpdated'),
            tone: 'success',
          },
        }));
        fireFeedback('success');

        return buildResult(true, 'Profile updated');
      },

      toggleWalletMode: () => {
        set((state) => {
          const language = state.settings.language;
          const nextWalletMode =
            state.profile.walletMode === 'custodial' ? 'non-custodial' : 'custodial';
          fireFeedback('info');

          return {
            profile: {
              ...state.profile,
              walletMode: nextWalletMode,
            },
            activity: prependActivity(
              state.activity,
              buildActivity(
                'settings',
                'Wallet mode switched',
                `Wallet visual mode changed to ${nextWalletMode}.`,
              ),
            ),
            toast: {
              id: `${Date.now()}`,
              message:
                nextWalletMode === 'custodial'
                  ? translate(language, 'toast.walletModeCustodial')
                  : translate(language, 'toast.walletModeNonCustodial'),
              tone: 'info',
            },
          };
        });
      },

      toggleBiometrics: async () => {
        const state = get();
        const language = state.settings.language;

        if (state.walletFuture.biometricsEnabled) {
          set((currentState) => ({
            walletFuture: {
              ...currentState.walletFuture,
              biometricsEnabled: false,
            },
            activity: prependActivity(
              currentState.activity,
              buildActivity('settings', 'Biometrics updated', 'Biometrics disabled for OrbitX.'),
            ),
            toast: {
              id: `${Date.now()}`,
              message: translate(language, 'toast.biometricsOff'),
              tone: 'info',
            },
          }));
          fireFeedback('info');
          return buildResult(true, 'Biometrics disabled');
        }

        const result = await enableBiometricsForOrbitX();
        if (!result.ok) {
          state.showToast(result.message, 'error');
          return buildResult(false, result.message);
        }

        set((currentState) => ({
          walletFuture: {
            ...currentState.walletFuture,
            biometricsEnabled: true,
          },
          activity: prependActivity(
            currentState.activity,
            buildActivity('settings', 'Biometrics updated', 'Biometrics enabled for OrbitX.'),
          ),
          toast: {
            id: `${Date.now()}`,
            message: translate(language, 'toast.biometricsOn'),
            tone: 'success',
          },
        }));
        fireFeedback('success');
        return buildResult(true, 'Biometrics enabled');
      },

      toggleBackupReminder: () => {
        set((state) => {
          const language = state.settings.language;
          const nextValue = !state.walletFuture.backupReminderEnabled;

          return {
            walletFuture: {
              ...state.walletFuture,
              backupReminderEnabled: nextValue,
            },
            activity: prependActivity(
              state.activity,
              buildActivity(
                'settings',
                'Backup reminder updated',
                `Future backup reminder ${nextValue ? 'enabled' : 'disabled'}.`,
              ),
            ),
            toast: {
              id: `${Date.now()}`,
              message: nextValue
                ? translate(language, 'toast.backupReminderOn')
                : translate(language, 'toast.backupReminderOff'),
              tone: 'info',
            },
          };
        });
        fireFeedback('info');
      },

      initializeWalletBeta: async () => {
        const state = get();

        try {
          const [bundle, security] = await Promise.all([
            getOrCreateWalletBundle(),
            getWalletSecurityState(),
          ]);

          set((currentState) => ({
            walletFuture: {
              ...currentState.walletFuture,
              simulated: false,
              portfolioMode: 'onchain',
              syncStatus: 'idle',
              onchainAssets: [],
              supportedRealTokenIds: [],
              seedPhraseStatus: security.confirmedAt ? 'generated' : 'ready',
              seedPhraseRevealedAt: security.revealedAt,
              seedPhraseConfirmedAt: security.confirmedAt,
              receiveAddresses: bundle.receiveAddresses,
              lastWalletInitAt: new Date().toISOString(),
            },
            activity: prependActivity(
              currentState.activity,
              buildActivity(
                'settings',
                'Wallet lista',
                'Direcciones activas para Ethereum, Base, BNB Chain y Solana.',
              ),
            ),
            toast: {
              id: `${Date.now()}`,
              message: 'Wallet lista para recibir',
              tone: 'success',
            },
          }));
          fireFeedback('success');
          void get().syncOnchainPortfolio(true);

          return buildResult(true, 'Wallet initialized');
        } catch (error) {
          state.showToast('No se pudo activar la wallet', 'error');
          return buildResult(false, error instanceof Error ? error.message : 'Wallet init failed');
        }
      },

      connectExternalWallet: async (provider, address) => {
        const state = get();

        try {
          const label = externalWalletProviderLabel(provider);
          const nextAddress = address?.trim() ?? '';

          if (provider === 'walletconnect') {
            state.showToast('WalletConnect queda preparado para la siguiente fase.', 'info');
            return buildResult(false, 'WalletConnect not ready yet');
          }

          if (!nextAddress) {
            state.showToast('Pega tu direccion publica de MetaMask para continuar.', 'error');
            return buildResult(false, 'External wallet address required');
          }

          if (!isValidWalletAddress(nextAddress, 'ethereum')) {
            state.showToast(translate(state.settings.language, 'toast.invalidAddress'), 'error');
            return buildResult(false, 'Invalid external wallet address');
          }

          set((currentState) => ({
            walletFuture: {
              ...currentState.walletFuture,
              externalWallet: {
                provider,
                address: nextAddress,
                simulated: false,
                signingReady: false,
                connectedAt: new Date().toISOString(),
                status: 'connected',
                walletName: label,
                chainId: undefined,
                sessionTopic: undefined,
                lastError: undefined,
              },
            },
            activity: prependActivity(
              currentState.activity,
              buildActivity(
                'settings',
                `${label} conectado`,
                `${label} quedo vinculado con su direccion publica para usarlo como wallet secundaria en OrbitX.`,
              ),
            ),
            toast: {
              id: `${Date.now()}`,
              message: `${label} conectado`,
              tone: 'success',
            },
          }));
          fireFeedback('success');

          return buildResult(true, 'External wallet connected');
        } catch (error) {
          state.showToast(
            error instanceof Error ? error.message : 'No se pudo conectar la wallet externa',
            'error',
          );
          return buildResult(
            false,
            error instanceof Error ? error.message : 'External wallet connection failed',
          );
        }
      },

      disconnectExternalWallet: () => {
        set((state) => ({
          walletFuture: {
            ...state.walletFuture,
            externalWallet: {
              provider: null,
              address: '',
              simulated: true,
              signingReady: false,
              status: 'disconnected',
              walletName: undefined,
              chainId: undefined,
              sessionTopic: undefined,
              lastError: undefined,
            },
          },
          activity: prependActivity(
            state.activity,
            buildActivity('settings', 'Wallet externa desconectada', 'La sesion externa se elimino de OrbitX.'),
          ),
          toast: {
            id: `${Date.now()}`,
            message: 'Wallet externa desconectada',
            tone: 'info',
          },
        }));
        fireFeedback('info');
      },

      depositFunds: (assetId, amount) => {
        const state = get();
        const language = state.settings.language;
        const token = getTokenOrNull(state.tokens, assetId);

        if (!token || amount <= 0) {
          state.showToast(translate(language, 'toast.invalidAmount'), 'error');
          return buildResult(false, 'Invalid amount');
        }

        set((currentState) => {
          const copy = getActivityCopy(
            language,
            'Deposit completed',
            `${roundTo(amount, 4)} ${token.symbol} credited in simulation mode.`,
          );

          return {
            assets: updateAssetBalance(currentState.assets, assetId, amount, token.price),
            activity: prependActivity(
              currentState.activity,
              buildActivity('deposit', copy.title, copy.description),
            ),
            toast: {
              id: `${Date.now()}`,
              message: translate(language, 'toast.depositDone', {
                symbol: token.symbol,
              }),
              tone: 'success',
            },
          };
        });
        fireFeedback('success');

        return buildResult(true, 'Deposit simulated');
      },

      withdrawFunds: (assetId, amount, destination) => {
        const state = get();
        const language = state.settings.language;
        const token = getTokenOrNull(state.tokens, assetId);
        const asset = state.assets.find((item) => item.tokenId === assetId);
        const nextDestination = destination.trim();

        if (!token || !asset || amount <= 0 || asset.amount < amount) {
          state.showToast(translate(language, 'toast.insufficientFunds'), 'error');
          return buildResult(false, 'Insufficient funds');
        }

        if (!nextDestination) {
          state.showToast(translate(language, 'toast.destinationRequired'), 'error');
          return buildResult(false, 'Destination required');
        }

        if (!isValidWalletAddress(nextDestination, getTransferNetwork(token))) {
          state.showToast(translate(language, 'toast.invalidAddress'), 'error');
          return buildResult(false, 'Invalid destination address');
        }

        set((currentState) => ({
          assets: updateAssetBalance(currentState.assets, assetId, -amount, token.price),
          activity: prependActivity(
            currentState.activity,
            buildActivity(
              'withdraw',
              'Withdrawal processed',
              `${roundTo(amount, 4)} ${token.symbol} prepared for ${maskTransferDestination(nextDestination)} in wallet beta.`,
            ),
          ),
          toast: {
            id: `${Date.now()}`,
            message: translate(language, 'toast.withdrawDone', {
              symbol: token.symbol,
            }),
            tone: 'success',
          },
        }));
        fireFeedback('success');

        return buildResult(true, 'Withdrawal simulated');
      },

      sendFunds: (assetId, amount, destination) => {
        const state = get();
        const language = state.settings.language;
        const token = getTokenOrNull(state.tokens, assetId);
        const asset = state.assets.find((item) => item.tokenId === assetId);
        const nextDestination = destination.trim();

        if (!token || !asset || amount <= 0 || asset.amount < amount) {
          state.showToast(translate(language, 'toast.insufficientFunds'), 'error');
          return buildResult(false, 'Insufficient funds');
        }

        if (!nextDestination) {
          state.showToast(translate(language, 'toast.destinationRequired'), 'error');
          return buildResult(false, 'Destination required');
        }

        if (!isValidWalletAddress(nextDestination, getTransferNetwork(token))) {
          state.showToast(translate(language, 'toast.invalidAddress'), 'error');
          return buildResult(false, 'Invalid destination address');
        }

        set((currentState) => ({
          assets: updateAssetBalance(currentState.assets, assetId, -amount, token.price),
          activity: prependActivity(
            currentState.activity,
            buildActivity(
              'send',
              'Transfer simulated',
              `${roundTo(amount, 4)} ${token.symbol} queued for ${maskTransferDestination(nextDestination)} in wallet beta.`,
            ),
          ),
          toast: {
            id: `${Date.now()}`,
            message: translate(language, 'toast.sendDone', {
              symbol: token.symbol,
            }),
            tone: 'success',
          },
        }));
        fireFeedback('success');

        return buildResult(true, 'Send simulated');
      },

      buyToken: (tokenId, usdAmount) => {
        const state = get();
        const language = state.settings.language;
        const token = getTokenOrNull(state.tokens, tokenId);
        const usdAsset = state.assets.find((asset) => asset.tokenId === 'usd');

        if (!token || !token.isTradeable || token.kind === 'cash' || usdAmount <= 0) {
          state.showToast(translate(language, 'toast.orderInvalid'), 'error');
          return buildResult(false, 'Invalid order');
        }

        if (!usdAsset || usdAsset.amount < usdAmount) {
          state.showToast(translate(language, 'toast.insufficientFunds'), 'error');
          return buildResult(false, 'Insufficient funds');
        }

        const tokenAmount = usdAmount / token.price;

        set((currentState) => ({
          assets: updateAssetBalance(
            updateAssetBalance(currentState.assets, 'usd', -usdAmount, 1),
            tokenId,
            tokenAmount,
            token.price,
          ),
          activity: prependActivity(
            currentState.activity,
            buildActivity(
              'buy',
              `Bought ${token.symbol}`,
              `${roundTo(usdAmount, 2)} USD rotated into ${token.symbol}.`,
            ),
          ),
          toast: {
            id: `${Date.now()}`,
            message: translate(language, 'toast.buyDone', {
              symbol: token.symbol,
            }),
            tone: 'success',
          },
        }));
        fireFeedback('success');

        return buildResult(true, 'Buy simulated');
      },

      sellToken: (tokenId, usdAmount) => {
        const state = get();
        const language = state.settings.language;
        const token = getTokenOrNull(state.tokens, tokenId);
        const asset = state.assets.find((item) => item.tokenId === tokenId);

        if (!token || !asset || usdAmount <= 0) {
          state.showToast(translate(language, 'toast.orderInvalid'), 'error');
          return buildResult(false, 'Invalid order');
        }

        const tokenAmount = usdAmount / token.price;
        if (asset.amount < tokenAmount) {
          state.showToast(translate(language, 'toast.insufficientFunds'), 'error');
          return buildResult(false, 'Insufficient token balance');
        }

        set((currentState) => ({
          assets: updateAssetBalance(
            updateAssetBalance(currentState.assets, tokenId, -tokenAmount, token.price),
            'usd',
            usdAmount,
            1,
          ),
          activity: prependActivity(
            currentState.activity,
            buildActivity(
              'sell',
              `Sold ${token.symbol}`,
              `${roundTo(usdAmount, 2)} USD realized from ${token.symbol}.`,
            ),
          ),
          toast: {
            id: `${Date.now()}`,
            message: translate(language, 'toast.sellDone', {
              symbol: token.symbol,
            }),
            tone: 'success',
          },
        }));
        fireFeedback('success');

        return buildResult(true, 'Sell simulated');
      },

      createToken: (payload: CreateTokenPayload) => {
        const state = get();
        const language = state.settings.language;
        const normalizedSymbol = normalizeTicker(payload.symbol);
        const normalizedName = payload.name.trim();
        const chainConfig = getLaunchChainConfig(payload.chain);
        const normalizedDescription = payload.description?.trim();
        const normalizedSupply = Number(payload.supply);
        const walletNetwork =
          payload.chain === 'ethereum' ||
          payload.chain === 'base' ||
          payload.chain === 'bnb' ||
          payload.chain === 'solana'
            ? payload.chain
            : undefined;

        if (!normalizedName || normalizedSymbol.length < 2 || !Number.isFinite(normalizedSupply) || normalizedSupply <= 0) {
          state.showToast(translate(language, 'toast.incompleteToken'), 'error');
          return buildResult(false, 'Incomplete token data');
        }

        if (!chainConfig || !chainConfig.tokenCreationEnabled) {
          state.showToast(chainConfig?.helperText ?? 'Red no disponible para crear tokens', 'error');
          return buildResult(false, 'Unsupported launch chain');
        }

        if (
          state.tokens.some(
            (token) =>
              token.symbol.toLowerCase() === normalizedSymbol.toLowerCase() ||
              token.name.toLowerCase() === normalizedName.toLowerCase(),
          )
        ) {
          state.showToast(translate(language, 'toast.duplicateToken'), 'error');
          return buildResult(false, 'Duplicate token');
        }

        const colorPalette = ['#7B3FE4', '#00C2FF', '#00FFA3', '#FF7A59', '#FF7AAB', '#FFB84D'];
        const createdAt = new Date().toISOString();
        const nextToken: MarketToken = {
          id: `custom-${normalizedSymbol.toLowerCase()}-${Date.now()}`,
          name: normalizedName,
          symbol: normalizedSymbol,
          price: 0,
          change24h: 0,
          marketCap: 0,
          volume24h: 0,
          holders: 1,
          color: sample(colorPalette),
          categories: [],
          description:
            normalizedDescription ||
            `${normalizedName} fue desplegado on-chain y queda listo para crear liquidez cuando tu decidas lanzarlo.`,
          logo: payload.logo ?? null,
          creator: state.profile.handle,
          contractAddress: payload.contractAddress,
          deploymentTxHash: payload.deploymentTxHash,
          deployerAddress: payload.deployerAddress,
          tokenSupply: payload.supply,
          tokenDecimals: payload.decimals,
          chainId: chainConfig.chainId ?? null,
          chain: payload.chain,
          launchVenue: payload.launchVenue,
          launchStatus: 'created',
          listingStatus: 'created',
          listingType: null,
          contractSafety: null,
          preListingValidation: null,
          liquidity: null,
          liquidityLock: null,
          liquidityPoolUsd: 0,
          houseFeePct: 1.5,
          createdAt,
          updatedAt: createdAt,
          isTradeable: false,
          isUserCreated: true,
          kind: 'meme',
          sparkline: Array.from({ length: 18 }, () => 0),
        };
        nextToken.transparency = buildTransparencyPayload(nextToken);

        set((currentState) => ({
          tokens: [nextToken, ...currentState.tokens],
          walletFuture: {
            ...currentState.walletFuture,
            onchainAssets: walletNetwork
              ? [
                  {
                    tokenId: nextToken.id,
                    amount: normalizedSupply,
                    averageCost: 0,
                    network: walletNetwork,
                  },
                  ...currentState.walletFuture.onchainAssets.filter(
                    (asset) => asset.tokenId !== nextToken.id,
                  ),
                ]
              : currentState.walletFuture.onchainAssets,
            supportedRealTokenIds: [
              nextToken.id,
              ...currentState.walletFuture.supportedRealTokenIds.filter((item) => item !== nextToken.id),
            ],
          },
          feed: [
            buildCreatorPost(
              language,
              normalizedName,
              normalizedSymbol,
              currentState.profile.handle,
              currentState.profile.avatar,
              payload.chain,
              payload.launchVenue,
            ),
            ...currentState.feed,
          ],
          activity: prependActivity(
            currentState.activity,
            buildActivity(
              'create_token',
              `${normalizedSymbol} created`,
              `${normalizedName} fue desplegado on-chain en ${payload.chain} con contrato ${payload.contractAddress}.`,
            ),
          ),
          toast: {
            id: `${Date.now()}`,
            message: `${normalizedSymbol} creado on-chain`,
            tone: 'success',
          },
        }));
        fireFeedback('success');

        return {
          ok: true,
          message: 'Token created',
          tokenId: nextToken.id,
        };
      },

      markTokenReadyToList: (tokenId) => {
        const state = get();
        const token = getTokenOrNull(state.tokens, tokenId);

        if (!token || !token.isUserCreated) {
          return buildResult(false, 'Token not available');
        }

        set((currentState) => ({
          tokens: currentState.tokens.map((currentToken) =>
            currentToken.id === tokenId
              ? {
                  ...currentToken,
                  listingStatus: currentToken.listingStatus === 'created' ? 'ready_to_list' : currentToken.listingStatus,
                  updatedAt: new Date().toISOString(),
                }
              : currentToken,
          ),
        }));

        return buildResult(true, 'Token ready to list');
      },

      updateTokenRecord: (tokenId, payload) => {
        const state = get();
        const token = getTokenOrNull(state.tokens, tokenId);

        if (!token) {
          return buildResult(false, 'Token not available');
        }

        const nextUpdatedAt = new Date().toISOString();

        set((currentState) => ({
          tokens: currentState.tokens.map((currentToken) => {
            if (currentToken.id !== tokenId) {
              return currentToken;
            }

            const nextToken: MarketToken = {
              ...currentToken,
              ...payload,
              updatedAt: nextUpdatedAt,
            };

            return {
              ...nextToken,
              transparency: buildTransparencyPayload(nextToken),
            };
          }),
        }));

        return buildResult(true, 'Token updated');
      },

      launchToken: (tokenId, payload) => {
        const state = get();
        const token = getTokenOrNull(state.tokens, tokenId);
        const dexConfig = payload.mode === 'dex' && payload.dexNetwork ? getDexChainConfig(payload.dexNetwork) : null;

        if (!token || !token.isUserCreated) {
          state.showToast('Token no disponible para lanzamiento', 'error');
          return buildResult(false, 'Token not available');
        }

        if (payload.liquidityPoolUsd <= 0) {
          state.showToast('Define una liquidez inicial valida', 'error');
          return buildResult(false, 'Invalid liquidity');
        }

        if (payload.mode === 'dex' && (!dexConfig || !dexConfig.liquidityEnabled)) {
          state.showToast(dexConfig?.helperText ?? 'Esta red aun no permite liquidez', 'error');
          return buildResult(false, 'DEX network unavailable');
        }

        if (payload.listingType === 'orbitx_protected') {
          if (payload.contractSafety?.status !== 'passed') {
            state.showToast('El listado protegido de OrbitX necesita checks aprobados.', 'error');
            return buildResult(false, 'Protected checks missing');
          }

          if (payload.preListingValidation?.status !== 'passed') {
            state.showToast('El listado protegido de OrbitX necesita validacion real de compra y venta.', 'error');
            return buildResult(false, 'Protected trade validation missing');
          }

          if (payload.liquidityLock?.status !== 'locked') {
            state.showToast('El listado protegido de OrbitX requiere un bloqueo de liquidez confirmado.', 'error');
            return buildResult(false, 'Protected liquidity lock missing');
          }
        }

        const nextVenue = payload.mode === 'orbitx' ? 'orbitx' : payload.dexVenue ?? inferVenueFromDexNetwork(payload.dexNetwork);
        const poolAddress = payload.poolAddress ?? payload.poolReference ?? null;
        const nextCategories = getLifecycleCategories(payload.liquidityPoolUsd);
        const nextUpdatedAt = new Date().toISOString();

        set((currentState) => ({
          tokens: currentState.tokens.map((currentToken) =>
            currentToken.id === tokenId
              ? {
                  ...currentToken,
                  launchMode: payload.mode,
                  dexNetwork: payload.mode === 'dex' ? payload.dexNetwork : undefined,
                  launchVenue: nextVenue,
                  poolReference: poolAddress,
                  poolAddress,
                  launchStatus: 'launched',
                  listingStatus: payload.lifecycleStatus,
                  listingType: payload.listingType,
                  contractSafety: payload.contractSafety ?? currentToken.contractSafety ?? null,
                  preListingValidation:
                    payload.preListingValidation ?? currentToken.preListingValidation ?? null,
                  liquidityLock: payload.liquidityLock ?? currentToken.liquidityLock ?? null,
                  liquidity: poolAddress
                    ? {
                        listingType: payload.listingType,
                        network: currentToken.chain ?? currentToken.dexNetwork ?? 'base',
                        dexVenue: nextVenue,
                        poolAddress,
                        creatorWallet:
                          payload.creatorWallet ??
                          currentToken.deployerAddress ??
                          currentState.walletFuture.receiveAddresses.base,
                        tokenAddress: currentToken.contractAddress ?? '',
                        pairKind: payload.pairKind ?? 'native',
                        quoteTokenId: payload.quoteTokenId,
                        quoteAddress: payload.quoteAddress,
                        quoteDecimals: payload.quoteDecimals,
                        tokenDecimals: payload.tokenDecimals ?? currentToken.tokenDecimals ?? 18,
                        tokenAmount: String(payload.tokenLiquidityAmount ?? 0),
                        quoteAmount: String(payload.quoteLiquidityAmount ?? 0),
                        liquidityAmountUsd: roundTo(payload.liquidityPoolUsd, 2),
                        lpTokenAmount: payload.lpTokenAmount,
                        createdAt: nextUpdatedAt,
                        txHash: payload.liquidityTxHash ?? '',
                      }
                    : currentToken.liquidity ?? null,
                  categories: nextCategories,
                  liquidityPoolUsd: roundTo(payload.liquidityPoolUsd, 2),
                  liquidityTxHash: payload.liquidityTxHash ?? currentToken.liquidityTxHash ?? null,
                  quoteTokenId: payload.quoteTokenId ?? currentToken.quoteTokenId ?? null,
                  quoteAddress: payload.quoteAddress ?? currentToken.quoteAddress ?? null,
                  quoteDecimals: payload.quoteDecimals ?? currentToken.quoteDecimals ?? null,
                  tokenDecimals: payload.tokenDecimals ?? currentToken.tokenDecimals ?? 18,
                  chainId: payload.chainId ?? currentToken.chainId ?? null,
                  isTradeable:
                    payload.listingType === 'external' || payload.lifecycleStatus === 'orbitx_listed',
                  price: payload.priceUsd ?? currentToken.price,
                  marketCap: payload.marketCapUsd ?? currentToken.marketCap,
                  updatedAt: nextUpdatedAt,
                  transparency: buildTransparencyPayload({
                    ...currentToken,
                    chain: currentToken.chain ?? 'base',
                    chainId: payload.chainId ?? currentToken.chainId ?? undefined,
                    poolAddress,
                    liquidityTxHash: payload.liquidityTxHash,
                    liquidityLock: payload.liquidityLock ?? currentToken.liquidityLock ?? null,
                  }),
                }
              : currentToken,
          ),
          activity: prependActivity(
            currentState.activity,
            buildActivity(
              'create_token',
              payload.listingType === 'orbitx_protected'
                ? `${token.symbol} listado protegido activado`
                : `${token.symbol} listado externo activado`,
              payload.listingType === 'orbitx_protected'
                ? `${token.symbol} paso checks reales, creo liquidez y confirmo bloqueo en ${poolAddress ?? 'pool'}`
                : `${token.symbol} creo liquidez real y quedo marcado como solo listado externo.`,
            ),
          ),
          toast: {
            id: `${Date.now()}`,
            message:
              payload.listingType === 'orbitx_protected'
                ? `${token.symbol} listado en OrbitX`
                : `${token.symbol} listado en DEX`,
            tone: 'success',
          },
        }));
        fireFeedback('success');

        return {
          ok: true,
          message: 'Token launched',
          poolAddress: poolAddress ?? undefined,
        };
      },

      setBotEnabled: (enabled) => {
        set((state) => ({
          bot: {
            ...state.bot,
            enabled,
          },
          activity: prependActivity(
            state.activity,
            buildActivity(
              'bot',
              enabled ? 'Bot activated' : 'Bot paused',
              enabled ? 'Auto trading resumed in simulation mode.' : 'Auto trading paused from the premium dashboard.',
            ),
          ),
          toast: {
            id: `${Date.now()}`,
            message: enabled
              ? translate(state.settings.language, 'toast.botOn')
              : translate(state.settings.language, 'toast.botOff'),
            tone: 'info',
          },
        }));
        fireFeedback('info');
      },

      setBotMarketType: (marketType: BotMarketType) => {
        set((state) => ({
          bot: {
            ...state.bot,
            marketType,
            maxDailyTrades:
              marketType === 'futures'
                ? Math.min(state.bot.maxDailyTrades, 18)
                : state.bot.risk === 'conservative'
                  ? 12
                  : state.bot.risk === 'aggressive'
                    ? 36
                    : 24,
          },
          activity: prependActivity(
            state.activity,
            buildActivity(
              'bot',
              'Bot market updated',
              `Bot market switched to ${marketType}.`,
            ),
          ),
          toast: {
            id: `${Date.now()}`,
            message:
              marketType === 'futures'
                ? 'Bot de futuros listo'
                : 'Bot spot listo',
            tone: 'info',
          },
        }));
        fireFeedback('info');
      },

      setBotRisk: (risk: BotRisk) => {
        set((state) => ({
          bot: {
            ...state.bot,
            risk,
            maxDailyTrades:
              state.bot.marketType === 'futures'
                ? risk === 'conservative'
                  ? 8
                  : risk === 'aggressive'
                    ? 18
                    : 12
                : risk === 'conservative'
                  ? 12
                  : risk === 'aggressive'
                    ? 36
                    : 24,
          },
          activity: prependActivity(
            state.activity,
            buildActivity(
              'bot',
              'Bot strategy updated',
              `Risk profile switched to ${risk}.`,
            ),
          ),
          toast: {
            id: `${Date.now()}`,
            message: translate(state.settings.language, 'toast.botMode', {
              risk,
            }),
            tone: 'info',
          },
        }));
        fireFeedback('info');
      },

      setBotTargetToken: (tokenId) => {
        set((state) => ({
          bot: {
            ...state.bot,
            selectedTokenId: tokenId,
          },
        }));
        void Haptics.selectionAsync();
      },

      setBotQuoteAsset: (assetId) => {
        set((state) => {
          const quoteAsset = state.assets.find((asset) => asset.tokenId === assetId);
          const percent = state.bot.allocationPct;

          return {
            bot: {
              ...state.bot,
              selectedQuoteAssetId: assetId,
              allocatedUsd: roundTo(((quoteAsset?.amount ?? 0) * percent) / 100, 2),
            },
          };
        });
        void Haptics.selectionAsync();
      },

      setBotAllocationPct: (percent) => {
        set((state) => {
          const quoteAsset = state.assets.find(
            (asset) => asset.tokenId === state.bot.selectedQuoteAssetId,
          );
          const safePercent = clamp(Math.round(percent), 5, 100);
          const allocatedUsd = roundTo(((quoteAsset?.amount ?? 0) * safePercent) / 100, 2);

          return {
            bot: {
              ...state.bot,
              allocationPct: safePercent,
              allocatedUsd,
            },
          };
        });
        void Haptics.selectionAsync();
      },

      activateBot: () => {
        const state = get();
        const language = state.settings.language;
        const selectedToken = getTokenOrNull(state.tokens, state.bot.selectedTokenId);
        const quoteAsset = state.assets.find(
          (asset) => asset.tokenId === state.bot.selectedQuoteAssetId,
        );
        const feeUsd = roundTo((state.bot.allocatedUsd * state.bot.feePct) / 100, 2);
        const modeLabel = state.bot.marketType === 'futures' ? 'futuros' : 'spot';

        if (!selectedToken || state.bot.allocatedUsd <= 0) {
          state.showToast('Elige una moneda y un porcentaje valido', 'error');
          return buildResult(false, 'Bot missing configuration');
        }

        if (!quoteAsset || quoteAsset.amount < feeUsd) {
          state.showToast(translate(language, 'toast.insufficientFunds'), 'error');
          return buildResult(false, 'Insufficient USD for bot fee');
        }

        set((currentState) => ({
          assets: updateAssetBalance(
            currentState.assets,
            currentState.bot.selectedQuoteAssetId,
            -feeUsd,
            1,
          ),
          bot: {
            ...currentState.bot,
            enabled: true,
            lastFeeUsd: feeUsd,
          },
          activity: prependActivity(
            currentState.activity,
            buildActivity(
              'bot',
              'Bot activated',
              `Bot ${modeLabel} listo sobre ${selectedToken.symbol}/${currentState.bot.selectedQuoteAssetId.toUpperCase()} con ${currentState.bot.allocationPct}% del capital y fee del ${currentState.bot.feePct}%.`,
            ),
          ),
          toast: {
            id: `${Date.now()}`,
            message: `Bot ${modeLabel} activado en ${selectedToken.symbol}. Fee: ${feeUsd} ${currentState.bot.selectedQuoteAssetId.toUpperCase()}`,
            tone: 'success',
          },
        }));
        fireFeedback('success');

        return buildResult(true, 'Bot activated');
      },

      createFeedPost: (text, tokenSymbol) => {
        const state = get();
        const language = state.settings.language;
        const normalizedText = normalizeCommunityText(text);
        const normalizedSymbol = normalizeTicker(tokenSymbol ?? '');
        const latestOwnPost = state.feed.find(
          (post) => post.handle === state.profile.handle,
        );

        if (!normalizedText) {
          state.showToast('Escribe una idea corta sobre mercado o tokens', 'error');
          return buildResult(false, 'Empty post');
        }

        if (normalizedText.length > COMMUNITY_POST_LIMIT) {
          state.showToast(`Maximo ${COMMUNITY_POST_LIMIT} caracteres`, 'error');
          return buildResult(false, 'Post too long');
        }

        if (!hasCryptoContext(normalizedText, normalizedSymbol)) {
          state.showToast('Publica solo noticias o ideas sobre crypto', 'error');
          return buildResult(false, 'Post outside crypto scope');
        }

        if (
          latestOwnPost &&
          Date.now() - new Date(latestOwnPost.timestamp).getTime() < COMMUNITY_POST_COOLDOWN_MS
        ) {
          state.showToast('Espera unos segundos antes de publicar otra vez', 'error');
          return buildResult(false, 'Posting too quickly');
        }

        if (
          latestOwnPost &&
          latestOwnPost.content.trim().toLowerCase() === normalizedText.toLowerCase()
        ) {
          state.showToast('Esa publicacion ya existe', 'error');
          return buildResult(false, 'Duplicate post');
        }

        set((currentState) => ({
          feed: [
            {
              id: `post-${Date.now()}`,
              author: currentState.profile.name,
              handle: currentState.profile.handle,
              avatar: currentState.profile.avatar,
              content: normalizedText,
              timestamp: new Date().toISOString(),
              tokenSymbols: normalizedSymbol ? [normalizedSymbol] : [],
              reactions: { fire: 0, rocket: 0, diamond: 0 },
              comments: [],
            },
            ...currentState.feed,
          ],
          activity: prependActivity(
            currentState.activity,
            buildActivity(
              'social',
              'Community post created',
              normalizedText,
            ),
          ),
          toast: {
            id: `${Date.now()}`,
            message:
              language === 'en'
                ? 'Post published'
                : language === 'pt'
                  ? 'Publicacao publicada'
                  : 'Publicacion publicada',
            tone: 'success',
          },
        }));
        fireFeedback('success');

        return buildResult(true, 'Community post created');
      },

      addReaction: (postId, reaction: ReactionKey) => {
        set((state) => ({
          feed: state.feed.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  reactions: {
                    ...post.reactions,
                    [reaction]: post.reactions[reaction] + 1,
                  },
                }
              : post,
          ),
        }));
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },

      addComment: (postId, text) => {
        const state = get();
        const language = state.settings.language;
        const trimmedText = text.trim();
        if (!trimmedText) {
          state.showToast(translate(language, 'toast.commentEmpty'), 'error');
          return buildResult(false, 'Empty comment');
        }

        set((currentState) => ({
          feed: currentState.feed.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: [
                    {
                      id: `comment-${Date.now()}`,
                      author: currentState.profile.name,
                      handle: currentState.profile.handle,
                      avatar: currentState.profile.avatar,
                      text: trimmedText,
                      timestamp: new Date().toISOString(),
                    },
                    ...post.comments,
                  ],
                }
              : post,
          ),
          activity: prependActivity(
            currentState.activity,
            buildActivity('social', 'Comment posted', trimmedText),
          ),
          toast: {
            id: `${Date.now()}`,
            message: translate(language, 'toast.commentSent'),
            tone: 'success',
          },
        }));
        fireFeedback('success');

        return buildResult(true, 'Comment posted');
      },

      syncLiveMarket: async (force = false) => {
        const state = get();
        const lastSync = state.walletFuture.lastMarketSyncAt
          ? new Date(state.walletFuture.lastMarketSyncAt).getTime()
          : 0;

        if (liveMarketSyncInFlight) {
          return;
        }

        if (!force && lastSync && Date.now() - lastSync < 20_000) {
          return;
        }

        try {
          liveMarketSyncInFlight = true;
          const rows = await fetchLiveMarketRows();
          const mergedTokens = mergeLiveRows(get().tokens, rows);

          set((state) => ({
            tokens: mergedTokens,
            walletFuture: {
              ...state.walletFuture,
              onchainAssets: mapReferenceCosts(state.walletFuture.onchainAssets, mergedTokens),
              lastMarketSyncAt: new Date().toISOString(),
            },
          }));
        } catch {
          // Keep local simulation alive when the network is unavailable.
        } finally {
          liveMarketSyncInFlight = false;
        }
      },

      syncOnchainPortfolio: async (force = false) => {
        const state = get();
        const lastSync = state.walletFuture.lastOnchainSyncAt
          ? new Date(state.walletFuture.lastOnchainSyncAt).getTime()
          : 0;

        if (onchainSyncInFlight || state.walletFuture.syncStatus === 'syncing') {
          return;
        }

        if (!force && lastSync && Date.now() - lastSync < 15_000) {
          return;
        }

        set((currentState) => ({
          walletFuture: {
            ...currentState.walletFuture,
            syncStatus: 'syncing',
            lastOnchainSyncError: '',
          },
        }));

        try {
          const storedWallet = await getStoredWalletBundle();
          if (!storedWallet) {
            set((currentState) => ({
              walletFuture: {
                ...currentState.walletFuture,
                syncStatus: 'idle',
                lastOnchainSyncError: '',
              },
            }));
            return;
          }

          onchainSyncInFlight = true;
          const snapshot = await fetchOnchainPortfolio();

          set((currentState) => {
            const persistedCustomAssets = currentState.walletFuture.onchainAssets.filter((asset) =>
              currentState.tokens.some(
                (token) => token.id === asset.tokenId && token.isUserCreated,
              ),
            );
            const mergedOnchainAssets = [
              ...snapshot.assets,
              ...persistedCustomAssets.filter(
                (asset) =>
                  !snapshot.assets.some(
                    (snapshotAsset) =>
                      snapshotAsset.tokenId === asset.tokenId &&
                      snapshotAsset.network === asset.network,
                  ),
              ),
            ];

            return {
              walletFuture: {
                ...currentState.walletFuture,
                simulated: false,
                portfolioMode: 'onchain',
                syncStatus: 'success',
                onchainAssets: mapReferenceCosts(mergedOnchainAssets, currentState.tokens),
                supportedRealTokenIds: Array.from(
                  new Set([
                    ...snapshot.supportedTokenIds,
                    ...persistedCustomAssets.map((asset) => asset.tokenId),
                  ]),
                ),
                receiveAddresses: snapshot.receiveAddresses,
                lastOnchainSyncAt: snapshot.fetchedAt,
                lastOnchainSyncError: '',
              },
              activity:
                !currentState.walletFuture.lastOnchainSyncAt || force
                  ? prependActivity(
                      currentState.activity,
                      buildActivity(
                        'settings',
                        'Mainnet synced',
                        'Portfolio real actualizado desde Base, BNB Chain y Solana.',
                      ),
                    )
                  : currentState.activity,
            };
          });
        } catch (error) {
          set((currentState) => ({
            walletFuture: {
              ...currentState.walletFuture,
              syncStatus: 'error',
              lastOnchainSyncError:
                error instanceof Error ? error.message : 'Onchain sync failed',
            },
          }));
        } finally {
          onchainSyncInFlight = false;
        }
      },

      tickMarket: () => {
        set((state) => {
          const nextTokens = state.tokens.map((token) => {
            if (!token.isTradeable || token.kind === 'cash' || token.coingeckoId) {
              return token;
            }

            const volatility =
              token.kind === 'meme'
                ? 2.85
                : token.kind === 'bluechip'
                  ? 0.75
                  : token.kind === 'layer1'
                    ? 1.55
                    : 1.2;
            const momentumBoost = token.isUserCreated ? 0.25 : token.change24h > 0 ? 0.12 : -0.08;
            const deltaPct = clamp(randomBetween(-volatility, volatility) + momentumBoost, -4.8, 5.4);
            const nextPrice = roundAdaptivePrice(
              Math.max(token.price * (1 + deltaPct / 100), token.price * 0.65),
            );

            return {
              ...token,
              price: nextPrice,
              change24h: roundTo(clamp(token.change24h * 0.9 + deltaPct * 1.25, -42, 84), 2),
              marketCap: Math.round(Math.max(token.marketCap * (1 + deltaPct / 100), 850_000)),
              volume24h: Math.round(
                Math.max(token.volume24h * (1 + randomBetween(-0.09, 0.12)), 120_000),
              ),
              holders: Math.max(token.holders + Math.round(randomBetween(-6, 18)), 80),
              sparkline: [...token.sparkline.slice(-17), nextPrice],
            };
          });

          const nextBot = simulateBot(state.bot, nextTokens);

          return {
            tokens: nextTokens,
            bot: nextBot,
          };
        });
      },
    }),
    {
      name: ORBITX_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persistedState, currentState) =>
        mergePersistedState(persistedState, currentState as OrbitStore),
      partialize: (state) => ({
        profile: state.profile,
        settings: state.settings,
        walletFuture: state.walletFuture,
        tokens: state.tokens,
        assets: state.assets,
        bot: state.bot,
        feed: state.feed,
        activity: state.activity,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          devWarn('[OrbitX] Persist hydration failed, using initial state.', error);
        }

        if (state) {
          useOrbitStore.setState((current) => ({
            settings: {
              ...current.settings,
              language: normalizeLanguageCode(current.settings.language),
              orbitMotionPreset:
                current.settings.orbitMotionPreset === 'bear'
                  ? 'bear'
                  : current.settings.orbitMotionPreset === 'battle'
                    ? 'battle'
                    : 'bull',
            },
          }));
          state.setHasHydrated(true);
          return;
        }

        useOrbitStore.setState({ hasHydrated: true });
      },
    },
  ),
);

import { router, usePathname } from 'expo-router';

import { formatCurrencyByLanguage, translate } from '../../constants/i18n';
import { useOrbitStore } from '../../store/useOrbitStore';
import { useAuthStore } from '../store/authStore';
import { getLocalizedAstraSurfaceLabel } from '../services/astra/astraCore';
import { useSecurityCenterStore } from '../store/securityCenterStore';
import { useWalletStore } from '../store/walletStore';
import { useAstraStore } from '../store/astraStore';
import type { AstraSupportContext, AstraSurface } from '../types/astra';

type OpenAstraPayload = Omit<
  AstraSupportContext,
  | 'language'
  | 'path'
  | 'screenName'
  | 'walletReady'
  | 'walletStatusLabel'
  | 'seedBackedUp'
  | 'externalWalletConnected'
  | 'emailVerified'
  | 'accountStatusLabel'
  | 'balanceLabel'
  | 'spotBalanceLabel'
  | 'web3BalanceLabel'
> & {
  path?: string;
  screenName?: string;
};

function inferSurface(pathname: string | null): AstraSurface {
  const path = pathname ?? '/';

  if (path.includes('/create-token')) return 'create_token';
  if (path.includes('/bot-futures')) return 'bot_futures';
  if (path.includes('/social')) return 'social';
  if (path.includes('/markets') || path.includes('/market')) return 'market';
  if (path.includes('/security')) return 'security';
  if (path.includes('/settings') || path.includes('/personalization') || path.includes('/language')) return 'settings';
  if (path.includes('/pool')) return 'pool';
  if (path.includes('/wallet')) return 'wallet';
  if (path.includes('/ramp') || path.includes('/convert')) return 'ramp';
  if (path.includes('/spot') || path.includes('/trade')) return 'trade';
  if (path.includes('/profile')) return 'profile';
  if (path.includes('/error') || path.includes('not-found')) return 'error';
  if (path.includes('/home')) return 'home';
  return 'general';
}

function inferScreenName(surface: AstraSurface, language: AstraSupportContext['language']) {
  return getLocalizedAstraSurfaceLabel(language, surface);
}

function formatUsd(language: AstraSupportContext['language'], value: number) {
  return formatCurrencyByLanguage(language, value, 'USD');
}

export function useAstra() {
  const pathname = usePathname();
  const language = useOrbitStore((state) => state.settings.language);
  const ask = useAstraStore((state) => state.ask);
  const rememberContext = useAstraStore((state) => state.rememberContext);
  const walletReady = useWalletStore((state) => state.isWalletReady);
  const securityStatus = useWalletStore((state) => state.securityStatus);
  const externalWalletAddress = useWalletStore((state) => state.externalWallet.address);
  const web3Assets = useWalletStore((state) => state.assets);
  const spotBalances = useWalletStore((state) => state.spotBalances);
  const twoFactorEnabled = useSecurityCenterStore((state) => state.twoFactor.enabled);
  const activeSessions = useSecurityCenterStore((state) => state.activeSessions);
  const autoLockMinutes = useSecurityCenterStore((state) => state.autoLockMinutes);
  const emailVerified = useAuthStore((state) => state.session.emailConfirmed);
  const accountStatus = useAuthStore((state) => state.session.status);
  const bot = useOrbitStore((state) => state.bot);
  const tokens = useOrbitStore((state) => state.tokens);
  const assets = useOrbitStore((state) => state.assets);

  const totalWeb3 = web3Assets.reduce((sum, asset) => sum + asset.usdValue, 0);
  const totalSpot = spotBalances.reduce((sum, asset) => sum + asset.amount, 0);
  const selectedBotToken = tokens.find((token) => token.id === bot.selectedTokenId);
  const selectedQuoteAsset = assets.find((asset) => asset.tokenId === bot.selectedQuoteAssetId);

  function buildContext(payload: OpenAstraPayload): AstraSupportContext {
    const surface = payload.surface ?? inferSurface(pathname);
    return {
      ...payload,
      surface,
      language,
      path: payload.path ?? pathname ?? '/',
      screenName:
        payload.screenName ??
        payload.surfaceTitle ??
        inferScreenName(surface, language),
      walletReady,
      walletStatusLabel: walletReady
        ? translate(language, 'astra.context.walletReady')
        : translate(language, 'astra.context.noWallet'),
      seedBackedUp: Boolean(securityStatus.seedPhraseConfirmedAt),
      externalWalletConnected: Boolean(externalWalletAddress),
      emailVerified,
      twoFactorEnabled,
      activeSessionsCount: activeSessions.length,
      autoLockMinutes,
      accountStatusLabel:
        accountStatus === 'authenticated'
          ? emailVerified
            ? translate(language, 'astra.context.verifiedAccount')
            : translate(language, 'astra.context.emailPending')
          : translate(language, 'astra.context.sessionClosed'),
      balanceLabel: formatUsd(language, totalWeb3 + totalSpot),
      spotBalanceLabel: formatUsd(language, totalSpot),
      web3BalanceLabel: formatUsd(language, totalWeb3),
      botEnabled: bot.enabled,
      botRiskLabel:
        bot.risk === 'conservative'
          ? language === 'es'
            ? 'Conservador'
            : 'Conservative'
          : bot.risk === 'aggressive'
            ? language === 'es'
              ? 'Agresivo'
              : 'Aggressive'
            : language === 'es'
              ? 'Moderado'
              : 'Balanced',
      botTokenLabel: selectedBotToken
        ? `${selectedBotToken.symbol}/${bot.selectedQuoteAssetId.toUpperCase()}`
        : undefined,
      botAllocationLabel:
        bot.allocatedUsd > 0
          ? `${formatUsd(language, bot.allocatedUsd)} · ${bot.allocationPct}%`
          : selectedQuoteAsset
            ? `${bot.allocationPct}% ${language === 'es' ? 'del saldo' : 'of balance'}`
            : undefined,
      botDailyPnlLabel:
        bot.enabled || bot.dailyPnlUsd !== 0
          ? `${formatUsd(language, bot.dailyPnlUsd)} · ${bot.dailyGainPct >= 0 ? '+' : ''}${bot.dailyGainPct.toFixed(2)}%`
          : undefined,
      botStatusLabel: bot.enabled
        ? language === 'es'
          ? 'Bot activo'
          : 'Bot enabled'
        : language === 'es'
          ? 'Bot en pausa'
          : 'Bot paused',
      botMaxTradesLabel:
        language === 'es'
          ? `${bot.maxDailyTrades} trades max/dia`
          : `${bot.maxDailyTrades} max trades/day`,
    };
  }

  return {
    language,
    openAstra: (payload: OpenAstraPayload) => {
      const nextContext = buildContext(payload);

      rememberContext(nextContext);
      useAstraStore.setState({
        context: nextContext,
        isOpen: false,
        isExpanded: false,
        activeRequestId: null,
        isTyping: false,
      });
      router.push('/astra');
    },
    openAstraWithQuestion: async (payload: OpenAstraPayload, question: string) => {
      const trimmed = question.trim();
      const nextContext = buildContext(payload);
      rememberContext(nextContext);
      useAstraStore.setState({
        context: nextContext,
        isOpen: false,
        isExpanded: false,
        activeRequestId: null,
        isTyping: false,
      });
      router.push('/astra');
      if (!trimmed) {
        return null;
      }

      return ask(trimmed);
    },
  };
}

import { formatCurrencyByLanguage, translate } from '../../../constants/i18n';
import { useOrbitStore } from '../../../store/useOrbitStore';
import { useAuthStore } from '../../store/authStore';
import { useSecurityCenterStore } from '../../store/securityCenterStore';
import { useSocialStore } from '../../store/socialStore';
import { useWalletStore } from '../../store/walletStore';
import type {
  AstraContextLabels,
  AstraLanguage,
  AstraSelectedEntity,
  AstraSupportContext,
  AstraSurface,
} from '../../types/astra';
import { getAstraCapabilities } from './astraCapabilities';
import { getLocalizedAstraSurfaceLabel } from './astraCore';

type PartialAstraContext = Partial<AstraSupportContext>;

interface BuildAstraContextOptions {
  pathname?: string | null;
  language?: AstraLanguage;
  previousContext?: AstraSupportContext | null;
}

function formatUsd(language: AstraLanguage, value: number) {
  return formatCurrencyByLanguage(language, value, 'USD');
}

function normalizePathname(value: string | null | undefined) {
  const trimmed = `${value ?? ''}`.trim();
  return trimmed || '/';
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function resolvePreviousContext(
  previousContext: AstraSupportContext | null | undefined,
  surface: AstraSurface,
  path: string,
) {
  if (!previousContext) {
    return null;
  }

  return previousContext.surface === surface && previousContext.path === path
    ? previousContext
    : null;
}

function inferCurrentTask(
  surface: AstraSurface,
  context: PartialAstraContext,
  walletReady: boolean,
) {
  if (context.currentTask) {
    return context.currentTask;
  }

  switch (surface) {
    case 'wallet':
      return walletReady ? 'wallet_management' : 'wallet_setup';
    case 'trade':
      return context.currentPairSymbol ? 'trade_pair_review' : 'trade_overview';
    case 'market':
      return 'market_discovery';
    case 'create_token':
      return 'create_token_flow';
    case 'bot_futures':
      return 'bot_futures_control';
    case 'social':
      return 'social_exploration';
    case 'security':
      return 'security_review';
    case 'settings':
      return 'settings_preferences';
    case 'pool':
      return 'pool_tracking';
    case 'ramp':
      return context.rampMode
        ? `ramp_${`${context.rampMode}`.trim().toLowerCase().replace(/\s+/g, '_')}`
        : 'ramp_flow';
    case 'error':
      return 'issue_resolution';
    case 'home':
      return 'home_overview';
    default:
      return 'general_help';
  }
}

function inferSelectedEntity(context: PartialAstraContext): AstraSelectedEntity | undefined {
  if (context.selectedEntity) {
    return context.selectedEntity;
  }

  if (context.currentPairSymbol) {
    const [baseSymbol] = context.currentPairSymbol.split('/');
    return {
      type: 'trading_pair',
      pair: context.currentPairSymbol,
      symbol: baseSymbol ?? context.currentPairSymbol,
      status: context.currentPriceLabel ?? undefined,
    };
  }

  if (context.botTokenLabel) {
    return {
      type: 'bot_pair',
      pair: context.botTokenLabel,
      symbol: context.botTokenLabel.split('/')[0] ?? context.botTokenLabel,
      status: context.botStatusLabel ?? undefined,
    };
  }

  if (context.rampProviderLabel || context.rampMode) {
    return {
      type: 'ramp_flow',
      provider: context.rampProviderLabel ?? undefined,
      status: context.rampMode ?? undefined,
    };
  }

  if (context.poolStatusLabel) {
    return {
      type: 'monthly_pool',
      status: context.poolStatusLabel,
    };
  }

  return undefined;
}

export function inferAstraSurface(pathname: string | null): AstraSurface {
  const path = pathname ?? '/';

  if (path.includes('/create-token')) return 'create_token';
  if (path.includes('/bot-futures') || path.includes('/bot')) return 'bot_futures';
  if (path.includes('/social')) return 'social';
  if (path.includes('/markets') || path.includes('/market')) return 'market';
  if (path.includes('/security')) return 'security';
  if (
    path.includes('/settings') ||
    path.includes('/personalization') ||
    path.includes('/language')
  ) {
    return 'settings';
  }
  if (path.includes('/pool')) return 'pool';
  if (path.includes('/wallet')) return 'wallet';
  if (path.includes('/ramp') || path.includes('/convert')) return 'ramp';
  if (path.includes('/spot') || path.includes('/trade')) return 'trade';
  if (path.includes('/profile')) return 'profile';
  if (path.includes('/error') || path.includes('not-found')) return 'error';
  if (path.includes('/home')) return 'home';
  return 'general';
}

export function inferAstraScreenName(surface: AstraSurface, language: AstraLanguage) {
  return getLocalizedAstraSurfaceLabel(language, surface);
}

export function buildAstraContext(
  input: PartialAstraContext,
  options: BuildAstraContextOptions = {},
): AstraSupportContext {
  const orbitState = useOrbitStore.getState();
  const walletState = useWalletStore.getState();
  const securityState = useSecurityCenterStore.getState();
  const authState = useAuthStore.getState();
  const socialState = useSocialStore.getState();

  const path = normalizePathname(input.path ?? options.pathname ?? options.previousContext?.path);
  const surface = input.surface ?? inferAstraSurface(path);
  const previousContext = resolvePreviousContext(options.previousContext, surface, path);
  const language =
    input.language ?? options.language ?? previousContext?.language ?? orbitState.settings.language;

  const totalWeb3 = walletState.assets.reduce((sum, asset) => sum + asset.usdValue, 0);
  const totalSpot = walletState.spotBalances.reduce((sum, asset) => sum + asset.amount, 0);
  const portfolioValue = totalWeb3 + totalSpot;
  const hasFunds = portfolioValue > 0;
  const activeLivePostId = socialState.activeLivePostId;
  const livePostsCount = socialState.posts.filter((post) => post.isLive).length;

  const selectedBotToken = orbitState.tokens.find(
    (token) => token.id === orbitState.bot.selectedTokenId,
  );
  const selectedQuoteAsset = orbitState.assets.find(
    (asset) => asset.tokenId === orbitState.bot.selectedQuoteAssetId,
  );

  const walletReady = input.walletReady ?? previousContext?.walletReady ?? walletState.isWalletReady;
  const seedBackedUp =
    input.seedBackedUp ??
    previousContext?.seedBackedUp ??
    Boolean(walletState.securityStatus.seedPhraseConfirmedAt);
  const externalWalletConnected =
    input.externalWalletConnected ??
    previousContext?.externalWalletConnected ??
    Boolean(walletState.externalWallet.address);
  const emailVerified =
    input.emailVerified ?? previousContext?.emailVerified ?? Boolean(authState.session.emailConfirmed);
  const twoFactorEnabled =
    input.twoFactorEnabled ??
    previousContext?.twoFactorEnabled ??
    Boolean(securityState.twoFactor.enabled);
  const activeSessionsCount =
    input.activeSessionsCount ??
    previousContext?.activeSessionsCount ??
    securityState.activeSessions.length;
  const autoLockMinutes =
    input.autoLockMinutes ??
    previousContext?.autoLockMinutes ??
    securityState.autoLockMinutes;

  const walletStatusLabel =
    input.walletStatusLabel ??
    previousContext?.walletStatusLabel ??
    (walletReady
      ? translate(language, 'astra.context.walletReady')
      : translate(language, 'astra.context.noWallet'));
  const accountStatusLabel =
    input.accountStatusLabel ??
    previousContext?.accountStatusLabel ??
    (authState.session.status === 'authenticated'
      ? emailVerified
        ? translate(language, 'astra.context.verifiedAccount')
        : translate(language, 'astra.context.emailPending')
      : translate(language, 'astra.context.sessionClosed'));

  const balanceLabel =
    input.balanceLabel ?? previousContext?.balanceLabel ?? formatUsd(language, portfolioValue);
  const spotBalanceLabel =
    input.spotBalanceLabel ?? previousContext?.spotBalanceLabel ?? formatUsd(language, totalSpot);
  const web3BalanceLabel =
    input.web3BalanceLabel ?? previousContext?.web3BalanceLabel ?? formatUsd(language, totalWeb3);

  const botRiskLabel =
    input.botRiskLabel ??
    previousContext?.botRiskLabel ??
    (orbitState.bot.risk === 'conservative'
      ? language === 'es'
        ? 'Conservador'
        : 'Conservative'
      : orbitState.bot.risk === 'aggressive'
        ? language === 'es'
          ? 'Agresivo'
          : 'Aggressive'
        : language === 'es'
          ? 'Moderado'
          : 'Balanced');
  const botTokenLabel =
    input.botTokenLabel ??
    previousContext?.botTokenLabel ??
    (selectedBotToken
      ? `${selectedBotToken.symbol}/${orbitState.bot.selectedQuoteAssetId.toUpperCase()}`
      : undefined);
  const botAllocationLabel =
    input.botAllocationLabel ??
    previousContext?.botAllocationLabel ??
    (orbitState.bot.allocatedUsd > 0
      ? `${formatUsd(language, orbitState.bot.allocatedUsd)} · ${orbitState.bot.allocationPct}%`
      : selectedQuoteAsset
        ? `${orbitState.bot.allocationPct}% ${language === 'es' ? 'del saldo' : 'of balance'}`
        : undefined);
  const botDailyPnlLabel =
    input.botDailyPnlLabel ??
    previousContext?.botDailyPnlLabel ??
    (orbitState.bot.enabled || orbitState.bot.dailyPnlUsd !== 0
      ? `${formatUsd(language, orbitState.bot.dailyPnlUsd)} · ${
          orbitState.bot.dailyGainPct >= 0 ? '+' : ''
        }${orbitState.bot.dailyGainPct.toFixed(2)}%`
      : undefined);
  const botStatusLabel =
    input.botStatusLabel ??
    previousContext?.botStatusLabel ??
    (orbitState.bot.enabled
      ? language === 'es'
        ? 'Bot activo'
        : 'Bot enabled'
      : language === 'es'
        ? 'Bot en pausa'
        : 'Bot paused');
  const botMaxTradesLabel =
    input.botMaxTradesLabel ??
    previousContext?.botMaxTradesLabel ??
    (language === 'es'
      ? `${orbitState.bot.maxDailyTrades} trades max/dia`
      : `${orbitState.bot.maxDailyTrades} max trades/day`);

  const screenName =
    input.screenName ??
    input.surfaceTitle ??
    previousContext?.screenName ??
    inferAstraScreenName(surface, language);

  const selectedEntity =
    inferSelectedEntity({
      ...previousContext,
      ...input,
      currentPriceLabel: input.currentPriceLabel ?? previousContext?.currentPriceLabel,
      botStatusLabel,
      botTokenLabel,
    }) ??
    previousContext?.selectedEntity;

  const userState = {
    ...(isRecord(previousContext?.userState) ? previousContext.userState : {}),
    ...(isRecord(input.userState) ? input.userState : {}),
    hasWallet: walletReady,
    hasFunds:
      input.userState && isRecord(input.userState) && 'hasFunds' in input.userState
        ? Boolean(input.userState.hasFunds)
        : hasFunds,
    isVerified: emailVerified,
    seedBackedUp,
    externalWalletConnected,
    twoFactorEnabled,
    activeSessionsCount,
    autoLockMinutes,
    portfolioValue: toNumber(
      isRecord(input.userState) ? input.userState.portfolioValue : undefined,
      portfolioValue,
    ),
    usageMode: input.usageMode ?? previousContext?.usageMode ?? orbitState.settings.usageMode,
  };

  const labels: AstraContextLabels = {
    ...(previousContext?.labels ?? {}),
    ...(input.labels ?? {}),
    screenName,
    walletStatusLabel,
    accountStatusLabel,
    balanceLabel,
    spotBalanceLabel,
    web3BalanceLabel,
    currentPriceLabel: input.currentPriceLabel ?? previousContext?.currentPriceLabel,
    botRiskLabel,
    botTokenLabel,
    botAllocationLabel,
    botDailyPnlLabel,
    botStatusLabel,
    botMaxTradesLabel,
    rampMode: input.rampMode ?? previousContext?.rampMode,
    rampProviderLabel: input.rampProviderLabel ?? previousContext?.rampProviderLabel,
    currentThemeLabel: input.currentThemeLabel ?? previousContext?.currentThemeLabel,
    poolStatusLabel: input.poolStatusLabel ?? previousContext?.poolStatusLabel,
    poolAmountLabel: input.poolAmountLabel ?? previousContext?.poolAmountLabel,
    poolTargetLabel: input.poolTargetLabel ?? previousContext?.poolTargetLabel,
    poolTimeRemainingLabel:
      input.poolTimeRemainingLabel ?? previousContext?.poolTimeRemainingLabel,
    poolUserParticipationLabel:
      input.poolUserParticipationLabel ?? previousContext?.poolUserParticipationLabel,
    poolEstimatedPositionLabel:
      input.poolEstimatedPositionLabel ?? previousContext?.poolEstimatedPositionLabel,
    socialLiveCountLabel: livePostsCount || undefined,
  };

  const uiState = {
    ...(isRecord(previousContext?.uiState) ? previousContext.uiState : {}),
    ...(isRecord(input.uiState) ? input.uiState : {}),
    walletStatus: walletReady ? 'ready' : 'missing',
    walletStatusLabel,
    botStatus: orbitState.bot.enabled ? 'active' : 'paused',
    botStatusLabel,
    tradeStatus:
      surface === 'trade'
        ? input.currentPairSymbol ?? previousContext?.currentPairSymbol
          ? 'pair_selected'
          : 'awaiting_pair'
        : undefined,
    rampState:
      surface === 'ramp'
        ? input.rampProviderLabel ?? previousContext?.rampProviderLabel
          ? 'provider_ready'
          : 'provider_pending'
        : undefined,
    activeLivePostId: activeLivePostId ?? undefined,
    livePostsCount,
    screenName,
  };

  const merged: AstraSupportContext = {
    ...(previousContext ?? {}),
    ...input,
    surface,
    path,
    language,
    screenName,
    summary: input.summary ?? previousContext?.summary,
    currentTask: inferCurrentTask(surface, { ...(previousContext ?? {}), ...input }, walletReady),
    selectedEntity,
    uiState,
    userState,
    labels,
    walletReady,
    walletStatusLabel,
    seedBackedUp,
    externalWalletConnected,
    emailVerified,
    accountStatusLabel,
    twoFactorEnabled,
    activeSessionsCount,
    autoLockMinutes,
    balanceLabel,
    spotBalanceLabel,
    web3BalanceLabel,
    botEnabled: input.botEnabled ?? previousContext?.botEnabled ?? orbitState.bot.enabled,
    botRiskLabel,
    botTokenLabel,
    botAllocationLabel,
    botDailyPnlLabel,
    botStatusLabel,
    botMaxTradesLabel,
  };

  return {
    ...merged,
    capabilities: {
      ...(previousContext?.capabilities ?? {}),
      ...(input.capabilities ?? {}),
      ...getAstraCapabilities(merged),
    },
  };
}

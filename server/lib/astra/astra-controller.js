import { orchestrateAstraChat } from './astra-orchestrator.js';
import { AstraSystemError, buildErrorEnvelope, buildSuccessEnvelope } from './astra-schemas.js';

function normalizeMessage(value, maxLength) {
  return `${value ?? ''}`.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function normalizeObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value;
}

export function buildAstraInputFromRequest(request, config) {
  const nestedContext = request.body?.context ?? {};
  const source = request.body ?? {};

  return {
    userId: `${request.headers['x-user-id'] ?? source.userId ?? nestedContext.userId ?? source.username ?? 'astra-user'}`.trim() || 'astra-user',
    sessionId: `${source.sessionId ?? nestedContext.sessionId ?? 'default'}`.trim() || 'default',
    message: normalizeMessage(source.message ?? source.transcript, config.maxQuestionLength),
    screen: source.screen ?? nestedContext.screen ?? 'general',
    language: source.language ?? nestedContext.language ?? 'ES',
    channel: source.channel ?? nestedContext.channel ?? 'text',
    username: source.username ?? nestedContext.username ?? 'Usuario',
    surface: source.surface ?? nestedContext.surface ?? source.screen ?? null,
    path: source.path ?? nestedContext.path ?? source.lastRoute ?? null,
    screenName: source.screenName ?? nestedContext.screenName ?? null,
    summary: normalizeMessage(source.summary ?? nestedContext.summary, 800),
    currentTask: normalizeMessage(source.currentTask ?? nestedContext.currentTask, 240),
    hasWallet: source.hasWallet ?? nestedContext.hasWallet,
    isVerified: source.isVerified ?? nestedContext.isVerified,
    hasFunds: source.hasFunds ?? nestedContext.hasFunds,
    portfolioValue: source.portfolioValue ?? nestedContext.portfolioValue,
    selectedToken: source.selectedToken ?? nestedContext.selectedToken ?? null,
    currentPairSymbol:
      source.currentPairSymbol ?? nestedContext.currentPairSymbol ?? null,
    currentPriceLabel:
      source.currentPriceLabel ?? nestedContext.currentPriceLabel ?? null,
    selectedEntity:
      normalizeObject(source.selectedEntity) ??
      normalizeObject(nestedContext.selectedEntity),
    uiState:
      normalizeObject(source.uiState) ??
      normalizeObject(nestedContext.uiState),
    userState:
      normalizeObject(source.userState) ??
      normalizeObject(nestedContext.userState),
    capabilities:
      normalizeObject(source.capabilities) ??
      normalizeObject(nestedContext.capabilities),
    labels:
      normalizeObject(source.labels) ??
      normalizeObject(nestedContext.labels),
    recentIntent: source.recentIntent ?? null,
    lastRoute: source.lastRoute ?? nestedContext.lastRoute ?? null,
    errorTitle: source.errorTitle ?? nestedContext.errorTitle ?? null,
    errorBody: source.errorBody ?? nestedContext.errorBody ?? null,
    twoFactorEnabled: source.twoFactorEnabled ?? nestedContext.twoFactorEnabled ?? null,
    activeSessionsCount: source.activeSessionsCount ?? nestedContext.activeSessionsCount ?? null,
    autoLockMinutes: source.autoLockMinutes ?? nestedContext.autoLockMinutes ?? null,
    walletReady: source.walletReady ?? nestedContext.walletReady ?? null,
    walletStatusLabel:
      source.walletStatusLabel ?? nestedContext.walletStatusLabel ?? null,
    seedBackedUp: source.seedBackedUp ?? nestedContext.seedBackedUp ?? null,
    externalWalletConnected:
      source.externalWalletConnected ?? nestedContext.externalWalletConnected ?? null,
    emailVerified: source.emailVerified ?? nestedContext.emailVerified ?? null,
    accountStatusLabel:
      source.accountStatusLabel ?? nestedContext.accountStatusLabel ?? null,
    balanceLabel: source.balanceLabel ?? nestedContext.balanceLabel ?? null,
    spotBalanceLabel:
      source.spotBalanceLabel ?? nestedContext.spotBalanceLabel ?? null,
    web3BalanceLabel:
      source.web3BalanceLabel ?? nestedContext.web3BalanceLabel ?? null,
    botEnabled: source.botEnabled ?? nestedContext.botEnabled ?? null,
    botRiskLabel: source.botRiskLabel ?? nestedContext.botRiskLabel ?? null,
    botTokenLabel: source.botTokenLabel ?? nestedContext.botTokenLabel ?? null,
    botStatusLabel:
      source.botStatusLabel ?? nestedContext.botStatusLabel ?? null,
    botAllocationLabel:
      source.botAllocationLabel ?? nestedContext.botAllocationLabel ?? null,
    botDailyPnlLabel:
      source.botDailyPnlLabel ?? nestedContext.botDailyPnlLabel ?? null,
    botMaxTradesLabel:
      source.botMaxTradesLabel ?? nestedContext.botMaxTradesLabel ?? null,
    rampMode: source.rampMode ?? nestedContext.rampMode ?? null,
    rampProviderLabel:
      source.rampProviderLabel ?? nestedContext.rampProviderLabel ?? null,
    usageMode: source.usageMode ?? nestedContext.usageMode ?? null,
    currentThemeLabel:
      source.currentThemeLabel ?? nestedContext.currentThemeLabel ?? null,
    poolStatusLabel:
      source.poolStatusLabel ?? nestedContext.poolStatusLabel ?? null,
    poolAmountLabel:
      source.poolAmountLabel ?? nestedContext.poolAmountLabel ?? null,
    poolTargetLabel:
      source.poolTargetLabel ?? nestedContext.poolTargetLabel ?? null,
    poolTimeRemainingLabel:
      source.poolTimeRemainingLabel ?? nestedContext.poolTimeRemainingLabel ?? null,
    poolUserParticipationLabel:
      source.poolUserParticipationLabel ??
      nestedContext.poolUserParticipationLabel ??
      null,
    poolEstimatedPositionLabel:
      source.poolEstimatedPositionLabel ??
      nestedContext.poolEstimatedPositionLabel ??
      null,
  };
}

function getSafeAstraError(error) {
  if (error instanceof AstraSystemError) {
    return {
      status: error.status,
      body: buildErrorEnvelope(
        error.exposeMessage
          ? error.message
          : 'No pudimos generar una respuesta completa de Astra.',
      ),
      log: {
        code: error.code,
        retryable: error.retryable,
      },
    };
  }

  return {
    status: 500,
    body: buildErrorEnvelope('No pudimos generar una respuesta completa de Astra.'),
    log: {
      code: 'ASTRA_UNKNOWN_ERROR',
    },
  };
}

export function createAstraChatController(config) {
  return async (request, response) => {
    const input = buildAstraInputFromRequest(request, config);

    if (!input.message) {
      response.status(400).json(
        buildErrorEnvelope('Astra necesita un mensaje para responder.'),
      );
      return;
    }

    try {
      const astraResponse = await orchestrateAstraChat({
        config,
        input,
      });

      response.json(buildSuccessEnvelope(astraResponse));
    } catch (error) {
      const safeError = getSafeAstraError(error);
      console.error('[OrbitX][AstraChat]', safeError.log);
      response.status(safeError.status).json(safeError.body);
    }
  };
}

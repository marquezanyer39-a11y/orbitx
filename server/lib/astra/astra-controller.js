import { orchestrateAstraChat } from './astra-orchestrator.js';
import { AstraSystemError, buildErrorEnvelope, buildSuccessEnvelope } from './astra-schemas.js';

function normalizeMessage(value, maxLength) {
  return `${value ?? ''}`.replace(/\s+/g, ' ').trim().slice(0, maxLength);
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
    hasWallet: source.hasWallet ?? nestedContext.hasWallet,
    isVerified: source.isVerified ?? nestedContext.isVerified,
    hasFunds: source.hasFunds ?? nestedContext.hasFunds,
    portfolioValue: source.portfolioValue ?? nestedContext.portfolioValue,
    selectedToken: source.selectedToken ?? nestedContext.selectedToken ?? null,
    recentIntent: source.recentIntent ?? null,
    lastRoute: source.lastRoute ?? nestedContext.lastRoute ?? null,
    errorTitle: source.errorTitle ?? nestedContext.errorTitle ?? null,
    errorBody: source.errorBody ?? nestedContext.errorBody ?? null,
    twoFactorEnabled: source.twoFactorEnabled ?? nestedContext.twoFactorEnabled ?? null,
    activeSessionsCount: source.activeSessionsCount ?? nestedContext.activeSessionsCount ?? null,
    autoLockMinutes: source.autoLockMinutes ?? nestedContext.autoLockMinutes ?? null,
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

import { getOrbitxKnowledge } from './astra-knowledge.js';

function normalizeText(value) {
  return `${value ?? ''}`.trim();
}

function detectRequestedAsset(message, fallbackToken, selectedEntity) {
  const normalized = `${message ?? ''}`.toUpperCase();
  if (normalized.includes('BTC') || normalized.includes('BITCOIN')) {
    return 'BTC';
  }

  if (normalized.includes('ETH') || normalized.includes('ETHEREUM')) {
    return 'ETH';
  }

  if (selectedEntity?.symbol) {
    return `${selectedEntity.symbol}`.toUpperCase();
  }

  if (selectedEntity?.pair) {
    return `${selectedEntity.pair}`.split('/')[0]?.toUpperCase() ?? null;
  }

  return `${fallbackToken ?? ''}`.toUpperCase() || null;
}

function getContextLabel(input, key) {
  const labelValue = input?.labels?.[key];
  if (labelValue == null) {
    return null;
  }

  return normalizeText(labelValue);
}

function getContextState(input, key) {
  const uiValue = input?.uiState?.[key];
  if (uiValue == null) {
    return null;
  }

  return typeof uiValue === 'string' ? uiValue : uiValue;
}

function hasLiveFeed(input) {
  const candidateStatuses = [
    getContextState(input, 'tradeFeedStatus'),
    getContextState(input, 'marketFeedStatus'),
    getContextState(input, 'priceFeedStatus'),
    getContextState(input, 'orderBookStatus'),
    getContextState(input, 'chartFeedStatus'),
  ]
    .map((value) => `${value ?? ''}`.toLowerCase())
    .filter(Boolean);

  return candidateStatuses.includes('live');
}

export function getWalletSummary(input) {
  const hasWallet = Boolean(input.walletReady ?? input.hasWallet ?? input.userState?.hasWallet);
  const isVerified = Boolean(
    input.emailVerified ?? input.isVerified ?? input.userState?.isVerified,
  );
  const hasFunds = Boolean(input.hasFunds ?? input.userState?.hasFunds);
  const portfolioValue = Number(
    input.userState?.portfolioValue ?? input.portfolioValue ?? 0,
  );
  const seedBackedUp =
    input.seedBackedUp == null
      ? Boolean(input.userState?.seedBackedUp)
      : Boolean(input.seedBackedUp);
  const externalWalletConnected =
    input.externalWalletConnected == null
      ? Boolean(input.userState?.externalWalletConnected)
      : Boolean(input.externalWalletConnected);
  const balanceLabel =
    input.balanceLabel ?? getContextLabel(input, 'balanceLabel') ?? `${portfolioValue.toFixed(2)} USD`;

  const posture = [];
  if (!seedBackedUp) {
    posture.push('falta respaldo de seed');
  }
  if (!externalWalletConnected) {
    posture.push('sin wallet externa conectada');
  }

  return {
    hasWallet,
    isVerified,
    hasFunds,
    portfolioValue,
    seedBackedUp,
    externalWalletConnected,
    walletStatusLabel:
      input.walletStatusLabel ?? getContextLabel(input, 'walletStatusLabel'),
    balanceLabel,
    summary: hasWallet
      ? `La wallet esta lista con balance reportado ${balanceLabel}.${posture.length ? ` Estado adicional: ${posture.join(', ')}.` : ''}`
      : 'Todavia no hay una wallet creada en OrbitX.',
    nextStep: hasWallet
      ? hasFunds
        ? seedBackedUp
          ? 'Abrir wallet o revisar seguridad'
          : 'Respaldar seed y revisar seguridad'
        : 'Depositar o comprar crypto'
      : 'Crear wallet',
  };
}

export function getMarketSnapshot(input) {
  const asset = detectRequestedAsset(input.message, input.selectedToken, input.selectedEntity);
  const pair =
    normalizeText(input.currentPairSymbol ?? input.selectedEntity?.pair) ||
    (asset ? `${asset}/USDT` : null);
  const currentPriceLabel =
    input.currentPriceLabel ?? getContextLabel(input, 'currentPriceLabel');
  const liveFeed = hasLiveFeed(input);
  const feedSource =
    normalizeText(
      getContextState(input, 'tradeFeedSourceLabel') ??
        getContextState(input, 'priceSourceLabel') ??
        getContextState(input, 'orderBookSourceLabel'),
    ) || null;

  if (!asset && !pair) {
    return {
      asset: null,
      pair: null,
      hasRealtimeFeed: liveFeed,
      currentPriceLabel: null,
      summary: 'No hay un activo claro para consultar todavia.',
      recommendation: 'Ir al mercado o abrir el par actual.',
    };
  }

  return {
    asset: asset ?? pair?.split('/')[0] ?? null,
    pair,
    hasRealtimeFeed: liveFeed,
    currentPriceLabel,
    feedSource,
    summary: currentPriceLabel
      ? `${pair ?? asset} marca ${currentPriceLabel}${feedSource ? ` con feed ${feedSource}` : ''}.`
      : liveFeed
        ? `${pair ?? asset} tiene contexto de mercado en vivo disponible.`
        : `No tengo un precio confirmado en vivo para ${pair ?? asset} en este momento.`,
    recommendation: liveFeed
      ? `Puedo ayudarte a leer ${pair ?? asset} o llevarte al panel de trade.`
      : `Puedo llevarte al mercado o al grafico de ${pair ?? asset} dentro de OrbitX.`,
  };
}

export function getCreateTokenState(input) {
  const stage =
    normalizeText(
      getContextState(input, 'createTokenStage') ?? input.currentTask,
    ) || null;
  const imageMode =
    normalizeText(getContextState(input, 'imageSourceMode')) || null;
  const imageStatus =
    normalizeText(getContextState(input, 'astraImageStatus')) || null;
  const availability =
    normalizeText(getContextState(input, 'astraAvailability')) || null;
  const selectedEntity = input.selectedEntity ?? null;

  if (input.screen !== 'create_token' && !stage && selectedEntity?.type !== 'token_draft') {
    return null;
  }

  return {
    stage,
    imageMode,
    imageStatus,
    availability,
    selectedEntity,
    summary: stage
      ? `El flujo de crear token esta en ${stage}.${imageMode ? ` El modo de imagen actual es ${imageMode}.` : ''}`
      : 'El flujo de crear token esta disponible, pero todavia sin un paso activo reportado.',
    nextStep:
      stage === 'wallet'
        ? 'Elegir la wallet que firmara el token'
        : stage === 'network'
          ? 'Elegir la red de despliegue'
          : stage === 'config'
            ? 'Definir nombre, simbolo, supply e imagen'
            : stage === 'costs'
              ? 'Revisar coste estimado y liquidez'
              : stage === 'signature'
                ? 'Firmar el despliegue real'
                : stage === 'result'
                  ? 'Revisar resultado y siguientes acciones'
                  : 'Continuar el wizard de token',
  };
}

export function getRampState(input) {
  const mode = normalizeText(input.rampMode ?? getContextLabel(input, 'rampMode'));
  const provider = normalizeText(
    input.rampProviderLabel ?? getContextLabel(input, 'rampProviderLabel'),
  );

  if (input.screen !== 'ramp' && !mode && !provider) {
    return null;
  }

  return {
    mode: mode || null,
    provider: provider || null,
    summary: provider
      ? `El flujo activo usa ${provider}${mode ? ` para ${mode}` : ''}.`
      : mode
        ? `Hay un flujo ramp activo en modo ${mode}.`
        : 'Hay un flujo ramp abierto sin proveedor confirmado.',
  };
}

export function getNewsSnapshot(input) {
  const provider = normalizeText(getContextState(input, 'newsProvider'));
  const itemsCount = Number(getContextState(input, 'newsItemsCount') ?? 0);
  const live = Boolean(getContextState(input, 'newsLive'));

  if (!provider && !itemsCount && input.screen !== 'home') {
    return null;
  }

  return {
    provider: provider || null,
    live,
    itemsCount,
    summary: provider
      ? `Noticias activas desde ${provider}${live ? ' en modo live' : ''}.`
      : 'No hay un proveedor de noticias confirmado en este contexto.',
  };
}

export function getSocialLiveState(input) {
  const activeLivePostId = normalizeText(getContextState(input, 'activeLivePostId'));
  const livePostsCount = Number(getContextState(input, 'livePostsCount') ?? 0);

  if (!activeLivePostId && !livePostsCount && input.screen !== 'social') {
    return null;
  }

  return {
    activeLivePostId: activeLivePostId || null,
    livePostsCount,
    summary: activeLivePostId
      ? `Hay un live activo (${activeLivePostId}) dentro del contexto social.`
      : livePostsCount > 0
        ? `Hay ${livePostsCount} directos activos en Social.`
        : 'Social esta abierto sin un live activo en este momento.',
  };
}

export function diagnoseOrbitxUI(input) {
  const screen = input.screen ?? 'general';
  const route = input.lastRoute ?? input.path ?? 'unknown';
  const issueLabel = `${input.errorTitle ?? input.errorBody ?? input.message ?? ''}`.trim();
  const currentTask = normalizeText(input.currentTask);

  return {
    screen,
    route,
    currentTask: currentTask || null,
    issueDetected: Boolean(issueLabel),
    summary: issueLabel
      ? `El bloqueo parece venir de ${screen} en la ruta ${route}${currentTask ? ` mientras estaba en ${currentTask}` : ''}.`
      : `Puedo ayudarte a diagnosticar lo que esta pasando en ${screen}.`,
    nextStep: 'Revisar accion previa, estado de red y repetir de forma segura.',
  };
}

export function detectSecurityRisk(input) {
  const twoFactorEnabled = Boolean(
    input.twoFactorEnabled ?? input.userState?.twoFactorEnabled,
  );
  const activeSessionsCount = Number(
    input.activeSessionsCount ?? input.userState?.activeSessionsCount ?? 0,
  );
  const autoLockMinutes = Number(
    input.autoLockMinutes ?? input.userState?.autoLockMinutes ?? 0,
  );
  const seedBackedUp = Boolean(
    input.seedBackedUp ?? input.userState?.seedBackedUp,
  );

  const riskSignals = [];
  if (!twoFactorEnabled) {
    riskSignals.push('2FA desactivado');
  }
  if (activeSessionsCount > 2) {
    riskSignals.push('demasiadas sesiones activas');
  }
  if (autoLockMinutes === 0) {
    riskSignals.push('auto-lock no configurado');
  }
  if (!seedBackedUp && input.hasWallet) {
    riskSignals.push('seed sin respaldo');
  }

  return {
    level: riskSignals.length >= 2 ? 'high' : riskSignals.length === 1 ? 'medium' : 'low',
    signals: riskSignals,
    summary:
      riskSignals.length > 0
        ? `Hay riesgos detectados: ${riskSignals.join(', ')}.`
        : 'No veo un riesgo evidente en la configuracion reportada.',
  };
}

export function runAstraTools(input) {
  const normalized = `${input.message ?? ''}`.toLowerCase();
  const walletSummary = getWalletSummary(input);
  const securityRisk = detectSecurityRisk(input);
  const orbitxKnowledge = getOrbitxKnowledge(input);

  const result = {
    walletSummary,
    securityRisk,
    orbitxKnowledge,
    marketSnapshot: getMarketSnapshot(input),
    createTokenState: getCreateTokenState(input),
    rampState: getRampState(input),
    newsSnapshot: getNewsSnapshot(input),
    socialLiveState: getSocialLiveState(input),
    uiDiagnosis: null,
    toolsUsed: [
      'getWalletSummary',
      'detectSecurityRisk',
      'getOrbitxKnowledge',
      'getMarketSnapshot',
    ],
  };

  if (result.createTokenState) {
    result.toolsUsed.push('getCreateTokenState');
  }

  if (result.rampState) {
    result.toolsUsed.push('getRampState');
  }

  if (result.newsSnapshot) {
    result.toolsUsed.push('getNewsSnapshot');
  }

  if (result.socialLiveState) {
    result.toolsUsed.push('getSocialLiveState');
  }

  if (
    normalized.includes('bug') ||
    normalized.includes('crash') ||
    normalized.includes('error') ||
    normalized.includes('falla') ||
    normalized.includes('no abre') ||
    normalized.includes('pantalla')
  ) {
    result.uiDiagnosis = diagnoseOrbitxUI(input);
    result.toolsUsed.push('diagnoseOrbitxUI');
  }

  return result;
}

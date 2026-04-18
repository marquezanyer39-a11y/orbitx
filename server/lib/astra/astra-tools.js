import { getOrbitxKnowledge } from './astra-knowledge.js';

function detectRequestedAsset(message, fallbackToken) {
  const normalized = `${message ?? ''}`.toUpperCase();
  if (normalized.includes('BTC') || normalized.includes('BITCOIN')) {
    return 'BTC';
  }

  if (normalized.includes('ETH') || normalized.includes('ETHEREUM')) {
    return 'ETH';
  }

  return `${fallbackToken ?? ''}`.toUpperCase() || null;
}

export function getWalletSummary(input) {
  const hasWallet = Boolean(input.hasWallet);
  const isVerified = Boolean(input.isVerified);
  const hasFunds = Boolean(input.hasFunds);
  const portfolioValue = Number(input.portfolioValue ?? 0);

  return {
    hasWallet,
    isVerified,
    hasFunds,
    portfolioValue,
    summary: hasWallet
      ? `La wallet ya existe y el valor aproximado del portafolio es ${portfolioValue.toFixed(2)} USD.`
      : 'Todavia no hay una wallet creada en OrbitX.',
    nextStep: hasWallet
      ? hasFunds
        ? 'Abrir wallet o revisar seguridad'
        : 'Depositar o comprar crypto'
      : 'Crear wallet',
  };
}

export function getMarketSnapshot(input) {
  const asset = detectRequestedAsset(input.message, input.selectedToken);
  if (!asset) {
    return {
      asset: null,
      hasRealtimeFeed: false,
      summary: 'No hay un activo claro para consultar.',
      recommendation: 'Ir al mercado o abrir el grafico.',
    };
  }

  return {
    asset,
    pair: `${asset}/USDT`,
    hasRealtimeFeed: false,
    summary: `Aun no hay un feed en tiempo real conectado para ${asset}.`,
    recommendation: `Puedo llevarte al mercado o al grafico de ${asset} dentro de OrbitX.`,
  };
}

export function diagnoseOrbitxUI(input) {
  const screen = input.screen ?? 'general';
  const route = input.lastRoute ?? 'unknown';
  const issueLabel = `${input.errorTitle ?? input.errorBody ?? input.message ?? ''}`.trim();

  return {
    screen,
    route,
    issueDetected: Boolean(issueLabel),
    summary: issueLabel
      ? `El bloqueo parece venir de ${screen} en la ruta ${route}.`
      : `Puedo ayudarte a diagnosticar lo que esta pasando en ${screen}.`,
    nextStep: 'Revisar accion previa, estado de red y repetir de forma segura.',
  };
}

export function detectSecurityRisk(input) {
  const twoFactorEnabled = Boolean(input.twoFactorEnabled);
  const activeSessionsCount = Number(input.activeSessionsCount ?? 0);
  const autoLockMinutes = Number(input.autoLockMinutes ?? 0);

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

  const toolsUsed = [
    'getWalletSummary',
    'detectSecurityRisk',
    'getOrbitxKnowledge',
  ];
  const result = {
    walletSummary,
    securityRisk,
    orbitxKnowledge,
    marketSnapshot: null,
    uiDiagnosis: null,
    toolsUsed,
  };

  if (
    normalized.includes('btc') ||
    normalized.includes('bitcoin') ||
    normalized.includes('eth') ||
    normalized.includes('ethereum') ||
    normalized.includes('precio') ||
    normalized.includes('price') ||
    normalized.includes('mercado') ||
    normalized.includes('market')
  ) {
    result.marketSnapshot = getMarketSnapshot(input);
    result.toolsUsed.push('getMarketSnapshot');
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

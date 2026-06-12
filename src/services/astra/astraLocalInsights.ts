export interface AstraLocalInsight {
  eyebrow: string;
  title: string;
  body: string;
  primaryLabel: string;
  secondaryLabel: string;
  question: string;
}

function normalizeSignedChange(change?: string | number | null) {
  if (typeof change === 'number' && Number.isFinite(change)) {
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  }

  const normalized = `${change ?? ''}`.trim();
  return normalized || 'sin cambio claro';
}

export function buildHomeLocalInsight(input: {
  balanceLabel: string;
  leadPairLabel?: string | null;
  leadPairChangeLabel?: string | null;
  rewardsLabel?: string | null;
}): AstraLocalInsight {
  const pairLabel = input.leadPairLabel?.trim() || 'BTC/USDT';
  const pairChange = normalizeSignedChange(input.leadPairChangeLabel);

  return {
    eyebrow: 'ASTRA local',
    title: 'Resumen seguro de inicio',
    body: `Balance visible ${input.balanceLabel}. ${pairLabel} se mueve ${pairChange} y el pool muestra ${input.rewardsLabel ?? 'avance local'}. Lectura informativa, sin operaciones reales.`,
    primaryLabel: 'Abrir ASTRA demo',
    secondaryLabel: 'Simular escenario',
    question: `Dame una lectura breve del inicio de QVEX usando este contexto seguro: balance ${input.balanceLabel}, par destacado ${pairLabel} con cambio ${pairChange}, pool ${input.rewardsLabel ?? 'sin dato adicional'}.`,
  };
}

export function buildMarketsLocalInsight(input: {
  activeTabLabel: string;
  marketCount: number;
  highlightedPair?: string | null;
  highlightedChange?: string | number | null;
}): AstraLocalInsight {
  const pairLabel = input.highlightedPair?.trim() || 'BTC/USDT';
  const pairChange = normalizeSignedChange(input.highlightedChange);

  return {
    eyebrow: 'ASTRA mercado',
    title: 'Lectura de mercados en modo seguro',
    body: `${input.marketCount} activos visibles en ${input.activeTabLabel}. ${pairLabel} marca ${pairChange}. ASTRA puede resumir momentum y riesgo visual sin abrir trading real.`,
    primaryLabel: 'Leer mercado con ASTRA',
    secondaryLabel: 'Ver simulacion ASTRA',
    question: `Resume el estado de Mercados en modo seguro. Tab activa ${input.activeTabLabel}, ${input.marketCount} activos visibles, par destacado ${pairLabel} con cambio ${pairChange}.`,
  };
}

export function buildWalletLocalInsight(input: {
  totalBalanceLabel: string;
  penEstimateLabel: string;
  web3StatusLabel: string;
  activityCount: number;
}): AstraLocalInsight {
  return {
    eyebrow: 'ASTRA wallet segura',
    title: 'Lectura de billetera sin riesgo',
    body: `Saldo visual ${input.totalBalanceLabel} (${input.penEstimateLabel}). Web3 ${input.web3StatusLabel}. ${input.activityCount} eventos visibles en actividad demo. Todo sigue en lectura segura, sin mover fondos.`,
    primaryLabel: 'Analizar billetera demo',
    secondaryLabel: 'Escenario de portafolio',
    question: `Analiza esta billetera en modo seguro. Saldo ${input.totalBalanceLabel}, referencia ${input.penEstimateLabel}, estado Web3 ${input.web3StatusLabel}, actividad visible ${input.activityCount}.`,
  };
}

export function buildTradeLocalInsight(input: {
  pairSymbol: string;
  orderType: string;
  side: string;
  priceSourceLabel: string;
  chartSourceLabel: string;
  orderBookSourceLabel: string;
}): AstraLocalInsight {
  return {
    eyebrow: 'ASTRA trade visual',
    title: 'Ticket de simulacion guiado',
    body: `${input.pairSymbol} usa precio ${input.priceSourceLabel}, grafico ${input.chartSourceLabel} y libro ${input.orderBookSourceLabel}. El ticket ${input.side}/${input.orderType} es solo simulacion local.`,
    primaryLabel: 'Consultar ASTRA trade',
    secondaryLabel: 'Simular escenario trade',
    question: `Explica este ticket de trade seguro para ${input.pairSymbol}. Lado ${input.side}, tipo ${input.orderType}, precio ${input.priceSourceLabel}, grafico ${input.chartSourceLabel}, libro ${input.orderBookSourceLabel}.`,
  };
}

export function buildChartLocalInsight(input: {
  pairSymbol: string;
  timeframe: string;
  priceStatusLabel: string;
  orderBookStatusLabel: string;
  chartSourceLabel: string;
}): AstraLocalInsight {
  return {
    eyebrow: 'ASTRA chart local',
    title: 'Lectura tecnica en solo lectura',
    body: `${input.pairSymbol} en ${input.timeframe}. Precio ${input.priceStatusLabel}, muro ${input.orderBookStatusLabel}, velas desde ${input.chartSourceLabel}. ASTRA puede interpretar el contexto sin ejecutar compras ni ventas.`,
    primaryLabel: 'Interpretar grafico',
    secondaryLabel: 'Escenario tecnico',
    question: `Interpreta este grafico seguro de ${input.pairSymbol} en ${input.timeframe}. Estado del precio ${input.priceStatusLabel}, libro ${input.orderBookStatusLabel}, fuente ${input.chartSourceLabel}.`,
  };
}

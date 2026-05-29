import { useMarketStore } from '../../store/marketStore';
import { useWalletStore } from '../../store/walletStore';
import type {
  AstraContext,
  AstraUserProfile,
  EVMNetwork,
  MarketContext,
  PnLSnapshot,
  PortfolioSnapshot,
  SolanaNetwork,
  WalletContext,
} from '../types/context.types';

/**
 * Mapea el perfil del usuario desde los stores actuales hacia el esquema de ASTRA.
 */
export function selectAstraUserProfile(): AstraUserProfile {
  return {
    experienceLevel: 'intermediate',
    // TODO [PRIORIDAD: baja]
    // Motivo: El perfil en la base de datos aun no tiene los campos de experienceLevel y riskTolerance.
    // Contexto tecnico: Se requiere extender el schema del perfil de Supabase e inyectarlo en el AuthStore.
    // Dependencia: Base de datos Supabase actualizada.
    // Estimado: 2h
    riskTolerance: 'moderate',
    intensityMode: 'balanced',
    // TODO [PRIORIDAD: media]
    // Motivo: La intensidad no se persiste ni se sincroniza actualmente.
    // Contexto tecnico: Guardar en el nuevo store de ASTRA o Supabase en una fase posterior de memoria.
    // Dependencia: ASTRA_MEMORY_ENABLED.
    // Estimado: 3h
    language: 'es',
    // TODO [PRIORIDAD: baja]
    // Motivo: En Fase 1 el idioma queda bloqueado a 'es' para evitar una mezcla parcial de idiomas en ASTRA v2.
    // Contexto tecnico: Ampliar el union type y mapear desde el store de preferencias solo cuando exista soporte completo.
    // Dependencia: Catalogo multilenguaje validado para ASTRA v2.
    // Estimado: 1h
    activeHours: [],
  };
}

/**
 * Selecciona la wallet activa del estado legacy.
 */
export function selectAstraWallet(): {
  wallet: WalletContext | null;
  network: EVMNetwork | SolanaNetwork | null;
} {
  const walletState = useWalletStore.getState();
  const address = walletState.externalWallet?.address || walletState.walletAddress;
  const isOrbit = !!walletState.walletAddress && !walletState.externalWallet?.address;

  if (!address) {
    return { wallet: null, network: null };
  }

  return {
    wallet: {
      address,
      type: isOrbit ? 'smart_contract' : 'eoa',
    },
    network: 'ethereum',
    // TODO [PRIORIDAD: baja]
    // Motivo: Se mockea 'ethereum' hasta tipar correctamente SupportedNetwork a EVMNetwork | SolanaNetwork.
    // Contexto tecnico: walletState.selectedNetwork debe parsearse al union type de ASTRA.
    // Dependencia: Refactorizacion menor de tipos.
    // Estimado: 1h
  };
}

/**
 * Construye el snapshot de portfolio.
 */
export function selectAstraPortfolio(): PortfolioSnapshot {
  const walletState = useWalletStore.getState();
  const totalValue =
    walletState.assets.reduce((sum, asset) => sum + asset.usdValue, 0) +
    walletState.spotBalances.reduce((sum, asset) => sum + asset.amount, 0);

  return {
    totalUsdValue: totalValue.toString(),
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Construye el snapshot de PnL.
 */
export function selectAstraPnL(): PnLSnapshot {
  // TODO [PRIORIDAD: media]
  // Motivo: El calculo de PnL diario requiere un historico y aun no existe en el store local.
  // Contexto tecnico: Se requiere cachear o consultar la API del portfolio con 24h de historico.
  // Dependencia: API de balance historico.
  // Estimado: 4h
  return {
    dailyUsdChange: '0.00',
    dailyPercentageChange: '0.00',
  };
}

/**
 * Construye el contexto de mercado.
 */
export function selectAstraMarketContext(): MarketContext {
  const marketState = useMarketStore.getState();

  // Se usa Number temporalmente solo para evaluar el signo y derivar isBullish.
  // No se exportan numbers dentro del AstraContext.
  const isBullish = marketState.selectedPair?.change24h
    ? Number(marketState.selectedPair.change24h) > 0
    : false;

  return {
    isBullish,
    globalVolume24h: '0',
    // TODO [PRIORIDAD: baja]
    // Motivo: El volumen global 24h no esta disponible en MarketStore actualmente.
    // Contexto tecnico: Extraer desde la API de CoinGecko o market metrics global.
    // Dependencia: Endpoint de CoinGecko para global market data.
    // Estimado: 1.5h
  };
}

/**
 * Constructor unificado de todo el contexto.
 */
export function buildCurrentAstraContext(activeScreen: string, sessionId: string): AstraContext {
  const { wallet, network } = selectAstraWallet();
  const marketState = useMarketStore.getState();

  const activePair = marketState.selectedPair
    ? {
        symbol: marketState.selectedPair.symbol,
        baseAsset: marketState.selectedPair.baseSymbol,
        quoteAsset: marketState.selectedPair.quoteSymbol,
      }
    : undefined;

  const activeToken = marketState.selectedCoin
    ? {
        symbol: marketState.selectedCoin.symbol,
        address: marketState.selectedPair?.contractAddress ?? undefined,
      }
    : undefined;

  return {
    activeScreen,
    activeToken,
    activePair,
    connectedWallet: wallet,
    activeNetwork: network,
    portfolio: selectAstraPortfolio(),
    pnl: selectAstraPnL(),
    marketContext: selectAstraMarketContext(),
    volatilityState: {
      level: 'low',
      score: '0.0',
    },
    recentActions: [],
    userProfile: selectAstraUserProfile(),
    sessionId,
    capturedAt: new Date().toISOString(),
  };
}

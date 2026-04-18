import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { AstraIntelligenceCard } from '../../components/botFutures/AstraIntelligenceCard';
import { BotFuturesCommandHeader } from '../../components/botFutures/BotFuturesCommandHeader';
import { BotFuturesCommandHero } from '../../components/botFutures/BotFuturesCommandHero';
import { BotFuturesFlowCard } from '../../components/botFutures/BotFuturesFlowCard';
import { BotOperationalSummary } from '../../components/botFutures/BotOperationalSummary';
import { CommandEmergencyBlock } from '../../components/botFutures/CommandEmergencyBlock';
import { PriorityActionGrid } from '../../components/botFutures/PriorityActionGrid';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import {
  BOT_FUTURES_MODE_DEFINITIONS,
  useBotFuturesStore,
  type BotFuturesExchangeId,
  type BotFuturesModeId,
} from '../../store/botFuturesStore';

type BotCommandState = 'no-exchange' | 'paused' | 'active';
type BotCommandExchange = 'none' | 'binance' | 'okx' | 'bybit';

interface CommandCenterState {
  botState: BotCommandState;
  mode: BotFuturesModeId;
  exchange: BotCommandExchange;
  pair: string;
}

function takeFirst(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function normalizeMode(value?: string): BotFuturesModeId {
  return value === 'real' || value === 'testnet' ? value : 'simulated';
}

function normalizeExchange(value?: string): BotCommandExchange {
  return value === 'binance' || value === 'okx' || value === 'bybit' ? value : 'none';
}

function normalizeState(value?: string): BotCommandState {
  return value === 'active' || value === 'paused' ? value : 'no-exchange';
}

function buildCommandState(
  stateValue?: string,
  modeValue?: string,
  exchangeValue?: string,
  pairValue?: string,
): CommandCenterState {
  const exchange = normalizeExchange(exchangeValue);
  const mode = normalizeMode(modeValue);
  const rawState = normalizeState(stateValue);
  const botState = exchange === 'none' ? 'no-exchange' : rawState === 'no-exchange' ? 'paused' : rawState;

  return {
    botState,
    mode,
    exchange,
    pair: pairValue && pairValue.length > 0 ? pairValue.toUpperCase() : 'SOL/USDT',
  };
}

export default function BotFuturesOverviewScreen() {
  const params = useLocalSearchParams<{
    state?: string | string[];
    mode?: string | string[];
    exchange?: string | string[];
    pair?: string | string[];
  }>();

  const routeOverride = useMemo(
    () =>
      buildCommandState(
        takeFirst(params.state),
        takeFirst(params.mode),
        takeFirst(params.exchange),
        takeFirst(params.pair),
      ),
    [params.exchange, params.mode, params.pair, params.state],
  );

  const hasExplicitRouteState = Boolean(
    takeFirst(params.state) || takeFirst(params.mode) || takeFirst(params.exchange) || takeFirst(params.pair),
  );

  const selectedExchange = useBotFuturesStore((state) => state.selectedExchange);
  const selectedMode = useBotFuturesStore((state) => state.selectedMode);
  const connectionStatus = useBotFuturesStore((state) => state.connectionStatus);
  const botStatus = useBotFuturesStore((state) => state.botStatus);
  const pair = useBotFuturesStore((state) => state.pair);
  const capitalAllocatedUsd = useBotFuturesStore((state) => state.capitalAllocatedUsd);
  const capitalReferenceUsd = useBotFuturesStore((state) => state.capitalReferenceUsd);
  const leverageMax = useBotFuturesStore((state) => state.leverageMax);
  const maxTradesPerDay = useBotFuturesStore((state) => state.maxTradesPerDay);
  const protectionMode = useBotFuturesStore((state) => state.protectionMode);
  const dailyPnlUsd = useBotFuturesStore((state) => state.dailyPnlUsd);
  const setSelectedExchange = useBotFuturesStore((state) => state.setSelectedExchange);
  const setSelectedMode = useBotFuturesStore((state) => state.setSelectedMode);
  const setBotStatus = useBotFuturesStore((state) => state.setBotStatus);
  const setPair = useBotFuturesStore((state) => state.setPair);
  const startBot = useBotFuturesStore((state) => state.startBot);
  const pauseBot = useBotFuturesStore((state) => state.pauseBot);

  useEffect(() => {
    if (!hasExplicitRouteState) {
      return;
    }

    setSelectedMode(routeOverride.mode);
    setSelectedExchange(routeOverride.exchange === 'none' ? null : (routeOverride.exchange as BotFuturesExchangeId));
    setBotStatus(routeOverride.botState === 'active' ? 'active' : 'paused');
    setPair(routeOverride.pair);
  }, [hasExplicitRouteState, routeOverride, setBotStatus, setPair, setSelectedExchange, setSelectedMode]);

  const visualState: CommandCenterState = {
    botState:
      !selectedExchange || selectedExchange === 'other' || connectionStatus !== 'connected'
        ? 'no-exchange'
        : botStatus === 'active'
          ? 'active'
          : 'paused',
    mode: selectedMode ?? 'simulated',
    exchange:
      !selectedExchange || selectedExchange === 'other'
        ? 'none'
        : selectedExchange,
    pair,
  };

  const exchangeMeta =
    visualState.exchange === 'binance'
      ? { label: 'Binance', sublabel: '(Binance Futures)', badge: 'BN' }
      : visualState.exchange === 'okx'
        ? { label: 'OKX', sublabel: '(Futures)', badge: 'OKX' }
        : visualState.exchange === 'bybit'
          ? { label: 'Bybit', sublabel: '(Derivatives)', badge: 'BB' }
          : { label: 'Ninguno', sublabel: '(Sin conexion)', badge: 'APP' };

  const modeMeta = {
    label: BOT_FUTURES_MODE_DEFINITIONS[visualState.mode].name,
    riskSuffix:
      visualState.mode === 'real'
        ? 'Capital real expuesto'
        : visualState.mode === 'testnet'
          ? 'Entorno de ensayo'
          : 'Entorno seguro',
  };

  const statusLabel =
    visualState.botState === 'active' ? 'ACTIVO' : 'EN PAUSA';

  const dailyPnlLabel =
    `${dailyPnlUsd >= 0 ? '+' : '-'}${Math.abs(dailyPnlUsd).toFixed(2)} USDT`;

  const currentStep =
    visualState.exchange === 'none'
      ? 'Exchange no conectado'
      : connectionStatus !== 'connected'
        ? 'Conexion pendiente de validar'
      : visualState.botState === 'active'
        ? 'Bot monitoreando posiciones'
        : visualState.mode === 'real'
          ? 'Bot listo para operacion real'
          : 'Bot listo en pausa';

  const nextAction =
    visualState.exchange === 'none'
      ? 'Conectar Exchange'
      : connectionStatus !== 'connected'
        ? 'Completar validacion'
      : visualState.botState === 'active'
        ? 'Seguir gestion de Astra'
        : 'Iniciar Bot';

  const astraPayload =
    visualState.exchange === 'none'
      ? {
          marketState: 'Lectura en espera',
          suggestedAction: 'Conectar Exchange',
          estimatedRisk: 'Sin evaluar',
          optimalZone: 'Pendiente de flujo',
          confirmation: 'Sin confirmacion operativa',
          invalidation: 'Flujo incompleto',
        }
      : visualState.botState === 'active'
        ? {
            marketState: 'Impulso con sesgo alcista',
            suggestedAction: 'CERRAR PARCIAL Y BREAK-EVEN',
            estimatedRisk: visualState.mode === 'real' ? 'Moderado / Real' : 'Moderado',
            optimalZone: 'Pullback 139.20 - 140.10',
            confirmation: 'Estructura validada',
            invalidation: 'Perdida de 138.40',
          }
        : {
            marketState: 'Ruptura Bajista Pendiente',
            suggestedAction: 'ESPERAR CONFIRMACION MODERADA',
            estimatedRisk: visualState.mode === 'real' ? 'Moderado / Real' : 'Moderado',
            optimalZone: 'Observando 138.50 - 141.20',
            confirmation: 'Break of Structure Pendiente',
            invalidation: 'Cierre sobre 143.00',
          };

  const operationalItems = [
    { label: 'Capital Asignado', value: `$${capitalAllocatedUsd} / $${Math.round(capitalReferenceUsd / 1000)}K` },
    { label: 'Apalancamiento', value: visualState.exchange === 'none' ? '--' : `${leverageMax}x max` },
    { label: 'Max Trades/Dia', value: `${maxTradesPerDay}` },
    {
      label: 'Proteccion Activa',
      value:
        protectionMode === 'strict' || visualState.mode === 'real'
          ? 'Stop Loss Estricto'
          : 'Stop Loss Dinamico',
    },
  ];

  const heroStats = [
    { label: 'Bot Status', value: statusLabel },
    {
      label: 'Exchange',
      value: exchangeMeta.label,
      subvalue: exchangeMeta.sublabel,
    },
    { label: 'Modo', value: modeMeta.label },
    { label: 'Par Principal', value: visualState.pair },
  ];

  const handleConnectExchange = () => {
    router.push('/bot-futures/connect-exchange');
  };

  const handleStart = () => {
    if (visualState.exchange === 'none' || connectionStatus !== 'connected') {
      return;
    }

    startBot();
  };

  const handlePause = () => {
    if (visualState.botState !== 'active') {
      return;
    }

    pauseBot();
  };

  const handleCloseAll = () => {
    if (visualState.exchange === 'none') {
      return;
    }

    setBotStatus('paused');
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <BotFuturesCommandHeader
        title="Bot Futures"
        subtitle="Command Center"
        onBack={() => router.back()}
        onSettings={() => router.push('/bot-futures/configuration')}
      />

      <BotFuturesCommandHero
        stats={heroStats}
        pnlLabel={dailyPnlLabel}
        startLabel={visualState.botState === 'active' ? 'BOT ACTIVO' : 'INICIAR BOT'}
        startDisabled={visualState.exchange === 'none' || visualState.botState === 'active'}
        pauseDisabled={visualState.botState !== 'active'}
        closeDisabled={visualState.exchange === 'none'}
        statusTone={visualState.botState === 'active' ? 'active' : 'paused'}
        modeTone={visualState.mode === 'real' ? 'paused' : 'neutral'}
        onStart={handleStart}
        onPause={handlePause}
        onClose={handleCloseAll}
      />

      <BotFuturesFlowCard currentStep={currentStep} nextAction={nextAction} />

      <AstraIntelligenceCard
        marketState={astraPayload.marketState}
        suggestedAction={astraPayload.suggestedAction}
        estimatedRisk={astraPayload.estimatedRisk}
        optimalZone={astraPayload.optimalZone}
        confirmation={astraPayload.confirmation}
        invalidation={astraPayload.invalidation}
      />

      <BotOperationalSummary items={operationalItems} />

      <PriorityActionGrid
        topAction={{
          label: 'CONECTAR EXCHANGE',
          icon: 'git-network-outline',
          badgeLabel: exchangeMeta.badge,
          onPress: handleConnectExchange,
        }}
        middleActions={[
          {
            label: 'Configuracion',
            icon: 'options-outline',
            onPress: () => router.push('/bot-futures/configuration'),
          },
          {
            label: 'Senales',
            icon: 'flash-outline',
            onPress: () => router.push('/bot-futures/signals'),
          },
          {
            label: 'Posiciones',
            icon: 'stats-chart-outline',
            onPress: () => router.push('/bot-futures/live-positions'),
          },
        ]}
        bottomActions={[
          {
            label: 'Estrategia',
            icon: 'git-branch-outline',
            onPress: () => router.push('/bot-futures/strategy'),
          },
          {
            label: 'Risk Manager',
            icon: 'shield-checkmark-outline',
            onPress: () => router.push('/bot-futures/risk-manager'),
          },
          {
            label: 'Historial',
            icon: 'time-outline',
            onPress: () => router.push('/bot-futures/history'),
          },
          {
            label: 'Rendimiento',
            icon: 'bar-chart-outline',
            onPress: () => router.push('/bot-futures/performance'),
          },
        ]}
      />

      <CommandEmergencyBlock onForceClose={handleCloseAll} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
    paddingBottom: 28,
  },
});

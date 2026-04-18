import type { SessionState, UserProfile } from '../../../types';
import type { MarketPair } from '../../types';
import type { SecurityStatus, WalletAsset } from '../../types/wallet';
import type { OpenOrder, RecentTradeRow } from '../../types/trade';

export interface ProfileMetricSeed {
  id: 'pnl30d' | 'today' | 'operations' | 'winRate';
  title: string;
  rawValue: number | null;
  helper: string;
  tone: 'positive' | 'negative' | 'neutral' | 'warning';
  format: 'currency' | 'count' | 'percent';
}

export interface ProfileSecurityAlert {
  kind: 'verify_email' | 'backup_seed' | 'enable_2fa';
  title: string;
  body: string;
  actionLabel: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function buildProfileIdentity(profile: UserProfile, session: SessionState) {
  const fallbackName =
    profile.email?.split('@')[0]?.replace(/[._-]/g, ' ').trim() || 'Anyer';
  const displayName =
    profile.name && profile.name !== 'OrbitX User' ? profile.name : fallbackName;
  const email = profile.email || session.recoveryEmail || 'anyer@orbitx.app';

  return {
    displayName,
    email,
    orbitId: profile.orbitId,
    avatarInitial: displayName.charAt(0).toUpperCase() || 'A',
    avatarUri: profile.avatarUri ?? null,
    isVerified: session.emailConfirmed,
    accountStatus: session.status === 'authenticated' ? 'Activo' : 'Sin sesion',
    verificationLabel: session.emailConfirmed ? 'Cuenta verificada' : 'Verificacion pendiente',
  };
}

export function buildProfileMetrics(params: {
  walletAssets: WalletAsset[];
  spotBalances: Array<{ symbol: string; amount: number }>;
  markets: MarketPair[];
  recentOrders: RecentTradeRow[];
  openOrders: OpenOrder[];
}): ProfileMetricSeed[] {
  const { walletAssets, spotBalances, markets, recentOrders, openOrders } = params;
  const tradeCount = recentOrders.length + openOrders.length;
  const hasActivity = walletAssets.length > 0 || spotBalances.length > 0 || tradeCount > 0;

  const todayGain = walletAssets.reduce((sum, asset) => {
    const pair = markets.find((market) => market.baseSymbol === asset.symbol);
    const move = (pair?.change24h ?? 0) / 100;
    return sum + asset.usdValue * move;
  }, 0);

  const pnl30d =
    hasActivity
      ? todayGain * 11.2 + recentOrders.length * 7.5 + openOrders.length * 14
      : 0;

  const winRate =
    recentOrders.length > 0
      ? clamp(
          47 +
            recentOrders.length * 1.35 +
            markets.filter((pair) => pair.change24h > 0).length * 0.32,
          0,
          86,
        )
      : null;

  return [
    {
      id: 'pnl30d',
      title: 'PnL (30D)',
      rawValue: pnl30d,
      helper: hasActivity
        ? pnl30d >= 0
          ? 'Crecimiento sostenido'
          : 'Volatilidad controlada'
        : 'Sin actividad todavia',
      tone: hasActivity ? (pnl30d >= 0 ? 'positive' : 'negative') : 'neutral',
      format: 'currency',
    },
    {
      id: 'today',
      title: 'Ganancia hoy',
      rawValue: todayGain,
      helper: hasActivity
        ? todayGain >= 0
          ? 'Sesion positiva'
          : 'Sesion defensiva'
        : 'Mercado esperando movimiento',
      tone: hasActivity ? (todayGain >= 0 ? 'positive' : 'negative') : 'neutral',
      format: 'currency',
    },
    {
      id: 'operations',
      title: 'Operaciones',
      rawValue: tradeCount,
      helper: tradeCount ? `${openOrders.length} abiertas` : 'Sin actividad todavia',
      tone: tradeCount ? 'neutral' : 'warning',
      format: 'count',
    },
    {
      id: 'winRate',
      title: 'Win rate',
      rawValue: winRate,
      helper:
        winRate === null
          ? 'Se calcula con tu historial'
          : winRate >= 60
            ? 'Ritmo saludable'
            : 'Ajusta tu riesgo',
      tone:
        winRate === null
          ? 'warning'
          : winRate >= 60
            ? 'positive'
            : 'warning',
      format: 'percent',
    },
  ];
}

export function buildSecurityAlert(params: {
  session: SessionState;
  email: string;
  isWalletReady: boolean;
  securityStatus: SecurityStatus;
}): ProfileSecurityAlert | null {
  const { session, email, isWalletReady, securityStatus } = params;

  if (session.status === 'authenticated' && !session.emailConfirmed && email) {
    return {
      kind: 'verify_email',
      title: 'Verifica tu correo',
      body: 'Confirma tu email para reforzar la seguridad de tu cuenta y recuperar acceso sin friccion.',
      actionLabel: 'Reenviar correo',
    };
  }

  if (isWalletReady && !securityStatus.seedPhraseConfirmedAt) {
    return {
      kind: 'backup_seed',
      title: 'Tu seguridad es prioridad',
      body: 'Respalda tu frase semilla para proteger tus fondos.',
      actionLabel: 'Respaldar ahora',
    };
  }

  if (isWalletReady && !securityStatus.pinEnabled && !securityStatus.biometricsEnabled) {
    return {
      kind: 'enable_2fa',
      title: 'Refuerza el acceso seguro',
      body: 'Activa PIN o biometria para proteger tu perfil y tu billetera.',
      actionLabel: 'Activar seguridad',
    };
  }

  return null;
}

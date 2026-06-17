export interface DemoBalanceItem {
  id: string;
  label: string;
  value: string;
  change: string;
  accent: string;
}

export interface DemoPortfolioSlice {
  id: string;
  label: string;
  percent: number;
  color: string;
}

export interface DemoMarketItem {
  id: string;
  symbol: string;
  name: string;
  priceLabel: string;
  changeLabel: string;
  volumeLabel: string;
  trend: number[];
  positive: boolean;
}

export interface DemoWalletActivityItem {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  tone: 'positive' | 'negative' | 'neutral';
}

export interface DemoPositionItem {
  id: string;
  symbol: string;
  side: 'Long' | 'Short';
  pnlLabel: string;
  exposureLabel: string;
  confidence: number;
}

export interface DemoAstraInsightItem {
  id: string;
  title: string;
  body: string;
  tag: string;
  tone: string;
}

export const DEMO_MODE_LABEL = 'Modo demo - datos simulados, sin operaciones reales.';
export const DEMO_BLOCKED_ACTION_LABEL =
  'Esta accion esta desactivada en la demo segura de QVEX.';

export const QVEX_DEMO_BALANCES: DemoBalanceItem[] = [
  {
    id: 'total',
    label: 'Balance total demo',
    value: 'USD 24,580.42',
    change: '+8.4% esta semana',
    accent: '#00E5FF',
  },
  {
    id: 'available',
    label: 'Liquidez disponible',
    value: 'USD 6,900.10',
    change: 'Reserva estable',
    accent: '#34D399',
  },
  {
    id: 'risk',
    label: 'Exposicion controlada',
    value: 'Riesgo medio',
    change: 'Cobertura mock activa',
    accent: '#F59E0B',
  },
];

export const QVEX_DEMO_PORTFOLIO: DemoPortfolioSlice[] = [
  { id: 'btc', label: 'BTC', percent: 34, color: '#00E5FF' },
  { id: 'eth', label: 'ETH', percent: 24, color: '#8B5CF6' },
  { id: 'stable', label: 'Stable', percent: 22, color: '#34D399' },
  { id: 'alts', label: 'Alts', percent: 12, color: '#F59E0B' },
  { id: 'cash', label: 'Cash', percent: 8, color: '#F87171' },
];

export const QVEX_DEMO_MARKETS: DemoMarketItem[] = [
  {
    id: 'btc-usdt',
    symbol: 'BTC/USDT',
    name: 'Bitcoin',
    priceLabel: '$72,480.22',
    changeLabel: '+3.84%',
    volumeLabel: 'Volumen demo: $2.8B',
    trend: [58, 62, 64, 66, 69, 73, 76],
    positive: true,
  },
  {
    id: 'eth-usdt',
    symbol: 'ETH/USDT',
    name: 'Ethereum',
    priceLabel: '$3,890.14',
    changeLabel: '+2.18%',
    volumeLabel: 'Volumen demo: $1.6B',
    trend: [42, 43, 45, 47, 48, 50, 53],
    positive: true,
  },
  {
    id: 'sol-usdt',
    symbol: 'SOL/USDT',
    name: 'Solana',
    priceLabel: '$186.05',
    changeLabel: '-1.26%',
    volumeLabel: 'Volumen demo: $840M',
    trend: [68, 67, 66, 65, 63, 62, 60],
    positive: false,
  },
  {
    id: 'qvx-usdt',
    symbol: 'QVX/USDT',
    name: 'QVEX Index',
    priceLabel: '$1.42',
    changeLabel: '+6.91%',
    volumeLabel: 'Volumen demo: $42M',
    trend: [24, 28, 30, 33, 37, 39, 44],
    positive: true,
  },
];

export const QVEX_DEMO_TOP_MOVERS = [
  { id: 'move-1', label: 'BTC lidera impulso', body: 'Momentum demo con flujo positivo y spread estable.' },
  { id: 'move-2', label: 'ETH gana traccion', body: 'Rotacion simulada hacia majors con menor riesgo relativo.' },
  { id: 'move-3', label: 'SOL pierde fuerza', body: 'Volatilidad local mas alta y menor profundidad de libro.' },
];

export const QVEX_DEMO_WALLET_ACTIVITY: DemoWalletActivityItem[] = [
  {
    id: 'activity-1',
    title: 'Deposito demo USDT',
    subtitle: 'Actividad ilustrativa, no movimiento real',
    amount: '+1,250 USDT',
    tone: 'positive',
  },
  {
    id: 'activity-2',
    title: 'Compra demo BTC',
    subtitle: 'Actividad ilustrativa, no orden real',
    amount: '-0.014 BTC',
    tone: 'negative',
  },
  {
    id: 'activity-3',
    title: 'Transferencia interna demo',
    subtitle: 'Actividad ilustrativa, no transferencia real',
    amount: 'S/ 680.00',
    tone: 'neutral',
  },
];

export const QVEX_DEMO_POSITIONS: DemoPositionItem[] = [
  {
    id: 'pos-1',
    symbol: 'BTC/USDT',
    side: 'Long',
    pnlLabel: '+$412.80',
    exposureLabel: 'Exposicion demo: $4,200',
    confidence: 74,
  },
  {
    id: 'pos-2',
    symbol: 'ETH/USDT',
    side: 'Long',
    pnlLabel: '+$188.30',
    exposureLabel: 'Exposicion demo: $2,100',
    confidence: 68,
  },
  {
    id: 'pos-3',
    symbol: 'SOL/USDT',
    side: 'Short',
    pnlLabel: '-$54.10',
    exposureLabel: 'Exposicion demo: $980',
    confidence: 56,
  },
];

export const QVEX_DEMO_CHART = [32, 34, 35, 39, 41, 38, 44, 48, 50, 47, 54, 58];

export const QVEX_DEMO_ASTRA_INSIGHTS: DemoAstraInsightItem[] = [
  {
    id: 'astra-1',
    title: 'Riesgo de mercado mock',
    body: 'La lectura simulada detecta volatilidad alta, pero sin deterioro estructural del escenario base.',
    tag: 'Riesgo',
    tone: '#F59E0B',
  },
  {
    id: 'astra-2',
    title: 'Portafolio con margen saludable',
    body: 'La composicion demo mantiene balance entre majors, liquidez y exposicion tactica.',
    tag: 'Portafolio',
    tone: '#34D399',
  },
  {
    id: 'astra-3',
    title: 'Wallet demo con liquidez lista',
    body: 'La billetera simulada conserva colchones suficientes para explorar escenarios sin tension.',
    tag: 'Wallet',
    tone: '#00E5FF',
  },
  {
    id: 'astra-4',
    title: 'Escenario realista dominante',
    body: 'El modelo demo favorece continuidad moderada con pullbacks controlados y confianza media.',
    tag: 'Escenarios',
    tone: '#8B5CF6',
  },
];

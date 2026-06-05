export const ASTRA_DEMO_VERSION = '8A-mock';

export const ASTRA_DEMO_INSIGHTS = [
  {
    id: '1',
    type: 'alerta',
    title: 'BTC rompe resistencia',
    body: 'Bitcoin supera 72K en este escenario mock con volumen ampliado y continuidad simulada.',
    confidence: 87,
    tag: 'Tecnico',
    color: '#00E5FF',
  },
  {
    id: '2',
    type: 'oportunidad',
    title: 'ETH/BTC ratio en minimos',
    body: 'El ratio simulado queda comprimido y sugiere una posible recuperacion relativa de ETH.',
    confidence: 74,
    tag: 'On-chain',
    color: '#A78BFA',
  },
  {
    id: '3',
    type: 'riesgo',
    title: 'Liquidez del mercado baja',
    body: 'La profundidad mock del libro cae y aumenta la sensibilidad de volatilidad en 24 horas.',
    confidence: 91,
    tag: 'Riesgo',
    color: '#F59E0B',
  },
  {
    id: '4',
    type: 'simulacion',
    title: 'DCA simulado: +23.4%',
    body: 'La lectura educativa compara aportes semanales frente a una compra unica en 90 dias.',
    confidence: 95,
    tag: 'Simulacion',
    color: '#34D399',
  },
] as const;

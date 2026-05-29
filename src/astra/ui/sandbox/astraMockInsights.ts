import type { AstraInboxItem, AstraInsightContent } from '../types/astraUi.types';

export const astraSandboxMicroCardInsight: AstraInsightContent = {
  title: 'Astra detecta momentum temprano',
  body: 'SOL conserva estructura alcista con volumen estable y baja friccion en la zona actual.',
  caption: 'Modo demo · visual aislado',
  tone: 'success',
  timestamp: '2026-05-24T11:42:00.000Z',
};

export const astraSandboxAlertInsight: AstraInsightContent = {
  title: 'Volatilidad elevada en BTC',
  body: 'La compresion previa se rompio y el movimiento puede acelerarse en los proximos minutos.',
  caption: 'Relevancia simulada · alerta local',
  tone: 'warning',
  timestamp: '2026-05-24T11:43:00.000Z',
};

export const astraSandboxCriticalInsight: AstraInsightContent = {
  title: 'Aprobacion de alto riesgo detectada',
  body: 'Revisa el contrato y el monto autorizado antes de continuar con cualquier firma.',
  bullets: [
    'Contrato no verificado en la simulacion visual.',
    'Monto autorizado superior al flujo esperado.',
    'No se ejecuto ninguna accion real en este sandbox.',
  ],
  caption: 'Demo UI · sin conexion a Web3',
  tone: 'critical',
  timestamp: '2026-05-24T11:44:00.000Z',
};

export const astraSandboxInboxItems: AstraInboxItem[] = [
  {
    id: 'sandbox-inbox-1',
    title: 'Insight de mercado listo',
    body: 'ETH rebota sobre soporte con actividad creciente en derivados.',
    timestamp: '11:40',
    source: 'market',
    read: false,
    displayMode: 'ambient',
    tone: 'success',
  },
  {
    id: 'sandbox-inbox-2',
    title: 'Riesgo Web3 observado',
    body: 'Se encontro una aprobacion con permisos amplios en una simulacion local.',
    timestamp: '11:35',
    source: 'web3',
    read: true,
    displayMode: 'critical',
    tone: 'critical',
  },
  {
    id: 'sandbox-inbox-3',
    title: 'Cambio en portfolio',
    body: 'La exposicion a altcoins aumento respecto al promedio semanal.',
    timestamp: '11:28',
    source: 'portfolio',
    read: false,
    displayMode: 'alert',
    tone: 'warning',
  },
];

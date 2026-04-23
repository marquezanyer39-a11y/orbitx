import type { MarketRealtimeStatus } from '../types';

export function getTradeRealtimeStatusLabel(status: MarketRealtimeStatus) {
  switch (status) {
    case 'live':
      return 'En vivo';
    case 'connecting':
      return 'Tiempo real';
    case 'reconnecting':
      return 'Reconectando';
    case 'fallback':
      return 'Mercado';
    case 'unsupported':
      return 'Vista ligera';
    case 'error':
    default:
      return 'Sin conexion';
  }
}

export function getTradeRealtimeStatusCopy(status: MarketRealtimeStatus) {
  switch (status) {
    case 'live':
      return 'Mercado sincronizado en tiempo real';
    case 'connecting':
      return 'Sincronizando lectura de mercado';
    case 'reconnecting':
      return 'Recuperando la conexion del mercado';
    case 'fallback':
      return 'Mostrando la ultima lectura disponible';
    case 'unsupported':
      return 'Modo ligero disponible para este par';
    case 'error':
    default:
      return 'El feed en vivo no esta disponible ahora';
  }
}

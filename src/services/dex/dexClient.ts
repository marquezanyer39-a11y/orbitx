import { getEvmProvider, getRpcConfig } from '../providers/rpcProviders';
import { QVEX_STABLE_APK_MODE, SAFE_MODE_BLOCK_MESSAGE } from '../../config/runtimeMode';

export function getDexProvider(network: 'ethereum' | 'base' | 'bnb') {
  if (QVEX_STABLE_APK_MODE) {
    throw new Error(SAFE_MODE_BLOCK_MESSAGE);
  }

  return getEvmProvider(network);
}

export function getDexNetworkLabel(network: 'ethereum' | 'base' | 'bnb' | 'solana') {
  return getRpcConfig(network).label;
}

export async function prepareDexExecution() {
  if (QVEX_STABLE_APK_MODE) {
    return {
      ready: false,
      message: SAFE_MODE_BLOCK_MESSAGE,
    };
  }

  return {
    ready: false,
    message:
      'La ejecucion por DEX externo todavia no esta disponible desde esta cuenta. QVEX mantiene esta base lista para integrarla sin rehacer el flujo.',
  };
}

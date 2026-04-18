import { getEvmProvider, getRpcConfig } from '../providers/rpcProviders';

export function getDexProvider(network: 'ethereum' | 'base' | 'bnb') {
  return getEvmProvider(network);
}

export function getDexNetworkLabel(network: 'ethereum' | 'base' | 'bnb' | 'solana') {
  return getRpcConfig(network).label;
}

export async function prepareDexExecution() {
  return {
    ready: false,
    message:
      'La ejecucion por DEX externo todavia no esta disponible desde esta cuenta. OrbitX mantiene esta base lista para integrarla sin rehacer el flujo.',
  };
}

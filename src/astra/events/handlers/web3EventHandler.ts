import type { AstraWeb3Event } from '../astraEvents.types';

interface CreateWeb3EventInput {
  id: string;
  title: string;
  message: string;
  severity: AstraWeb3Event['severity'];
  walletAddress?: string;
  network?: string;
  riskCode?: 'approval' | 'phishing' | 'simulation' | 'transaction';
  targetScreen?: string;
  dedupKey?: string;
  throttleMs?: number;
}

export function createWeb3Event(input: CreateWeb3EventInput): AstraWeb3Event {
  return {
    id: input.id,
    type: 'web3',
    severity: input.severity,
    title: input.title,
    message: input.message,
    timestamp: new Date().toISOString(),
    source: 'astra.web3',
    dedupKey: input.dedupKey,
    throttleMs: input.throttleMs,
    targetScreen: input.targetScreen,
    payload: {
      walletAddress: input.walletAddress,
      network: input.network,
      riskCode: input.riskCode,
    },
  };
}

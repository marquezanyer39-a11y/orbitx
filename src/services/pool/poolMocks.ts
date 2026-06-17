import type { Pool, PoolPosition } from './poolTypes';

// POOL_MOCK - no usar en produccion ni mezclar con Wallet/Web3.
export const mockPools: Pool[] = [
  {
    id: 'pool-usdt-stability',
    name: 'Pool USDT Estabilidad',
    asset: 'USDT',
    status: 'active',
    estimatedApy: 0,
    isMock: true,
  },
];

// POOL_MOCK - posiciones temporales para QA.
export const mockPoolPositions: PoolPosition[] = [
  {
    id: 'pool-position-mock-user-usdt',
    userId: 'mock-user-orbitx',
    poolId: 'pool-usdt-stability',
    asset: 'USDT',
    amount: 500,
    rewardsAccrued: 0,
    isMock: true,
    updatedAt: new Date().toISOString(),
  },
];

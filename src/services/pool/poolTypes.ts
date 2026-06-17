export interface Pool {
  id: string;
  name: string;
  asset: string;
  status: 'active' | 'paused' | 'closed';
  estimatedApy?: number;
  isMock: boolean;
}

export interface PoolPosition {
  id: string;
  userId: string;
  poolId: string;
  asset: string;
  amount: number;
  rewardsAccrued: number;
  isMock: boolean;
  updatedAt: string;
}

import type { VipUserStats } from '../../types/vip';

export const MOCK_VIP_USER_STATS: VipUserStats = {
  verificationStatus: 'verified',
  totalDepositUsdt: 100,
  totalTradeVolumeUsd: 1000,
  monthlyTradeVolumeUsd: 0,
  spotAndFuturesVolumeUsd: 1000,
  currentRankOverride: 'plus',
  granDuqueReviewStatus: 'not_eligible',
};

// Capa temporal aislada para Perfil/VIP.
// Luego puede reemplazarse por un servicio real que lea backend seguro.
export function getVipUserStatsSnapshot() {
  return MOCK_VIP_USER_STATS;
}

import type { AstraCapabilities, AstraSupportContext } from '../../types/astra';
import { isRampModeEnabled } from '../ramp/rampConfig';

export function getAstraCapabilities(context: AstraSupportContext): AstraCapabilities {
  return {
    hasWalletModule: true,
    hasWalletCreate: true,
    hasWalletImport: true,
    hasExternalWalletConnect: true,
    hasDepositFlow: true,
    hasWithdrawFlow: true,
    hasTradeModule: true,
    hasCharts: true,
    hasOrderBook: true,
    hasMonthlyRewardsPool: true,
    hasSecurityCenter: true,
    hasLanguageSettings: true,
    hasSocial: true,
    hasP2P: false,
    hasRampBuy: isRampModeEnabled('buy'),
    hasRampSell: isRampModeEnabled('sell'),
    hasRampConvert: isRampModeEnabled('convert'),
    hasRampPay: isRampModeEnabled('pay'),
  };
}

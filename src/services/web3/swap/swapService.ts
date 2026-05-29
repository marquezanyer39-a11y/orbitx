import { FEATURE_STATUS } from '../../../constants/featureStatus';
import {
  disabledSwapProviderAdapter,
  type ISwapProviderAdapter,
} from './swapProviderAdapter';
import type {
  SwapExecutionRequest,
  SwapExecutionResult,
  SwapQuote,
  SwapQuoteRequest,
} from './swapTypes';

function getSwapAdapter(): ISwapProviderAdapter {
  return disabledSwapProviderAdapter;
}

export async function getSwapQuote(request: SwapQuoteRequest): Promise<SwapQuote> {
  if (!FEATURE_STATUS.web3.swapEnabled) {
    throw new Error('SWAP_NOT_ENABLED: QVEX no genera cotizaciones falsas.');
  }

  return getSwapAdapter().getQuote(request);
}

export async function executeSwap(request: SwapExecutionRequest): Promise<SwapExecutionResult> {
  if (
    !Boolean(FEATURE_STATUS.web3.realExecutionEnabled as boolean) ||
    !FEATURE_STATUS.web3.swapEnabled ||
    !request.userConfirmed
  ) {
    return {
      status: 'disabled',
      txHash: null,
      explorerUrl: null,
      errorCode: 'SWAP_NOT_ENABLED',
      errorMessage: 'Swap real está deshabilitado. No se firmó ni envió ninguna transacción.',
    };
  }

  return getSwapAdapter().executeSwap(request);
}

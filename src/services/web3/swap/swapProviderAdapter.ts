import type {
  SwapExecutionRequest,
  SwapExecutionResult,
  SwapProviderId,
  SwapQuote,
  SwapQuoteRequest,
} from './swapTypes';

export interface ISwapProviderAdapter {
  providerId: SwapProviderId;
  getQuote(request: SwapQuoteRequest): Promise<SwapQuote>;
  executeSwap(request: SwapExecutionRequest): Promise<SwapExecutionResult>;
}

export class SwapDisabledError extends Error {
  constructor(message = 'Swap real no está habilitado en esta fase.') {
    super(message);
    this.name = 'SwapDisabledError';
  }
}

export const disabledSwapProviderAdapter: ISwapProviderAdapter = {
  providerId: 'disabled',
  async getQuote(): Promise<SwapQuote> {
    throw new SwapDisabledError('SWAP_NOT_ENABLED: no hay proveedor de cotizaciones integrado.');
  },
  async executeSwap(): Promise<SwapExecutionResult> {
    return {
      status: 'disabled',
      txHash: null,
      explorerUrl: null,
      errorCode: 'SWAP_NOT_ENABLED',
      errorMessage: 'Swap real está deshabilitado. No se ejecutó ninguna transacción.',
    };
  },
};

import type { OrderSimulationResult, TradeSide } from '../../types';
import { dexConstants } from './dexConstants';

export interface SwapSimulationInput {
  side: TradeSide;
  price: number;
  quantity: number;
  availableQuote: number;
  availableBase: number;
}

export function simulateSwapOrder(input: SwapSimulationInput): OrderSimulationResult {
  const price = Math.max(input.price, 0);
  const quantity = Math.max(input.quantity, 0);
  const total = price * quantity;
  const fee = total * dexConstants.feeRate;

  if (!price || !quantity || !total) {
    return {
      ok: false,
      message: 'Ingresa un precio y una cantidad validos.',
      fee: 0,
      total: 0,
      executedPrice: price,
    };
  }

  if (input.side === 'buy' && total + fee > input.availableQuote) {
    return {
      ok: false,
      message: 'No tienes saldo suficiente para completar la compra.',
      fee,
      total,
      executedPrice: price,
    };
  }

  if (input.side === 'sell' && quantity > input.availableBase) {
    return {
      ok: false,
      message: 'No tienes saldo suficiente para vender esa cantidad.',
      fee,
      total,
      executedPrice: price,
    };
  }

  return {
    ok: true,
    message: input.side === 'buy' ? 'Compra simulada correctamente.' : 'Venta simulada correctamente.',
    fee,
    total,
    executedPrice: price,
  };
}

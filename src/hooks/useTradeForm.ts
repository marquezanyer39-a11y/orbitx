import { useCallback, useMemo } from 'react';

import type { OrderType, TradeSide } from '../types';
import { simulateSwapOrder } from '../services/dex/swapSimulation';
import { useTradeStore } from '../store/tradeStore';
import { useWalletStore } from '../store/walletStore';
import { useUiStore } from '../store/uiStore';

function safeNumber(value: string) {
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
}

function normalizeSymbolFromPairId(pairId: string) {
  const [base, quote] = pairId.split('-');
  return {
    base: (base || 'BTC').toUpperCase(),
    quote: (quote || 'USDT').toUpperCase(),
  };
}

export function useTradeForm() {
  const tradeStore = useTradeStore();
  const walletStore = useWalletStore();
  const showToast = useUiStore((state) => state.showToast);

  const priceValue = safeNumber(tradeStore.price);
  const quantityValue = safeNumber(tradeStore.quantity);
  const totalValue = safeNumber(tradeStore.total);
  const pairSymbols = normalizeSymbolFromPairId(tradeStore.selectedPairId);
  const availableQuote =
    walletStore.spotBalances.find((balance) => balance.symbol === pairSymbols.quote)?.amount ?? 0;
  const availableBase =
    walletStore.spotBalances.find((balance) => balance.symbol === pairSymbols.base)?.amount ?? 0;

  const feeEstimate = useMemo(() => (priceValue * quantityValue || totalValue) * 0.001, [
    priceValue,
    quantityValue,
    totalValue,
  ]);

  const setSide = useCallback(
    (side: TradeSide) => {
      tradeStore.setSide(side);
    },
    [tradeStore],
  );

  const setOrderType = useCallback(
    (orderType: OrderType) => {
      tradeStore.setOrderType(orderType);
    },
    [tradeStore],
  );

  const setPrice = useCallback(
    (price: string) => {
      tradeStore.setPrice(price);
      const nextPrice = safeNumber(price);
      const quantity = safeNumber(tradeStore.quantity);
      if (nextPrice > 0 && quantity > 0) {
        tradeStore.setTotal(String(nextPrice * quantity));
      }
    },
    [tradeStore],
  );

  const setQuantity = useCallback(
    (quantity: string) => {
      tradeStore.setQuantity(quantity);
      const nextQuantity = safeNumber(quantity);
      if (priceValue > 0 && nextQuantity > 0) {
        tradeStore.setTotal(String(priceValue * nextQuantity));
      }
    },
    [priceValue, tradeStore],
  );

  const setTotal = useCallback(
    (total: string) => {
      tradeStore.setTotal(total);
      const nextTotal = safeNumber(total);
      if (priceValue > 0 && nextTotal > 0) {
        tradeStore.setQuantity(String(nextTotal / priceValue));
      }
    },
    [priceValue, tradeStore],
  );

  const calculateTotal = useCallback(
    (price?: number, quantity?: number) => (price ?? priceValue) * (quantity ?? quantityValue),
    [priceValue, quantityValue],
  );

  const applyPercent = useCallback(
    (percent: number) => {
      tradeStore.setQuickPercent(percent);
      const budget = tradeStore.buySellSide === 'buy' ? availableQuote : availableBase;
      const usable = budget * (percent / 100);

      if (tradeStore.buySellSide === 'buy') {
        if (priceValue <= 0) {
          tradeStore.setTotal(String(usable));
          return;
        }

        const quantity = usable / priceValue;
        tradeStore.setQuantity(String(quantity));
        tradeStore.setTotal(String(usable));
        return;
      }

      const quantity = usable;
      tradeStore.setQuantity(String(quantity));
      tradeStore.setTotal(String(quantity * Math.max(priceValue, 0)));
    },
    [availableBase, availableQuote, priceValue, tradeStore],
  );

  const submitOrderSimulation = useCallback(() => {
    const resolvedPrice =
      tradeStore.orderType === 'market'
        ? Math.max(priceValue || totalValue / Math.max(quantityValue, 1), 0)
        : priceValue;

    const result = simulateSwapOrder({
      side: tradeStore.buySellSide,
      price: resolvedPrice,
      quantity: quantityValue,
      availableQuote,
      availableBase,
    });

    if (!result.ok) {
      showToast(result.message, 'error');
      return result;
    }

    const baseAsset = {
      id: pairSymbols.base.toLowerCase(),
      symbol: pairSymbols.base,
      name: pairSymbols.base,
      amount: quantityValue,
      usdValue: result.total,
      network: 'spot' as const,
      environment: 'spot' as const,
    };

    if (tradeStore.orderType === 'market') {
      if (tradeStore.buySellSide === 'buy') {
        if (!walletStore.consumeSpotQuote(pairSymbols.quote, result.total + result.fee)) {
          showToast('No tienes saldo suficiente para comprar.', 'error');
          return { ...result, ok: false, message: 'No tienes saldo suficiente para comprar.' };
        }

        walletStore.creditSpotBase(baseAsset);
      } else {
        if (!walletStore.debitSpotBase(pairSymbols.base, quantityValue)) {
          showToast('No tienes saldo suficiente para vender.', 'error');
          return { ...result, ok: false, message: 'No tienes saldo suficiente para vender.' };
        }

        walletStore.depositToSpot(pairSymbols.quote, result.total - result.fee);
      }
    } else {
      tradeStore.addOpenOrder({
        id: `order-${Date.now()}`,
        side: tradeStore.buySellSide,
        type: tradeStore.orderType,
        pairId: tradeStore.selectedPairId,
        price: resolvedPrice,
        quantity: quantityValue,
        total: result.total,
        createdAt: new Date().toISOString(),
      });
    }

    tradeStore.addRecentOrder({
      id: `trade-${Date.now()}`,
      side: tradeStore.buySellSide,
      price: resolvedPrice,
      quantity: quantityValue,
      time: new Date().toISOString(),
    });

    tradeStore.resetForm();
    showToast(
      tradeStore.orderType === 'market'
        ? tradeStore.buySellSide === 'buy'
          ? `Compra ejecutada: ${pairSymbols.base}`
          : `Venta ejecutada: ${pairSymbols.base}`
        : `Orden ${tradeStore.orderType} registrada`,
      'success',
    );

    return result;
  }, [
    availableBase,
    availableQuote,
    pairSymbols.base,
    pairSymbols.quote,
    priceValue,
    quantityValue,
    showToast,
    totalValue,
    tradeStore,
    walletStore,
  ]);

  return {
    ...tradeStore,
    availableQuote,
    availableBase,
    feeEstimate,
    setSide,
    setOrderType,
    setPrice,
    setQuantity,
    setTotal,
    calculateTotal,
    applyPercent,
    submitOrderSimulation,
  };
}

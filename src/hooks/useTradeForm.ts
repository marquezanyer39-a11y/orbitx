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

  const submitOrderSimulation = useCallback(
    (sideOverride?: TradeSide) => {
      const liveTradeState = useTradeStore.getState();
      const liveWalletState = useWalletStore.getState();
      const side = sideOverride ?? liveTradeState.buySellSide;
      const livePriceValue = safeNumber(liveTradeState.price);
      const liveQuantityValue = safeNumber(liveTradeState.quantity);
      const liveTotalValue = safeNumber(liveTradeState.total);
      const livePairSymbols = normalizeSymbolFromPairId(liveTradeState.selectedPairId);
      const liveAvailableQuote =
        liveWalletState.spotBalances.find(
          (balance) => balance.symbol === livePairSymbols.quote,
        )?.amount ?? 0;
      const liveAvailableBase =
        liveWalletState.spotBalances.find(
          (balance) => balance.symbol === livePairSymbols.base,
        )?.amount ?? 0;
      const resolvedPrice =
        liveTradeState.orderType === 'market'
          ? Math.max(
              livePriceValue || liveTotalValue / Math.max(liveQuantityValue, 1),
              0,
            )
          : livePriceValue;

      const result = simulateSwapOrder({
        side,
        price: resolvedPrice,
        quantity: liveQuantityValue,
        availableQuote: liveAvailableQuote,
        availableBase: liveAvailableBase,
      });

      if (!result.ok) {
        showToast(result.message, 'error');
        return result;
      }

      const baseAsset = {
        id: livePairSymbols.base.toLowerCase(),
        symbol: livePairSymbols.base,
        name: livePairSymbols.base,
        amount: liveQuantityValue,
        usdValue: result.total,
        network: 'spot' as const,
        environment: 'spot' as const,
      };

      if (liveTradeState.orderType === 'market') {
        if (side === 'buy') {
          if (
            !liveWalletState.consumeSpotQuote(
              livePairSymbols.quote,
              result.total + result.fee,
            )
          ) {
            showToast('No tienes saldo suficiente para comprar.', 'error');
            return {
              ...result,
              ok: false,
              message: 'No tienes saldo suficiente para comprar.',
            };
          }

          liveWalletState.creditSpotBase(baseAsset);
        } else {
          if (!liveWalletState.debitSpotBase(livePairSymbols.base, liveQuantityValue)) {
            showToast('No tienes saldo suficiente para vender.', 'error');
            return {
              ...result,
              ok: false,
              message: 'No tienes saldo suficiente para vender.',
            };
          }

          liveWalletState.depositToSpot(livePairSymbols.quote, result.total - result.fee);
        }
      } else {
        liveTradeState.addOpenOrder({
          id: `order-${Date.now()}`,
          side,
          type: liveTradeState.orderType,
          pairId: liveTradeState.selectedPairId,
          price: resolvedPrice,
          quantity: liveQuantityValue,
          total: result.total,
          createdAt: new Date().toISOString(),
        });
      }

      liveTradeState.addRecentOrder({
        id: `trade-${Date.now()}`,
        side,
        price: resolvedPrice,
        quantity: liveQuantityValue,
        time: new Date().toISOString(),
      });

      liveTradeState.resetForm();
      showToast(
        liveTradeState.orderType === 'market'
          ? side === 'buy'
            ? `Compra ejecutada: ${livePairSymbols.base}`
            : `Venta ejecutada: ${livePairSymbols.base}`
          : `Orden ${liveTradeState.orderType} registrada`,
        'success',
      );

      return result;
    },
    [showToast],
  );

  const submitOrderSimulationForSide = useCallback(
    (side: TradeSide) => submitOrderSimulation(side),
    [submitOrderSimulation],
  );

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
    submitOrderSimulationForSide,
  };
}

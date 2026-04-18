import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  OpenOrder,
  OrderType,
  RecentTradeRow,
  TradePriceAlert,
  TradePriceAlertDirection,
  TradeSide,
} from '../types';
import { appConfig } from '../constants/appConfig';

interface TradeState {
  buySellSide: TradeSide;
  orderType: OrderType;
  price: string;
  quantity: string;
  total: string;
  stopPrice: string;
  selectedPairId: string;
  quickPercent: number | null;
  openOrders: OpenOrder[];
  recentOrders: RecentTradeRow[];
  priceAlerts: TradePriceAlert[];
  setSide: (side: TradeSide) => void;
  setOrderType: (orderType: OrderType) => void;
  setSelectedPairId: (pairId: string) => void;
  setPrice: (price: string) => void;
  setQuantity: (quantity: string) => void;
  setTotal: (total: string) => void;
  setStopPrice: (value: string) => void;
  setQuickPercent: (value: number | null) => void;
  resetForm: () => void;
  addOpenOrder: (order: OpenOrder) => void;
  cancelOpenOrder: (orderId: string) => void;
  addRecentOrder: (order: RecentTradeRow) => void;
  addPriceAlert: (
    pairId: string,
    direction: TradePriceAlertDirection,
    targetPrice: number,
  ) => void;
  removePriceAlert: (alertId: string) => void;
  markPriceAlertTriggered: (alertId: string, lastPrice: number) => void;
}

const initialForm = {
  price: '',
  quantity: '',
  total: '',
  stopPrice: '',
  quickPercent: null as number | null,
};

export const useTradeStore = create<TradeState>()(
  persist(
    (set, get) => ({
      buySellSide: 'buy',
      orderType: 'market',
      selectedPairId: appConfig.defaultPairId,
      openOrders: [],
      recentOrders: [],
      priceAlerts: [],
      ...initialForm,
      setSide: (buySellSide) => {
        if (get().buySellSide === buySellSide) {
          return;
        }
        set({ buySellSide });
      },
      setOrderType: (orderType) => {
        if (get().orderType === orderType) {
          return;
        }
        set({ orderType });
      },
      setSelectedPairId: (selectedPairId) => {
        if (get().selectedPairId === selectedPairId) {
          return;
        }
        set({ selectedPairId });
      },
      setPrice: (price) => {
        if (get().price === price) {
          return;
        }
        set({ price });
      },
      setQuantity: (quantity) => {
        if (get().quantity === quantity) {
          return;
        }
        set({ quantity });
      },
      setTotal: (total) => {
        if (get().total === total) {
          return;
        }
        set({ total });
      },
      setStopPrice: (stopPrice) => {
        if (get().stopPrice === stopPrice) {
          return;
        }
        set({ stopPrice });
      },
      setQuickPercent: (quickPercent) => {
        if (get().quickPercent === quickPercent) {
          return;
        }
        set({ quickPercent });
      },
      resetForm: () => set(initialForm),
      addOpenOrder: (order) =>
        set((state) => ({ openOrders: [order, ...state.openOrders].slice(0, 20) })),
      cancelOpenOrder: (orderId) =>
        set((state) => ({
          openOrders: state.openOrders.filter((order) => order.id !== orderId),
        })),
      addRecentOrder: (order) =>
        set((state) => ({ recentOrders: [order, ...state.recentOrders].slice(0, 30) })),
      addPriceAlert: (pairId, direction, targetPrice) =>
        set((state) => ({
          priceAlerts: [
            {
              id: `alert-${pairId}-${direction}-${Date.now()}`,
              pairId,
              direction,
              targetPrice,
              createdAt: new Date().toISOString(),
              triggeredAt: null,
              lastTriggeredPrice: null,
            },
            ...state.priceAlerts,
          ].slice(0, 40),
        })),
      removePriceAlert: (alertId) =>
        set((state) => ({
          priceAlerts: state.priceAlerts.filter((alert) => alert.id !== alertId),
        })),
      markPriceAlertTriggered: (alertId, lastPrice) =>
        set((state) => ({
          priceAlerts: state.priceAlerts.map((alert) =>
            alert.id === alertId && !alert.triggeredAt
              ? {
                  ...alert,
                  triggeredAt: new Date().toISOString(),
                  lastTriggeredPrice: lastPrice,
                }
              : alert,
          ),
        })),
    }),
    {
      name: 'orbitx-trade-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selectedPairId: state.selectedPairId,
        openOrders: state.openOrders,
        recentOrders: state.recentOrders,
        priceAlerts: state.priceAlerts,
      }),
    },
  ),
);

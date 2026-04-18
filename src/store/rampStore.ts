import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getRampConfig } from '../services/ramp/rampConfig';
import { buildRampMetricsSummary, estimateRevenueShare } from '../services/ramp/rampService';
import type {
  RampFlowRequest,
  RampFlowStatus,
  RampMetricsEvent,
  RampMetricsSummary,
  RampProviderCallback,
  RampQuote,
  RampWidgetSession,
} from '../types/ramp';

interface ActiveRampFlow {
  request: RampFlowRequest;
  status: RampFlowStatus;
  quote: RampQuote | null;
  session: RampWidgetSession | null;
  startedAt: string;
  updatedAt: string;
  message?: string;
}

interface RampStoreState {
  activeFlow: ActiveRampFlow | null;
  lastResult: RampProviderCallback | null;
  events: RampMetricsEvent[];
  summary: RampMetricsSummary;
  beginFlow: (request: RampFlowRequest) => void;
  setQuote: (quote: RampQuote | null) => void;
  setSession: (session: RampWidgetSession | null) => void;
  setStatus: (status: RampFlowStatus, message?: string) => void;
  completeFlow: (callback: RampProviderCallback) => void;
  failFlow: (message: string, status?: Extract<RampFlowStatus, 'failed' | 'cancelled'>) => void;
  clearActiveFlow: () => void;
}

function nowIso() {
  return new Date().toISOString();
}

function buildEventId() {
  return `ramp-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export const useRampStore = create<RampStoreState>()(
  persist(
    (set, get) => ({
      activeFlow: null,
      lastResult: null,
      events: [],
      summary: {
        started: 0,
        completed: 0,
        cancelled: 0,
        failed: 0,
        volumeFiat: 0,
        partnerFeesCollected: 0,
        estimatedRevenueShare: 0,
      },

      beginFlow: (request) => {
        const config = getRampConfig();
        const partnerFeeAmount = Number(
          ((request.fiatAmount * config.partnerFeePct) / 100).toFixed(2),
        );
        const event: RampMetricsEvent = {
          id: buildEventId(),
          createdAt: nowIso(),
          mode: request.mode,
          providerId: request.providerId,
          status: 'started',
          partnerFeePct: config.partnerFeePct,
          partnerFeeAmount,
          fiatAmount: request.fiatAmount,
          fiatCurrency: request.fiatCurrency,
          cryptoCurrency: request.cryptoCurrency,
          network: request.network,
          paymentMethod: request.paymentMethod,
          countryCode: request.countryCode,
        };

        set((state) => {
          const events = [event, ...state.events].slice(0, 120);
          return {
            activeFlow: {
              request,
              status: 'initiating',
              quote: null,
              session: null,
              startedAt: nowIso(),
              updatedAt: nowIso(),
            },
            lastResult: null,
            events,
            summary: buildRampMetricsSummary(events),
          };
        });
      },

      setQuote: (quote) => {
        set((state) => ({
          activeFlow: state.activeFlow
            ? {
                ...state.activeFlow,
                quote,
                updatedAt: nowIso(),
              }
            : state.activeFlow,
        }));
      },

      setSession: (session) => {
        set((state) => ({
          activeFlow: state.activeFlow
            ? {
                ...state.activeFlow,
                session,
                status: session ? 'redirecting' : state.activeFlow.status,
                updatedAt: nowIso(),
              }
            : state.activeFlow,
        }));
      },

      setStatus: (status, message) => {
        set((state) => ({
          activeFlow: state.activeFlow
            ? {
                ...state.activeFlow,
                status,
                message,
                updatedAt: nowIso(),
              }
            : state.activeFlow,
        }));
      },

      completeFlow: (callback) => {
        const activeFlow = get().activeFlow;
        if (!activeFlow) {
          return;
        }

        const quote = activeFlow.quote;
        const partnerFeePct = quote
          ? Number(((quote.partnerFeeAmount / Math.max(activeFlow.request.fiatAmount, 1)) * 100).toFixed(4))
          : 0;
        const partnerFeeAmount = quote?.partnerFeeAmount ?? 0;
        const revenueShareAmount = estimateRevenueShare(partnerFeeAmount);

        const event: RampMetricsEvent = {
          id: buildEventId(),
          createdAt: nowIso(),
          mode: activeFlow.request.mode,
          providerId: activeFlow.request.providerId,
          status:
            callback.status === 'completed'
              ? 'completed'
              : callback.status === 'cancelled'
                ? 'cancelled'
                : 'failed',
          partnerFeePct,
          partnerFeeAmount,
          estimatedRevenueShareAmount: revenueShareAmount,
          fiatAmount: callback.fiatAmount ?? activeFlow.request.fiatAmount,
          fiatCurrency: callback.fiatCurrency ?? activeFlow.request.fiatCurrency,
          cryptoCurrency: callback.cryptoCurrency ?? activeFlow.request.cryptoCurrency,
          network: activeFlow.request.network,
          paymentMethod: callback.paymentMethod ?? activeFlow.request.paymentMethod,
          countryCode: callback.countryCode ?? activeFlow.request.countryCode,
          externalTransactionId: callback.externalTransactionId,
          providerOrderId: callback.providerOrderId,
          reason: callback.message,
        };

        set((state) => {
          const events = [event, ...state.events].slice(0, 120);
          return {
            activeFlow: state.activeFlow
              ? {
                  ...state.activeFlow,
                  status: callback.status,
                  message: callback.message,
                  updatedAt: nowIso(),
                }
              : null,
            lastResult: callback,
            events,
            summary: buildRampMetricsSummary(events),
          };
        });
      },

      failFlow: (message, status = 'failed') => {
        const activeFlow = get().activeFlow;
        if (!activeFlow) {
          return;
        }

        const event: RampMetricsEvent = {
          id: buildEventId(),
          createdAt: nowIso(),
          mode: activeFlow.request.mode,
          providerId: activeFlow.request.providerId,
          status: status === 'cancelled' ? 'cancelled' : 'failed',
          partnerFeePct: activeFlow.quote
            ? Number(((activeFlow.quote.partnerFeeAmount / Math.max(activeFlow.request.fiatAmount, 1)) * 100).toFixed(4))
            : 0,
          partnerFeeAmount: activeFlow.quote?.partnerFeeAmount ?? 0,
          estimatedRevenueShareAmount: estimateRevenueShare(activeFlow.quote?.partnerFeeAmount ?? 0),
          fiatAmount: activeFlow.request.fiatAmount,
          fiatCurrency: activeFlow.request.fiatCurrency,
          cryptoCurrency: activeFlow.request.cryptoCurrency,
          network: activeFlow.request.network,
          paymentMethod: activeFlow.request.paymentMethod,
          countryCode: activeFlow.request.countryCode,
          reason: message,
        };

        set((state) => {
          const events = [event, ...state.events].slice(0, 120);
          return {
            activeFlow: state.activeFlow
              ? {
                  ...state.activeFlow,
                  status,
                  message,
                  updatedAt: nowIso(),
                }
              : null,
            lastResult: {
              status,
              message,
            },
            events,
            summary: buildRampMetricsSummary(events),
          };
        });
      },

      clearActiveFlow: () => {
        set({ activeFlow: null });
      },
    }),
    {
      name: 'orbitx-ramp-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activeFlow: state.activeFlow,
        lastResult: state.lastResult,
        events: state.events,
        summary: state.summary,
      }),
    },
  ),
);

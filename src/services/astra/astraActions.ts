import type { Router } from 'expo-router';

import { useOrbitStore } from '../../../store/useOrbitStore';
import { buildTradeHref } from '../../navigation/AppNavigator';
import { useAstraStore } from '../../store/astraStore';
import type { AstraAction, AstraSupportContext } from '../../types/astra';

function normalizePairIdFromSymbol(symbol?: string) {
  if (!symbol) {
    return 'btc-usdt';
  }

  return symbol
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace('/', '-');
}

interface ExecuteAstraActionOptions {
  action: AstraAction;
  context: AstraSupportContext;
  router: Pick<Router, 'push' | 'replace'>;
  onResolveWithAstra?: () => void;
}

export function executeAstraAction({
  action,
  context,
  router,
  onResolveWithAstra,
}: ExecuteAstraActionOptions) {
  switch (action.kind) {
    case 'open_screen': {
      if (action.targetScreen === 'home') {
        router.push('/home');
        return;
      }

      if (action.targetScreen === 'monthly_rewards_pool') {
        router.push('/pool');
        return;
      }

      if (action.targetScreen === 'create_token') {
        router.push('/create-token');
        return;
      }

      if (action.targetScreen === 'wallet_create') {
        router.push({
          pathname: '/(tabs)/wallet',
          params: {
            astraTab: 'web3',
            astraAction: context.walletReady ? 'open' : 'create',
          },
        });
        return;
      }

      if (action.targetScreen === 'wallet') {
        router.push('/(tabs)/wallet');
        return;
      }

      if (action.targetScreen === 'wallet_import') {
        router.push({
          pathname: '/(tabs)/wallet',
          params: {
            astraTab: 'web3',
            astraAction: 'import',
          },
        });
        return;
      }

      if (action.targetScreen === 'trade') {
        router.push(
          buildTradeHref({
            pairId: normalizePairIdFromSymbol(context.currentPairSymbol),
          }),
        );
        return;
      }

      if (action.targetScreen === 'chart') {
        router.push({
          pathname: '/trade/chart',
          params: {
            pairId: normalizePairIdFromSymbol(context.currentPairSymbol),
          },
        });
        return;
      }

      if (action.targetScreen === 'profile') {
        router.push('/(tabs)/profile');
        return;
      }

      if (action.targetScreen === 'browser') {
        router.push('/browser');
        return;
      }

      if (action.targetScreen === 'favorites') {
        router.push('/favorites');
        return;
      }

      if (action.targetScreen === 'history') {
        router.push('/history');
        return;
      }

      if (action.targetScreen === 'security') {
        router.push('/security');
        return;
      }

      if (action.targetScreen === 'personalization') {
        router.push('/personalization');
        return;
      }

      if (action.targetScreen === 'markets') {
        router.push('/(tabs)/market');
        return;
      }

      if (action.targetScreen === 'bot_futures') {
        router.push('/bot-futures');
        return;
      }

      if (action.targetScreen === 'bot_futures_connect_exchange') {
        router.push('/bot-futures/connect-exchange');
        return;
      }

      if (action.targetScreen === 'receive') {
        router.push('/receive');
        return;
      }

      if (action.targetScreen === 'send') {
        router.push('/send');
        return;
      }

      if (action.targetScreen === 'language') {
        router.push('/language');
        return;
      }

      if (action.targetScreen === 'social') {
        router.push('/social');
        return;
      }

      if (action.targetScreen === 'ramp_buy') {
        router.push({
          pathname: '/ramp/summary',
          params: { mode: 'buy' },
        });
        return;
      }

      if (action.targetScreen === 'ramp_sell') {
        router.push({
          pathname: '/ramp/summary',
          params: { mode: 'sell' },
        });
        return;
      }

      if (action.targetScreen === 'ramp_convert') {
        router.push('/convert');
        return;
      }

      if (action.targetScreen === 'ramp_pay') {
        router.push({
          pathname: '/ramp/summary',
          params: { mode: 'pay' },
        });
      }
      return;
    }

    case 'open_chart': {
      router.push({
        pathname: '/trade/chart',
        params: {
          pairId: normalizePairIdFromSymbol(action.chartSymbol || context.currentPairSymbol),
        },
      });
      return;
    }

    case 'connect_external_wallet': {
      router.push({
        pathname: '/(tabs)/wallet',
        params: {
          astraTab: 'web3',
          astraAction: 'connect-external',
        },
      });
      return;
    }

    case 'go_security_settings': {
      router.push('/security');
      return;
    }

    case 'change_language': {
      if (action.language) {
        useOrbitStore.getState().setLanguage(action.language);
      }
      return;
    }

    case 'start_guide': {
      if (action.guideId) {
        useAstraStore.getState().startGuide(action.guideId);
      }
      return;
    }

    case 'resume_guide': {
      useAstraStore.getState().resumeGuide(action.guideId);
      return;
    }

    case 'next_guide_step': {
      useAstraStore.getState().advanceGuide();
      return;
    }

    case 'previous_guide_step': {
      useAstraStore.getState().retreatGuide();
      return;
    }

    case 'cancel_guide': {
      useAstraStore.getState().cancelGuide();
      return;
    }

    case 'resolve_with_astra': {
      onResolveWithAstra?.();
      return;
    }

    default:
      return;
  }
}

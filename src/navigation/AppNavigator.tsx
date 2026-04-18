import type { Href, Router } from 'expo-router';

export function buildTradeHref(params?: { pairId?: string; side?: 'buy' | 'sell' }): Href {
  if (!params?.pairId && !params?.side) {
    return '/spot';
  }

  return {
    pathname: '/spot',
    params: {
      ...(params.pairId ? { pairId: params.pairId } : {}),
      ...(params.side ? { side: params.side } : {}),
    },
  };
}

export function navigateToTrade(
  router: Pick<Router, 'push' | 'replace'>,
  params?: { pairId?: string; side?: 'buy' | 'sell' },
) {
  router.push(buildTradeHref(params));
}

export function buildReceiveHref(network?: string): Href {
  return network ? { pathname: '/receive', params: { network } } : '/receive';
}

export function buildSendHref(network?: string): Href {
  return network ? { pathname: '/send', params: { network } } : '/send';
}

export function buildPairSelectorHref(pairId?: string): Href {
  return pairId ? { pathname: '/pair-selector', params: { pairId } } : '/pair-selector';
}

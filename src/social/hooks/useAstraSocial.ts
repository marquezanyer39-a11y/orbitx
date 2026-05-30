import { useCallback, useState } from 'react';

import * as astraSocialService from '../services/astraSocialService';

export function useAstraSocial() {
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [insightText, setInsightText] = useState('');

  const openInsight = useCallback(async (scope: 'feed' | 'live' | 'profile' | 'comments', tokenSymbol?: string | null) => {
    let nextInsight = '';

    if (scope === 'feed') {
      nextInsight = (await astraSocialService.getFeedInsights(tokenSymbol)) ?? '';
    } else if (scope === 'live') {
      nextInsight = (await astraSocialService.getLiveInsight(tokenSymbol)) ?? '';
    } else if (scope === 'comments') {
      nextInsight = await astraSocialService.analyzeCommentsMock();
    } else {
      nextInsight = await astraSocialService.getProfileInsight();
    }

    setInsightText(nextInsight);
    setInsightsOpen(true);
  }, []);

  const closeInsight = useCallback(() => {
    setInsightsOpen(false);
  }, []);

  return {
    insights: insightText,
    insightsOpen,
    openInsight,
    closeInsight,
  };
}

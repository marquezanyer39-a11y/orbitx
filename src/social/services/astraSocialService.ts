import {
  SOCIAL_COMMENTS_ASTRA_PROFILE_MOCK,
  SOCIAL_FEED_ASTRA_INSIGHTS_MOCK,
  SOCIAL_LIVE_ASTRA_INSIGHTS_MOCK,
  SOCIAL_PROFILE_ASTRA_INSIGHT_MOCK,
} from '../mocks/astraInsights.mock';
import { createMockDelay } from '../utils/createMockDelay';

export async function getFeedInsights(tokenSymbol?: string | null) {
  await createMockDelay();
  return tokenSymbol ? SOCIAL_FEED_ASTRA_INSIGHTS_MOCK[tokenSymbol.toUpperCase()] : undefined;
}

export async function getLiveInsight(tokenSymbol?: string | null) {
  await createMockDelay();
  return tokenSymbol ? SOCIAL_LIVE_ASTRA_INSIGHTS_MOCK[tokenSymbol.toUpperCase()] : undefined;
}

export async function getProfileInsight() {
  await createMockDelay();
  return SOCIAL_PROFILE_ASTRA_INSIGHT_MOCK;
}

export async function analyzeCommentsMock() {
  await createMockDelay();
  return SOCIAL_COMMENTS_ASTRA_PROFILE_MOCK;
}

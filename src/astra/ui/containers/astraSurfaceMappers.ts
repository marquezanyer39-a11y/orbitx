import type { AstraEvent } from '../../events/astraEvents.types';
import { computeRelevance, type RelevanceResult } from '../../relevance/relevanceEngine';
import type { AstraDisplayMode } from '../../relevance/relevanceRules';
import type { AstraIntensityMode, AstraUserProfile } from '../../types/context.types';
import type { AstraInsightContent, AstraUiTone } from '../types/astraUi.types';

export type AstraSurface = 'market' | 'trade' | 'wallet' | 'portfolio';

export type AstraSurfaceUiComponent = 'none' | 'microCard' | 'alertBanner';

export interface ResolveSurfaceInsightInput {
  enabled: boolean;
  event?: AstraEvent | null;
  surface: AstraSurface;
  intensityMode?: AstraIntensityMode;
  dismissalCount?: number;
}

export interface ResolvedSurfaceInsight {
  event: AstraEvent;
  relevance: RelevanceResult;
  content: AstraInsightContent;
  uiComponent: AstraSurfaceUiComponent;
  tone: AstraUiTone;
}

const DEFAULT_USER_PROFILE: AstraUserProfile = {
  experienceLevel: 'intermediate',
  riskTolerance: 'moderate',
  intensityMode: 'balanced',
  language: 'es',
  activeHours: [],
};

export function mapSeverityToTone(severity: AstraEvent['severity']): AstraUiTone {
  switch (severity) {
    case 'critical':
      return 'critical';
    case 'warning':
      return 'warning';
    default:
      return 'neutral';
  }
}

export function mapEventToInsightContent(
  event: AstraEvent,
  relevance: RelevanceResult,
): AstraInsightContent {
  return {
    title: event.title,
    body: event.message,
    caption: relevance.reason,
    tone: mapSeverityToTone(event.severity),
    timestamp: event.timestamp,
  };
}

export function mapDisplayModeToUiComponent(
  displayMode: AstraDisplayMode,
): AstraSurfaceUiComponent {
  switch (displayMode) {
    case 'ambient':
      return 'microCard';
    case 'alert':
    case 'critical':
      return 'alertBanner';
    default:
      return 'none';
  }
}

export function resolveSurfaceInsight(
  input: ResolveSurfaceInsightInput,
): ResolvedSurfaceInsight | null {
  if (!input.enabled || !input.event) {
    return null;
  }

  if (input.event.targetScreen && input.event.targetScreen !== input.surface) {
    return null;
  }

  const relevance = computeRelevance({
    event: input.event,
    context: {
      activeScreen: input.surface,
      userProfile: {
        ...DEFAULT_USER_PROFILE,
        intensityMode: input.intensityMode ?? DEFAULT_USER_PROFILE.intensityMode,
      },
    },
    dismissalCount: input.dismissalCount ?? 0,
  });

  const uiComponent = mapDisplayModeToUiComponent(relevance.displayMode);
  if (uiComponent === 'none') {
    return null;
  }

  return {
    event: input.event,
    relevance,
    content: mapEventToInsightContent(input.event, relevance),
    uiComponent,
    tone: mapSeverityToTone(input.event.severity),
  };
}

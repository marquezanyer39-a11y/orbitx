import type { AstraEvent } from '../../events/astraEvents.types';
import type { AstraEventBus } from '../../events/astraEventBus';
import type { AstraIntensityMode } from '../../types/context.types';
import { AstraAlertBanner } from '../components/AstraAlertBanner';
import { AstraMicroCard } from '../components/AstraMicroCard';
import { useAstraSurfaceInsights } from './useAstraSurfaceInsights';
import type { AstraSurface } from './astraSurfaceMappers';

interface AstraSurfaceInsightHostProps {
  surface: AstraSurface;
  enabled?: boolean;
  eventBus?: AstraEventBus;
  testEvent?: AstraEvent;
  dismissalCount?: number;
  intensityMode?: AstraIntensityMode;
  onPressInsight?: () => void;
  onDismiss?: () => void;
  bannerActionLabel?: string;
  onBannerAction?: () => void;
  accessoryLabel?: string;
}

export function AstraSurfaceInsightHost({
  surface,
  enabled,
  eventBus,
  testEvent,
  dismissalCount,
  intensityMode,
  onPressInsight,
  onDismiss,
  bannerActionLabel,
  onBannerAction,
  accessoryLabel,
}: AstraSurfaceInsightHostProps) {
  const insightState = useAstraSurfaceInsights({
    surface,
    enabled,
    eventBus,
    testEvent,
    dismissalCount,
    intensityMode,
  });

  if (!insightState.isEnabled || !insightState.insight || insightState.displayMode === 'silent') {
    return null;
  }

  if (insightState.uiComponent === 'alertBanner') {
    return (
      <AstraAlertBanner
        visible
        title={insightState.insight.title}
        message={insightState.insight.body}
        tone={insightState.tone ?? insightState.insight.tone}
        actionLabel={bannerActionLabel}
        onAction={onBannerAction}
        onDismiss={onDismiss}
      />
    );
  }

  return (
    <AstraMicroCard
      insight={insightState.insight}
      accessoryLabel={accessoryLabel}
      onPress={onPressInsight}
    />
  );
}

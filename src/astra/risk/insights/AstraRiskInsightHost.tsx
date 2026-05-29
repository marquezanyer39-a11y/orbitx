import React, { useEffect } from 'react';

import { AstraAlertBanner } from '../../ui/components/AstraAlertBanner';
import { AstraMicroCard } from '../../ui/components/AstraMicroCard';
import type { AstraInsightContent } from '../../ui/types/astraUi.types';
import type { AstraRiskInsightHostProps } from './astraRiskInsight.types';
import { useAstraRiskInsights } from './useAstraRiskInsights';

function toInsightContent(title: string, body: string, tone: AstraInsightContent['tone']): AstraInsightContent {
  return {
    title,
    body,
    tone,
  };
}

export function AstraRiskInsightHost(props: AstraRiskInsightHostProps) {
  const { activeInsight, dismissActiveInsight } = useAstraRiskInsights(props);

  useEffect(() => {
    if (activeInsight) {
      props.onShow?.(activeInsight);
    }
  }, [activeInsight, props]);

  if (!props.enabled || !activeInsight || activeInsight.displayMode === 'none') {
    return null;
  }

  if (activeInsight.displayMode === 'card') {
    return (
      <AstraMicroCard
        accessoryLabel={activeInsight.actionLabel}
        insight={toInsightContent(activeInsight.title, activeInsight.body, activeInsight.tone)}
        onPress={props.onShow ? () => props.onShow?.(activeInsight) : undefined}
      />
    );
  }

  return (
    <AstraAlertBanner
      message={activeInsight.body}
      onDismiss={() => {
        dismissActiveInsight();
        props.onDismiss?.();
      }}
      title={activeInsight.title}
      tone={activeInsight.displayMode === 'critical' ? 'critical' : activeInsight.tone}
      visible
    />
  );
}

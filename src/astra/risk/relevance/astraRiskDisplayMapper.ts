import type { AstraRiskRelevanceDisplayMode } from './astraRiskRelevanceRules';

export type AstraRiskUiDisplayMode = 'none' | 'card' | 'banner' | 'critical';

export function mapRiskDisplayModeToUi(
  displayMode: AstraRiskRelevanceDisplayMode,
): AstraRiskUiDisplayMode {
  if (displayMode === 'silent') {
    return 'none';
  }

  if (displayMode === 'ambient') {
    return 'card';
  }

  if (displayMode === 'alert') {
    return 'banner';
  }

  return 'critical';
}

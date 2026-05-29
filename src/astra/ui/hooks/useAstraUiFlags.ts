import { useMemo } from 'react';

import { astraConfigService, type AstraFeatureFlags } from '../../config/astraFlags';
import type { AstraUiFeatureFlags } from '../types/astraUi.types';

type AstraUiFlagKey =
  | 'ASTRA_UI_MICROCARD_ENABLED'
  | 'ASTRA_UI_ALERT_BANNER_ENABLED'
  | 'ASTRA_UI_FLOATING_ORB_ENABLED'
  | 'ASTRA_UI_INSIGHT_SHEET_ENABLED'
  | 'ASTRA_UI_CONFIRMATION_SHEET_ENABLED'
  | 'ASTRA_UI_INBOX_ENABLED'
  | 'ASTRA_UI_VOICE_PLACEHOLDER_ENABLED';

type ExtendedFlags = AstraFeatureFlags & Partial<Record<AstraUiFlagKey, boolean>>;

export function useAstraUiFlags(): AstraUiFeatureFlags {
  return useMemo(() => {
    const flags = astraConfigService.getFlags() as ExtendedFlags;

    return {
      microCardEnabled: flags.ASTRA_UI_MICROCARD_ENABLED ?? false,
      alertBannerEnabled: flags.ASTRA_UI_ALERT_BANNER_ENABLED ?? false,
      floatingOrbEnabled: flags.ASTRA_UI_FLOATING_ORB_ENABLED ?? false,
      insightSheetEnabled: flags.ASTRA_UI_INSIGHT_SHEET_ENABLED ?? false,
      confirmationSheetEnabled: flags.ASTRA_UI_CONFIRMATION_SHEET_ENABLED ?? false,
      inboxEnabled: flags.ASTRA_UI_INBOX_ENABLED ?? flags.ASTRA_INBOX_ENABLED,
      voiceModePlaceholderEnabled:
        flags.ASTRA_UI_VOICE_PLACEHOLDER_ENABLED ?? flags.ASTRA_VOICE_ENABLED,
    };
  }, []);
}

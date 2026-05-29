import { astraFlagsDefaults } from './astraFlags.defaults';
import { astraRemoteConfigCache } from './astraRemoteConfigCache';
import { astraRemoteConfigClient } from './astraRemoteConfigClient';
import { createAstraRemoteConfigSupabaseFetcher, type AstraSupabaseLikeClient } from './astraRemoteConfigSupabaseFetcher';

export interface AstraFeatureFlags {
  ASTRA_ENABLED: boolean; // master switch
  ASTRA_CONTEXT_ENABLED: boolean;
  ASTRA_NOTIFICATIONS_ENABLED: boolean;
  ASTRA_WEB3_SECURITY_ENABLED: boolean;
  ASTRA_VOICE_ENABLED: boolean;
  ASTRA_TOOL_EXECUTION_ENABLED: boolean;
  ASTRA_TOOL_REGISTRY_ENABLED: boolean;
  ASTRA_TOOL_CONFIRMATION_ENABLED: boolean;
  ASTRA_TOOL_AUDIT_ENABLED: boolean;
  ASTRA_TOOL_MOCK_EXECUTION_ENABLED: boolean;
  ASTRA_TOOL_LOCAL_ACTIONS_ENABLED: boolean;
  ASTRA_TOOL_MARK_INBOX_READ_ENABLED: boolean;
  ASTRA_TOOL_DISMISS_INSIGHT_ENABLED: boolean;
  ASTRA_TOOL_SAVE_NOTE_ENABLED: boolean;
  ASTRA_TOOL_SAVE_ORDER_DRAFT_ENABLED: boolean;
  ASTRA_TOOL_PIN_ASSET_ENABLED: boolean;
  ASTRA_TOOL_PIN_INSIGHT_ENABLED: boolean;
  ASTRA_TOOL_MUTE_SURFACE_ENABLED: boolean;
  ASTRA_TOOL_SET_INTENSITY_MODE_ENABLED: boolean;
  ASTRA_TOOL_CONFIRMATION_UI_ENABLED: boolean;
  ASTRA_TOOL_REAL_EXECUTION_ENABLED: boolean;
  ASTRA_RISK_ENGINE_ENABLED: boolean;
  ASTRA_RISK_READ_ONLY_ENABLED: boolean;
  ASTRA_RISK_TOKEN_SCAN_ENABLED: boolean;
  ASTRA_RISK_APPROVAL_SCAN_ENABLED: boolean;
  ASTRA_RISK_EXTERNAL_ADAPTERS_ENABLED: boolean;
  ASTRA_RISK_EVENT_PUBLISHING_ENABLED: boolean;
  ASTRA_RISK_RELEVANCE_ENABLED: boolean;
  ASTRA_RISK_INSIGHT_HOST_ENABLED: boolean;
  ASTRA_RISK_INSIGHT_CARDS_ENABLED: boolean;
  ASTRA_RISK_INSIGHT_BANNERS_ENABLED: boolean;
  ASTRA_RISK_INSIGHT_CRITICAL_ENABLED: boolean;
  ASTRA_RISK_REAL_EXECUTION_ENABLED: boolean;
  ASTRA_QA_HUB_ENABLED: boolean;
  ASTRA_QA_HUB_RISK_SANDBOX_ENABLED: boolean;
  ASTRA_QA_HUB_LOCAL_TOOLS_SANDBOX_ENABLED: boolean;
  ASTRA_QA_HUB_CONFIRMATION_BRIDGE_ENABLED: boolean;
  ASTRA_QA_HUB_REMOTE_CONFIG_PANEL_ENABLED: boolean;
  ASTRA_QA_HUB_UI_SANDBOX_ENABLED: boolean;
  ASTRA_QA_HUB_FLAGS_PANEL_ENABLED: boolean;
  ASTRA_MEMORY_ENABLED: boolean;
  ASTRA_INBOX_ENABLED: boolean;
  ASTRA_UI_MICROCARD_ENABLED: boolean;
  ASTRA_UI_ALERT_BANNER_ENABLED: boolean;
  ASTRA_UI_FLOATING_ORB_ENABLED: boolean;
  ASTRA_UI_INSIGHT_SHEET_ENABLED: boolean;
  ASTRA_UI_CONFIRMATION_SHEET_ENABLED: boolean;
  ASTRA_UI_INBOX_ENABLED: boolean;
  ASTRA_UI_VOICE_PLACEHOLDER_ENABLED: boolean;
  ASTRA_UI_SURFACE_INSIGHTS_ENABLED: boolean;
  ASTRA_UI_SURFACE_MARKET_ENABLED: boolean;
  ASTRA_UI_SURFACE_TRADE_ENABLED: boolean;
  ASTRA_UI_SURFACE_WALLET_ENABLED: boolean;
  ASTRA_UI_SURFACE_PORTFOLIO_ENABLED: boolean;
  ASTRA_MEMORY_LOCAL_ENABLED: boolean;
  ASTRA_MEMORY_DISMISSALS_ENABLED: boolean;
  ASTRA_MEMORY_INBOX_PERSISTENCE_ENABLED: boolean;
  ASTRA_NOTIFICATION_ENGINE_ENABLED: boolean;
  ASTRA_NOTIFICATION_QUEUE_ENABLED: boolean;
  ASTRA_NOTIFICATION_COOLDOWN_ENABLED: boolean;
  ASTRA_REMOTE_CONFIG_ENABLED: boolean;
  ASTRA_KILL_SWITCH: boolean;
  ASTRA_SYNC_READ_ENABLED: boolean;
  ASTRA_SYNC_WRITE_ENABLED: boolean;
  ASTRA_NOTIFICATION_LOCAL_DELIVERY_ENABLED: boolean;
  ASTRA_NOTIFICATION_PUSH_ENABLED: boolean;
}

export const astraConfigService = {
  getFlags(): AstraFeatureFlags {
    return astraRemoteConfigCache.get()?.flags ?? astraFlagsDefaults;
  },

  async refreshFlags(): Promise<AstraFeatureFlags> {
    return astraRemoteConfigClient.getFlags();
  },

  setRemoteFetcher(fetchRemoteConfig?: () => Promise<unknown>): void {
    astraRemoteConfigClient.setFetcher(fetchRemoteConfig);
  },

  configureSupabaseRemoteConfig(
    client: AstraSupabaseLikeClient | undefined,
    environment: 'development' | 'preview' | 'production',
  ): void {
    this.setRemoteFetcher(
      createAstraRemoteConfigSupabaseFetcher({
        client,
        environment,
      }),
    );
  },

  resetRemoteCache(): void {
    astraRemoteConfigClient.clearCache();
  },

  getFlag<K extends keyof AstraFeatureFlags>(key: K): AstraFeatureFlags[K] {
    const flags = this.getFlags();
    return flags[key];
  },
};

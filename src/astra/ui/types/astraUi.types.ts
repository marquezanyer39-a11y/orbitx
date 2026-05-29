export type AstraUiTone = 'neutral' | 'success' | 'warning' | 'critical';

export type AstraUiDisplayMode = 'silent' | 'ambient' | 'alert' | 'critical';

export interface AstraInsightContent {
  title: string;
  body: string;
  caption?: string;
  bullets?: string[];
  tone?: AstraUiTone;
  timestamp?: string;
}

export interface AstraInboxItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  source?: string;
  read?: boolean;
  displayMode?: AstraUiDisplayMode;
  tone?: AstraUiTone;
}

export interface AstraUiFeatureFlags {
  microCardEnabled: boolean;
  alertBannerEnabled: boolean;
  floatingOrbEnabled: boolean;
  insightSheetEnabled: boolean;
  confirmationSheetEnabled: boolean;
  inboxEnabled: boolean;
  voiceModePlaceholderEnabled: boolean;
}

export interface AstraMicroCardProps {
  insight: AstraInsightContent;
  accessoryLabel?: string;
  onPress?: () => void;
}

export interface AstraAlertBannerProps {
  visible?: boolean;
  title: string;
  message: string;
  tone?: AstraUiTone;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

export interface AstraFloatingOrbProps {
  visible?: boolean;
  unreadCount?: number;
  label?: string;
  bottomOffset?: number;
  rightOffset?: number;
  onPress?: () => void;
}

export interface AstraInsightSheetProps {
  visible: boolean;
  insight: AstraInsightContent | null;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  onClose: () => void;
}

export interface AstraConfirmationSheetProps {
  visible: boolean;
  title: string;
  body: string;
  tone?: AstraUiTone;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface AstraInboxProps {
  items?: AstraInboxItem[];
  title?: string;
  subtitle?: string;
  emptyTitle?: string;
  emptyBody?: string;
  onBack?: () => void;
  onOpenItem?: (item: AstraInboxItem) => void;
}

export interface AstraVoiceModePlaceholderProps {
  title?: string;
  subtitle?: string;
  primaryLabel?: string;
  onPrimaryAction?: () => void;
}

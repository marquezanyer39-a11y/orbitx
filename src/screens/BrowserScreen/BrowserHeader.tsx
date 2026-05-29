import { Ionicons } from '@expo/vector-icons';
import type { RefObject } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { useI18n } from '../../../hooks/useI18n';
import type { BrowserLink, BrowserMode } from './useBrowserViewModel';
import { hostLabel, sourceLabel } from './useBrowserViewModel';
import { COLORS, styles } from './browserStyles';

interface BrowserHeaderProps {
  browserTitle: string;
  currentUrl: string;
  draftUrl: string;
  inputRef: RefObject<TextInput | null>;
  mode: BrowserMode;
  quickLinks: BrowserLink[];
  selectedId: string;
  source?: string | string[];
  onBack: () => void;
  onOpenDestination: (input?: string | null, selected?: string) => void;
  onSetDraftUrl: (value: string) => void;
  onToggleSettings: () => void;
}

export function BrowserHeader({
  browserTitle,
  currentUrl,
  draftUrl,
  inputRef,
  mode,
  quickLinks,
  selectedId,
  source,
  onBack,
  onOpenDestination,
  onSetDraftUrl,
  onToggleSettings,
}: BrowserHeaderProps) {
  const { t } = useI18n();

  return (
    <>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <View style={styles.headerTitleRow}>
            <View style={styles.brandGlyph}>
              <Ionicons name="navigate-outline" size={14} color={COLORS.purpleSoft} />
            </View>
            <Text style={styles.headerTitle}>{browserTitle || t('browser.title')}</Text>
          </View>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {mode === 'browse'
              ? `${sourceLabel(source)} · ${hostLabel(currentUrl)}`
              : t('browser.subtitle')}
          </Text>
        </View>
        <Pressable
          onPress={onToggleSettings}
          style={({ pressed }) => [styles.profileBadge, pressed && styles.pressed]}
          hitSlop={8}
        >
          <Ionicons name="options-outline" size={20} color={COLORS.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.urlBar}>
        <Ionicons name="lock-closed-outline" size={17} color={COLORS.textSecondary} />
        <TextInput
          ref={inputRef}
          value={draftUrl}
          onChangeText={onSetDraftUrl}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          placeholder={t('browser.searchPlaceholder')}
          placeholderTextColor={COLORS.textMuted}
          style={styles.urlInput}
          returnKeyType="go"
          onSubmitEditing={() => onOpenDestination(draftUrl)}
        />
        <Pressable onPress={() => onOpenDestination(draftUrl)} style={({ pressed }) => [styles.goButton, pressed && styles.pressed]}>
          <Ionicons name="arrow-forward" size={19} color={COLORS.textPrimary} />
        </Pressable>
      </View>

      {mode === 'home' ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickContent}>
          {quickLinks.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => onOpenDestination(item.url, item.id)}
              style={({ pressed }) => [
                styles.quickChip,
                selectedId === item.id && styles.quickChipActive,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={14} color={COLORS.purpleSoft} />
              <Text style={styles.quickText}>{item.title}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
    </>
  );
}

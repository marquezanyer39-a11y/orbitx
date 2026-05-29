import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import type { RefObject } from 'react';
import type { TextInput } from 'react-native';

import type { BrowserMode } from './useBrowserViewModel';
import { COLORS, styles } from './browserStyles';

function BrowserBottomItem({
  active,
  icon,
  label,
  onPress,
}: {
  active?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.bottomItem, pressed && styles.pressed]}>
      <View style={[styles.bottomIconWrap, active && styles.bottomIconWrapActive]}>
        <Ionicons name={icon} size={20} color={active ? COLORS.purpleSoft : COLORS.textSecondary} />
      </View>
      <Text style={[styles.bottomLabel, active && styles.bottomLabelActive]}>{label}</Text>
    </Pressable>
  );
}

interface BrowserQuickActionsProps {
  favorite: boolean;
  inputRef: RefObject<TextInput | null>;
  mode: BrowserMode;
  settingsOpen: boolean;
  onRefresh: () => void;
  onResetHome: () => void;
  onToggleFavorite: () => void;
  onToggleSettings: () => void;
}

export function BrowserQuickActions({
  favorite,
  inputRef,
  mode,
  onRefresh,
  onResetHome,
  onToggleFavorite,
  onToggleSettings,
  settingsOpen,
}: BrowserQuickActionsProps) {
  return (
    <View style={styles.bottomBar}>
      <BrowserBottomItem icon="home-outline" label="Inicio" active={mode === 'home'} onPress={onResetHome} />
      <BrowserBottomItem icon="refresh-outline" label="Recargar" onPress={onRefresh} />
      <BrowserBottomItem
        icon="search-outline"
        label="Buscar"
        active={mode === 'browse'}
        onPress={() => inputRef.current?.focus()}
      />
      <BrowserBottomItem
        icon={favorite ? 'star' : 'star-outline'}
        label="Favoritos"
        active={favorite}
        onPress={onToggleFavorite}
      />
      <BrowserBottomItem
        icon="settings-outline"
        label="Ajustes"
        active={settingsOpen}
        onPress={onToggleSettings}
      />
    </View>
  );
}

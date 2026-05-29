import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import type { AstraInboxItem, AstraInboxProps } from '../types/astraUi.types';
import { astraUiTheme, getAstraUiToneColors } from '../theme/astraUiTheme';

export function AstraInbox({
  items = [],
  title = 'Astra Inbox',
  subtitle = 'Eventos y hallazgos listos para revision manual.',
  emptyTitle = 'Sin eventos',
  emptyBody = 'Cuando ASTRA tenga elementos listos, apareceran aqui.',
  onBack,
  onOpenItem,
}: AstraInboxProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        {onBack ? (
          <Pressable onPress={onBack} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <Ionicons name="arrow-back" size={18} color={astraUiTheme.colors.text} />
          </Pressable>
        ) : null}
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={items.length ? styles.listContent : styles.emptyContent}
        renderItem={({ item }) => (
          <InboxRow item={item} onPress={onOpenItem ? () => onOpenItem(item) : undefined} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="sparkles-outline" size={24} color={astraUiTheme.colors.textMuted} />
            <Text style={styles.emptyTitle}>{emptyTitle}</Text>
            <Text style={styles.emptyBody}>{emptyBody}</Text>
          </View>
        }
      />
    </View>
  );
}

function InboxRow({ item, onPress }: { item: AstraInboxItem; onPress?: () => void }) {
  const toneColors = getAstraUiToneColors(item.tone);

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderColor: toneColors.borderColor, backgroundColor: astraUiTheme.colors.surfaceElevated },
        onPress && pressed && styles.pressed,
      ]}
    >
      <View style={[styles.rowMarker, { backgroundColor: toneColors.iconColor }]} />
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{item.title}</Text>
        <Text style={styles.rowBody}>{item.body}</Text>
        <Text style={styles.rowMeta}>
          {item.source ? `${item.source} · ` : ''}
          {item.timestamp}
        </Text>
      </View>
      {!item.read ? <View style={styles.unreadDot} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: astraUiTheme.colors.background,
    paddingHorizontal: astraUiTheme.spacing.lg,
    paddingTop: astraUiTheme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: astraUiTheme.spacing.md,
    marginBottom: astraUiTheme.spacing.lg,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: astraUiTheme.colors.surfaceElevated,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.bold,
    fontSize: 22,
  },
  subtitle: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  listContent: {
    gap: astraUiTheme.spacing.sm,
    paddingBottom: astraUiTheme.spacing.xl,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  row: {
    minHeight: 84,
    borderRadius: astraUiTheme.radii.md,
    borderWidth: 1,
    paddingHorizontal: astraUiTheme.spacing.md,
    paddingVertical: astraUiTheme.spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: astraUiTheme.spacing.sm,
  },
  rowMarker: {
    width: 6,
    height: 42,
    borderRadius: astraUiTheme.radii.pill,
  },
  rowCopy: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 14,
  },
  rowBody: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  rowMeta: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.medium,
    fontSize: 11,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: astraUiTheme.colors.accent,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    gap: astraUiTheme.spacing.sm,
    paddingHorizontal: astraUiTheme.spacing.xl,
  },
  emptyTitle: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 16,
  },
  emptyBody: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.regular,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  pressed: {
    opacity: 0.84,
  },
});

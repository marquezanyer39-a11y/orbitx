import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../../constants/theme';

export type ProfileContentKind = 'live' | 'signal' | 'clip' | 'support';

export interface ProfileContentItem {
  id: string;
  kind: ProfileContentKind;
  title: string;
  subtitle?: string;
  body?: string;
  imageUri?: string;
  badge?: string;
  metric?: string;
  accentValue?: string;
}

interface ProfileContentGridProps {
  items: ProfileContentItem[];
  onOpen: (item: ProfileContentItem) => void;
}

export const ProfileContentGrid = memo(function ProfileContentGrid({
  items,
  onOpen,
}: ProfileContentGridProps) {
  return (
    <View style={styles.wrap}>
      {items.map((item, index) => {
        const fullWidth = index === 0 || item.kind === 'signal';
        return (
          <Pressable
            key={item.id}
            onPress={() => onOpen(item)}
            style={({ pressed }) => [styles.card, fullWidth ? styles.cardFull : styles.cardHalf, pressed && styles.pressed]}
          >
            {item.imageUri ? (
              <Image source={{ uri: item.imageUri }} style={styles.cardImage} resizeMode="cover" />
            ) : null}

            <View style={styles.cardShade} />

            {item.kind === 'signal' ? (
              <View style={styles.signalContent}>
                <View style={styles.signalHeader}>
                  <Ionicons name="trending-up" size={18} color="#7FFF93" />
                  <Text style={styles.signalLabel}>ALPHA SIGNAL</Text>
                </View>
                <Text style={styles.signalTitle}>{item.title}</Text>
                {item.body ? <Text style={styles.signalBody}>{item.body}</Text> : null}
                {item.accentValue ? (
                  <View style={styles.signalFooter}>
                    <Text style={styles.signalFooterLabel}>Win Rate Creator</Text>
                    <Text style={styles.signalFooterValue}>{item.accentValue}</Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <View style={styles.mediaCopy}>
                {item.badge ? (
                  <View style={item.kind === 'live' ? styles.liveBadge : styles.subtleBadge}>
                    <Text style={item.kind === 'live' ? styles.liveBadgeText : styles.subtleBadgeText}>
                      {item.kind === 'live' ? `${item.badge} DEMO` : item.badge}
                    </Text>
                  </View>
                ) : null}

                {item.subtitle ? <Text style={styles.mediaSubtitle}>{item.subtitle}</Text> : null}
                <Text style={styles.mediaTitle}>{item.title}</Text>
                {item.metric ? (
                  <View style={styles.metricRow}>
                    <Ionicons
                      name={item.kind === 'clip' ? 'play' : 'eye-outline'}
                      size={13}
                      color="rgba(250,250,250,0.76)"
                    />
                    <Text style={styles.metricText}>{item.metric} demo</Text>
                  </View>
                ) : null}
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  card: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(20,21,24,0.52)',
  },
  cardFull: {
    width: '100%',
    minHeight: 232,
    borderRadius: 16,
  },
  cardHalf: {
    width: '48.9%',
    minHeight: 336,
    borderRadius: 14,
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
  },
  cardShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.34)',
  },
  mediaCopy: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 6,
  },
  liveBadge: {
    alignSelf: 'flex-start',
    minHeight: 18,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,178,171,0.96)',
    justifyContent: 'center',
  },
  liveBadgeText: {
    color: '#690005',
    fontFamily: FONT.bold,
    fontSize: 9,
    letterSpacing: 0.9,
  },
  subtleBadge: {
    alignSelf: 'flex-start',
    minHeight: 18,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: withOpacity('#192219', 0.76),
    borderWidth: 1,
    borderColor: withOpacity('#3C4A3C', 0.24),
    justifyContent: 'center',
  },
  subtleBadgeText: {
    color: '#DCE5D7',
    fontFamily: FONT.bold,
    fontSize: 9,
    letterSpacing: 0.9,
  },
  mediaSubtitle: {
    color: 'rgba(250,250,250,0.72)',
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  mediaTitle: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 15,
    lineHeight: 21,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    color: 'rgba(250,250,250,0.8)',
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  signalContent: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 18,
    justifyContent: 'space-between',
  },
  signalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signalLabel: {
    color: '#7FFF93',
    fontFamily: FONT.bold,
    fontSize: 12,
    letterSpacing: 1.1,
  },
  signalTitle: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 33,
    lineHeight: 39,
  },
  signalBody: {
    color: '#DCE5D7',
    fontFamily: FONT.regular,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
  },
  signalFooter: {
    marginTop: 18,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: withOpacity('#2E372E', 0.58),
    borderWidth: 1,
    borderColor: withOpacity('#3C4A3C', 0.24),
    gap: 8,
  },
  signalFooterLabel: {
    color: '#DCE5D7',
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  signalFooterValue: {
    color: '#7FFF93',
    fontFamily: FONT.bold,
    fontSize: 20,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.988 }],
  },
});

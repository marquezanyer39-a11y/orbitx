import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../constants/theme';
import type { SocialCreator } from '../../types/social';

interface LiveHeaderProps {
  creator: SocialCreator;
  viewers: number;
  isFollowing: boolean;
  onFollow: () => void;
  onClose: () => void;
}

export function LiveHeader({
  creator,
  viewers,
  isFollowing,
  onFollow,
  onClose,
}: LiveHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.leftCluster}>
        <Pressable style={styles.avatarShell}>
          {creator.avatarUri ? (
            <Image source={{ uri: creator.avatarUri }} style={styles.avatar} resizeMode="cover" />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>
                {(creator.avatar ?? creator.displayName.slice(0, 1)).toUpperCase()}
              </Text>
            </View>
          )}
        </Pressable>

        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {creator.displayName}
            </Text>
            {creator.verified ? (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={10} color="#001B09" />
              </View>
            ) : null}
          </View>

          <View style={styles.metaRow}>
            <BlurView intensity={18} tint="dark" style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>LIVE DEMO</Text>
            </BlurView>

            <BlurView intensity={18} tint="dark" style={styles.viewerPill}>
              <Ionicons name="eye-outline" size={12} color="#FAFAFA" />
              <Text style={styles.viewerText}>{formatCompactViewers(viewers)} demo</Text>
            </BlurView>
          </View>
        </View>
      </View>

      <View style={styles.rightCluster}>
        <Pressable
          onPress={onFollow}
          style={({ pressed }) => [
            styles.followButton,
            isFollowing && styles.followButtonActive,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.followLabel, isFollowing && styles.followLabelActive]}>
            {isFollowing ? 'Siguiendo' : 'Seguir'}
          </Text>
        </Pressable>

        <Pressable onPress={onClose} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
          <Ionicons name="close" size={18} color="#FAFAFA" />
        </Pressable>
      </View>
    </View>
  );
}

function formatCompactViewers(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }

  return `${value}`;
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  leftCluster: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarShell: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: withOpacity('#00C853', 0.62),
    backgroundColor: withOpacity('#081008', 0.74),
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 22,
  },
  identity: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    flexShrink: 1,
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 16,
  },
  verifiedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00C853',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveBadge: {
    minHeight: 24,
    paddingHorizontal: 10,
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: withOpacity('#FF4D4D', 0.18),
    borderWidth: 1,
    borderColor: withOpacity('#FF4D4D', 0.28),
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FF4D4D',
  },
  liveBadgeText: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 10,
    letterSpacing: 1,
  },
  viewerPill: {
    minHeight: 24,
    paddingHorizontal: 10,
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: withOpacity('#08090B', 0.44),
    borderWidth: 1,
    borderColor: withOpacity('#FAFAFA', 0.08),
  },
  viewerText: {
    color: '#FAFAFA',
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  rightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  followButton: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    backgroundColor: withOpacity('#00C853', 0.92),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00C853',
    shadowOpacity: 0.26,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  followButtonActive: {
    backgroundColor: withOpacity('#0E1511', 0.7),
    borderWidth: 1,
    borderColor: withOpacity('#FAFAFA', 0.12),
    shadowOpacity: 0,
    elevation: 0,
  },
  followLabel: {
    color: '#001B09',
    fontFamily: FONT.bold,
    fontSize: 12,
  },
  followLabelActive: {
    color: '#FAFAFA',
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#08090B', 0.42),
    borderWidth: 1,
    borderColor: withOpacity('#FAFAFA', 0.08),
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
});

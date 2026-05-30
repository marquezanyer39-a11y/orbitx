import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../constants/theme';
import type { SocialCreator } from '../../types/social';

interface LiveActionRailProps {
  creator: SocialCreator;
  liked: boolean;
  likeCount: number;
  commentCount: number;
  onProfile: () => void;
  onLike: () => void;
  onComments: () => void;
  onGifts: () => void;
  onShare: () => void;
  onAstra: () => void;
}

export function LiveActionRail({
  creator,
  liked,
  likeCount,
  commentCount,
  onProfile,
  onLike,
  onComments,
  onGifts,
  onShare,
  onAstra,
}: LiveActionRailProps) {
  return (
    <View style={styles.rail} pointerEvents="box-none">
      <Pressable onPress={onProfile} style={({ pressed }) => [styles.profileButton, pressed && styles.pressed]}>
        {creator.avatarUri ? (
          <Image source={{ uri: creator.avatarUri }} style={styles.profileAvatar} resizeMode="cover" />
        ) : (
          <Text style={styles.profileInitial}>
            {(creator.avatar ?? creator.displayName.slice(0, 1)).toUpperCase()}
          </Text>
        )}
      </Pressable>

      <RailButton
        icon={liked ? 'heart' : 'heart-outline'}
        label={`${formatCompactCount(likeCount)} demo`}
        active={liked}
        onPress={onLike}
      />
      <RailButton
        icon="chatbubble-ellipses-outline"
        label={`${formatCompactCount(commentCount)} demo`}
        onPress={onComments}
      />
      <RailButton icon="gift-outline" label="Gifts demo" onPress={onGifts} />
      <RailButton icon="share-social-outline" label="Share" onPress={onShare} />

      <Pressable onPress={onAstra} style={({ pressed }) => [styles.astraButton, pressed && styles.pressed]}>
        <Ionicons name="sparkles" size={26} color="#3FE56C" />
      </Pressable>
    </View>
  );
}

function RailButton({
  icon,
  label,
  active = false,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
      <View style={[styles.iconShell, active && styles.iconShellActive]}>
        <Ionicons name={icon} size={23} color={active ? '#FF6F8E' : '#FAFAFA'} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

function formatCompactCount(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }

  return `${value}`;
}

const styles = StyleSheet.create({
  rail: {
    alignItems: 'center',
    gap: 16,
  },
  profileButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: withOpacity('#00C853', 0.54),
    backgroundColor: withOpacity('#081008', 0.7),
    shadowColor: '#00C853',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
  },
  profileInitial: {
    flex: 1,
    color: '#FAFAFA',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: FONT.bold,
    fontSize: 24,
    paddingTop: 14,
  },
  actionButton: {
    alignItems: 'center',
    gap: 5,
  },
  iconShell: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#08090B', 0.38),
    borderWidth: 1,
    borderColor: withOpacity('#FAFAFA', 0.08),
  },
  iconShellActive: {
    backgroundColor: withOpacity('#FF6F8E', 0.14),
    borderColor: withOpacity('#FF6F8E', 0.24),
  },
  actionLabel: {
    color: '#FAFAFA',
    fontFamily: FONT.semibold,
    fontSize: 11,
    textShadowColor: 'rgba(0,0,0,0.38)',
    textShadowRadius: 8,
  },
  astraButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#00C853', 0.08),
    borderWidth: 1,
    borderColor: withOpacity('#3FE56C', 0.28),
    shadowColor: '#00C853',
    shadowOpacity: 0.24,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },
});

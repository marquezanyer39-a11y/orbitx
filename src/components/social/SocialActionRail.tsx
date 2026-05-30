import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../constants/theme';
import type { SocialCreator } from '../../types/social';

interface SocialActionRailProps {
  creator: SocialCreator;
  liked: boolean;
  likeCount: number;
  commentCount: number;
  onOpenCreator: () => void;
  onFollowCreator: () => void;
  onToggleLike: () => void;
  onOpenComments: () => void;
  onOpenAstra: () => void;
  onShare: () => void;
}

export function SocialActionRail({
  creator,
  liked,
  likeCount,
  commentCount,
  onOpenCreator,
  onFollowCreator,
  onToggleLike,
  onOpenComments,
  onOpenAstra,
  onShare,
}: SocialActionRailProps) {
  return (
    <View style={styles.rail}>
      <View style={styles.avatarStack}>
        <Pressable onPress={onOpenCreator} style={styles.avatarRing}>
          {creator.avatarUri ? (
            <Image source={{ uri: creator.avatarUri }} style={styles.avatarImage} resizeMode="cover" />
          ) : (
            <Text style={styles.avatarText}>{creator.avatar ?? creator.displayName.slice(0, 1)}</Text>
          )}
        </Pressable>
        <Pressable onPress={onFollowCreator} style={styles.followButton}>
          <Ionicons name="add" size={16} color="#001B09" />
        </Pressable>
      </View>

      <RailButton
        icon={liked ? 'heart' : 'heart-outline'}
        label={`${formatCompactCount(likeCount)} demo`}
        active={liked}
        onPress={onToggleLike}
      />
      <RailButton
        icon="chatbubble-outline"
        label={`${formatCompactCount(commentCount)} demo`}
        onPress={onOpenComments}
      />
      <Pressable onPress={onOpenAstra} style={({ pressed }) => [styles.astraButton, pressed && styles.pressed]}>
        <Ionicons name="sparkles" size={29} color="#3FE56C" />
      </Pressable>
      <RailButton icon="share-social-outline" label="" onPress={onShare} />
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
    <Pressable onPress={onPress} style={({ pressed }) => [styles.railButton, pressed && styles.pressed]}>
      <Ionicons name={icon} size={34} color={active ? '#FF6B81' : '#FFFFFF'} />
      {label ? <Text style={styles.railLabel}>{label}</Text> : null}
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

  return String(value);
}

const styles = StyleSheet.create({
  rail: {
    position: 'absolute',
    right: 14,
    bottom: 158,
    alignItems: 'center',
    gap: 21,
    zIndex: 5,
  },
  avatarStack: {
    alignItems: 'center',
  },
  avatarRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: withOpacity('#00C853', 0.64),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#081008', 0.8),
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 29,
  },
  avatarText: {
    color: '#F4FFF7',
    fontFamily: FONT.bold,
    fontSize: 22,
  },
  followButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3FE56C',
    marginTop: -13,
    shadowColor: '#00C853',
    shadowOpacity: 0.38,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  railButton: {
    minWidth: 58,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  railLabel: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: 12,
    textShadowColor: 'rgba(0,0,0,0.48)',
    textShadowRadius: 8,
  },
  astraButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#081008', 0.76),
    borderWidth: 1,
    borderColor: withOpacity('#3FE56C', 0.34),
    shadowColor: '#00C853',
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 9,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },
});

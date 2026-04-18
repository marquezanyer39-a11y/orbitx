import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { memo, useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import type { SocialCreator, SocialPost } from '../../types/social';

interface SocialFeedItemProps {
  post: SocialPost;
  creator: SocialCreator;
  isActive: boolean;
  liked: boolean;
  commentCount: number;
  onToggleLike: () => void;
  onOpenComments: () => void;
  onShare: () => void;
  onOpenCreator: () => void;
  onSendMessage: () => void;
  onOpenGifts?: () => void;
  showGiftAction?: boolean;
  height: number;
}

function CreatorAvatar({
  creator,
  textColor,
}: {
  creator: SocialCreator;
  textColor: string;
}) {
  if (creator.avatarUri) {
    return <Image source={{ uri: creator.avatarUri }} style={styles.avatarImage} resizeMode="cover" />;
  }

  return (
    <Text style={[styles.avatarText, { color: textColor }]}>
      {creator.avatar ?? creator.displayName.slice(0, 1)}
    </Text>
  );
}

export const SocialFeedItem = memo(function SocialFeedItem({
  post,
  creator,
  isActive,
  liked,
  commentCount,
  onToggleLike,
  onOpenComments,
  onShare,
  onOpenCreator,
  onSendMessage,
  onOpenGifts,
  showGiftAction = false,
  height,
}: SocialFeedItemProps) {
  const { colors } = useAppTheme();
  const mediaUri = post.posterUri ?? post.mediaUri;

  return (
    <View style={[styles.outer, { height }]}>
      <View
        style={[
          styles.mediaShell,
          {
            backgroundColor: withOpacity(colors.surface, 0.94),
            borderColor: withOpacity(colors.primary, 0.18),
            borderRadius: post.isLive ? 24 : 30,
          },
        ]}
      >
        {post.mediaType === 'video' ? (
          <PostVideoSurface
            mediaUri={post.mediaUri}
            posterUri={post.posterUri}
            isActive={isActive}
            isLive={Boolean(post.isLive)}
          />
        ) : (
          <Image source={{ uri: mediaUri }} style={styles.media} resizeMode="cover" />
        )}

        <LinearGradient
          colors={['transparent', withOpacity('#050505', 0.82), withOpacity('#050505', 0.98)]}
          start={{ x: 0.5, y: 0.14 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.overlay}
        />

        {post.mediaType === 'video' && !isActive ? (
          <View
            pointerEvents="none"
            style={[
              styles.videoPreviewBadge,
              {
                backgroundColor: withOpacity(colors.overlay, 0.52),
                borderColor: withOpacity(colors.borderStrong, 0.72),
              },
            ]}
          >
            <Ionicons name="play" size={18} color={colors.text} />
            <Text style={[styles.videoPreviewLabel, { color: colors.text }]}>
              {post.isLive ? 'Live' : 'Preview'}
            </Text>
          </View>
        ) : null}

        <View style={styles.topBar}>
          <Pressable
            onPress={onOpenCreator}
            style={[
              styles.creatorPill,
              {
                backgroundColor: withOpacity(colors.overlay, 0.42),
                borderColor: withOpacity(colors.borderStrong, 0.72),
              },
            ]}
          >
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: withOpacity(colors.primary, 0.18),
                  borderColor: withOpacity(colors.primary, 0.28),
                },
              ]}
            >
              <CreatorAvatar creator={creator} textColor={colors.text} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.creatorNameRow}>
                <Text style={[styles.creatorName, { color: colors.text }]}>{creator.displayName}</Text>
                {creator.verified ? (
                  <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                ) : null}
              </View>
              <Text style={[styles.creatorHandle, { color: colors.textSoft }]}>{creator.handle}</Text>
            </View>
          </Pressable>

          {post.isLive ? (
            <View
              style={[
                styles.liveBadge,
                {
                  backgroundColor: withOpacity(colors.loss, 0.16),
                  borderColor: withOpacity(colors.loss, 0.28),
                },
              ]}
            >
              <View style={[styles.liveDot, { backgroundColor: colors.loss }]} />
              <Text style={[styles.liveBadgeText, { color: colors.text }]}>
                {`En vivo${post.liveViewers ? ` | ${formatViewers(post.liveViewers)}` : ''}`}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.actionRail}>
          <ActionButton
            icon={liked ? 'heart' : 'heart-outline'}
            label={String(post.likes)}
            color={liked ? colors.loss : colors.text}
            onPress={onToggleLike}
          />
          <ActionButton
            icon="chatbubble-ellipses-outline"
            label={String(commentCount)}
            color={colors.text}
            onPress={onOpenComments}
          />
          <ActionButton
            icon="paper-plane-outline"
            label="DM"
            color={colors.text}
            onPress={onSendMessage}
          />
          {showGiftAction && onOpenGifts ? (
            <ActionButton
              icon="gift-outline"
              label="Regalo"
              color={colors.primary}
              onPress={onOpenGifts}
            />
          ) : null}
          <ActionButton
            icon="share-social-outline"
            label={String(post.shares)}
            color={colors.text}
            onPress={onShare}
          />
        </View>

        <View style={styles.bottomCopy}>
          <View style={styles.categoryRow}>
            <View
              style={[
                styles.categoryChip,
                {
                  backgroundColor: withOpacity(colors.primary, 0.16),
                  borderColor: withOpacity(colors.primary, 0.28),
                },
              ]}
            >
              <Text style={[styles.categoryLabel, { color: colors.text }]}>
                {post.category === 'analysis'
                  ? 'Analisis'
                  : post.category === 'meme'
                  ? 'Meme'
                  : 'Noticia'}
              </Text>
            </View>
            {post.tokenSymbol ? (
              <View
                style={[
                  styles.tokenChip,
                  {
                    backgroundColor: withOpacity(colors.profit, 0.12),
                    borderColor: withOpacity(colors.profit, 0.2),
                  },
                ]}
              >
                <Text style={[styles.tokenLabel, { color: colors.profit }]}>{post.tokenSymbol}</Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.description, { color: colors.text }]}>{post.description}</Text>
          <Text style={[styles.hashtags, { color: colors.primary }]}>{post.hashtags.join(' ')}</Text>
        </View>
      </View>
    </View>
  );
});

function PostVideoSurface({
  mediaUri,
  posterUri,
  isActive,
  isLive,
}: {
  mediaUri: string;
  posterUri?: string | null;
  isActive: boolean;
  isLive: boolean;
}) {
  const { colors } = useAppTheme();
  const [muted, setMuted] = useState(false);
  const player = useVideoPlayer(isActive ? { uri: mediaUri } : null, (instance) => {
    instance.loop = true;
    instance.volume = 1;
    instance.muted = false;
    instance.staysActiveInBackground = false;
    instance.keepScreenOnWhilePlaying = false;
    instance.showNowPlayingNotification = false;
  });

  useEffect(() => {
    player.muted = muted;
  }, [muted, player]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    player.currentTime = 0;
    player.play();

    return () => {
      player.pause();
    };
  }, [isActive, player]);

  if (!isActive) {
    if (posterUri) {
      return <Image source={{ uri: posterUri }} style={styles.media} resizeMode="cover" />;
    }

    return (
      <LinearGradient
        colors={[
          withOpacity('#0B0B0F', 0.88),
          withOpacity(colors.primary, 0.2),
          withOpacity('#050505', 0.96),
        ]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.mediaPlaceholder}
      >
        <Ionicons name={isLive ? 'radio' : 'play'} size={34} color={colors.text} />
        <Text style={[styles.mediaPlaceholderLabel, { color: colors.text }]}>
          {isLive ? 'Directo de video' : 'Video listo para reproducir'}
        </Text>
      </LinearGradient>
    );
  }

  return (
    <>
      <VideoView
        player={player}
        style={styles.media}
        nativeControls={false}
        contentFit="cover"
        surfaceType="textureView"
      />
      <Pressable
        onPress={() => setMuted((value) => !value)}
        style={[
          styles.audioButton,
          {
            backgroundColor: withOpacity(colors.overlay, 0.42),
            borderColor: withOpacity(colors.borderStrong, 0.72),
          },
        ]}
      >
        <Ionicons
          name={muted ? 'volume-mute-outline' : 'volume-high-outline'}
          size={18}
          color={colors.text}
        />
      </Pressable>
    </>
  );
}

function formatViewers(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }

  return String(value);
}

function ActionButton({
  icon,
  label,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.actionButton,
        {
          backgroundColor: withOpacity(colors.overlay, 0.44),
          borderColor: withOpacity(colors.borderStrong, 0.72),
        },
      ]}
    >
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
  },
  mediaShell: {
    flex: 1,
    borderWidth: 1,
    overflow: 'hidden',
  },
  media: {
    ...StyleSheet.absoluteFillObject,
  },
  mediaPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 28,
  },
  mediaPlaceholderLabel: {
    fontFamily: FONT.semibold,
    fontSize: 13,
    textAlign: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  audioButton: {
    position: 'absolute',
    right: 16,
    top: 90,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPreviewBadge: {
    position: 'absolute',
    top: '45%',
    left: '50%',
    marginLeft: -44,
    marginTop: -18,
    minWidth: 88,
    minHeight: 36,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  videoPreviewLabel: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  topBar: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  creatorPill: {
    flex: 1,
    minHeight: 56,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 19,
  },
  creatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  creatorName: {
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  creatorHandle: {
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  liveBadge: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 21,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveBadgeText: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  actionRail: {
    position: 'absolute',
    right: 16,
    bottom: 132,
    gap: 12,
    alignItems: 'center',
  },
  actionButton: {
    width: 58,
    minHeight: 58,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionLabel: {
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  bottomCopy: {
    position: 'absolute',
    left: 16,
    right: 86,
    bottom: 18,
    gap: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryChip: {
    minHeight: 30,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  tokenChip: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenLabel: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  description: {
    fontFamily: FONT.semibold,
    fontSize: 16,
    lineHeight: 22,
  },
  hashtags: {
    fontFamily: FONT.medium,
    fontSize: 13,
    lineHeight: 18,
  },
});

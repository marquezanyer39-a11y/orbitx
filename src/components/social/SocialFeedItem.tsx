import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../constants/theme';
import type { SocialCreator, SocialPost } from '../../types/social';
import { AstraInsightOverlay } from './AstraInsightOverlay';
import { SocialActionRail } from './SocialActionRail';

interface SocialFeedItemProps {
  post: SocialPost;
  creator: SocialCreator;
  liked: boolean;
  commentCount: number;
  height: number;
  astraInsight: string;
  onToggleLike: () => void;
  onOpenComments: () => void;
  onShare: () => void;
  onOpenCreator: () => void;
  onFollowCreator: () => void;
  onOpenAstra: () => void;
}

export const SocialFeedItem = memo(function SocialFeedItem({
  post,
  creator,
  liked,
  commentCount,
  height,
  astraInsight,
  onToggleLike,
  onOpenComments,
  onShare,
  onOpenCreator,
  onFollowCreator,
  onOpenAstra,
}: SocialFeedItemProps) {
  const mediaUri = post.posterUri ?? post.mediaUri;
  const categoryLabel = getCategoryLabel(post.category);

  return (
    <View style={[styles.item, { height }]}>
      <View style={styles.background}>
        <Image source={{ uri: mediaUri }} style={styles.media} resizeMode="cover" />
        <LinearGradient
          colors={[
            'rgba(0,0,0,0.76)',
            'rgba(0,0,0,0.04)',
            'rgba(0,0,0,0.18)',
            'rgba(0,0,0,0.86)',
          ]}
          locations={[0, 0.28, 0.62, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View pointerEvents="none" style={styles.greenBloom} />
        <View pointerEvents="none" style={styles.chartGlassLine} />
      </View>

      {post.isLive ? (
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>
            LIVE DEMO{post.liveViewers ? ` · ${formatCompactCount(post.liveViewers)} viewers demo` : ''}
          </Text>
          <Text style={styles.liveDemoCaption}>Vista de ejemplo</Text>
        </View>
      ) : null}

      <SocialActionRail
        creator={creator}
        liked={liked}
        likeCount={post.likes}
        commentCount={commentCount}
        onOpenCreator={onOpenCreator}
        onFollowCreator={onFollowCreator}
        onToggleLike={onToggleLike}
        onOpenComments={onOpenComments}
        onOpenAstra={onOpenAstra}
        onShare={onShare}
      />

      <View style={styles.bottomContent}>
        <AstraInsightOverlay insight={astraInsight} onPress={onOpenAstra} />

        <Pressable onPress={onOpenCreator} style={({ pressed }) => [styles.creatorBlock, pressed && styles.pressed]}>
          <Text style={styles.creatorName} numberOfLines={1}>
            {creator.handle || `@${creator.displayName.replace(/\s+/g, '')}`}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.categoryChip}>
              <Text style={styles.categoryText}>{categoryLabel}</Text>
            </View>
            {post.tokenSymbol ? <Text style={styles.tokenText}>{post.tokenSymbol}</Text> : null}
          </View>
        </Pressable>

        <Text style={styles.description} numberOfLines={3}>
          {post.description}
        </Text>

        <Text style={styles.hashtags} numberOfLines={1}>
          {post.hashtags.join(' ')}
        </Text>

        <View style={styles.audioRow}>
          <Ionicons name="musical-note" size={15} color="#3FE56C" />
          <Text style={styles.audioText} numberOfLines={1}>
            QVEX - Feed demo / datos de ejemplo
          </Text>
        </View>
      </View>
    </View>
  );
});

function getCategoryLabel(category: SocialPost['category']) {
  if (category === 'analysis') {
    return 'Trading';
  }

  if (category === 'meme') {
    return 'Memecoin';
  }

  return 'Crypto News';
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
  item: {
    width: '100%',
    backgroundColor: '#08090B',
    overflow: 'hidden',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#08090B',
  },
  media: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  greenBloom: {
    position: 'absolute',
    left: -80,
    right: -80,
    bottom: 180,
    height: 220,
    borderRadius: 120,
    backgroundColor: withOpacity('#00C853', 0.12),
    transform: [{ rotate: '-8deg' }],
  },
  chartGlassLine: {
    position: 'absolute',
    left: -32,
    right: -32,
    bottom: 136,
    height: 1,
    backgroundColor: withOpacity('#3FE56C', 0.32),
    shadowColor: '#00C853',
    shadowOpacity: 0.44,
    shadowRadius: 18,
    transform: [{ rotate: '-1deg' }],
  },
  livePill: {
    position: 'absolute',
    top: 142,
    left: 18,
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,35,64,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,82,82,0.34)',
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FF5252',
  },
  liveText: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: 10,
    letterSpacing: 1.1,
  },
  liveDemoCaption: {
    color: '#FFD76A',
    fontFamily: FONT.semibold,
    fontSize: 9,
    letterSpacing: 0.4,
  },
  bottomContent: {
    position: 'absolute',
    left: 24,
    right: 84,
    bottom: 118,
    gap: 12,
  },
  creatorBlock: {
    alignSelf: 'flex-start',
    gap: 4,
  },
  creatorName: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: 22,
    lineHeight: 27,
    textShadowColor: 'rgba(0,0,0,0.52)',
    textShadowRadius: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryChip: {
    minHeight: 22,
    borderRadius: 11,
    paddingHorizontal: 8,
    justifyContent: 'center',
    backgroundColor: withOpacity('#081008', 0.44),
    borderWidth: 1,
    borderColor: withOpacity('#FFFFFF', 0.1),
  },
  categoryText: {
    color: '#DCE5D7',
    fontFamily: FONT.semibold,
    fontSize: 10.5,
  },
  tokenText: {
    color: '#3FE56C',
    fontFamily: FONT.bold,
    fontSize: 11,
  },
  description: {
    color: 'rgba(255,255,255,0.88)',
    fontFamily: FONT.medium,
    fontSize: 18,
    lineHeight: 27,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 10,
  },
  hashtags: {
    color: '#F4FFF7',
    fontFamily: FONT.semibold,
    fontSize: 14,
    lineHeight: 18,
    opacity: 0.9,
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  audioText: {
    color: 'rgba(255,255,255,0.58)',
    fontFamily: FONT.medium,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.82,
  },
});

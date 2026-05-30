import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../../constants/theme';

export interface ProfileHeaderCreator {
  name: string;
  handle: string;
  bio: string;
  avatarUri: string;
  bannerUri: string;
  verified: boolean;
  vipLabel: string;
  followersLabel: string;
  followingLabel: string;
  likesLabel: string;
}

interface ProfileHeaderProps {
  creator: ProfileHeaderCreator;
  isFollowing: boolean;
  onBack: () => void;
  onMore: () => void;
  onToggleFollow: () => void;
  onMessage: () => void;
  onShare: () => void;
}

export function ProfileHeader({
  creator,
  isFollowing,
  onBack,
  onMore,
  onToggleFollow,
  onMessage,
  onShare,
}: ProfileHeaderProps) {
  return (
    <View style={styles.wrap}>
      <Image source={{ uri: creator.bannerUri }} style={styles.banner} resizeMode="cover" />
      <View style={styles.bannerGlow} />
      <View style={styles.bannerShadeTop} />
      <View style={styles.bannerShadeBottom} />

      <View style={styles.topBar}>
        <Pressable onPress={onBack} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
          <Ionicons name="arrow-back" size={18} color="#7FFF93" />
        </Pressable>

        <View style={styles.topBarTitleWrap}>
          <Text style={styles.topBarTitle}>Creator Profile</Text>
        </View>

        <Pressable onPress={onMore} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
          <Ionicons name="ellipsis-vertical" size={18} color="#7FFF93" />
        </Pressable>
      </View>

      <View style={styles.overlayContent}>
        <View style={styles.avatarStack}>
          <View style={styles.avatarRing}>
            <Image source={{ uri: creator.avatarUri }} style={styles.avatar} resizeMode="cover" />
          </View>

          <BlurView intensity={20} tint="dark" style={styles.vipBadge}>
            <Ionicons name="checkmark-circle" size={12} color="#081008" />
            <Text style={styles.vipLabel}>{creator.vipLabel}</Text>
          </BlurView>
        </View>

        <Text style={styles.handle}>{creator.handle}</Text>
        <Text style={styles.bio}>{creator.bio}</Text>

        <View style={styles.statsRow}>
          <StatBlock value={creator.followersLabel} label="SEGUIDORES DEMO" />
          <StatBlock value={creator.followingLabel} label="SIGUIENDO DEMO" />
          <StatBlock value={creator.likesLabel} label="LIKES DEMO" />
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            onPress={onToggleFollow}
            style={({ pressed }) => [
              styles.followButton,
              isFollowing && styles.followButtonActive,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.followButtonText, isFollowing && styles.followButtonTextActive]}>
              {isFollowing ? 'Siguiendo' : 'Seguir'}
            </Text>
          </Pressable>

          <Pressable onPress={onMessage} style={({ pressed }) => [styles.circleAction, pressed && styles.pressed]}>
            <Ionicons name="mail-outline" size={18} color="#7FFF93" />
          </Pressable>

          <Pressable onPress={onShare} style={({ pressed }) => [styles.circleAction, pressed && styles.pressed]}>
            <Ionicons name="share-social-outline" size={18} color="#7FFF93" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 560,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    backgroundColor: '#081008',
  },
  banner: {
    ...StyleSheet.absoluteFillObject,
  },
  bannerGlow: {
    position: 'absolute',
    right: -80,
    top: 120,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(0,200,83,0.16)',
  },
  bannerShadeTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,16,8,0.34)',
  },
  bannerShadeBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 320,
    backgroundColor: 'rgba(8,16,8,0.86)',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    minHeight: 72,
    paddingHorizontal: 16,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  topBarTitleWrap: {
    flex: 1,
    paddingHorizontal: 12,
  },
  topBarTitle: {
    color: '#7FFF93',
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#192219', 0.7),
    borderWidth: 1,
    borderColor: withOpacity('#3C4A3C', 0.34),
  },
  overlayContent: {
    position: 'relative',
    paddingHorizontal: 24,
    paddingBottom: 28,
    zIndex: 2,
  },
  avatarStack: {
    width: 108,
    height: 108,
    marginBottom: 14,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#3FE56C',
    padding: 4,
    backgroundColor: '#081008',
    shadowColor: '#3FE56C',
    shadowOpacity: 0.26,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 44,
  },
  vipBadge: {
    position: 'absolute',
    right: 0,
    bottom: 4,
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(127,255,147,0.92)',
    borderWidth: 1,
    borderColor: withOpacity('#081008', 0.3),
  },
  vipLabel: {
    color: '#003912',
    fontFamily: FONT.bold,
    fontSize: 10,
    letterSpacing: 0.7,
  },
  handle: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 34,
    letterSpacing: -0.6,
  },
  bio: {
    marginTop: 10,
    color: '#DCE5D7',
    fontFamily: FONT.regular,
    fontSize: 17,
    lineHeight: 25,
    maxWidth: 340,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
    marginTop: 18,
  },
  statBlock: {
    gap: 2,
  },
  statValue: {
    color: '#7FFF93',
    fontFamily: FONT.bold,
    fontSize: 28,
    letterSpacing: -0.4,
  },
  statLabel: {
    color: '#BBCBB8',
    fontFamily: FONT.medium,
    fontSize: 11,
    letterSpacing: 1.1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 22,
  },
  followButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3FE56C',
    shadowColor: '#3FE56C',
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
  },
  followButtonActive: {
    backgroundColor: withOpacity('#192219', 0.82),
    borderWidth: 1,
    borderColor: withOpacity('#3C4A3C', 0.34),
    shadowOpacity: 0,
    elevation: 0,
  },
  followButtonText: {
    color: '#003912',
    fontFamily: FONT.bold,
    fontSize: 16,
  },
  followButtonTextActive: {
    color: '#FAFAFA',
  },
  circleAction: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#192219', 0.62),
    borderWidth: 1,
    borderColor: withOpacity('#3C4A3C', 0.3),
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
});

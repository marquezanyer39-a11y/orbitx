import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useSocialFeed } from '../../hooks/useSocialFeed';
import { useUiStore } from '../../store/uiStore';
import { copyToClipboard } from '../../utils/copyToClipboard';

export default function SocialCreatorScreen() {
  const { colors } = useAppTheme();
  const { creatorId } = useLocalSearchParams<{ creatorId?: string }>();
  const showToast = useUiStore((state) => state.showToast);
  const {
    creators,
    posts,
    threads,
    currentCreator,
    followingCreatorIds,
    toggleFollowCreator,
    ensureThreadWithCreator,
  } = useSocialFeed();
  const [activeTab, setActiveTab] = useState<'posts' | 'threads'>('posts');

  const resolvedCreatorId = creatorId === 'current-user' ? currentCreator.id : creatorId;
  const creator = creators.find((item) => item.id === resolvedCreatorId);
  const creatorPosts = posts.filter((post) => post.authorId === resolvedCreatorId);
  const isOwnProfile = resolvedCreatorId === currentCreator.id;
  const creatorThreads = useMemo(() => (isOwnProfile ? threads : []), [isOwnProfile, threads]);

  if (!creator) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
        edges={['top', 'bottom']}
      >
        <View style={styles.centered}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No encontramos este perfil</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isFollowing = followingCreatorIds.includes(creator.id);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.circleButton,
              {
                backgroundColor: withOpacity(colors.surfaceElevated, 0.82),
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="chevron-back" size={18} color={colors.text} />
          </Pressable>
          <Pressable
            onPress={async () => {
              await copyToClipboard(`orbitx://social/creator/${creator.id}`);
              showToast('Perfil copiado.', 'success');
            }}
            style={[
              styles.circleButton,
              {
                backgroundColor: withOpacity(colors.surfaceElevated, 0.82),
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="share-social-outline" size={18} color={colors.text} />
          </Pressable>
        </View>

        <LinearGradient
          colors={[withOpacity(colors.primary, 0.2), withOpacity(colors.surface, 0.96)]}
          style={[styles.hero, { borderColor: withOpacity(colors.primary, 0.22) }]}
        >
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: withOpacity(colors.primary, 0.16),
                borderColor: withOpacity(colors.primary, 0.28),
              },
            ]}
          >
            {creator.avatarUri ? (
              <Image source={{ uri: creator.avatarUri }} style={styles.avatarImage} resizeMode="cover" />
            ) : (
              <Text style={[styles.avatarText, { color: colors.text }]}>
                {creator.avatar ?? creator.displayName.slice(0, 1)}
              </Text>
            )}
          </View>
          <View style={styles.heroCopy}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: colors.text }]}>{creator.displayName}</Text>
              {creator.verified ? (
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              ) : null}
            </View>
            <Text style={[styles.handle, { color: colors.textMuted }]}>{creator.handle}</Text>
            <Text style={[styles.bio, { color: colors.textSoft }]}>
              {isOwnProfile ? 'Tu espacio dentro de OrbitX Social.' : creator.bio}
            </Text>
            <View style={styles.statsRow}>
              <Text style={[styles.meta, { color: colors.text }]}>
                {creator.followers.toLocaleString()} seguidores
              </Text>
              <Text style={[styles.meta, { color: colors.text }]}>
                {creator.following.toLocaleString()} siguiendo
              </Text>
              {isOwnProfile ? (
                <Text style={[styles.meta, { color: colors.text }]}>
                  {creatorThreads.length.toLocaleString()} hilos
                </Text>
              ) : null}
            </View>
          </View>
          <View style={styles.actionRow}>
            {isOwnProfile ? (
              <Pressable
                onPress={() => router.push('/(tabs)/profile')}
                style={[
                  styles.followButton,
                  {
                    backgroundColor: colors.primary,
                    borderColor: withOpacity(colors.primary, 0.68),
                  },
                ]}
              >
                <Text style={[styles.followLabel, { color: '#0B0B0F' }]}>Editar perfil</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => toggleFollowCreator(creator.id)}
                style={[
                  styles.followButton,
                  {
                    backgroundColor: isFollowing
                      ? withOpacity(colors.fieldBackground, 0.86)
                      : colors.primary,
                    borderColor: isFollowing
                      ? colors.border
                      : withOpacity(colors.primary, 0.68),
                  },
                ]}
              >
                <Text style={[styles.followLabel, { color: isFollowing ? colors.text : '#0B0B0F' }]}>
                  {isFollowing ? 'Siguiendo' : 'Seguir'}
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => {
                const threadId = ensureThreadWithCreator(creator);
                router.push({ pathname: '/social/messages', params: { threadId } });
              }}
              style={[
                styles.messageButton,
                {
                  backgroundColor: withOpacity(colors.surfaceElevated, 0.86),
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="paper-plane-outline" size={15} color={colors.text} />
            </Pressable>
          </View>
        </LinearGradient>

        {isOwnProfile ? (
          <View
            style={[
              styles.segmentedControl,
              {
                backgroundColor: withOpacity(colors.surfaceElevated, 0.9),
                borderColor: colors.border,
              },
            ]}
          >
            <Pressable
              onPress={() => setActiveTab('posts')}
              style={[
                styles.segmentedChip,
                {
                  backgroundColor:
                    activeTab === 'posts' ? withOpacity(colors.primary, 0.18) : 'transparent',
                  borderColor:
                    activeTab === 'posts'
                      ? withOpacity(colors.primary, 0.28)
                      : 'transparent',
                },
              ]}
            >
              <Text
                style={[
                  styles.segmentedLabel,
                  { color: activeTab === 'posts' ? colors.text : colors.textMuted },
                ]}
              >
                Publicaciones
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab('threads')}
              style={[
                styles.segmentedChip,
                {
                  backgroundColor:
                    activeTab === 'threads' ? withOpacity(colors.primary, 0.18) : 'transparent',
                  borderColor:
                    activeTab === 'threads'
                      ? withOpacity(colors.primary, 0.28)
                      : 'transparent',
                },
              ]}
            >
              <Text
                style={[
                  styles.segmentedLabel,
                  { color: activeTab === 'threads' ? colors.text : colors.textMuted },
                ]}
              >
                Hilos
              </Text>
            </Pressable>
          </View>
        ) : null}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {isOwnProfile && activeTab === 'threads' ? 'Tus hilos' : 'Publicaciones'}
        </Text>

        {isOwnProfile && activeTab === 'threads' ? (
          <View style={styles.postList}>
            {creatorThreads.length ? (
              creatorThreads.map((thread) => (
                <Pressable
                  key={thread.id}
                  onPress={() =>
                    router.push({ pathname: '/social/messages', params: { threadId: thread.id } })
                  }
                  style={[
                    styles.threadCard,
                    {
                      backgroundColor: withOpacity(colors.surfaceElevated, 0.88),
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.threadCardTop}>
                    <View
                      style={[
                        styles.threadAvatar,
                        {
                          backgroundColor: withOpacity(colors.primary, 0.16),
                          borderColor: withOpacity(colors.primary, 0.26),
                        },
                      ]}
                    >
                      {thread.peerAvatarUri ? (
                        <Image
                          source={{ uri: thread.peerAvatarUri }}
                          style={styles.threadAvatarImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <Text style={[styles.threadAvatarText, { color: colors.text }]}>
                          {thread.peerAvatar ?? thread.peerName.slice(0, 1)}
                        </Text>
                      )}
                    </View>
                    <View style={styles.threadMeta}>
                      <Text style={[styles.threadName, { color: colors.text }]}>{thread.peerName}</Text>
                      <Text style={[styles.threadHandle, { color: colors.textMuted }]}>
                        {thread.peerHandle}
                      </Text>
                    </View>
                    {thread.unreadCount ? (
                      <View style={[styles.threadBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.threadBadgeLabel}>{thread.unreadCount}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text
                    style={[styles.threadPreview, { color: colors.textSoft }]}
                    numberOfLines={2}
                  >
                    {thread.messages[thread.messages.length - 1]?.body ??
                      'Abre el hilo para continuar la conversacion.'}
                  </Text>
                </Pressable>
              ))
            ) : (
              <View
                style={[
                  styles.emptyState,
                  {
                    backgroundColor: withOpacity(colors.surfaceElevated, 0.88),
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Todavia no tienes hilos activos
                </Text>
                <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
                  Cuando escribas o recibas mensajes en Social, apareceran aqui.
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.postList}>
            {creatorPosts.map((post) => (
              <Pressable
                key={post.id}
                onPress={() => router.push(`/social/comments/${post.id}`)}
                style={[
                  styles.postCard,
                  {
                    backgroundColor: withOpacity(colors.surfaceElevated, 0.88),
                    borderColor: colors.border,
                  },
                ]}
              >
                <LinearGradient
                  colors={[withOpacity(colors.primary, 0.12), 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View
                  style={[
                    styles.postPreview,
                    {
                      backgroundColor: withOpacity(colors.fieldBackground, 0.82),
                      borderColor: withOpacity(colors.primary, 0.18),
                    },
                  ]}
                >
                  {post.posterUri ? (
                    <Image source={{ uri: post.posterUri }} style={styles.postPreviewImage} resizeMode="cover" />
                  ) : (
                    <LinearGradient
                      colors={[withOpacity(colors.primary, 0.22), withOpacity(colors.surfaceElevated, 0.92)]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.postPreviewFallback}
                    >
                      <Ionicons
                        name={post.mediaType === 'video' ? 'play' : 'image-outline'}
                        size={24}
                        color={colors.text}
                      />
                    </LinearGradient>
                  )}
                  <View
                    style={[
                      styles.postPreviewBadge,
                      {
                        backgroundColor: withOpacity(colors.overlay, 0.48),
                        borderColor: withOpacity(colors.borderStrong, 0.72),
                      },
                    ]}
                  >
                    <Ionicons
                      name={post.mediaType === 'video' ? 'videocam' : 'image'}
                      size={12}
                      color={colors.text}
                    />
                    <Text style={[styles.postPreviewBadgeLabel, { color: colors.text }]}>
                      {post.mediaType === 'video' ? 'Video' : 'Imagen'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.postCategory, { color: colors.primary }]}>
                  {post.category === 'analysis'
                    ? 'Analisis'
                    : post.category === 'meme'
                      ? 'Meme'
                      : 'Noticia'}
                </Text>
                <Text style={[styles.postDescription, { color: colors.text }]}>
                  {post.description}
                </Text>
                <Text style={[styles.postMeta, { color: colors.textMuted }]}>
                  {post.hashtags.join(' ')} {post.tokenSymbol ? `| ${post.tokenSymbol}` : ''}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 34, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: { borderRadius: 24, borderWidth: 1, padding: 16, gap: 14 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 36 },
  avatarText: { fontFamily: FONT.bold, fontSize: 30 },
  heroCopy: { gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontFamily: FONT.bold, fontSize: 26 },
  handle: { fontFamily: FONT.medium, fontSize: 12 },
  bio: { fontFamily: FONT.regular, fontSize: 13, lineHeight: 19 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 4, flexWrap: 'wrap' },
  meta: { fontFamily: FONT.semibold, fontSize: 12 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  followButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followLabel: { fontFamily: FONT.bold, fontSize: 13 },
  messageButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedControl: { borderRadius: 18, borderWidth: 1, padding: 4, flexDirection: 'row', gap: 6 },
  segmentedChip: {
    flex: 1,
    minHeight: 38,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedLabel: { fontFamily: FONT.semibold, fontSize: 12 },
  sectionTitle: { fontFamily: FONT.bold, fontSize: 20 },
  postList: { gap: 10 },
  postCard: { borderRadius: 20, borderWidth: 1, padding: 14, gap: 8, overflow: 'hidden' },
  postPreview: {
    height: 144,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 2,
  },
  postPreviewImage: {
    width: '100%',
    height: '100%',
  },
  postPreviewFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postPreviewBadge: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    minHeight: 28,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postPreviewBadgeLabel: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  threadCard: { borderRadius: 20, borderWidth: 1, padding: 14, gap: 10, overflow: 'hidden' },
  threadCardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  threadAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  threadAvatarImage: { width: '100%', height: '100%', borderRadius: 22 },
  threadAvatarText: { fontFamily: FONT.bold, fontSize: 18 },
  threadMeta: { flex: 1, gap: 2 },
  threadName: { fontFamily: FONT.semibold, fontSize: 14 },
  threadHandle: { fontFamily: FONT.medium, fontSize: 11 },
  threadPreview: { fontFamily: FONT.regular, fontSize: 12, lineHeight: 18 },
  threadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  threadBadgeLabel: { color: '#0B0B0F', fontFamily: FONT.bold, fontSize: 10 },
  postCategory: { fontFamily: FONT.medium, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.2 },
  postDescription: { fontFamily: FONT.semibold, fontSize: 15, lineHeight: 21 },
  postMeta: { fontFamily: FONT.regular, fontSize: 12, lineHeight: 18 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyState: { borderRadius: 20, borderWidth: 1, padding: 18, gap: 8 },
  emptyTitle: { fontFamily: FONT.bold, fontSize: 20 },
  emptyBody: { fontFamily: FONT.regular, fontSize: 12, lineHeight: 18 },
});

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useSocialFeed } from '../../hooks/useSocialFeed';
import type { SocialComment } from '../../types/social';
import { useUiStore } from '../../store/uiStore';

function formatCommentTime(value: string) {
  const date = new Date(value);
  return date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SocialCommentsScreen() {
  const { colors } = useAppTheme();
  const showToast = useUiStore((state) => state.showToast);
  const { postId } = useLocalSearchParams<{ postId?: string }>();
  const [draft, setDraft] = useState('');
  const [replyTarget, setReplyTarget] = useState<SocialComment | null>(null);

  const { posts, creators, commentsByPost, likedCommentIds, toggleLikeComment, publishComment } =
    useSocialFeed();

  const post = posts.find((item) => item.id === postId);
  const creatorsById = useMemo(
    () => Object.fromEntries(creators.map((creator) => [creator.id, creator])),
    [creators],
  );
  const postCreator = post ? creatorsById[post.authorId] : null;
  const comments = useMemo(
    () =>
      [...(commentsByPost[postId ?? ''] ?? [])].sort((left, right) =>
        left.createdAt.localeCompare(right.createdAt),
      ),
    [commentsByPost, postId],
  );

  const handleSend = () => {
    if (!post) {
      return;
    }

    const body = draft.trim();
    if (!body) {
      showToast('Escribe un comentario antes de enviarlo.', 'info');
      return;
    }

    publishComment(post.id, body, replyTarget?.id);
    setDraft('');
    setReplyTarget(null);
    showToast('Comentario publicado.', 'success');
  };

  if (!post || !postCreator) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
        edges={['top', 'bottom']}
      >
        <View style={styles.centered}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Este post ya no esta disponible
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.backButton,
              {
                backgroundColor: withOpacity(colors.surfaceElevated, 0.88),
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.backLabel, { color: colors.text }]}>Volver</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]}>Comentarios</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Conversacion alrededor del contenido compartido.
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              styles.postCard,
              {
                backgroundColor: withOpacity(colors.surfaceElevated, 0.92),
                borderColor: withOpacity(colors.primary, 0.22),
              },
            ]}
          >
            <View style={styles.postHeader}>
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor: withOpacity(colors.primary, 0.18),
                    borderColor: withOpacity(colors.primary, 0.26),
                  },
                ]}
              >
                <Text style={[styles.avatarText, { color: colors.text }]}>
                  {postCreator.avatar ?? postCreator.displayName.slice(0, 1)}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.postAuthor, { color: colors.text }]}>
                  {postCreator.displayName}
                </Text>
                <Text style={[styles.postHandle, { color: colors.textMuted }]}>
                  {postCreator.handle}
                </Text>
              </View>
            </View>

            <Text style={[styles.postDescription, { color: colors.text }]}>
              {post.description}
            </Text>
            <Text style={[styles.postMeta, { color: colors.primary }]}>
              {post.hashtags.join(' ')}
            </Text>
          </View>

          <View style={styles.commentsSection}>
            {comments.length ? (
              comments.map((comment) => {
                const replyingTo =
                  comment.replyToCommentId != null
                    ? comments.find((item) => item.id === comment.replyToCommentId)
                    : null;
                const liked = likedCommentIds.includes(comment.id);

                return (
                  <View
                    key={comment.id}
                    style={[
                      styles.commentCard,
                      {
                        backgroundColor: withOpacity(colors.surfaceElevated, 0.88),
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.commentHeader}>
                      <View
                        style={[
                          styles.commentAvatar,
                          {
                            backgroundColor: withOpacity(colors.primary, 0.14),
                            borderColor: withOpacity(colors.primary, 0.22),
                          },
                        ]}
                      >
                        <Text style={[styles.commentAvatarText, { color: colors.text }]}>
                          {comment.authorName.slice(0, 1).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.commentAuthor, { color: colors.text }]}>
                          {comment.authorName}
                        </Text>
                        <Text style={[styles.commentHandle, { color: colors.textMuted }]}>
                          {comment.authorHandle} · {formatCommentTime(comment.createdAt)}
                        </Text>
                      </View>
                    </View>

                    {replyingTo ? (
                      <Text style={[styles.replyLine, { color: colors.primary }]}>
                        Respuesta a {replyingTo.authorHandle}
                      </Text>
                    ) : null}

                    <Text style={[styles.commentBody, { color: colors.text }]}>
                      {comment.body}
                    </Text>

                    <View style={styles.commentActions}>
                      <Pressable
                        onPress={() => setReplyTarget(comment)}
                        style={styles.commentAction}
                      >
                        <Ionicons name="return-up-forward-outline" size={15} color={colors.textMuted} />
                        <Text style={[styles.commentActionLabel, { color: colors.textMuted }]}>
                          Responder
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => toggleLikeComment(comment.id)}
                        style={styles.commentAction}
                      >
                        <Ionicons
                          name={liked ? 'heart' : 'heart-outline'}
                          size={15}
                          color={liked ? colors.loss : colors.textMuted}
                        />
                        <Text
                          style={[
                            styles.commentActionLabel,
                            { color: liked ? colors.loss : colors.textMuted },
                          ]}
                        >
                          {comment.likes}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })
            ) : (
              <View
                style={[
                  styles.emptyComments,
                  {
                    backgroundColor: withOpacity(colors.surfaceElevated, 0.86),
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name="chatbubbles-outline" size={22} color={colors.primary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Todavia no hay respuestas
                </Text>
                <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
                  Se el primero en aportar contexto o reaccionar.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View
          style={[
            styles.composerShell,
            {
              backgroundColor: withOpacity(colors.surfaceElevated, 0.96),
              borderTopColor: withOpacity(colors.border, 0.88),
            },
          ]}
        >
          {replyTarget ? (
            <View
              style={[
                styles.replyBanner,
                {
                  backgroundColor: withOpacity(colors.primary, 0.12),
                  borderColor: withOpacity(colors.primary, 0.22),
                },
              ]}
            >
              <Text style={[styles.replyBannerText, { color: colors.text }]}>
                Respondiendo a {replyTarget.authorHandle}
              </Text>
              <Pressable onPress={() => setReplyTarget(null)}>
                <Ionicons name="close" size={16} color={colors.textMuted} />
              </Pressable>
            </View>
          ) : null}

          <View style={styles.composerRow}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Escribe tu comentario"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: withOpacity(colors.fieldBackground, 0.84),
                  borderColor: colors.border,
                },
              ]}
            />
            <Pressable
              onPress={handleSend}
              style={[
                styles.sendButton,
                {
                  backgroundColor: colors.primary,
                  borderColor: withOpacity(colors.primary, 0.68),
                },
              ]}
            >
              <Ionicons name="send" size={16} color="#0B0B0F" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 10,
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 24,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 140,
    gap: 14,
  },
  postCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  postAuthor: {
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  postHandle: {
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  postDescription: {
    fontFamily: FONT.semibold,
    fontSize: 15,
    lineHeight: 22,
  },
  postMeta: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  commentsSection: {
    gap: 10,
  },
  commentCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: {
    fontFamily: FONT.bold,
    fontSize: 15,
  },
  commentAuthor: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  commentHandle: {
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  replyLine: {
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  commentBody: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  commentActionLabel: {
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  emptyComments: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 22,
    gap: 8,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: FONT.bold,
    fontSize: 17,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  backButton: {
    minHeight: 42,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backLabel: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  composerShell: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 16,
    gap: 10,
  },
  replyBanner: {
    minHeight: 36,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  replyBannerText: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontFamily: FONT.medium,
    fontSize: 14,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

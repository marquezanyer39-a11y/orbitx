import { BlurView } from 'expo-blur';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FONT, withOpacity } from '../../../../constants/theme';
import type { SocialComment } from '../../../types/social';
import { AstraCommentInsight } from './AstraCommentInsight';
import { CommentInputBar } from './CommentInputBar';
import { CommentItem, type CommentItemModel } from './CommentItem';
import { CommentsHeader, type CommentsFilterKey } from './CommentsHeader';

interface CommentsCurrentUser {
  displayName: string;
  handle: string;
  avatarUri?: string | null;
  avatarFallback?: string;
}

interface CommentsBottomSheetProps {
  visible: boolean;
  comments: SocialComment[];
  astraInsight?: string;
  currentUser: CommentsCurrentUser;
  creatorIds?: string[];
  creatorLabel?: string;
  highlightedCommentId?: string;
  likedCommentIds?: string[];
  onClose: () => void;
  onSendComment?: (body: string, replyToCommentId?: string | null) => void | Promise<void>;
  onLikeComment?: (commentId: string) => void;
  onOpenGift?: () => void;
}

export function CommentsBottomSheet({
  visible,
  comments,
  astraInsight,
  currentUser,
  creatorIds = [],
  creatorLabel = 'Creator',
  highlightedCommentId,
  likedCommentIds = [],
  onClose,
  onSendComment,
  onLikeComment,
  onOpenGift,
}: CommentsBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(460)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [isMounted, setIsMounted] = useState(visible);
  const [activeFilter, setActiveFilter] = useState<CommentsFilterKey>('top');
  const [draft, setDraft] = useState('');
  const [replyingTo, setReplyingTo] = useState<CommentItemModel | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const localLikedIds = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 6,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    if (isMounted) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 460,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => setIsMounted(false));
    }
  }, [backdropOpacity, isMounted, translateY, visible]);

  const closeWithAnimation = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 460,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsMounted(false);
      onClose();
    });
  }, [backdropOpacity, onClose, translateY]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dy) > 8 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 150 || gestureState.vy > 1.1) {
            closeWithAnimation();
            return;
          }

          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 5,
          }).start();
        },
      }),
    [closeWithAnimation, translateY],
  );

  const structuredComments = useMemo(() => {
    const byParent = new Map<string, SocialComment[]>();
    const topLevel: SocialComment[] = [];

    comments.forEach((comment) => {
      if (comment.replyToCommentId) {
        const current = byParent.get(comment.replyToCommentId) ?? [];
        byParent.set(comment.replyToCommentId, [...current, comment]);
        return;
      }

      topLevel.push(comment);
    });

    const creatorSet = new Set(creatorIds);
    const sortedTopLevel = sortComments(topLevel, activeFilter, creatorSet);

    return sortedTopLevel.map<CommentItemModel>((comment) => ({
      id: comment.id,
      authorName: comment.authorName,
      authorHandle: comment.authorHandle,
      body: comment.body,
      likes: comment.likes,
      createdAtLabel: formatCommentAge(comment.createdAt),
      isCreator: creatorSet.has(comment.authorId),
      isVerified: creatorSet.has(comment.authorId),
      replies: sortComments(byParent.get(comment.id) ?? [], 'recent', creatorSet).map((reply) => ({
        id: reply.id,
        authorName: reply.authorName,
        authorHandle: reply.authorHandle,
        body: reply.body,
        likes: reply.likes,
        createdAtLabel: formatCommentAge(reply.createdAt),
        isCreator: creatorSet.has(reply.authorId),
        isVerified: creatorSet.has(reply.authorId),
      })),
    }));
  }, [activeFilter, comments, creatorIds]);

  const highlightedComment = useMemo(() => {
    if (!structuredComments.length) {
      return null;
    }

    if (highlightedCommentId) {
      return structuredComments.find((comment) => comment.id === highlightedCommentId) ?? null;
    }

    return (
      structuredComments.find((comment) => comment.isCreator) ??
      [...structuredComments].sort((left, right) => right.likes - left.likes)[0] ??
      null
    );
  }, [highlightedCommentId, structuredComments]);

  const listComments = useMemo(
    () => structuredComments.filter((comment) => comment.id !== highlightedComment?.id),
    [highlightedComment?.id, structuredComments],
  );

  const renderComment = useCallback(
    ({ item }: ListRenderItemInfo<CommentItemModel>) => {
      const liked = likedCommentIds.includes(item.id) || Boolean(localLikedIds.current[item.id]);
      return (
        <CommentItem
          comment={item}
          liked={liked}
          repliesExpanded={Boolean(expandedReplies[item.id])}
          onLike={(commentId) => {
            if (onLikeComment) {
              onLikeComment(commentId);
              return;
            }
            localLikedIds.current[commentId] = !localLikedIds.current[commentId];
          }}
          onReply={(comment) => setReplyingTo(comment)}
          onToggleReplies={(commentId) =>
            setExpandedReplies((current) => ({ ...current, [commentId]: !current[commentId] }))
          }
        />
      );
    },
    [expandedReplies, likedCommentIds, onLikeComment],
  );

  const sendComment = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed || !onSendComment) {
      return;
    }

    await onSendComment(trimmed, replyingTo?.id ?? null);
    setDraft('');
    setReplyingTo(null);
  }, [draft, onSendComment, replyingTo?.id]);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal transparent animationType="none" visible={isMounted} onRequestClose={closeWithAnimation}>
      <KeyboardAvoidingView
        style={styles.modalWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeWithAnimation} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheetWrap,
            {
              transform: [{ translateY }],
              paddingBottom: Math.max(insets.bottom, 10),
            },
          ]}
          {...panResponder.panHandlers}
        >
          <BlurView intensity={28} tint="dark" style={styles.sheet}>
            <View style={styles.handle} />

            <CommentsHeader
              countLabel={formatCountLabel(comments.length)}
              activeFilter={activeFilter}
              onChangeFilter={setActiveFilter}
              onClose={closeWithAnimation}
            />
            <Text style={styles.demoNotice}>
              Comentarios demo/locales. No provienen de backend social real.
            </Text>

            {astraInsight ? <AstraCommentInsight text={astraInsight} /> : null}

            {highlightedComment ? (
              <View style={styles.highlightCard}>
                <View style={styles.highlightHeader}>
                  <Text style={styles.highlightLabel}>
                    {highlightedComment.isCreator ? `${creatorLabel} destacado` : 'Comentario destacado'}
                  </Text>
                  <Text style={styles.highlightTime}>{highlightedComment.createdAtLabel}</Text>
                </View>
                <Text style={styles.highlightAuthor}>
                  {highlightedComment.authorName}{' '}
                  <Text style={styles.highlightHandle}>{highlightedComment.authorHandle}</Text>
                </Text>
                <Text style={styles.highlightBody}>{highlightedComment.body}</Text>
              </View>
            ) : null}

            <FlatList
              data={listComments}
              keyExtractor={(item) => item.id}
              renderItem={renderComment}
              style={styles.list}
              contentContainerStyle={[
                styles.listContent,
                {
                  paddingBottom: 112 + Math.max(insets.bottom, 10),
                },
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              initialNumToRender={8}
              maxToRenderPerBatch={8}
              windowSize={8}
              ListEmptyComponent={<Text style={styles.emptyText}>Todavia no hay comentarios reales en este hilo.</Text>}
            />

            <CommentInputBar
              avatarUri={currentUser.avatarUri}
              avatarFallback={currentUser.avatarFallback ?? currentUser.displayName.slice(0, 1).toUpperCase()}
              value={draft}
              replyingToLabel={replyingTo ? replyingTo.authorName : null}
              onChangeText={setDraft}
              onCancelReply={() => setReplyingTo(null)}
              onGift={onOpenGift}
              onSend={() => {
                void sendComment();
              }}
            />
          </BlurView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function sortComments(
  comments: SocialComment[],
  filter: CommentsFilterKey,
  creatorIds: Set<string>,
) {
  const source =
    filter === 'creators'
      ? comments.filter((comment) => creatorIds.has(comment.authorId))
      : [...comments];

  if (filter === 'recent') {
    return source.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  return source.sort((left, right) => {
    if (right.likes !== left.likes) {
      return right.likes - left.likes;
    }

    return right.createdAt.localeCompare(left.createdAt);
  });
}

function formatCommentAge(createdAt: string) {
  const diff = Math.max(Date.now() - new Date(createdAt).getTime(), 0);
  const minutes = Math.floor(diff / 60000);

  if (minutes < 60) {
    return `${Math.max(minutes, 1)}m`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function formatCountLabel(count: number) {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }

  return `${count}`;
}

const styles = StyleSheet.create({
  modalWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,9,11,0.88)',
  },
  sheetWrap: {
    justifyContent: 'flex-end',
  },
  sheet: {
    minHeight: 360,
    maxHeight: '86%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    backgroundColor: 'rgba(20,21,24,0.72)',
    borderTopWidth: 1,
    borderColor: withOpacity('#FFFFFF', 0.10),
  },
  handle: {
    alignSelf: 'center',
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(161,161,170,0.28)',
    marginTop: 10,
    marginBottom: 12,
  },
  highlightCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: withOpacity('#00C853', 0.08),
    borderWidth: 1,
    borderColor: withOpacity('#3FE56C', 0.16),
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  highlightLabel: {
    color: '#7FFF93',
    fontFamily: FONT.bold,
    fontSize: 11,
    letterSpacing: 1,
  },
  highlightTime: {
    color: '#8F9692',
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  highlightAuthor: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 13,
  },
  highlightHandle: {
    color: '#A1A1AA',
    fontFamily: FONT.medium,
  },
  highlightBody: {
    marginTop: 6,
    color: '#DCE5D7',
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    flex: 1,
    marginTop: 10,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  demoNotice: {
    color: '#FFD76A',
    fontFamily: FONT.semibold,
    fontSize: 11,
    lineHeight: 16,
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  emptyText: {
    color: '#A1A1AA',
    fontFamily: FONT.medium,
    fontSize: 13,
    textAlign: 'center',
    paddingTop: 28,
  },
});

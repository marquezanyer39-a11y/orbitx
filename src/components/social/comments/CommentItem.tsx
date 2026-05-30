import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../../constants/theme';
import { CommentReply, type CommentReplyModel } from './CommentReply';

export interface CommentItemModel {
  id: string;
  authorName: string;
  authorHandle: string;
  body: string;
  likes: number;
  createdAtLabel: string;
  isCreator?: boolean;
  isVerified?: boolean;
  replies: CommentReplyModel[];
}

interface CommentItemProps {
  comment: CommentItemModel;
  liked: boolean;
  repliesExpanded: boolean;
  onLike: (id: string) => void;
  onReply: (comment: CommentItemModel) => void;
  onToggleReplies: (id: string) => void;
}

export const CommentItem = memo(function CommentItem({
  comment,
  liked,
  repliesExpanded,
  onLike,
  onReply,
  onToggleReplies,
}: CommentItemProps) {
  const replyCount = comment.replies.length;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{comment.authorName.slice(0, 1).toUpperCase()}</Text>
        </View>

        <View style={styles.copy}>
          <View style={styles.authorRow}>
            <Text style={styles.author}>
              {comment.authorName} <Text style={styles.handle}>{comment.authorHandle}</Text>
            </Text>
            {comment.isVerified ? (
              <Ionicons name="checkmark-circle" size={13} color="#3FE56C" />
            ) : null}
            {comment.isCreator ? <Text style={styles.creatorBadge}>CREATOR</Text> : null}
          </View>

          <Text style={styles.body}>{comment.body}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{comment.createdAtLabel}</Text>
            <Pressable onPress={() => onLike(comment.id)} style={({ pressed }) => [styles.metaAction, pressed && styles.pressed]}>
              <Text style={[styles.metaText, liked && styles.metaTextActive]}>♥ {comment.likes}</Text>
            </Pressable>
            <Pressable onPress={() => onReply(comment)} style={({ pressed }) => [styles.metaAction, pressed && styles.pressed]}>
              <Text style={styles.metaText}>Responder</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.metaAction, pressed && styles.pressed]}>
              <Ionicons name="ellipsis-horizontal" size={16} color="#8F9692" />
            </Pressable>
          </View>

          {replyCount ? (
            <Pressable onPress={() => onToggleReplies(comment.id)} style={({ pressed }) => [styles.replyToggle, pressed && styles.pressed]}>
              <Text style={styles.replyToggleText}>
                {repliesExpanded ? 'Ocultar respuestas' : `Ver ${replyCount} respuesta${replyCount > 1 ? 's' : ''}`}
              </Text>
            </Pressable>
          ) : null}

          {repliesExpanded
            ? comment.replies.map((reply) => (
                <CommentReply
                  key={reply.id}
                  reply={reply}
                  liked={false}
                  onLike={onLike}
                />
              ))
            : null}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#FAFAFA', 0.08),
    marginTop: 2,
  },
  avatarText: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  copy: {
    flex: 1,
    gap: 6,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  author: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 13,
  },
  handle: {
    color: '#8F9692',
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  creatorBadge: {
    color: '#7FFF93',
    fontFamily: FONT.bold,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  body: {
    color: '#DCE5D7',
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  metaText: {
    color: '#8F9692',
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  metaTextActive: {
    color: '#7FFF93',
  },
  metaAction: {
    minHeight: 22,
    justifyContent: 'center',
  },
  replyToggle: {
    alignSelf: 'flex-start',
    minHeight: 22,
    justifyContent: 'center',
  },
  replyToggleText: {
    color: '#A9B4AE',
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  pressed: {
    opacity: 0.82,
  },
});

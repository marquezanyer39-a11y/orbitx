import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../../constants/theme';

export interface CommentReplyModel {
  id: string;
  authorName: string;
  authorHandle: string;
  body: string;
  likes: number;
  createdAtLabel: string;
  isCreator?: boolean;
  isVerified?: boolean;
}

interface CommentReplyProps {
  reply: CommentReplyModel;
  liked: boolean;
  onLike: (id: string) => void;
}

export const CommentReply = memo(function CommentReply({
  reply,
  liked,
  onLike,
}: CommentReplyProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.connector} />
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{reply.authorName.slice(0, 1).toUpperCase()}</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.author}>
          {reply.authorName}{' '}
          <Text style={styles.handle}>{reply.authorHandle}</Text>
          {reply.isCreator ? <Text style={styles.creatorBadge}>  CREATOR</Text> : null}
        </Text>
        <Text style={styles.body}>{reply.body}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{reply.createdAtLabel}</Text>
          <Pressable onPress={() => onLike(reply.id)} style={({ pressed }) => [styles.metaAction, pressed && styles.pressed]}>
            <Text style={[styles.metaText, liked && styles.metaTextActive]}>♥ {reply.likes}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 8,
    paddingLeft: 18,
  },
  connector: {
    position: 'absolute',
    left: 9,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: withOpacity('#A1A1AA', 0.18),
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#FAFAFA', 0.08),
    marginTop: 1,
  },
  avatarText: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 10,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  author: {
    color: '#F1F5F3',
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  handle: {
    color: '#8F9692',
    fontFamily: FONT.medium,
    fontSize: 11,
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
    fontSize: 12,
    lineHeight: 17,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  metaText: {
    color: '#8F9692',
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  metaTextActive: {
    color: '#7FFF93',
  },
  metaAction: {
    minHeight: 18,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.82,
  },
});

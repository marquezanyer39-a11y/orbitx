import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../constants/theme';

export interface LiveChatMessage {
  id: string;
  author: string;
  handle: string;
  body: string;
  isPinned?: boolean;
}

interface LiveChatOverlayProps {
  messages: LiveChatMessage[];
  onOpenComments: () => void;
}

export function LiveChatOverlay({ messages, onOpenComments }: LiveChatOverlayProps) {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.headerRow}>
        <View style={styles.liveChatBadge}>
          <Ionicons name="chatbubble-ellipses-outline" size={14} color="#FAFAFA" />
          <Text style={styles.liveChatLabel}>Chat demo</Text>
        </View>

        <Pressable onPress={onOpenComments} style={({ pressed }) => [styles.expandButton, pressed && styles.pressed]}>
          <Text style={styles.expandLabel}>Ver todo</Text>
        </Pressable>
      </View>

      <View style={styles.stack}>
        {messages.map((message) => (
          <View key={message.id} style={[styles.messageRow, message.isPinned && styles.messagePinned]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{message.author.slice(0, 1).toUpperCase()}</Text>
            </View>
            <Text style={styles.messageText} numberOfLines={2}>
              <Text style={styles.author}>{message.author}</Text>
              <Text style={styles.handle}> {message.handle}</Text>
              <Text> {message.body}</Text>
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  liveChatBadge: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: withOpacity('#08090B', 0.32),
    borderWidth: 1,
    borderColor: withOpacity('#FAFAFA', 0.07),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveChatLabel: {
    color: '#FAFAFA',
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  expandButton: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#00C853', 0.12),
  },
  expandLabel: {
    color: '#B9FFD0',
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  stack: {
    gap: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 2,
    paddingRight: 12,
  },
  messagePinned: {
    backgroundColor: withOpacity('#00C853', 0.08),
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#FAFAFA', 0.10),
  },
  avatarText: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 11,
  },
  messageText: {
    flex: 1,
    color: '#F6F6F6',
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 18,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowRadius: 8,
  },
  author: {
    fontFamily: FONT.bold,
    color: '#FAFAFA',
  },
  handle: {
    fontFamily: FONT.medium,
    color: '#A1A1AA',
  },
  pressed: {
    opacity: 0.82,
  },
});

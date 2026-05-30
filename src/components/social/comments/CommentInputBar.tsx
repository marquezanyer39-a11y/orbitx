import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { FONT, withOpacity } from '../../../../constants/theme';

interface CommentInputBarProps {
  avatarUri?: string | null;
  avatarFallback: string;
  value: string;
  placeholder?: string;
  replyingToLabel?: string | null;
  onChangeText: (value: string) => void;
  onCancelReply: () => void;
  onGift?: () => void;
  onSend: () => void;
}

export const CommentInputBar = memo(function CommentInputBar({
  avatarUri,
  avatarFallback,
  value,
  placeholder = 'Escribe un comentario...',
  replyingToLabel,
  onChangeText,
  onCancelReply,
  onGift,
  onSend,
}: CommentInputBarProps) {
  return (
    <BlurView intensity={26} tint="dark" style={styles.wrap}>
      {replyingToLabel ? (
        <View style={styles.replyBanner}>
          <Text style={styles.replyBannerText}>Respondiendo a {replyingToLabel}</Text>
          <Pressable onPress={onCancelReply} hitSlop={8}>
            <Ionicons name="close" size={14} color="#A1A1AA" />
          </Pressable>
        </View>
      ) : null}

      <View style={styles.row}>
        <View style={styles.avatarWrap}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} resizeMode="cover" />
          ) : (
            <Text style={styles.avatarFallbackText}>{avatarFallback}</Text>
          )}
        </View>

        <View style={styles.inputShell}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#808582"
            style={styles.input}
            multiline
          />
        </View>

        <View style={styles.actions}>
          <Pressable style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
            <Ionicons name="happy-outline" size={20} color="#A1A1AA" />
          </Pressable>
          {onGift ? (
            <Pressable onPress={onGift} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
              <Ionicons name="gift-outline" size={20} color="#A1A1AA" />
            </Pressable>
          ) : null}
          <Pressable
            onPress={onSend}
            style={({ pressed }) => [styles.sendButton, !value.trim() && styles.sendButtonDisabled, pressed && styles.pressed]}
            disabled={!value.trim()}
          >
            <Ionicons name="send" size={18} color={value.trim() ? '#003912' : '#6D726F'} />
          </Pressable>
        </View>
      </View>
    </BlurView>
  );
});

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: 1,
    borderTopColor: withOpacity('#FFFFFF', 0.08),
    backgroundColor: 'rgba(20,21,24,0.72)',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 8,
  },
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  replyBannerText: {
    color: '#A1A1AA',
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  avatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#FAFAFA', 0.08),
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarFallbackText: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  inputShell: {
    flex: 1,
    minHeight: 46,
    maxHeight: 110,
    borderRadius: 23,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: withOpacity('#151E15', 0.92),
    borderWidth: 1,
    borderColor: withOpacity('#FFFFFF', 0.06),
    justifyContent: 'center',
  },
  input: {
    color: '#FAFAFA',
    fontFamily: FONT.medium,
    fontSize: 13,
    lineHeight: 18,
    padding: 0,
    textAlignVertical: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3FE56C',
  },
  sendButtonDisabled: {
    backgroundColor: withOpacity('#3FE56C', 0.2),
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },
});

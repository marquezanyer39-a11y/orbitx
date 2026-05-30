import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { FONT, withOpacity } from '../../../constants/theme';

interface LiveBottomBarProps {
  value: string;
  onChangeText: (value: string) => void;
  onGift: () => void;
  onShareTrade: () => void;
  onSend: () => void;
}

export function LiveBottomBar({
  value,
  onChangeText,
  onGift,
  onShareTrade,
  onSend,
}: LiveBottomBarProps) {
  return (
    <BlurView intensity={24} tint="dark" style={styles.wrap}>
      <View style={styles.inputShell}>
        <Ionicons name="chatbubble-ellipses-outline" size={16} color="#A1A1AA" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Escribe un mensaje..."
          placeholderTextColor="#7E8188"
          style={styles.input}
          returnKeyType="send"
          onSubmitEditing={onSend}
        />
      </View>

      <Pressable onPress={onGift} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
        <Ionicons name="gift-outline" size={18} color="#FAFAFA" />
      </Pressable>

      <Pressable onPress={onShareTrade} style={({ pressed }) => [styles.tradeButton, pressed && styles.pressed]}>
        <Ionicons name="trending-up-outline" size={18} color="#001B09" />
      </Pressable>

      <Pressable onPress={onSend} style={({ pressed }) => [styles.sendButton, pressed && styles.pressed]}>
        <Ionicons name="send" size={18} color="#001B09" />
      </Pressable>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 62,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: withOpacity('#08090B', 0.56),
    borderWidth: 1,
    borderColor: withOpacity('#FAFAFA', 0.08),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputShell: {
    flex: 1,
    minHeight: 42,
    borderRadius: 21,
    paddingHorizontal: 12,
    backgroundColor: withOpacity('#FFFFFF', 0.04),
    borderWidth: 1,
    borderColor: withOpacity('#FAFAFA', 0.06),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    color: '#FAFAFA',
    fontFamily: FONT.medium,
    fontSize: 13,
    paddingVertical: 0,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#FFFFFF', 0.05),
  },
  tradeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#00C853', 0.88),
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3FE56C',
    shadowColor: '#00C853',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },
});

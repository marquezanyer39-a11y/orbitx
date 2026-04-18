import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  onVoice: () => void;
  canSend: boolean;
}

export function AstraInputBar({
  value,
  placeholder,
  onChangeText,
  onSend,
  onVoice,
  canSend,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.wrap,
        {
          borderColor: withOpacity(colors.borderStrong, 0.54),
          backgroundColor: withOpacity(colors.surface, 0.98),
        },
      ]}
    >
      <Pressable
        onPress={onVoice}
        style={[
          styles.sideButton,
          {
            backgroundColor: withOpacity(colors.fieldBackground, 0.9),
            borderColor: withOpacity(colors.borderStrong, 0.48),
          },
        ]}
      >
        <Ionicons name="mic-outline" size={18} color={colors.textSoft} />
      </Pressable>

      <View
        style={[
          styles.inputShell,
          {
            backgroundColor: withOpacity(colors.fieldBackground, 0.84),
            borderColor: withOpacity(colors.borderStrong, 0.42),
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { color: colors.text }]}
          multiline
          maxLength={280}
        />
      </View>

      <Pressable
        onPress={onSend}
        style={[
          styles.sendButton,
          {
            backgroundColor: canSend ? withOpacity(colors.profit, 0.16) : withOpacity(colors.fieldBackground, 0.9),
            borderColor: canSend ? withOpacity(colors.profit, 0.34) : withOpacity(colors.borderStrong, 0.44),
            shadowColor: colors.profit,
          },
        ]}
      >
        <Ionicons name="arrow-up" size={18} color={canSend ? colors.profit : colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    borderWidth: 1,
    borderRadius: RADII.xl,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  sideButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputShell: {
    flex: 1,
    minHeight: 44,
    maxHeight: 108,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  input: {
    fontFamily: FONT.regular,
    fontSize: 15,
    lineHeight: 21,
    minHeight: 24,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});

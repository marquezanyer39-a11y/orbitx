import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { AstraAnimatedLogo } from './AstraAnimatedLogo';
import { AstraQuickChipItem, AstraQuickChips } from './AstraQuickChips';

export interface AstraChatMessageItem {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  chips?: AstraQuickChipItem[];
}

interface Props {
  message: AstraChatMessageItem;
  onPressChip: (chip: AstraQuickChipItem) => void;
}

export function AstraMessageBubble({ message, onPressChip }: Props) {
  const { colors } = useAppTheme();
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <View style={styles.userWrap}>
        <View
          style={[
            styles.userBubble,
            {
              backgroundColor: withOpacity(colors.surfaceElevated, 0.98),
              borderColor: withOpacity(colors.borderStrong, 0.56),
            },
          ]}
        >
          <Text style={[styles.userText, { color: colors.text }]}>{message.text}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.assistantWrap}>
      <View
        style={[
          styles.avatarShell,
          {
            backgroundColor: withOpacity(colors.surfaceElevated, 0.96),
            borderColor: withOpacity(colors.profit, 0.16),
          },
        ]}
      >
        <AstraAnimatedLogo size={16} emphasis="subtle" />
      </View>

      <View style={styles.assistantContent}>
        <View
          style={[
            styles.assistantBubble,
            {
              backgroundColor: withOpacity(colors.surfaceElevated, 0.98),
              borderColor: withOpacity(colors.borderStrong, 0.56),
            },
          ]}
        >
          <Text style={[styles.assistantText, { color: colors.textSoft }]}>{message.text}</Text>
        </View>
        {message.chips?.length ? (
          <AstraQuickChips chips={message.chips} onPress={onPressChip} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userWrap: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  userBubble: {
    maxWidth: '82%',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userText: {
    fontFamily: FONT.medium,
    fontSize: 14,
    lineHeight: 21,
  },
  assistantWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 18,
  },
  avatarShell: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  assistantContent: {
    flex: 1,
    gap: 10,
  },
  assistantBubble: {
    maxWidth: '92%',
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  assistantText: {
    fontFamily: FONT.regular,
    fontSize: 15,
    lineHeight: 23,
  },
});

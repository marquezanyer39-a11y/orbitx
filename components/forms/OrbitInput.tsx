import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';

import { FONT, RADII, SPACING } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';

interface OrbitInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoCorrect?: boolean;
  secureTextEntry?: boolean;
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
}

export function OrbitInput({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = false,
  secureTextEntry = false,
  autoComplete,
  textContentType,
}: OrbitInputProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: colors.textSoft }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        autoComplete={autoComplete}
        textContentType={textContentType}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        style={[
          styles.input,
          multiline && styles.multiline,
          {
            borderColor: colors.border,
            backgroundColor: colors.fieldBackground,
            color: colors.text,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: 13,
  },
  input: {
    minHeight: 52,
    borderRadius: RADII.md,
    borderWidth: 1,
    fontFamily: FONT.medium,
    fontSize: 15,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
});

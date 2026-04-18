import { StyleSheet, Text, TextInput, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  apiKey: string;
  secretKey: string;
  modeLabel: string;
  onApiKeyChange: (value: string) => void;
  onSecretKeyChange: (value: string) => void;
}

export function ApiKeysFormCard({
  apiKey,
  secretKey,
  modeLabel,
  onApiKeyChange,
  onSecretKeyChange,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: withOpacity(colors.surfaceElevated, 0.86),
          borderColor: withOpacity(colors.borderStrong, 0.18),
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Paso 4: Pega tus claves API</Text>

      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Clave API (API Key)</Text>
        <TextInput
          value={apiKey}
          onChangeText={onApiKeyChange}
          placeholder="API Key"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: withOpacity(colors.backgroundAlt, 0.9),
              borderColor: withOpacity(colors.borderStrong, 0.18),
            },
          ]}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
          Clave Secreta (Secret Key)
        </Text>
        <TextInput
          value={secretKey}
          onChangeText={onSecretKeyChange}
          placeholder="Secret Key"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: withOpacity(colors.backgroundAlt, 0.9),
              borderColor: withOpacity(colors.borderStrong, 0.18),
            },
          ]}
        />
      </View>

      <View
        style={[
          styles.modePill,
          {
            backgroundColor: withOpacity(colors.primary, 0.08),
            borderColor: withOpacity(colors.primary, 0.2),
          },
        ]}
      >
        <Text style={[styles.modePillLabel, { color: colors.textMuted }]}>Modo Activo</Text>
        <Text style={[styles.modePillValue, { color: colors.primary }]}>{modeLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 18,
    lineHeight: 22,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 15,
  },
  input: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontFamily: FONT.regular,
    fontSize: 14,
  },
  modePill: {
    alignSelf: 'flex-start',
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  modePillLabel: {
    fontFamily: FONT.medium,
    fontSize: 10,
    lineHeight: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  modePillValue: {
    fontFamily: FONT.semibold,
    fontSize: 13,
    lineHeight: 16,
  },
});

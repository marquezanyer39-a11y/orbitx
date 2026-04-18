import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { SectionHeader } from '../../components/common/SectionHeader';
import { useAuthStore } from '../../store/authStore';
import { useOrbitStore } from '../../../store/useOrbitStore';

export default function PrivacyScreen() {
  const { colors } = useAppTheme();
  const settings = useOrbitStore((state) => state.settings);
  const setPrivacyMode = useOrbitStore((state) => state.setPrivacyMode);
  const email = useAuthStore((state) => state.profile.email);

  const maskedEmail = email ? `${email.slice(0, 2)}••••${email.slice(email.indexOf('@'))}` : 'No disponible';

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <SectionHeader
        title="Privacidad"
        subtitle="Ajusta como OrbitX muestra tu informacion y el nivel de proteccion visual."
      />

      <View style={[styles.card, { backgroundColor: colors.fieldBackground, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Modo actual</Text>
        <Text style={[styles.body, { color: colors.textMuted }]}>
          {settings.privacyMode === 'strict'
            ? 'El modo estricto prioriza discrecion y minimiza informacion expuesta en pantalla.'
            : 'El modo estandar mantiene una vista equilibrada para uso diario.'}
        </Text>
        <PrimaryButton
          label={settings.privacyMode === 'strict' ? 'Usar modo estandar' : 'Usar modo estricto'}
          tone="secondary"
          onPress={() =>
            setPrivacyMode(settings.privacyMode === 'strict' ? 'standard' : 'strict')
          }
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.fieldBackground, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Vista de cuenta</Text>
        <Text style={[styles.body, { color: colors.textMuted }]}>
          Correo visible: {settings.privacyMode === 'strict' ? maskedEmail : email || 'No disponible'}
        </Text>
        <Text style={[styles.body, { color: colors.textMuted }]}>
          OrbitX no expone frase semilla ni claves privadas desde esta pantalla.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
  },
  card: {
    borderWidth: 1,
    borderRadius: RADII.lg,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  body: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
});

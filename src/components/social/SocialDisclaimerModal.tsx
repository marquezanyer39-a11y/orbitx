import { LinearGradient } from 'expo-linear-gradient';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useI18n } from '../../../hooks/useI18n';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface SocialDisclaimerModalProps {
  visible: boolean;
  onAccept: () => void;
  onClose?: () => void;
}

export function SocialDisclaimerModal({
  visible,
  onAccept,
  onClose,
}: SocialDisclaimerModalProps) {
  const { colors } = useAppTheme();
  const { t } = useI18n();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose ?? onAccept}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.cardShell,
            {
              backgroundColor: withOpacity(colors.surfaceElevated, 0.96),
              borderColor: withOpacity(colors.primary, 0.22),
            },
          ]}
        >
          <LinearGradient
            colors={[withOpacity(colors.primary, 0.2), 'transparent']}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={[styles.title, { color: colors.text }]}>{t('social.disclaimerTitle')}</Text>
          <Text style={[styles.body, { color: colors.textSoft }]}>{t('social.disclaimerBody')}</Text>
          <Pressable
            onPress={onAccept}
            style={[
              styles.button,
              {
                backgroundColor: colors.primary,
                borderColor: withOpacity(colors.primary, 0.68),
              },
            ]}
          >
            <Text style={styles.buttonLabel}>{t('social.disclaimerAccept')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.62)',
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardShell: {
    width: '100%',
    borderRadius: RADII.xl,
    borderWidth: 1,
    padding: 18,
    gap: 14,
    overflow: 'hidden',
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 20,
  },
  body: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  button: {
    minHeight: 48,
    borderRadius: RADII.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    color: '#0B0B0F',
    fontFamily: FONT.bold,
    fontSize: 14,
  },
});

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { copyToClipboard } from '../../utils/copyToClipboard';
import { FONT, RADII, SPACING, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { OrbitInput } from '../../../components/forms/OrbitInput';
import { PrimaryButton } from '../common/PrimaryButton';
import type { PendingTwoFactorSetup, TwoFactorProvider } from '../../types';

interface TwoFactorSetupSheetProps {
  visible: boolean;
  pendingSetup: PendingTwoFactorSetup | null;
  onClose: () => void;
  onStart: (provider: TwoFactorProvider) => Promise<boolean>;
  onConfirm: (code: string) => Promise<boolean>;
}

export function TwoFactorSetupSheet({
  visible,
  pendingSetup,
  onClose,
  onStart,
  onConfirm,
}: TwoFactorSetupSheetProps) {
  const { colors } = useAppTheme();
  const [loadingProvider, setLoadingProvider] = useState<TwoFactorProvider | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [code, setCode] = useState('');

  async function handleStart(provider: TwoFactorProvider) {
    setLoadingProvider(provider);
    await onStart(provider);
    setLoadingProvider(null);
  }

  async function handleConfirm() {
    setSubmitting(true);
    const ok = await onConfirm(code);
    if (ok) {
      setCode('');
      onClose();
    }
    setSubmitting(false);
  }

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: withOpacity(colors.background, 0.84) }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.backgroundAlt,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: withOpacity(colors.text, 0.16) }]} />

          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={[styles.eyebrow, { color: colors.textMuted }]}>Seguridad avanzada</Text>
              <Text style={[styles.title, { color: colors.text }]}>Autenticacion en dos factores</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Protege el acceso con codigos temporales desde tu app autenticadora.
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.fieldBackground }]}
            >
              <Ionicons name="close" size={18} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {!pendingSetup ? (
              <>
                <View
                  style={[
                    styles.infoCard,
                    {
                      backgroundColor: colors.fieldBackground,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.infoTitle, { color: colors.text }]}>Elige tu app</Text>
                  <Text style={[styles.infoBody, { color: colors.textMuted }]}>
                    Puedes usar Google Authenticator o Authy. OrbitX guardara la configuracion
                    localmente y quedara lista para la integracion de servidor.
                  </Text>
                </View>

                <PrimaryButton
                  label={loadingProvider === 'google_authenticator' ? 'Preparando...' : 'Google Authenticator'}
                  icon="logo-google"
                  tone="secondary"
                  disabled={Boolean(loadingProvider)}
                  onPress={() => void handleStart('google_authenticator')}
                />

                <PrimaryButton
                  label={loadingProvider === 'authy' ? 'Preparando...' : 'Authy'}
                  icon="shield-checkmark-outline"
                  tone="secondary"
                  disabled={Boolean(loadingProvider)}
                  onPress={() => void handleStart('authy')}
                />
              </>
            ) : (
              <>
                <View
                  style={[
                    styles.infoCard,
                    {
                      backgroundColor: colors.fieldBackground,
                      borderColor: withOpacity(colors.primary, 0.22),
                    },
                  ]}
                >
                  <Text style={[styles.infoTitle, { color: colors.text }]}>
                    Escanea este QR en {pendingSetup.provider === 'authy' ? 'Authy' : 'Google Authenticator'}
                  </Text>
                  <Text style={[styles.infoBody, { color: colors.textMuted }]}>
                    Luego escribe el codigo de 6 digitos para completar la activacion.
                  </Text>
                </View>

                <View
                  style={[
                    styles.qrCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: withOpacity(colors.primary, 0.24),
                    },
                  ]}
                >
                  <Image source={{ uri: pendingSetup.qrDataUrl }} style={styles.qrImage} />
                </View>

                <View
                  style={[
                    styles.manualKeyCard,
                    {
                      backgroundColor: colors.fieldBackground,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.manualLabel, { color: colors.textSoft }]}>Clave manual</Text>
                  <Text style={[styles.manualValue, { color: colors.text }]}>{pendingSetup.manualKey}</Text>
                  <PrimaryButton
                    label="Copiar clave"
                    tone="ghost"
                    icon="copy-outline"
                    onPress={() => void copyToClipboard(pendingSetup.manualKey)}
                  />
                </View>

                <OrbitInput
                  label="Codigo de verificacion"
                  value={code}
                  onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  keyboardType="numeric"
                />

                <PrimaryButton
                  label={submitting ? 'Verificando...' : 'Activar 2FA'}
                  disabled={submitting || code.length < 6}
                  onPress={() => void handleConfirm()}
                />
              </>
            )}

            <PrimaryButton label="Cerrar" tone="ghost" onPress={onClose} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    gap: 14,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: RADII.pill,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    fontFamily: FONT.medium,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 20,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: 12,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    gap: 6,
  },
  infoTitle: {
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  infoBody: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  qrCard: {
    borderWidth: 1,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrImage: {
    width: 220,
    height: 220,
    borderRadius: 20,
  },
  manualKeyCard: {
    borderWidth: 1,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    gap: 8,
  },
  manualLabel: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  manualValue: {
    fontFamily: FONT.semibold,
    fontSize: 16,
    letterSpacing: 1.2,
  },
});

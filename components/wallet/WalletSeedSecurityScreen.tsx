import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  AppState,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { FONT, RADII, SPACING, withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { revealSecureSeedPhrase } from '../../src/services/wallet/secureWalletStorage';
import { markWalletSeedConfirmed } from '../../utils/wallet';
import { unlockOrbitXWithBiometrics } from '../../utils/biometrics';
import { verifyWalletPin } from '../../utils/walletSecurity';
import { PrimaryButton } from '../common/PrimaryButton';
import { OrbitInput } from '../forms/OrbitInput';

type WalletSeedSecurityMode = 'reveal' | 'export' | 'backup';
type SecurityPhase = 'warning' | 'pin' | 'revealed' | 'confirm_backup' | 'completed' | 'blocked';

interface WalletSeedSecurityScreenProps {
  visible: boolean;
  mode: WalletSeedSecurityMode;
  biometricsEnabled: boolean;
  pinEnabled: boolean;
  onClose: () => void;
  onRequirePinSetup?: () => void;
  onConfirmed?: () => void;
}

export function WalletSeedSecurityScreen({
  visible,
  mode,
  biometricsEnabled,
  pinEnabled,
  onClose,
  onRequirePinSetup,
  onConfirmed,
}: WalletSeedSecurityScreenProps) {
  const { colors } = useAppTheme();
  const [phase, setPhase] = useState<SecurityPhase>('warning');
  const [pin, setPin] = useState('');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [challengeWords, setChallengeWords] = useState<Record<number, string>>({});
  const [errorText, setErrorText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) {
      setPhase('warning');
      setPin('');
      setSeedPhrase('');
      setChallengeWords({});
      setErrorText('');
      setLoading(false);
      return;
    }

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background') {
        onClose();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [onClose, visible]);

  const seedWords = useMemo(
    () => seedPhrase.split(' ').map((word) => word.trim()).filter(Boolean),
    [seedPhrase],
  );
  const challengeIndexes = [2, 6, 9];
  const headingTitle =
    mode === 'export'
      ? 'Exportar respaldo'
      : mode === 'backup'
        ? 'Respaldar frase semilla'
        : 'Ver frase semilla';
  const revealButtonLabel =
    mode === 'export'
      ? 'Continuar con la exportacion'
      : mode === 'backup'
        ? 'Desbloquear para respaldar'
        : 'Continuar';

  async function revealSeedPhrase() {
    const mnemonic = await revealSecureSeedPhrase();
    setSeedPhrase(mnemonic);
    setPhase(mode === 'backup' ? 'confirm_backup' : 'revealed');
  }

  async function handleContinue() {
    setLoading(true);
    setErrorText('');

    try {
      if (biometricsEnabled) {
        const biometricResult = await unlockOrbitXWithBiometrics();
        if (!biometricResult.ok) {
          setErrorText(biometricResult.message);
          return;
        }
      }

      if (pinEnabled) {
        setPhase('pin');
        return;
      }

      if (biometricsEnabled) {
        await revealSeedPhrase();
        return;
      }

      setPhase('blocked');
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : 'No se pudo continuar con esta accion.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleValidatePin() {
    setLoading(true);
    setErrorText('');

    try {
      const validPin = await verifyWalletPin(pin.trim());

      if (!validPin) {
        setErrorText('El PIN no coincide.');
        return;
      }

      await revealSeedPhrase();
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : 'No se pudo verificar el PIN.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleExportSeed() {
    if (!seedPhrase) {
      return;
    }

    await Share.share({
      title: 'Respaldo de billetera OrbitX',
      message: seedPhrase,
    });
    onClose();
  }

  async function handleConfirmBackup() {
    const invalidIndex = challengeIndexes.find((index) => {
      const expected = seedWords[index];
      const provided = challengeWords[index]?.trim().toLowerCase();
      return !expected || provided !== expected.toLowerCase();
    });

    if (typeof invalidIndex === 'number') {
      setErrorText(`La palabra ${invalidIndex + 1} no coincide. Revisa tu respaldo.`);
      return;
    }

    setLoading(true);
    setErrorText('');

    try {
      await markWalletSeedConfirmed();
      onConfirmed?.();
      setPhase('completed');
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : 'No se pudo confirmar el respaldo.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.header,
            {
              borderBottomColor: withOpacity(colors.border, 0.72),
            },
          ]}
        >
          <View style={styles.headerCopy}>
            <Text style={[styles.eyebrow, { color: colors.textMuted }]}>Seguridad</Text>
            <Text style={[styles.title, { color: colors.text }]}>{headingTitle}</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Acceso protegido para acciones sensibles de tu billetera Web3.
            </Text>
          </View>

          <Pressable
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: colors.fieldBackground }]}
          >
            <Ionicons name="close" size={18} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {phase === 'warning' ? (
            <>
              <View
                style={[
                  styles.warningCard,
                  {
                    backgroundColor: withOpacity(colors.warning, 0.08),
                    borderColor: withOpacity(colors.warning, 0.24),
                  },
                ]}
              >
                <View
                  style={[
                    styles.warningIcon,
                    { backgroundColor: withOpacity(colors.warning, 0.14) },
                  ]}
                >
                  <Ionicons name="shield-outline" size={18} color={colors.warning} />
                </View>

                <View style={styles.warningCopy}>
                  <Text style={[styles.warningTitle, { color: colors.text }]}>
                    Verifica que estas en un lugar privado
                  </Text>
                  <Text style={[styles.warningBody, { color: colors.textMuted }]}>
                    Tu frase semilla controla el acceso total a tu billetera. No la compartas, no
                    la pegues en chats y evita capturas de pantalla.
                  </Text>
                </View>
              </View>

              <View style={styles.points}>
                {[
                  'OrbitX nunca la deja visible por defecto.',
                  'Necesitas reautenticacion antes de verla o exportarla.',
                  'La vista se cierra automaticamente al salir de esta pantalla.',
                ].map((item) => (
                  <View key={item} style={styles.pointRow}>
                    <View
                      style={[
                        styles.pointDot,
                        { backgroundColor: withOpacity(colors.primary, 0.24) },
                      ]}
                    />
                    <Text style={[styles.pointText, { color: colors.textSoft }]}>{item}</Text>
                  </View>
                ))}
              </View>

              {errorText ? (
                <Text style={[styles.errorText, { color: colors.loss }]}>{errorText}</Text>
              ) : null}

              <PrimaryButton
                label={loading ? 'Verificando...' : revealButtonLabel}
                disabled={loading}
                onPress={() => void handleContinue()}
              />
              <PrimaryButton label="Cancelar" variant="ghost" onPress={onClose} />
            </>
          ) : null}

          {phase === 'pin' ? (
            <>
              <View
                style={[
                  styles.helperCard,
                  {
                    backgroundColor: colors.fieldBackground,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.warningTitle, { color: colors.text }]}>Confirma tu PIN</Text>
                <Text style={[styles.warningBody, { color: colors.textMuted }]}>
                  Usa tu PIN de seguridad para continuar con esta accion.
                </Text>
              </View>

              <OrbitInput
                label="PIN"
                value={pin}
                onChangeText={(value) => {
                  setErrorText('');
                  setPin(value.replace(/\D/g, '').slice(0, 6));
                }}
                placeholder="Ingresa tu PIN"
                keyboardType="numeric"
                secureTextEntry
              />

              {errorText ? (
                <Text style={[styles.errorText, { color: colors.loss }]}>{errorText}</Text>
              ) : null}

              <PrimaryButton
                label={loading ? 'Verificando...' : 'Verificar PIN'}
                disabled={loading}
                onPress={() => void handleValidatePin()}
              />
              <PrimaryButton
                label="Cancelar"
                variant="ghost"
                onPress={onClose}
              />
            </>
          ) : null}

          {phase === 'blocked' ? (
            <>
              <View
                style={[
                  styles.helperCard,
                  {
                    backgroundColor: colors.fieldBackground,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.warningTitle, { color: colors.text }]}>
                  Configura una capa de seguridad primero
                </Text>
                <Text style={[styles.warningBody, { color: colors.textMuted }]}>
                  Para ver o exportar tu frase semilla necesitas un PIN y, si quieres, biometria.
                </Text>
              </View>

              <PrimaryButton label="Configurar PIN" onPress={onRequirePinSetup} />
              <PrimaryButton label="Volver" variant="ghost" onPress={onClose} />
            </>
          ) : null}

          {phase === 'revealed' ? (
            <>
              <View
                style={[
                  styles.helperCard,
                  {
                    backgroundColor: colors.fieldBackground,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.warningTitle, { color: colors.text }]}>
                  Frase semilla desbloqueada
                </Text>
                <Text style={[styles.warningBody, { color: colors.textMuted }]}>
                  Guardala fuera de linea. Cierra esta vista en cuanto termines.
                </Text>
              </View>

              <View style={styles.seedGrid}>
                {seedWords.map((word, index) => (
                  <View
                    key={`${word}-${index}`}
                    style={[
                      styles.seedWord,
                      {
                        backgroundColor: colors.fieldBackground,
                        borderColor: withOpacity(colors.border, 0.86),
                      },
                    ]}
                  >
                    <Text style={[styles.seedIndex, { color: colors.textMuted }]}>
                      {index + 1}
                    </Text>
                    <Text style={[styles.seedLabel, { color: colors.text }]}>{word}</Text>
                  </View>
                ))}
              </View>

              {mode === 'export' ? (
                <PrimaryButton label="Exportar ahora" onPress={() => void handleExportSeed()} />
              ) : null}

              <PrimaryButton label="Ocultar y cerrar" variant="ghost" onPress={onClose} />
            </>
          ) : null}

          {phase === 'confirm_backup' ? (
            <>
              <View
                style={[
                  styles.helperCard,
                  {
                    backgroundColor: colors.fieldBackground,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.warningTitle, { color: colors.text }]}>
                  Confirma tu respaldo
                </Text>
                <Text style={[styles.warningBody, { color: colors.textMuted }]}>
                  Verifica algunas palabras para confirmar que guardaste tu frase de forma segura.
                </Text>
              </View>

              <View style={styles.seedGrid}>
                {seedWords.map((word, index) => (
                  <View
                    key={`${word}-${index}`}
                    style={[
                      styles.seedWord,
                      {
                        backgroundColor: colors.fieldBackground,
                        borderColor: withOpacity(colors.border, 0.86),
                      },
                    ]}
                  >
                    <Text style={[styles.seedIndex, { color: colors.textMuted }]}>
                      {index + 1}
                    </Text>
                    <Text style={[styles.seedLabel, { color: colors.text }]}>{word}</Text>
                  </View>
                ))}
              </View>

              {challengeIndexes.map((index) => (
                <OrbitInput
                  key={index}
                  label={`Palabra ${index + 1}`}
                  value={challengeWords[index] ?? ''}
                  onChangeText={(value) => {
                    setErrorText('');
                    setChallengeWords((current) => ({
                      ...current,
                      [index]: value.trim().toLowerCase(),
                    }));
                  }}
                  placeholder={`Escribe la palabra ${index + 1}`}
                  autoCapitalize="none"
                />
              ))}

              {errorText ? (
                <Text style={[styles.errorText, { color: colors.loss }]}>{errorText}</Text>
              ) : null}

              <PrimaryButton
                label={loading ? 'Confirmando...' : 'Confirmar respaldo'}
                disabled={loading}
                onPress={() => void handleConfirmBackup()}
              />
              <PrimaryButton label="Cancelar" variant="ghost" onPress={onClose} />
            </>
          ) : null}

          {phase === 'completed' ? (
            <>
              <View
                style={[
                  styles.helperCard,
                  {
                    backgroundColor: colors.fieldBackground,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.warningTitle, { color: colors.text }]}>
                  Respaldo confirmado
                </Text>
                <Text style={[styles.warningBody, { color: colors.textMuted }]}>
                  Tu frase semilla quedo marcada como respaldada. Guardala siempre fuera de linea.
                </Text>
              </View>

              <PrimaryButton label="Cerrar" onPress={onClose} />
            </>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    fontFamily: FONT.medium,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 24,
    lineHeight: 28,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  warningCard: {
    borderWidth: 1,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  warningIcon: {
    width: 36,
    height: 36,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningCopy: {
    flex: 1,
    gap: 4,
  },
  warningTitle: {
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  warningBody: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  helperCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: SPACING.md,
    gap: 4,
  },
  points: {
    gap: 10,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  pointDot: {
    width: 8,
    height: 8,
    borderRadius: RADII.pill,
    marginTop: 6,
  },
  pointText: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  seedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  seedWord: {
    width: '47%',
    borderRadius: RADII.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  seedIndex: {
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  seedLabel: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  errorText: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
});

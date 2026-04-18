import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { FONT, RADII, SPACING, withOpacity } from '../../constants/theme';
import { ORBIT_CHAIN_CONFIG } from '../../constants/networks';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useOrbitStore } from '../../store/useOrbitStore';
import { useUiStore } from '../../src/store/uiStore';
import {
  createWalletBundle,
  getStoredWalletBundle,
  getWalletSecurityState,
  importWalletBundle,
  markWalletSeedConfirmed,
  markWalletSeedRevealed,
  maskAddress,
} from '../../utils/wallet';
import { PrimaryButton } from '../common/PrimaryButton';
import { OrbitInput } from '../forms/OrbitInput';

interface WalletSetupFlowProps {
  visible: boolean;
  onClose: () => void;
  onComplete?: () => void;
  mode?: 'create' | 'seed' | 'import';
}

type SetupStep = 'intro' | 'import' | 'seed' | 'confirm' | 'ready' | 'protected';

const ACTIVE_NETWORKS = [
  { label: 'Ethereum', note: 'Activa hoy', key: 'ethereum' as const },
  { label: 'Base', note: 'Activa hoy', key: 'base' as const },
  { label: 'BNB Chain', note: 'Activa hoy', key: 'bnb' as const },
  { label: 'Solana', note: 'Activa hoy', key: 'solana' as const },
] as const;

const PREPARED_NETWORKS = ORBIT_CHAIN_CONFIG
  .filter((network) => network.phase !== 'active')
  .map((network) =>
    network.phase === 'asset_only'
      ? `${network.label} (${network.shortLabel}) - solo asset`
      : `${network.label} (${network.shortLabel}) - en preparación`,
  );

export function WalletSetupFlow({
  visible,
  onClose,
  onComplete,
  mode = 'create',
}: WalletSetupFlowProps) {
  const { colors } = useAppTheme();
  const initializeWalletBeta = useOrbitStore((state) => state.initializeWalletBeta);
  const showToast = useUiStore((state) => state.showToast);
  const [step, setStep] = useState<SetupStep>('intro');
  const [loading, setLoading] = useState(false);
  const [copyingSeed, setCopyingSeed] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState('');
  const [importPhrase, setImportPhrase] = useState('');
  const [addresses, setAddresses] = useState<{
    ethereum: string;
    base: string;
    bnb: string;
    solana: string;
  } | null>(null);
  const [confirmation, setConfirmation] = useState(['', '', '']);
  const [errorText, setErrorText] = useState('');
  const [seedProtected, setSeedProtected] = useState(false);

  const viewSeedOnly = mode === 'seed';
  const importMode = mode === 'import';
  const progressSteps = importMode ? ['import', 'ready'] : ['intro', 'seed', 'confirm', 'ready'];
  const progressItems = useMemo(
    () =>
      importMode
        ? [
            { key: 'import', label: 'Importar' },
            { key: 'ready', label: 'Lista' },
          ]
        : viewSeedOnly
          ? [{ key: 'seed', label: 'Frase' }]
          : [
              { key: 'intro', label: 'Inicio' },
              { key: 'seed', label: 'Respaldo' },
              { key: 'confirm', label: 'Confirmar' },
              { key: 'ready', label: 'Lista' },
            ],
    [importMode, viewSeedOnly],
  );
  const currentProgressKey =
    step === 'protected'
      ? viewSeedOnly
        ? 'seed'
        : 'ready'
      : step;
  const currentProgressIndex = Math.max(
    progressItems.findIndex((item) => item.key === currentProgressKey),
    0,
  );
  const stepEyebrow = viewSeedOnly
    ? 'Billetera Web3'
    : importMode
      ? 'Importar billetera'
      : 'Billetera OrbitX';
  const stepTitle =
    step === 'seed'
      ? 'Respalda tu frase semilla'
      : step === 'confirm'
        ? 'Confirma tu respaldo'
        : step === 'ready'
          ? 'Billetera lista'
          : step === 'protected'
            ? 'Frase semilla protegida'
            : importMode
              ? 'Importa una billetera existente'
              : 'Crea tu billetera principal';
  const stepSubtitle =
    step === 'seed'
      ? 'Guardala fuera de linea. Luego quedara oculta y solo podras verla desde Seguridad con reautenticacion.'
      : step === 'confirm'
        ? 'Verifica tu respaldo antes de activar la billetera.'
        : step === 'ready'
          ? 'Direcciones y redes listas para usar dentro de OrbitX.'
          : step === 'protected'
            ? 'La frase ya se mostro y ahora queda protegida dentro de Seguridad.'
            : importMode
              ? 'Recupera tu acceso con una frase semilla valida de 12 palabras.'
              : 'Crea tu billetera OrbitX para recibir, enviar y firmar desde la app.';

  useEffect(() => {
    if (!visible) {
      setStep('intro');
      setLoading(false);
      setCopyingSeed(false);
      setSeedPhrase('');
      setImportPhrase('');
      setAddresses(null);
      setConfirmation(['', '', '']);
      setErrorText('');
      setSeedProtected(false);
      return;
    }

    if (mode === 'import') {
      setStep('import');
      setLoading(false);
      setErrorText('');
      return;
    }

    if (mode === 'seed') {
      let mounted = true;

      const loadBundle = async () => {
        try {
          setLoading(true);
          setErrorText('');
          const [bundle, security] = await Promise.all([
            getStoredWalletBundle(),
            getWalletSecurityState(),
          ]);

          if (!mounted) {
            return;
          }

          if (!bundle) {
            setErrorText('Primero crea o importa tu billetera OrbitX.');
            setStep('protected');
            return;
          }

          setAddresses(bundle.receiveAddresses);
          setSeedProtected(Boolean(security.revealedAt || security.confirmedAt));

          if (security.revealedAt || security.confirmedAt) {
            setStep('protected');
            return;
          }

          setSeedPhrase(bundle.mnemonic);
          setStep('seed');
        } catch (error) {
          if (!mounted) {
            return;
          }
          setErrorText(error instanceof Error ? error.message : 'No se pudo abrir la frase semilla.');
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

      void loadBundle();

      return () => {
        mounted = false;
      };
    }
  }, [mode, visible]);

  const seedWords = useMemo(
    () => seedPhrase.split(' ').map((word) => word.trim()).filter(Boolean),
    [seedPhrase],
  );

  const confirmationIndexes = useMemo(() => {
    if (!seedWords.length) {
      return [0, 4, 8];
    }

    return [0, Math.min(4, seedWords.length - 1), Math.min(8, seedWords.length - 1)];
  }, [seedWords]);

  async function handleGenerate() {
    try {
      setLoading(true);
      setErrorText('');
      setConfirmation(['', '', '']);
      const bundle = await createWalletBundle();
      setAddresses(bundle.receiveAddresses);

      if (bundle.security.revealedAt || bundle.security.confirmedAt) {
        setSeedProtected(true);
        setStep('protected');
        return;
      }

      await markWalletSeedRevealed();
      setSeedPhrase(bundle.mnemonic);
      setSeedProtected(false);
      setStep('seed');
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'No se pudo generar tu billetera.');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmSeed() {
    if (seedWords.length < 12) {
      setErrorText('La frase semilla no esta lista todavia. Genera una nueva antes de continuar.');
      return;
    }

    const valid = confirmation.every((value, index) => {
      const expectedWord = seedWords[confirmationIndexes[index]] ?? '';
      return value.trim().toLowerCase() === expectedWord.toLowerCase();
    });

    if (!valid) {
      setErrorText('Las palabras no coinciden. Revisa la frase y vuelve a intentarlo.');
      return;
    }

    setLoading(true);
    setErrorText('');

    try {
      await markWalletSeedConfirmed();
      const result = await initializeWalletBeta();

      if (!result.ok) {
        setErrorText(result.message);
        return;
      }

      setSeedProtected(true);
      setStep('ready');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopySeedPhrase() {
    if (!seedPhrase || seedWords.length < 12) {
      setErrorText('Todavia no hay una frase semilla valida para copiar.');
      return;
    }

    try {
      setCopyingSeed(true);
      await Clipboard.setStringAsync(seedPhrase);
      showToast('Frase semilla copiada. Guardala en un lugar privado y seguro.', 'success');
    } catch (error) {
      setErrorText(
        error instanceof Error
          ? error.message
          : 'No se pudo copiar la frase semilla en este momento.',
      );
    } finally {
      setCopyingSeed(false);
    }
  }

  async function handleImportWallet() {
    const normalizedPhrase = importPhrase.trim().toLowerCase().replace(/\s+/g, ' ');

    if (!normalizedPhrase) {
      setErrorText('Pega una frase semilla valida para continuar.');
      return;
    }

    if (normalizedPhrase.split(' ').filter(Boolean).length < 12) {
      setErrorText('La frase semilla debe incluir al menos 12 palabras validas.');
      return;
    }

    setLoading(true);
    setErrorText('');

    try {
      const bundle = await importWalletBundle(normalizedPhrase);
      const result = await initializeWalletBeta();

      if (!result.ok) {
        setErrorText(result.message);
        return;
      }

      setAddresses(bundle.receiveAddresses);
      setSeedProtected(true);
      setStep('ready');
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'No se pudo importar la billetera.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.overlay, { backgroundColor: withOpacity(colors.background, 0.82) }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.grabber,
              { backgroundColor: withOpacity(colors.textMuted, 0.22) },
            ]}
          />

          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={[styles.eyebrow, { color: colors.textMuted }]}>{stepEyebrow}</Text>
              <Text style={[styles.title, { color: colors.text }]}>{stepTitle}</Text>
              <Text style={[styles.headerBody, { color: colors.textMuted }]}>{stepSubtitle}</Text>
            </View>
            <Pressable
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.fieldBackground }]}
            >
              <Ionicons name="close" size={18} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.progressShell}>
            <Text style={[styles.progressMeta, { color: colors.textMuted }]}>
              Paso {currentProgressIndex + 1} de {progressItems.length}
            </Text>

            <View style={styles.progressRow}>
              {progressItems.map((item, index) => {
                const active = currentProgressIndex >= index;
                const current = currentProgressIndex === index;

                return (
                  <View key={item.key} style={styles.progressItem}>
                    <View
                      style={[
                        styles.progressBadge,
                        {
                          backgroundColor: active
                            ? withOpacity(colors.primary, 0.14)
                            : withOpacity(colors.text, 0.08),
                          borderColor: current
                            ? colors.primary
                            : active
                              ? withOpacity(colors.primary, 0.24)
                              : withOpacity(colors.border, 0.9),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.progressBadgeLabel,
                          { color: active ? colors.text : colors.textMuted },
                        ]}
                      >
                        {index + 1}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.progressItemLabel,
                        { color: active ? colors.text : colors.textMuted },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {step === 'intro' ? (
              <View style={styles.block}>
                <View
                  style={[
                    styles.heroIcon,
                    {
                      backgroundColor: withOpacity(colors.primary, 0.12),
                      borderColor: withOpacity(colors.primary, 0.2),
                    },
                  ]}
                >
                  <Ionicons name="shield-checkmark-outline" size={24} color={colors.text} />
                </View>

                <View style={styles.copyBlock}>
                  <Text style={[styles.blockTitle, { color: colors.text }]}>
                    Empieza con tu propia billetera
                  </Text>
                  <Text style={[styles.blockBody, { color: colors.textMuted }]}>
                    OrbitX crea tu billetera, protege la frase semilla desde el inicio y la deja lista para usar.
                  </Text>
                </View>

                <View style={styles.points}>
                  {[
                    'Se crea dentro de OrbitX, sin salir de la app.',
                    'La frase semilla queda protegida y solo podras verla desde Seguridad con reautenticacion.',
                    'Queda lista para recibir en Ethereum, Base, BNB Chain y Solana.',
                  ].map((item) => (
                    <View key={item} style={styles.pointRow}>
                      <View
                        style={[
                          styles.pointDot,
                          { backgroundColor: withOpacity(colors.primary, 0.5) },
                        ]}
                      />
                      <Text style={[styles.pointText, { color: colors.textSoft }]}>{item}</Text>
                    </View>
                  ))}
                </View>

                <PrimaryButton
                  label={loading ? 'Generando...' : 'Crear billetera'}
                  onPress={() => void handleGenerate()}
                />
                {errorText ? (
                  <Text style={[styles.errorText, { color: colors.loss }]}>{errorText}</Text>
                ) : null}
              </View>
            ) : null}

            {step === 'import' ? (
              <View style={styles.block}>
                <View style={styles.copyBlock}>
                  <Text style={[styles.blockTitle, { color: colors.text }]}>
                    Importa tu billetera
                  </Text>
                  <Text style={[styles.blockBody, { color: colors.textMuted }]}>
                    Pega tu frase de 12 palabras para recuperar tu billetera dentro de OrbitX.
                  </Text>
                </View>

                <OrbitInput
                  label="Frase semilla"
                  value={importPhrase}
                  onChangeText={(value) => {
                    setErrorText('');
                    setImportPhrase(value);
                  }}
                  placeholder="palabra1 palabra2 palabra3 ..."
                  autoCapitalize="none"
                  multiline
                />

                <View
                  style={[
                    styles.noteCard,
                    {
                      backgroundColor: withOpacity(colors.primary, 0.06),
                      borderColor: withOpacity(colors.primary, 0.14),
                    },
                  ]}
                >
                  <Text style={[styles.noteText, { color: colors.textSoft }]}>
                    Usa una frase valida de 12 palabras. OrbitX derivara tus direcciones reales y dejara la billetera lista para usar.
                  </Text>
                </View>

                {errorText ? (
                  <Text style={[styles.errorText, { color: colors.loss }]}>{errorText}</Text>
                ) : null}

                <PrimaryButton
                  label={loading ? 'Importando...' : 'Importar billetera'}
                  onPress={() => void handleImportWallet()}
                />
              </View>
            ) : null}

            {step === 'seed' ? (
              <View style={styles.block}>
                <View style={styles.copyBlock}>
                  <Text style={[styles.blockTitle, { color: colors.text }]}>
                    Respalda tu frase semilla
                  </Text>
                  <Text style={[styles.blockBody, { color: colors.textMuted }]}>
                    Guardala fuera de la app y no la compartas con nadie.
                  </Text>
                </View>

                <View
                  style={[
                    styles.seedGrid,
                    {
                      backgroundColor: colors.fieldBackground,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  {seedWords.map((word, index) => (
                    <View
                      key={`${word}-${index}`}
                      style={[
                        styles.seedChip,
                        {
                          backgroundColor: withOpacity(colors.primary, 0.08),
                          borderColor: withOpacity(colors.primary, 0.16),
                        },
                      ]}
                    >
                      <Text style={[styles.seedIndex, { color: colors.textMuted }]}>
                        {index + 1}
                      </Text>
                      <Text style={[styles.seedWord, { color: colors.text }]}>{word}</Text>
                    </View>
                  ))}
                </View>

                <View
                  style={[
                    styles.noteCard,
                    {
                      backgroundColor: withOpacity(colors.warning, 0.08),
                      borderColor: withOpacity(colors.warning, 0.18),
                    },
                  ]}
                >
                  <Text style={[styles.noteText, { color: colors.textSoft }]}>
                    Redes activas hoy: Ethereum, Base, BNB Chain y Solana. TRON queda preparado y Bitcoin se muestra solo como activo.
                  </Text>
                </View>

                <View style={styles.actionStack}>
                  <PrimaryButton
                    label={copyingSeed ? 'Copiando...' : 'Copiar frase'}
                    variant="secondary"
                    disabled={copyingSeed}
                    onPress={() => void handleCopySeedPhrase()}
                  />

                  <PrimaryButton
                    label={viewSeedOnly ? 'Cerrar' : 'Ya la guarde'}
                    onPress={() => {
                      if (viewSeedOnly) {
                        onClose();
                        return;
                      }

                      setStep('confirm');
                    }}
                  />
                </View>
              </View>
            ) : null}

            {step === 'protected' ? (
              <View style={styles.block}>
                <View
                  style={[
                    styles.heroIcon,
                    {
                      backgroundColor: withOpacity(colors.warning, 0.12),
                      borderColor: withOpacity(colors.warning, 0.18),
                    },
                  ]}
                >
                  <Ionicons name="lock-closed-outline" size={22} color={colors.warning} />
                </View>

                <View style={styles.copyBlock}>
                  <Text style={[styles.blockTitle, { color: colors.text }]}>
                    Frase semilla protegida
                  </Text>
                  <Text style={[styles.blockBody, { color: colors.textMuted }]}>
                    {seedProtected
                      ? 'La frase ya no queda visible aqui. Si vuelves a necesitarla, entra a Seguridad y verifica tu identidad antes de verla.'
                      : 'Todavia no hay una frase semilla disponible para mostrar.'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.noteCard,
                    {
                      backgroundColor: withOpacity(colors.primary, 0.06),
                      borderColor: withOpacity(colors.primary, 0.14),
                    },
                  ]}
                >
                  <Text style={[styles.noteText, { color: colors.textSoft }]}>
                    OrbitX mantiene la billetera activa, pero no vuelve a exponer las 12 palabras desde este flujo.
                  </Text>
                </View>

                {addresses ? (
                  <View
                    style={[
                      styles.preparedCard,
                      {
                        backgroundColor: colors.fieldBackground,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.preparedTitle, { color: colors.text }]}>
                      Direccion principal
                    </Text>
                    <Text style={[styles.preparedBody, { color: colors.textMuted }]}>
                      {maskAddress(addresses.base || addresses.ethereum || addresses.bnb || addresses.solana)}
                    </Text>
                  </View>
                ) : null}

                {errorText ? (
                  <Text style={[styles.errorText, { color: colors.loss }]}>{errorText}</Text>
                ) : null}

                <PrimaryButton label="Entendido" onPress={onClose} />
              </View>
            ) : null}

            {step === 'confirm' ? (
              <View style={styles.block}>
                <View style={styles.copyBlock}>
                  <Text style={[styles.blockTitle, { color: colors.text }]}>
                    Confirma tu respaldo
                  </Text>
                  <Text style={[styles.blockBody, { color: colors.textMuted }]}>
                    Escribe estas palabras para activar la billetera con seguridad.
                  </Text>
                </View>

                {confirmationIndexes.map((wordIndex, index) => (
                  <OrbitInput
                    key={`${wordIndex}-${index}`}
                    label={`Palabra #${wordIndex + 1}`}
                    value={confirmation[index]}
                    onChangeText={(value) => {
                      setErrorText('');
                      setConfirmation((current) =>
                        current.map((item, itemIndex) => (itemIndex === index ? value : item)),
                      );
                    }}
                    placeholder="Escribe la palabra exacta"
                    autoCapitalize="none"
                  />
                ))}

                {errorText ? (
                  <Text style={[styles.errorText, { color: colors.loss }]}>{errorText}</Text>
                ) : null}

                <PrimaryButton
                  label={loading ? 'Activando...' : 'Activar billetera'}
                  onPress={() => void handleConfirmSeed()}
                />
              </View>
            ) : null}

            {step === 'ready' ? (
              <View style={styles.block}>
                <View
                  style={[
                    styles.heroIcon,
                    {
                      backgroundColor: withOpacity(colors.profit, 0.12),
                      borderColor: withOpacity(colors.profit, 0.2),
                    },
                  ]}
                >
                  <Ionicons name="checkmark-circle-outline" size={24} color={colors.profit} />
                </View>

                <View style={styles.copyBlock}>
                  <Text style={[styles.blockTitle, { color: colors.text }]}>
                    {importMode ? 'Billetera vinculada y lista' : 'Billetera activa y lista para recibir'}
                  </Text>
                  <Text style={[styles.blockBody, { color: colors.textMuted }]}>
                    {importMode
                      ? 'Tu billetera Web3 ya quedo lista dentro de OrbitX.'
                      : 'Ya puedes copiar direcciones y recibir fondos.'}
                  </Text>
                </View>

                <View style={styles.networkGrid}>
                  {ACTIVE_NETWORKS.map((network) => {
                    const address = addresses?.[network.key];

                    return (
                      <View
                        key={network.label}
                        style={[
                          styles.networkCard,
                          {
                            backgroundColor: colors.fieldBackground,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <View style={styles.networkHeader}>
                          <Text style={[styles.networkTitle, { color: colors.text }]}>
                            {network.label}
                          </Text>
                          <Text style={[styles.networkBadge, { color: colors.profit }]}>
                            {network.note}
                          </Text>
                        </View>
                        <Text style={[styles.networkAddress, { color: colors.textSoft }]}>
                          {address ? maskAddress(address) : 'Direccion lista al abrir Recibir'}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <View
                  style={[
                    styles.preparedCard,
                    {
                      backgroundColor: colors.fieldBackground,
                      borderColor: colors.border,
                    },
                  ]}
                >
                    <Text style={[styles.preparedTitle, { color: colors.text }]}>
                      Redes populares preparadas
                  </Text>
                  <Text style={[styles.preparedBody, { color: colors.textMuted }]}>
                    {PREPARED_NETWORKS.join(' - ')}
                  </Text>
                </View>

                <PrimaryButton
                  label={importMode ? 'Abrir Web3' : 'Ir a recibir'}
                  onPress={() => {
                    onComplete?.();
                    onClose();
                  }}
                />
              </View>
            ) : null}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  grabber: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 999,
    marginBottom: 4,
  },
  sheet: {
    maxHeight: '86%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.md,
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
    fontSize: 23,
    lineHeight: 28,
  },
  headerBody: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressShell: {
    gap: 8,
  },
  progressMeta: {
    fontFamily: FONT.medium,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  progressItem: {
    minWidth: '23%',
    gap: 6,
  },
  progressBadge: {
    width: 28,
    height: 28,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBadgeLabel: {
    fontFamily: FONT.bold,
    fontSize: 11,
  },
  progressItemLabel: {
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  content: {
    gap: 14,
    paddingBottom: 6,
  },
  block: {
    gap: 14,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: RADII.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyBlock: {
    gap: 6,
  },
  blockTitle: {
    fontFamily: FONT.bold,
    fontSize: 18,
    lineHeight: 22,
  },
  blockBody: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  points: {
    gap: 10,
  },
  actionStack: {
    gap: 10,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  pointDot: {
    width: 7,
    height: 7,
    borderRadius: 7,
    marginTop: 5,
  },
  pointText: {
    flex: 1,
    fontFamily: FONT.medium,
    fontSize: 11,
    lineHeight: 17,
  },
  seedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    borderWidth: 1,
    borderRadius: RADII.xl,
    padding: 12,
  },
  seedChip: {
    width: '47.5%',
    borderRadius: RADII.md,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 7,
    gap: 3,
  },
  seedIndex: {
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  seedWord: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  noteCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 13,
  },
  noteText: {
    fontFamily: FONT.medium,
    fontSize: 11,
    lineHeight: 17,
  },
  errorText: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  networkGrid: {
    gap: 8,
  },
  networkCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 10,
    gap: 4,
  },
  networkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  networkTitle: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  networkBadge: {
    fontFamily: FONT.semibold,
    fontSize: 10,
  },
  networkAddress: {
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  preparedCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  preparedTitle: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  preparedBody: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
});

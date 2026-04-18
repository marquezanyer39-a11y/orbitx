import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, SPACING, withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getWalletPinState, setWalletPin, verifyWalletPin } from '../../utils/walletSecurity';
import { PrimaryButton } from '../common/PrimaryButton';
import { OrbitInput } from '../forms/OrbitInput';

interface WalletPinSheetProps {
  visible: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function WalletPinSheet({ visible, onClose, onSaved }: WalletPinSheetProps) {
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [hasExistingPin, setHasExistingPin] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [nextPin, setNextPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    if (!visible) {
      setLoading(false);
      setCurrentPin('');
      setNextPin('');
      setConfirmPin('');
      setErrorText('');
      return;
    }

    let mounted = true;

    const loadPinState = async () => {
      const pinState = await getWalletPinState();
      if (mounted) {
        setHasExistingPin(pinState.enabled);
      }
    };

    void loadPinState();

    return () => {
      mounted = false;
    };
  }, [visible]);

  async function handleSavePin() {
    if (!/^\d{4,6}$/.test(nextPin.trim())) {
      setErrorText('Usa un PIN de 4 a 6 digitos.');
      return;
    }

    if (nextPin.trim() !== confirmPin.trim()) {
      setErrorText('Los PIN no coinciden.');
      return;
    }

    setLoading(true);
    setErrorText('');

    try {
      if (hasExistingPin) {
        const validCurrentPin = await verifyWalletPin(currentPin.trim());
        if (!validCurrentPin) {
          setErrorText('El PIN actual no coincide.');
          return;
        }
      }

      await setWalletPin(nextPin.trim());
      onSaved?.();
      onClose();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'No se pudo guardar el PIN.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: withOpacity(colors.background, 0.84) }]}>
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
          <View style={[styles.grabber, { backgroundColor: withOpacity(colors.text, 0.12) }]} />

          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={[styles.eyebrow, { color: colors.textMuted }]}>Seguridad</Text>
              <Text style={[styles.title, { color: colors.text }]}>
                {hasExistingPin ? 'Cambiar PIN' : 'Crear PIN'}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Protege acciones sensibles de tu billetera con un PIN corto y facil de recordar.
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.fieldBackground }]}
            >
              <Ionicons name="close" size={18} color={colors.text} />
            </Pressable>
          </View>

          {hasExistingPin ? (
            <OrbitInput
              label="PIN actual"
              value={currentPin}
              onChangeText={(value) => {
                setErrorText('');
                setCurrentPin(value.replace(/\D/g, '').slice(0, 6));
              }}
              placeholder="Ingresa tu PIN actual"
              keyboardType="numeric"
              secureTextEntry
            />
          ) : null}

          <OrbitInput
            label={hasExistingPin ? 'Nuevo PIN' : 'PIN'}
            value={nextPin}
            onChangeText={(value) => {
              setErrorText('');
              setNextPin(value.replace(/\D/g, '').slice(0, 6));
            }}
            placeholder="4 a 6 digitos"
            keyboardType="numeric"
            secureTextEntry
          />

          <OrbitInput
            label="Confirmar PIN"
            value={confirmPin}
            onChangeText={(value) => {
              setErrorText('');
              setConfirmPin(value.replace(/\D/g, '').slice(0, 6));
            }}
            placeholder="Repite tu PIN"
            keyboardType="numeric"
            secureTextEntry
          />

          <View
            style={[
              styles.helperCard,
              {
                backgroundColor: colors.fieldBackground,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.helperText, { color: colors.textMuted }]}>
              OrbitX te pedira este PIN antes de mostrar la frase semilla o exportar un respaldo
              cuando no uses biometria.
            </Text>
          </View>

          {errorText ? (
            <Text style={[styles.errorText, { color: colors.loss }]}>{errorText}</Text>
          ) : null}

          <PrimaryButton
            label={loading ? 'Guardando...' : hasExistingPin ? 'Actualizar PIN' : 'Guardar PIN'}
            disabled={loading}
            onPress={() => void handleSavePin()}
          />

          <PrimaryButton label="Cancelar" variant="ghost" onPress={onClose} />
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
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    gap: 12,
  },
  grabber: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: RADII.pill,
    marginBottom: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 20,
    lineHeight: 24,
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
  helperCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 12,
  },
  helperText: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  errorText: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
});

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { astraToolConfirmationStore } from '../tools/astraToolConfirmation';
import type { AstraToolExecutionResult } from '../tools/astraTool.types';
import { astraToolRegistry } from '../tools/astraToolRegistry';
import { AstraToolConfirmationHost } from '../tools/ui/containers/AstraToolConfirmationHost';
import type { AstraToolPendingConfirmationInput } from '../tools/ui/astraToolConfirmation.types';
import { astraUiTheme } from '../ui/theme/astraUiTheme';

const SAFE_CONFIRMATION_PARAMS = {
  chainId: 1,
  tokenSymbol: 'USDC',
  spenderLabel: 'Contrato demo auditado',
};

export function AstraQaConfirmationBridge() {
  const [pending, setPending] = useState<AstraToolPendingConfirmationInput | null>(null);
  const [status, setStatus] = useState('Sin fixture activo.');

  function createSafeFixture() {
    const tool = astraToolRegistry.get('web3.review_approval_mock');
    if (!tool) {
      setStatus('Tool de fixture no disponible.');
      return;
    }

    const record = astraToolConfirmationStore.createPending(tool, {
      toolId: tool.id,
      params: SAFE_CONFIRMATION_PARAMS,
      requestedBy: 'user',
      source: 'astra-qa-hub',
    });

    const result: AstraToolExecutionResult = {
      status: 'pending_confirmation',
      toolId: tool.id,
      message: 'Fixture seguro de confirmacion visual. No ejecuta fondos ni firmas.',
      confirmationToken: record.token,
    };

    setPending({
      result,
      params: SAFE_CONFIRMATION_PARAMS,
      source: 'astra-qa-hub',
    });
    setStatus('Fixture pending_confirmation creado localmente.');
  }

  function clearFixture() {
    astraToolConfirmationStore.clear();
    setPending(null);
    setStatus('Fixture limpiado.');
  }

  return (
    <View style={styles.panel} testID="astra-qa-confirmation-bridge">
      <View style={styles.header}>
        <Text style={styles.title}>Confirmation UI bridge</Text>
        <Text style={styles.subtitle}>
          Fixture local seguro. No firma, no conecta wallet, no llama backend y no ejecuta transacciones.
        </Text>
      </View>

      <View style={styles.payload}>
        <Text style={styles.payloadTitle}>Payload visible</Text>
        <Text style={styles.payloadText}>Token: USDC</Text>
        <Text style={styles.payloadText}>Red: 1</Text>
        <Text style={styles.payloadText}>Spender: Contrato demo auditado</Text>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={createSafeFixture} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonText}>Crear fixture visual</Text>
        </Pressable>
        <Pressable onPress={clearFixture} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
          <Text style={styles.secondaryButtonText}>Limpiar</Text>
        </Pressable>
      </View>

      <Text style={styles.status}>{status}</Text>

      <AstraToolConfirmationHost
        enabled
        pendingConfirmation={pending}
        onApprove={() => {
          setStatus('Aprobado como confirmed_noop/mock. No se ejecuto nada real.');
          setPending(null);
        }}
        onReject={() => {
          setStatus('Rechazado localmente. Estado limpio.');
          setPending(null);
        }}
        onExpired={() => {
          setStatus('Fixture expirado.');
          setPending(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: astraUiTheme.spacing.sm,
  },
  button: {
    alignItems: 'center',
    backgroundColor: astraUiTheme.colors.accent,
    borderRadius: astraUiTheme.radii.pill,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: astraUiTheme.spacing.md,
  },
  buttonText: {
    color: astraUiTheme.colors.background,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 13,
  },
  header: {
    gap: astraUiTheme.spacing.xs,
  },
  panel: {
    backgroundColor: astraUiTheme.colors.surface,
    borderColor: astraUiTheme.colors.borderStrong,
    borderRadius: astraUiTheme.radii.lg,
    borderWidth: 1,
    gap: astraUiTheme.spacing.md,
    padding: astraUiTheme.spacing.md,
  },
  payload: {
    backgroundColor: astraUiTheme.colors.surfaceElevated,
    borderRadius: astraUiTheme.radii.md,
    gap: 4,
    padding: astraUiTheme.spacing.md,
  },
  payloadText: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.regular,
    fontSize: 13,
  },
  payloadTitle: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.84,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: astraUiTheme.colors.surfaceElevated,
    borderColor: astraUiTheme.colors.borderStrong,
    borderRadius: astraUiTheme.radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: astraUiTheme.spacing.md,
  },
  secondaryButtonText: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 13,
  },
  status: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.medium,
    fontSize: 12,
  },
  subtitle: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  title: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.bold,
    fontSize: 18,
  },
});

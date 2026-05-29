import { useEffect, useMemo, useRef } from 'react';

import { astraConfigService } from '../../../config/astraFlags';
import { AstraConfirmationSheet } from '../../../ui/sheets/AstraConfirmationSheet';
import {
  resolveAstraToolConfirmationVisibility,
  useAstraToolConfirmation,
} from '../hooks/useAstraToolConfirmation';
import type {
  AstraToolConfirmationCallbackPayload,
  AstraToolConfirmationHostProps,
} from '../astraToolConfirmation.types';
import type { AstraToolId } from '../../astraTool.types';

function buildCallbackPayload(
  status: AstraToolConfirmationCallbackPayload['status'],
  token: string | null,
  toolId?: AstraToolId,
  resolution?: AstraToolConfirmationCallbackPayload['resolution'],
): AstraToolConfirmationCallbackPayload {
  return {
    status,
    token,
    toolId,
    resolution: resolution ?? null,
  };
}

export function AstraToolConfirmationHost({
  pendingConfirmation,
  enabled,
  onApprove,
  onReject,
  onExpired,
  onClose,
  onStateChange,
}: AstraToolConfirmationHostProps) {
  const {
    state,
    openFromPendingConfirmation,
    approve,
    reject,
    close,
    cleanupExpired,
  } = useAstraToolConfirmation();

  const flags = astraConfigService.getFlags();
  const hostEnabled = useMemo(() => {
    if (enabled === false) {
      return false;
    }

    if (enabled === true) {
      return true;
    }

    return (
      flags.ASTRA_ENABLED &&
      flags.ASTRA_TOOL_CONFIRMATION_UI_ENABLED &&
      flags.ASTRA_UI_CONFIRMATION_SHEET_ENABLED &&
      !flags.ASTRA_KILL_SWITCH
    );
  }, [enabled, flags]);

  const lastPendingTokenRef = useRef<string | null>(null);
  const lastLifecycleKeyRef = useRef<string | null>(null);

  useEffect(() => {
    cleanupExpired();
  }, [cleanupExpired]);

  useEffect(() => {
    if (!hostEnabled || !pendingConfirmation?.result.confirmationToken) {
      if (!pendingConfirmation && state.status === 'pending') {
        close();
        onClose?.(buildCallbackPayload('idle', state.token, state.viewModel?.toolId));
      }
      return;
    }

    const token = pendingConfirmation.result.confirmationToken;
    if (lastPendingTokenRef.current === token) {
      return;
    }

    lastPendingTokenRef.current = token;
    openFromPendingConfirmation(pendingConfirmation);
  }, [
    close,
    hostEnabled,
    onClose,
    openFromPendingConfirmation,
    pendingConfirmation,
    state.status,
    state.token,
    state.viewModel?.toolId,
  ]);

  useEffect(() => {
    const payload = buildCallbackPayload(state.status, state.token, state.viewModel?.toolId, state.resolution);
    onStateChange?.(payload);

    const lifecycleKey = `${state.status}:${state.token ?? 'none'}:${state.resolution ?? 'none'}`;
    if (lastLifecycleKeyRef.current === lifecycleKey) {
      return;
    }

    lastLifecycleKeyRef.current = lifecycleKey;

    if (state.status === 'approved_mock') {
      onApprove?.(payload);
      return;
    }

    if (state.status === 'rejected') {
      onReject?.(payload);
      return;
    }

    if (state.status === 'expired') {
      onExpired?.(payload);
    }
  }, [onApprove, onExpired, onReject, onStateChange, state]);

  if (!resolveAstraToolConfirmationVisibility(hostEnabled, state) || !state.viewModel) {
    return null;
  }

  return (
    <AstraConfirmationSheet
      visible
      title={state.viewModel.title}
      body={state.viewModel.body}
      tone={state.viewModel.tone}
      confirmLabel={state.viewModel.confirmLabel}
      cancelLabel={state.viewModel.cancelLabel}
      onConfirm={approve}
      onCancel={() => {
        reject();
      }}
    />
  );
}

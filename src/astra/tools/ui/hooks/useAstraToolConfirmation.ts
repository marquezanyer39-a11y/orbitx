import { useCallback, useRef, useState } from 'react';

import {
  createAstraToolConfirmationController,
  type AstraToolConfirmationController,
  type AstraToolConfirmationControllerOptions,
} from '../astraToolConfirmationController';
import type {
  AstraToolConfirmationControllerState,
  AstraToolPendingConfirmationInput,
} from '../astraToolConfirmation.types';

export interface AstraToolConfirmationHarness {
  getState(): AstraToolConfirmationControllerState;
  openFromPendingConfirmation(input: AstraToolPendingConfirmationInput): AstraToolConfirmationControllerState;
  approve(): AstraToolConfirmationControllerState;
  reject(reason?: string): AstraToolConfirmationControllerState;
  close(): AstraToolConfirmationControllerState;
  cleanupExpired(): AstraToolConfirmationControllerState;
}

export function createAstraToolConfirmationHarness(
  controller: AstraToolConfirmationController = createAstraToolConfirmationController(),
): AstraToolConfirmationHarness {
  let snapshot = controller.getState();

  return {
    getState() {
      return snapshot;
    },
    openFromPendingConfirmation(input) {
      snapshot = controller.openFromPendingConfirmation(input);
      return snapshot;
    },
    approve() {
      snapshot = controller.approve().state;
      return snapshot;
    },
    reject(reason) {
      snapshot = controller.reject(reason).state;
      return snapshot;
    },
    close() {
      snapshot = controller.close();
      return snapshot;
    },
    cleanupExpired() {
      snapshot = controller.cleanupExpired();
      return snapshot;
    },
  };
}

export function resolveAstraToolConfirmationVisibility(
  enabled: boolean,
  state: AstraToolConfirmationControllerState,
): boolean {
  return enabled && state.status === 'pending' && !!state.viewModel;
}

export function useAstraToolConfirmation(options: AstraToolConfirmationControllerOptions = {}) {
  const controllerRef = useRef<AstraToolConfirmationController | null>(null);
  if (!controllerRef.current) {
    controllerRef.current = createAstraToolConfirmationController(options);
  }

  const [state, setState] = useState<AstraToolConfirmationControllerState>(controllerRef.current.getState());

  const sync = useCallback((nextState: AstraToolConfirmationControllerState) => {
    setState(nextState);
    return nextState;
  }, []);

  const openFromPendingConfirmation = useCallback(
    (input: AstraToolPendingConfirmationInput) => {
      return sync(controllerRef.current!.openFromPendingConfirmation(input));
    },
    [sync],
  );

  const approve = useCallback(() => {
    return sync(controllerRef.current!.approve().state);
  }, [sync]);

  const reject = useCallback(
    (reason?: string) => {
      return sync(controllerRef.current!.reject(reason).state);
    },
    [sync],
  );

  const close = useCallback(() => {
    return sync(controllerRef.current!.close());
  }, [sync]);

  const cleanupExpired = useCallback(() => {
    return sync(controllerRef.current!.cleanupExpired());
  }, [sync]);

  return {
    state,
    controller: controllerRef.current,
    openFromPendingConfirmation,
    approve,
    reject,
    close,
    cleanupExpired,
  };
}

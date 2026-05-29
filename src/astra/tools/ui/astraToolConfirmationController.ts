import { astraToolConfirmationStore, type AstraToolConfirmationStore } from '../astraToolConfirmation';

import {
  isAstraToolUiConfirmable,
  mapPendingConfirmationToSheetModel,
} from './astraToolConfirmationMappers';
import type {
  AstraToolConfirmationActionResult,
  AstraToolConfirmationControllerState,
  AstraToolPendingConfirmationInput,
} from './astraToolConfirmation.types';

const INITIAL_STATE: AstraToolConfirmationControllerState = {
  status: 'idle',
  pendingInput: null,
  viewModel: null,
  token: null,
  resolution: null,
  errorMessage: null,
};

export interface AstraToolConfirmationControllerOptions {
  confirmationStore?: AstraToolConfirmationStore;
  now?: () => number;
}

export interface AstraToolConfirmationController {
  getState(): AstraToolConfirmationControllerState;
  openFromPendingConfirmation(input: AstraToolPendingConfirmationInput): AstraToolConfirmationControllerState;
  approve(): AstraToolConfirmationActionResult;
  reject(reason?: string): AstraToolConfirmationActionResult;
  close(): AstraToolConfirmationControllerState;
  cleanupExpired(): AstraToolConfirmationControllerState;
}

export function createAstraToolConfirmationController(
  options: AstraToolConfirmationControllerOptions = {},
): AstraToolConfirmationController {
  const confirmationStore = options.confirmationStore ?? astraToolConfirmationStore;
  const now = options.now ?? (() => Date.now());
  const resolvedTokens = new Set<string>();
  let state: AstraToolConfirmationControllerState = INITIAL_STATE;

  const setState = (nextState: AstraToolConfirmationControllerState): AstraToolConfirmationControllerState => {
    state = nextState;
    return state;
  };

  const setIdle = (): AstraToolConfirmationControllerState => {
    return setState({
      ...INITIAL_STATE,
    });
  };

  const getActiveToken = (): string | null => state.viewModel?.token ?? state.token;

  return {
    getState() {
      return state;
    },

    openFromPendingConfirmation(input) {
      const confirmationToken = input.result.confirmationToken;
      if (input.result.status !== 'pending_confirmation' || !confirmationToken) {
        return setState({
          ...INITIAL_STATE,
          status: 'error',
          pendingInput: input,
          errorMessage: 'La solicitud no requiere confirmacion visual.',
        });
      }

      if (!isAstraToolUiConfirmable(input.result.toolId)) {
        return setState({
          ...INITIAL_STATE,
          status: 'error',
          pendingInput: input,
          token: confirmationToken,
          errorMessage: 'El tool no esta permitido para confirmacion visual en FASE 5B.',
        });
      }

      if (resolvedTokens.has(confirmationToken)) {
        return setState({
          ...INITIAL_STATE,
          status: 'error',
          pendingInput: input,
          token: confirmationToken,
          errorMessage: 'La confirmacion ya fue resuelta previamente.',
        });
      }

      const record = confirmationStore.getPending(confirmationToken);
      if (!record) {
        return setState({
          ...INITIAL_STATE,
          status: 'expired',
          pendingInput: input,
          token: confirmationToken,
          resolution: 'expired',
          errorMessage: 'La confirmacion expiro antes de abrir la hoja.',
        });
      }

      const viewModel = mapPendingConfirmationToSheetModel(
        {
          ...input,
          record,
        },
        { now },
      );

      if (new Date(record.expiresAt).getTime() <= now()) {
        resolvedTokens.add(record.token);
        return setState({
          ...INITIAL_STATE,
          status: 'expired',
          pendingInput: input,
          token: record.token,
          resolution: 'expired',
          errorMessage: 'La confirmacion expiro.',
        });
      }

      return setState({
        status: 'pending',
        pendingInput: input,
        viewModel,
        token: record.token,
        resolution: null,
        errorMessage: null,
      });
    },

    approve() {
      if (state.status !== 'pending' || !state.viewModel) {
        return {
          state,
          didResolve: false,
        };
      }

      const record = confirmationStore.getPending(state.viewModel.token);
      if (!record || new Date(record.expiresAt).getTime() <= now()) {
        resolvedTokens.add(state.viewModel.token);
        return {
          state: setState({
            ...INITIAL_STATE,
            status: 'expired',
            pendingInput: state.pendingInput,
            token: state.viewModel.token,
            resolution: 'expired',
            errorMessage: 'La confirmacion expiro antes de aprobar.',
          }),
          didResolve: false,
        };
      }

      resolvedTokens.add(state.viewModel.token);
      return {
        state: setState({
          ...INITIAL_STATE,
          status: 'approved_mock',
          pendingInput: state.pendingInput,
          token: state.viewModel.token,
          resolution: 'confirmed_noop',
          errorMessage: null,
        }),
        didResolve: true,
      };
    },

    reject(reason) {
      if (state.status !== 'pending' || !state.viewModel) {
        return {
          state,
          didResolve: false,
        };
      }

      resolvedTokens.add(state.viewModel.token);
      return {
        state: setState({
          ...INITIAL_STATE,
          status: 'rejected',
          pendingInput: state.pendingInput,
          token: state.viewModel.token,
          resolution: 'rejected',
          errorMessage: reason ?? null,
        }),
        didResolve: true,
      };
    },

    close() {
      return setIdle();
    },

    cleanupExpired() {
      confirmationStore.cleanupExpired();

      const activeToken = getActiveToken();
      if (!activeToken) {
        return state;
      }

      const record = confirmationStore.getPending(activeToken);
      if (record) {
        return state;
      }

      resolvedTokens.add(activeToken);
      return setState({
        ...INITIAL_STATE,
        status: 'expired',
        token: activeToken,
        resolution: 'expired',
        errorMessage: 'La confirmacion expiro durante la sesion.',
      });
    },
  };
}

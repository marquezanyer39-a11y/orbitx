import type { AstraConfirmationSheetProps, AstraUiTone } from '../../ui/types/astraUi.types';
import type {
  AstraToolConfirmationRecord,
  AstraToolExecutionResult,
  AstraToolId,
} from '../astraTool.types';

export type AstraToolConfirmationUiStatus =
  | 'idle'
  | 'pending'
  | 'approved_mock'
  | 'rejected'
  | 'expired'
  | 'error';

export type AstraToolConfirmationResolution =
  | 'approved_mock'
  | 'confirmed_noop'
  | 'rejected'
  | 'expired'
  | 'closed';

export interface AstraToolPendingConfirmationInput {
  result: AstraToolExecutionResult;
  params?: Record<string, unknown>;
  source?: string;
}

export interface AstraToolResolvedPendingConfirmation extends AstraToolPendingConfirmationInput {
  record: AstraToolConfirmationRecord;
}

export interface AstraToolConfirmationField {
  label: string;
  value: string;
}

export interface AstraToolConfirmationSanitizedPayload {
  summary: string;
  fields: AstraToolConfirmationField[];
  redactedKeys: string[];
}

export interface AstraToolConfirmationViewModel
  extends Pick<AstraConfirmationSheetProps, 'title' | 'body' | 'tone' | 'confirmLabel' | 'cancelLabel'> {
  toolId: AstraToolId;
  token: string;
  expiresAt: string;
  summary: string;
  fields: AstraToolConfirmationField[];
  redactedKeys: string[];
}

export interface AstraToolConfirmationControllerState {
  status: AstraToolConfirmationUiStatus;
  pendingInput: AstraToolPendingConfirmationInput | null;
  viewModel: AstraToolConfirmationViewModel | null;
  token: string | null;
  resolution: AstraToolConfirmationResolution | null;
  errorMessage: string | null;
}

export interface AstraToolConfirmationActionResult {
  state: AstraToolConfirmationControllerState;
  didResolve: boolean;
}

export interface AstraToolConfirmationCallbackPayload {
  status: AstraToolConfirmationUiStatus;
  token: string | null;
  toolId?: AstraToolId;
  resolution?: AstraToolConfirmationResolution | null;
}

export interface AstraToolConfirmationHostProps {
  pendingConfirmation?: AstraToolPendingConfirmationInput | null;
  enabled?: boolean;
  onApprove?: (payload: AstraToolConfirmationCallbackPayload) => void;
  onReject?: (payload: AstraToolConfirmationCallbackPayload) => void;
  onExpired?: (payload: AstraToolConfirmationCallbackPayload) => void;
  onClose?: (payload: AstraToolConfirmationCallbackPayload) => void;
  onStateChange?: (payload: AstraToolConfirmationCallbackPayload) => void;
}

export interface AstraToolConfirmationMapperOptions {
  now?: () => number;
}

export interface AstraToolConfirmationToneConfig {
  title: string;
  tone: AstraUiTone;
  confirmLabel: string;
  cancelLabel: string;
}

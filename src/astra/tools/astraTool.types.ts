import type { z } from 'zod';

export type AstraToolId =
  | 'astra.open_insight'
  | 'astra.save_note_mock'
  | 'astra.mark_inbox_item_read_local'
  | 'astra.dismiss_insight_local'
  | 'astra.save_note_local'
  | 'astra.set_intensity_mode_local'
  | 'astra.mute_surface_local'
  | 'astra.pin_insight_local'
  | 'astra.prepare_trade_note_mock'
  | 'web3.review_approval_mock'
  | 'market.pin_asset_local'
  | 'trade.prepare_order_mock'
  | 'trade.save_order_draft_local';

export type AstraToolRiskLevel = 'safe' | 'sensitive' | 'forbidden';

export type AstraToolExecutionMode = 'noop' | 'mock' | 'local' | 'forbidden';

export type AstraToolCategory = 'astra' | 'web3' | 'trade' | 'wallet' | 'market';

export type AstraToolStatus =
  | 'success'
  | 'success_local'
  | 'pending_confirmation'
  | 'blocked'
  | 'failed';

export interface AstraToolDefinition<TParams = Record<string, unknown>> {
  id: AstraToolId;
  label: string;
  description: string;
  category: AstraToolCategory;
  riskLevel: AstraToolRiskLevel;
  executionMode: AstraToolExecutionMode;
  requiresConfirmation: boolean;
  schema: z.ZodType<TParams>;
}

export interface AstraToolExecutionRequest {
  toolId: AstraToolId;
  params: Record<string, unknown>;
  requestedBy?: 'astra' | 'user' | 'system';
  source?: string;
  confirmationToken?: string;
}

export interface AstraToolExecutionResult {
  status: AstraToolStatus;
  toolId: AstraToolId;
  message: string;
  confirmationToken?: string;
  auditId?: string;
  errorCode?: string;
}

export interface AstraToolConfirmationRecord {
  token: string;
  toolId: AstraToolId;
  safeSummary: string;
  requestedAt: string;
  expiresAt: string;
  paramsHash: string;
}

export interface AstraToolAuditRecord {
  id: string;
  toolId: AstraToolId;
  status: AstraToolStatus;
  createdAt: string;
  paramsHash: string;
  metadata: Record<string, string>;
}

import { createAstraToolAuditRecord } from './astraToolAudit';
import { astraToolConfirmationStore, type AstraToolConfirmationStore } from './astraToolConfirmation';
import { createAstraToolError } from './astraToolErrors';
import { getAstraToolFlags } from './astraToolFlags';
import { executeAstraLocalTool } from './local/astraLocalToolAdapters';
import {
  astraLocalToolRegistry,
  type AstraLocalToolRegistry,
} from './local/astraLocalToolRegistry';
import type { AstraLocalToolAdapterDependencies, AstraLocalToolId } from './local/astraLocalTool.types';
import { astraToolRegistry, type AstraToolRegistry } from './astraToolRegistry';
import { validateAstraToolParams } from './astraToolValidator';
import type { AstraToolExecutionRequest, AstraToolExecutionResult } from './astraTool.types';
import { astraConfigService, type AstraFeatureFlags } from '../config/astraFlags';

interface ExecuteAstraToolOptions {
  registry?: AstraToolRegistry;
  localRegistry?: AstraLocalToolRegistry;
  localDependencies?: AstraLocalToolAdapterDependencies;
  confirmationStore?: AstraToolConfirmationStore;
  flags?: Partial<AstraFeatureFlags>;
}

export async function executeAstraTool(
  request: AstraToolExecutionRequest,
  options: ExecuteAstraToolOptions = {},
) : Promise<AstraToolExecutionResult> {
  const featureFlags = {
    ...astraConfigService.getFlags(),
    ...options.flags,
  };
  const flags = getAstraToolFlags(featureFlags);
  const registry = options.registry ?? astraToolRegistry;
  const localRegistry = options.localRegistry ?? astraLocalToolRegistry;
  const confirmationStore = options.confirmationStore ?? astraToolConfirmationStore;

  if (!flags.enabled || !flags.registryEnabled) {
    return {
      status: 'blocked',
      toolId: request.toolId,
      message: 'ASTRA tool execution is disabled.',
      errorCode: 'ASTRA_TOOLS_DISABLED',
    };
  }

  const tool = registry.get(request.toolId) ?? localRegistry.get(request.toolId);
  if (!tool) {
    return {
      status: 'failed',
      toolId: request.toolId,
      message: createAstraToolError('ASTRA_TOOL_NOT_FOUND', 'Tool not found.').message,
      errorCode: 'ASTRA_TOOL_NOT_FOUND',
    };
  }

  if (tool.riskLevel === 'forbidden' || tool.executionMode === 'forbidden') {
    return {
      status: 'blocked',
      toolId: request.toolId,
      message: 'This ASTRA tool is forbidden in the current phase.',
      errorCode: 'ASTRA_TOOL_FORBIDDEN',
    };
  }

  const validation = validateAstraToolParams(tool, request.params);
  if (!validation.success) {
    return {
      status: 'failed',
      toolId: request.toolId,
      message: validation.errors.join('; ') || 'Tool params are invalid.',
      errorCode: 'ASTRA_TOOL_VALIDATION_FAILED',
    };
  }

  if (tool.executionMode === 'local') {
    const localResult = await executeAstraLocalTool(
      request.toolId as AstraLocalToolId,
      (validation.data ?? {}) as Record<string, unknown>,
      {
        ...options.localDependencies,
        getFlags: () => featureFlags,
      },
    );

    if (localResult.status !== 'success_local') {
      return {
        status: localResult.status,
        toolId: request.toolId,
        message: localResult.message,
        errorCode:
          localResult.status === 'blocked'
            ? 'ASTRA_TOOLS_DISABLED'
            : 'ASTRA_TOOL_EXECUTION_FAILED',
      };
    }

    const audit = flags.auditEnabled
      ? createAstraToolAuditRecord(
          {
            ...request,
            params: localResult.auditParams,
          },
          'success_local',
        )
      : null;

    return {
      status: 'success_local',
      toolId: request.toolId,
      message: localResult.message,
      auditId: audit?.id,
    };
  }

  if (tool.requiresConfirmation) {
    if (!flags.confirmationEnabled) {
      return {
        status: 'blocked',
        toolId: request.toolId,
        message: 'Confirmation is disabled for sensitive ASTRA tools.',
        errorCode: 'ASTRA_TOOL_CONFIRMATION_REQUIRED',
      };
    }

    const pending = confirmationStore.createPending(tool, request);
    const audit = flags.auditEnabled
      ? createAstraToolAuditRecord(request, 'pending_confirmation')
      : null;

    return {
      status: 'pending_confirmation',
      toolId: request.toolId,
      message: pending.safeSummary,
      confirmationToken: pending.token,
      auditId: audit?.id,
      errorCode: 'ASTRA_TOOL_CONFIRMATION_REQUIRED',
    };
  }

  if (!flags.mockExecutionEnabled) {
    return {
      status: 'blocked',
      toolId: request.toolId,
      message: 'Mock ASTRA tool execution is disabled.',
      errorCode: 'ASTRA_TOOLS_DISABLED',
    };
  }

  const audit = flags.auditEnabled ? createAstraToolAuditRecord(request, 'success') : null;

  return {
    status: 'success',
    toolId: request.toolId,
    message: 'Mock/no-op ASTRA tool completed without side effects.',
    auditId: audit?.id,
  };
}

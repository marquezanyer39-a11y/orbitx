import type { AstraToolDefinition } from './astraTool.types';

export interface AstraToolValidationResult<TParams = unknown> {
  success: boolean;
  data?: TParams;
  errors: string[];
}

export function validateAstraToolParams<TParams>(
  tool: AstraToolDefinition<TParams>,
  params: Record<string, unknown>,
): AstraToolValidationResult<TParams> {
  const result = tool.schema.safeParse(params);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.issues.map((issue) => issue.message),
    };
  }

  return {
    success: true,
    data: result.data,
    errors: [],
  };
}

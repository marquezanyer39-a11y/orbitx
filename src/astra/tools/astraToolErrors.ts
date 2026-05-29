export type AstraToolErrorCode =
  | 'ASTRA_TOOLS_DISABLED'
  | 'ASTRA_TOOL_NOT_FOUND'
  | 'ASTRA_TOOL_FORBIDDEN'
  | 'ASTRA_TOOL_VALIDATION_FAILED'
  | 'ASTRA_TOOL_CONFIRMATION_REQUIRED'
  | 'ASTRA_TOOL_EXECUTION_FAILED';

export class AstraToolError extends Error {
  constructor(
    public readonly code: AstraToolErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'AstraToolError';
  }
}

export function createAstraToolError(code: AstraToolErrorCode, message: string): AstraToolError {
  return new AstraToolError(code, message);
}

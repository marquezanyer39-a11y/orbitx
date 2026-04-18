import { orchestrateAstraChat } from './astra/astra-orchestrator.js';
import { AstraSystemError } from './astra/astra-schemas.js';

export class AstraBrainError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'AstraBrainError';
    this.code = options.code ?? 'ASTRA_BRAIN_ERROR';
    this.status = options.status ?? 502;
    this.retryable = Boolean(options.retryable);
    this.exposeMessage = Boolean(options.exposeMessage);
  }
}

function toAstraBrainError(error) {
  if (error instanceof AstraBrainError) {
    return error;
  }

  if (error instanceof AstraSystemError) {
    return new AstraBrainError(error.message, {
      code: error.code,
      status: error.status,
      retryable: error.retryable,
      exposeMessage: error.exposeMessage,
    });
  }

  return new AstraBrainError('No pudimos generar una respuesta completa de Astra.', {
    code: 'ASTRA_BRAIN_UNKNOWN_ERROR',
    status: 500,
    retryable: false,
  });
}

export async function generateAstraBrainReply(config, input) {
  try {
    return await orchestrateAstraChat({
      config,
      input,
    });
  } catch (error) {
    throw toAstraBrainError(error);
  }
}

function truncate(value, maxLength) {
  return `${value ?? ''}`.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

const ALLOWED_ACTIONS = new Set([
  'wallet_create',
  'wallet_open',
  'view_market',
  'go_trade',
  'create_memecoin',
  'open_profile',
  'find_user_id',
  'get_started',
  'diagnose_issue',
  'connect_exchange',
  'open_bot_futures',
  'open_social',
  'review_security',
  'buy_crypto',
  'sell_crypto',
]);

const ALLOWED_MOODS = new Set(['normal', 'warning', 'critical']);

export class AstraSystemError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'AstraSystemError';
    this.code = options.code ?? 'ASTRA_SYSTEM_ERROR';
    this.status = options.status ?? 500;
    this.retryable = Boolean(options.retryable);
    this.exposeMessage = Boolean(options.exposeMessage);
  }
}

export function createAstraResponseSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      reply: { type: 'string' },
      actions: {
        type: 'array',
        items: {
          type: 'string',
          enum: Array.from(ALLOWED_ACTIONS),
        },
        maxItems: 4,
      },
      mood: {
        type: 'string',
        enum: Array.from(ALLOWED_MOODS),
      },
    },
    required: ['reply', 'actions', 'mood'],
  };
}

export function buildStructuredResponse(payload = {}) {
  const actions = Array.isArray(payload.actions)
    ? payload.actions
        .map((item) => `${item ?? ''}`.trim())
        .filter((item) => ALLOWED_ACTIONS.has(item))
        .slice(0, 4)
    : [];

  return {
    reply:
      truncate(payload.reply ?? payload.message, 700) ||
      'Puedo ayudarte con eso dentro de OrbitX.',
    actions,
    mood: ALLOWED_MOODS.has(payload.mood) ? payload.mood : 'normal',
  };
}

export function buildSuccessEnvelope(data) {
  return {
    success: true,
    data: buildStructuredResponse(data),
  };
}

export function buildErrorEnvelope(message) {
  return {
    success: false,
    error: {
      message:
        truncate(message, 260) ||
        'No pudimos generar una respuesta completa de Astra.',
    },
  };
}

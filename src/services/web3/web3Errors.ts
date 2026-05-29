export type Web3ErrorCode =
  | 'USER_REJECTED'
  | 'INSUFFICIENT_FUNDS'
  | 'INSUFFICIENT_GAS'
  | 'INVALID_ADDRESS'
  | 'INVALID_AMOUNT'
  | 'UNSUPPORTED_CHAIN'
  | 'CHAIN_MISMATCH'
  | 'PROVIDER_NOT_FOUND'
  | 'WALLET_NOT_CONNECTED'
  | 'RPC_UNAVAILABLE'
  | 'RPC_TIMEOUT'
  | 'GAS_ESTIMATION_FAILED'
  | 'TOKEN_NOT_SUPPORTED'
  | 'TOKEN_SEND_DISABLED'
  | 'ERC20_TRANSFER_FAILED'
  | 'APPROVAL_REJECTED'
  | 'TX_REVERTED'
  | 'NONCE_ERROR'
  | 'UNKNOWN';

export const WEB3_ERROR_MESSAGES: Record<Web3ErrorCode, string> = {
  USER_REJECTED: 'Firma rechazada por el usuario.',
  INSUFFICIENT_FUNDS: 'Saldo insuficiente para cubrir el monto y el gas.',
  INSUFFICIENT_GAS: 'Saldo nativo insuficiente para cubrir el gas.',
  INVALID_ADDRESS: 'Dirección no válida.',
  INVALID_AMOUNT: 'Monto no válido.',
  UNSUPPORTED_CHAIN: 'Red no compatible con QVEX.',
  CHAIN_MISMATCH: 'La red de tu wallet no coincide con la seleccionada.',
  PROVIDER_NOT_FOUND: 'No se encontró el proveedor de la wallet.',
  WALLET_NOT_CONNECTED: 'Wallet externa no conectada.',
  RPC_UNAVAILABLE: 'No se pudo conectar con el proveedor RPC.',
  RPC_TIMEOUT: 'Tiempo de espera agotado. Intenta de nuevo.',
  GAS_ESTIMATION_FAILED: 'No se pudo estimar el gas. Intenta de nuevo.',
  TOKEN_NOT_SUPPORTED: 'Token no soportado en esta red.',
  TOKEN_SEND_DISABLED: 'El envío de este token no está habilitado.',
  ERC20_TRANSFER_FAILED: 'La transferencia del token falló.',
  APPROVAL_REJECTED: 'La aprobación fue rechazada.',
  TX_REVERTED: 'La transacción fue revertida por el contrato.',
  NONCE_ERROR: 'Error de nonce. Intenta de nuevo.',
  UNKNOWN: 'Ocurrió un error inesperado. Intenta de nuevo.',
};

export class Web3Error extends Error {
  public readonly rawMessage?: string;

  constructor(
    public code: Web3ErrorCode,
    public userMessage: string = WEB3_ERROR_MESSAGES[code],
    public originalError?: unknown,
  ) {
    super(userMessage);
    this.name = 'Web3Error';
    this.rawMessage = readErrorMessage(originalError).trim() || undefined;
  }
}

export class Web3ValidationError extends Web3Error {
  constructor(code: Web3ErrorCode, message?: string) {
    super(code, message ?? WEB3_ERROR_MESSAGES[code]);
    this.name = 'Web3ValidationError';
  }
}

function readErrorCode(error: unknown): number | string | undefined {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  return 'code' in error && typeof (error as { code?: unknown }).code !== 'undefined'
    ? (error as { code?: number | string }).code
    : undefined;
}

function readErrorReason(error: unknown): string {
  if (!error || typeof error !== 'object' || !('reason' in error)) {
    return '';
  }

  const reason = (error as { reason?: unknown }).reason;
  return typeof reason === 'string' ? reason : '';
}

function readErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
  }

  return '';
}

function matches(value: string, patterns: string[]): boolean {
  return patterns.some((pattern) => value.includes(pattern));
}

export function normalizeWeb3Error(
  error: unknown,
  fallbackMessage = WEB3_ERROR_MESSAGES.UNKNOWN,
): Web3Error {
  if (error instanceof Web3Error) {
    return error;
  }

  const rawMessage = `${readErrorMessage(error)} ${readErrorReason(error)}`.trim();
  const normalized = rawMessage.toLowerCase();
  const code = readErrorCode(error);

  if (
    code === 4001 ||
    matches(normalized, [
      'user rejected',
      'user denied',
      'rejected request',
      'cancelled',
      'canceled',
      'denied by user',
      'user reject',
    ])
  ) {
    return new Web3Error('USER_REJECTED', WEB3_ERROR_MESSAGES.USER_REJECTED, error);
  }

  if (
    matches(normalized, [
      'insufficient funds',
      'exceeds balance',
      'funds for gas',
      'gas * price + value',
      'not enough funds',
    ])
  ) {
    return new Web3Error('INSUFFICIENT_FUNDS', WEB3_ERROR_MESSAGES.INSUFFICIENT_FUNDS, error);
  }

  if (
    matches(normalized, [
      'unsupported chain',
      'chain unsupported',
      'network not supported',
      'unsupported network',
    ])
  ) {
    return new Web3Error('UNSUPPORTED_CHAIN', WEB3_ERROR_MESSAGES.UNSUPPORTED_CHAIN, error);
  }

  if (
    matches(normalized, ['rpc_timeout', 'timeout', 'timed out', 'request timeout'])
  ) {
    return new Web3Error('RPC_TIMEOUT', WEB3_ERROR_MESSAGES.RPC_TIMEOUT, error);
  }

  if (
    matches(normalized, [
      'rpc',
      'failed to fetch',
      'network request failed',
      'could not detect network',
      'missing response',
      'server error',
      'network error',
    ])
  ) {
    return new Web3Error('RPC_UNAVAILABLE', WEB3_ERROR_MESSAGES.RPC_UNAVAILABLE, error);
  }

  if (matches(normalized, ['invalid address', 'bad address checksum'])) {
    return new Web3Error('INVALID_ADDRESS', WEB3_ERROR_MESSAGES.INVALID_ADDRESS, error);
  }

  if (
    matches(normalized, [
      'invalid amount',
      'invalid decimal',
      'underflow',
      'overflow',
      'numeric fault',
    ])
  ) {
    return new Web3Error('INVALID_AMOUNT', WEB3_ERROR_MESSAGES.INVALID_AMOUNT, error);
  }

  if (matches(normalized, ['chain mismatch', 'wrong network', 'network mismatch'])) {
    return new Web3Error('CHAIN_MISMATCH', WEB3_ERROR_MESSAGES.CHAIN_MISMATCH, error);
  }

  if (matches(normalized, ['provider not found', 'missing provider', 'no provider'])) {
    return new Web3Error('PROVIDER_NOT_FOUND', WEB3_ERROR_MESSAGES.PROVIDER_NOT_FOUND, error);
  }

  if (matches(normalized, ['wallet not connected', 'not connected', 'session not found'])) {
    return new Web3Error('WALLET_NOT_CONNECTED', WEB3_ERROR_MESSAGES.WALLET_NOT_CONNECTED, error);
  }

  if (matches(normalized, ['gas estimation', 'cannot estimate gas', 'estimate gas'])) {
    return new Web3Error('GAS_ESTIMATION_FAILED', WEB3_ERROR_MESSAGES.GAS_ESTIMATION_FAILED, error);
  }

  if (matches(normalized, ['nonce'])) {
    return new Web3Error('NONCE_ERROR', WEB3_ERROR_MESSAGES.NONCE_ERROR, error);
  }

  if (matches(normalized, ['execution reverted', 'transaction reverted', 'transaction failed'])) {
    return new Web3Error('TX_REVERTED', WEB3_ERROR_MESSAGES.TX_REVERTED, error);
  }

  return new Web3Error('UNKNOWN', fallbackMessage, error);
}

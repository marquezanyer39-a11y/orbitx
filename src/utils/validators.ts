import { isValidEvmAddress, isValidSolanaAddress } from '../../utils/validation';
import type { Web3ErrorCode } from '../services/web3/web3Errors';

export { isValidEvmAddress };

export const VALIDATION_MESSAGES = {
  INVALID_ADDRESS: 'Dirección no válida.',
  INVALID_AMOUNT: 'Monto no válido.',
  AMOUNT_TOO_LOW: 'El monto debe ser mayor a cero.',
  INSUFFICIENT_BALANCE: 'Saldo insuficiente.',
  INSUFFICIENT_GAS: 'Saldo nativo insuficiente para cubrir el gas.',
  WALLET_NOT_CONNECTED: 'Wallet externa no conectada.',
  UNSUPPORTED_NETWORK: 'Red no compatible.',
  TOKEN_NOT_SUPPORTED: 'Token no soportado en esta red.',
  CHAIN_MISMATCH: 'La red de tu wallet no coincide con la seleccionada.',
  GAS_ESTIMATION_FAILED: 'No se pudo estimar el gas.',
  TX_PREPARATION_FAILED: 'No se pudo preparar la transacción.',
} as const;

function parseDecimalToUnits(value: string, decimals: number): string | null {
  const normalized = value.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(normalized) || decimals < 0) {
    return null;
  }

  const [wholePart, fractionPart = ''] = normalized.split('.');
  if (fractionPart.length > decimals) {
    return null;
  }

  const paddedFraction = fractionPart.padEnd(decimals, '0');
  const units = `${wholePart}${paddedFraction}`.replace(/^0+(?=\d)/, '');
  return units || '0';
}

function compareUnitStrings(left: string, right: string): number {
  const normalizedLeft = left.replace(/^0+(?=\d)/, '');
  const normalizedRight = right.replace(/^0+(?=\d)/, '');

  if (normalizedLeft.length !== normalizedRight.length) {
    return normalizedLeft.length > normalizedRight.length ? 1 : -1;
  }

  return normalizedLeft.localeCompare(normalizedRight);
}

export function validateAddress(
  address: string,
  network?: 'ethereum' | 'base' | 'bnb' | 'polygon' | 'solana',
) {
  const normalized = address.trim();
  if (!normalized) {
    return false;
  }

  if (network === 'solana') {
    return isValidSolanaAddress(normalized);
  }

  if (network === 'ethereum' || network === 'base' || network === 'bnb' || network === 'polygon') {
    return isValidEvmAddress(normalized);
  }

  return isValidEvmAddress(normalized) || isValidSolanaAddress(normalized);
}

export function validateAmount(value: number | string) {
  const amount = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(amount) && amount > 0;
}

export function isValidSendAmount(
  amount: string,
  availableBalance: string,
  decimals: number,
): { valid: boolean; errorCode?: Web3ErrorCode } {
  const amountUnits = parseDecimalToUnits(amount, decimals);
  const availableUnits = parseDecimalToUnits(availableBalance, decimals);

  if (amountUnits === null) {
    return { valid: false, errorCode: 'INVALID_AMOUNT' };
  }

  if (compareUnitStrings(amountUnits, '0') <= 0) {
    return { valid: false, errorCode: 'INVALID_AMOUNT' };
  }

  if (availableUnits === null || compareUnitStrings(amountUnits, availableUnits) > 0) {
    return { valid: false, errorCode: 'INSUFFICIENT_FUNDS' };
  }

  return { valid: true };
}

export function hasSufficientGasBalance(
  nativeBalance: string,
  estimatedGasCost: string,
): boolean {
  const nativeUnits = parseDecimalToUnits(nativeBalance, 18);
  const gasUnits = parseDecimalToUnits(estimatedGasCost, 18);

  return (
    nativeUnits !== null &&
    gasUnits !== null &&
    compareUnitStrings(nativeUnits, gasUnits) >= 0
  );
}

export function isChainMatch(walletChainId: number, targetChainId: number): boolean {
  return walletChainId === targetChainId;
}

export async function validateSeedPhrase(seedPhrase: string) {
  const { validateWalletMnemonic } = await import('../../utils/wallet');
  return validateWalletMnemonic(seedPhrase);
}

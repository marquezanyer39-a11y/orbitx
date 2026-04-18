import { isValidEvmAddress, isValidSolanaAddress } from '../../utils/validation';

export function validateAddress(address: string, network?: 'ethereum' | 'base' | 'bnb' | 'solana') {
  const normalized = address.trim();
  if (!normalized) {
    return false;
  }

  if (network === 'solana') {
    return isValidSolanaAddress(normalized);
  }

  if (network === 'ethereum' || network === 'base' || network === 'bnb') {
    return isValidEvmAddress(normalized);
  }

  return isValidEvmAddress(normalized) || isValidSolanaAddress(normalized);
}

export function validateAmount(value: number | string) {
  const amount = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(amount) && amount > 0;
}

export async function validateSeedPhrase(seedPhrase: string) {
  const { validateWalletMnemonic } = await import('../../utils/wallet');
  return validateWalletMnemonic(seedPhrase);
}

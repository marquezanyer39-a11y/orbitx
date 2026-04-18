export function isValidEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value.trim());
}

export function isValidPassword(value: string) {
  return value.trim().length >= 6;
}

export function isValidName(value: string) {
  return value.trim().length >= 2;
}

export function isValidEvmAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}

export function isValidSolanaAddress(value: string) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value.trim());
}

export function isValidWalletAddress(
  value: string,
  network: 'ethereum' | 'base' | 'bnb' | 'solana' | 'generic',
) {
  const normalized = value.trim();

  if (!normalized) {
    return false;
  }

  if (network === 'solana') {
    return isValidSolanaAddress(normalized);
  }

  if (network === 'ethereum' || network === 'base' || network === 'bnb') {
    return isValidEvmAddress(normalized);
  }

  return normalized.length >= 12;
}

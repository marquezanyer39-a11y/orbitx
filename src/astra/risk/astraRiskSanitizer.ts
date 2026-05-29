const SENSITIVE_KEY_PATTERN =
  /(seed|private|secret|token|signature|payload|mnemonic|session|calldata|transaction|access|refresh|apiKey|balance|wallet)/i;
const FULL_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;
const ADDRESS_IN_TEXT_PATTERN = /0x[a-fA-F0-9]{40}/g;
const BALANCE_KEY_PATTERN = /(balance|amount|allowance|value)/i;

export function truncateRiskAddress(address?: string | null): string | null {
  if (!address || !FULL_ADDRESS_PATTERN.test(address)) {
    return null;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function sanitizeRiskText(value: string): string {
  return value.replace(ADDRESS_IN_TEXT_PATTERN, (address) => truncateRiskAddress(address) ?? '[address]').slice(0, 120);
}

export function sanitizeRiskMetadata(input: Record<string, unknown> = {}): Record<string, string> {
  return Object.entries(input).reduce<Record<string, string>>((metadata, [key, value]) => {
    if (SENSITIVE_KEY_PATTERN.test(key) || BALANCE_KEY_PATTERN.test(key)) {
      metadata[key] = '[redacted]';
      return metadata;
    }

    if (typeof value === 'string') {
      metadata[key] = FULL_ADDRESS_PATTERN.test(value)
        ? truncateRiskAddress(value) ?? '[address]'
        : sanitizeRiskText(value);
      return metadata;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      metadata[key] = String(value);
      return metadata;
    }

    metadata[key] = '[structured]';
    return metadata;
  }, {});
}

export function hasFullRiskAddress(value: string): boolean {
  return FULL_ADDRESS_PATTERN.test(value) || ADDRESS_IN_TEXT_PATTERN.test(value);
}

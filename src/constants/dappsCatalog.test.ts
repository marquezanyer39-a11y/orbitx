import { describe, expect, it } from 'vitest';

import {
  DAPPS_CATALOG,
  getDappById,
  isWhitelistedDappUrl,
  searchDapps,
} from './dappsCatalog';

describe('dappsCatalog', () => {
  it('contains only https URLs', () => {
    expect(DAPPS_CATALOG.every((dapp) => dapp.url.startsWith('https://'))).toBe(true);
  });

  it('allows only exact official domains', () => {
    expect(isWhitelistedDappUrl('https://app.uniswap.org/')).toBe(true);
    expect(isWhitelistedDappUrl('https://fake-uniswap.example/')).toBe(false);
  });

  it('can find enabled DApps by search', () => {
    expect(searchDapps('swap').some((dapp) => dapp.id === 'uniswap')).toBe(true);
  });

  it('returns DApps by id', () => {
    expect(getDappById('aave')?.officialDomain).toBe('app.aave.com');
  });
});

import { describe, expect, it } from 'vitest';

import { mapPendingConfirmationToSheetModel, sanitizeAstraToolParamsForUi, truncateAddress } from '../astraToolConfirmationMappers';

describe('astraToolConfirmationMappers', () => {
  it('convierte pending_confirmation en props seguras', () => {
    const viewModel = mapPendingConfirmationToSheetModel({
      result: {
        status: 'pending_confirmation',
        toolId: 'web3.review_approval_mock',
        message: 'pending',
        confirmationToken: 'token-1',
      },
      params: {
        chainId: 1,
        tokenSymbol: 'USDT',
        spenderLabel: '0x1234567890abcdef1234567890abcdef12345678',
      },
      record: {
        token: 'token-1',
        toolId: 'web3.review_approval_mock',
        safeSummary: 'Review approval mock safely.',
        requestedAt: '2030-01-01T00:00:00.000Z',
        expiresAt: '2030-01-01T01:00:00.000Z',
        paramsHash: 'mock_hash',
      },
    });

    expect(viewModel.title).toBe('Revisar aprobacion mock');
    expect(viewModel.fields).toEqual([
      { label: 'Token', value: 'USDT' },
      { label: 'Red', value: '1' },
      { label: 'Spender', value: '0x1234...5678' },
    ]);
    expect(viewModel.body).not.toContain('rawTransaction');
  });

  it('elimina claves sensibles y trunca direcciones', () => {
    const sanitized = sanitizeAstraToolParamsForUi({
      privateKey: 'secret',
      seed: 'seed words',
      mnemonic: 'mnemonic words',
      signature: '0xsigned',
      accessToken: 'access',
      refreshToken: 'refresh',
      session: 'session-id',
      rawTransaction: '0xraw',
      calldata: '0xcall',
      signingPayload: '0xpayload',
      recipient: '0x1234567890abcdef1234567890abcdef12345678',
    });

    expect(sanitized.redactedKeys.sort()).toEqual([
      'accessToken',
      'calldata',
      'mnemonic',
      'privateKey',
      'rawTransaction',
      'refreshToken',
      'seed',
      'session',
      'signature',
      'signingPayload',
    ]);
    expect(sanitized.fields).toEqual([{ label: 'Recipient', value: '0x1234...5678' }]);
    expect(truncateAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe('0x1234...5678');
  });

  it('usa fallback seguro si no hay mapper especifico', () => {
    const viewModel = mapPendingConfirmationToSheetModel({
      result: {
        status: 'pending_confirmation',
        toolId: 'web3.review_approval_mock',
        message: 'pending',
        confirmationToken: 'token-2',
      },
      params: {},
      record: {
        token: 'token-2',
        toolId: 'web3.review_approval_mock',
        safeSummary: 'Accion pendiente de confirmacion',
        requestedAt: '2030-01-01T00:00:00.000Z',
        expiresAt: '2030-01-01T01:00:00.000Z',
        paramsHash: 'mock_hash',
      },
    });

    expect(viewModel.body).toContain('Accion pendiente');
    expect(viewModel.fields.length).toBe(3);
  });
});

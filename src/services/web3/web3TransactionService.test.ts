import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../utils/wallet', () => ({
  getStoredWalletBundle: vi.fn(),
}));

import { getTokenBySymbol } from '../wallet/tokenRegistry';
import {
  buildErc20ApproveData,
  buildErc20TransferData,
  sendErc20Transaction,
  sendExternalWalletTransaction,
  sendNativeTransaction,
} from './web3TransactionService';
import { approveErc20Spender } from './web3ApprovalService';
import { executeSwap, getSwapQuote } from './swap/swapService';
import { sendOrbitWalletAsset } from '../../../utils/walletSend';
import { deployTokenWithExternalWallet } from '../tokens/externalWalletTokenDeployment';

describe('web3TransactionService ERC-20 calldata', () => {
  it('builds transfer calldata with token decimals', () => {
    const data = buildErc20TransferData(
      '0x1111111111111111111111111111111111111111',
      '10.50',
      6,
    );

    expect(data).toBe(
      '0xa9059cbb00000000000000000000000011111111111111111111111111111111111111110000000000000000000000000000000000000000000000000000000000a037a0',
    );
  });

  it('builds approve calldata without unlimited allowance', () => {
    const data = buildErc20ApproveData(
      '0x2222222222222222222222222222222222222222',
      '1',
      6,
    );

    expect(data).toBe(
      '0x095ea7b3000000000000000000000000222222222222222222222222222222222222222200000000000000000000000000000000000000000000000000000000000f4240',
    );
  });
});

describe('tokenRegistry', () => {
  it('keeps Polygon native USDC enabled with the configured contract', () => {
    const token = getTokenBySymbol(137, 'USDC');

    expect(token?.contractAddress).toBe('0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359');
    expect(token?.isEnabled).toBe(true);
    expect(token?.canSend).toBe(true);
  });

  it('keeps tokens without trusted contract disabled', () => {
    const token = getTokenBySymbol(1, 'SAITAMA');

    expect(token?.contractAddress).toBeNull();
    expect(token?.isEnabled).toBe(false);
    expect(token?.pendingAddress).toBe(true);
  });
});

describe('Wallet/Web3 execution hardening', () => {
  it('blocks native send when real execution is disabled', async () => {
    const statuses: string[] = [];

    const result = await sendNativeTransaction(
      {
        provider: {},
        fromAddress: '0x1111111111111111111111111111111111111111',
        toAddress: '0x2222222222222222222222222222222222222222',
        amount: '0.01',
        chainId: 1,
      },
      (status) => statuses.push(status),
    );

    expect(result.status).toBe('blocked');
    expect(result.txHash).toBeNull();
    expect(statuses).toEqual(['failed']);
  });

  it('blocks ERC-20 send when external send is disabled', async () => {
    const result = await sendErc20Transaction(
      {
        provider: {},
        fromAddress: '0x1111111111111111111111111111111111111111',
        toAddress: '0x2222222222222222222222222222222222222222',
        amount: '1',
        chainId: 1,
        token: {} as never,
      },
      () => undefined,
    );

    expect(result.status).toBe('blocked');
    expect(result.txHash).toBeNull();
  });

  it('blocks external wallet send when external send is disabled', async () => {
    const result = await sendExternalWalletTransaction({
      provider: {},
      fromAddress: '0x1111111111111111111111111111111111111111',
      toAddress: '0x2222222222222222222222222222222222222222',
      amountNative: '0.01',
      chainId: 1,
    });

    expect(result.status).toBe('blocked');
    expect(result.hash).toBeNull();
  });

  it('blocks approve when approvals are disabled', async () => {
    const result = await approveErc20Spender(
      {} as never,
      '0x2222222222222222222222222222222222222222',
      '1',
      1,
      {},
      () => undefined,
    );

    expect(result.status).toBe('blocked');
    expect(result.txHash).toBeNull();
  });

  it('blocks local mnemonic signing before reading the local wallet', async () => {
    await expect(
      sendOrbitWalletAsset('eth', '0x2222222222222222222222222222222222222222', 0.01),
    ).rejects.toThrow('WEB3_LOCAL_SEND_DISABLED');
  });

  it('blocks token deployment when token deploy is disabled', async () => {
    await expect(
      deployTokenWithExternalWallet({
        draft: {} as never,
        wallet: {
          address: '0x1111111111111111111111111111111111111111',
          eip155Provider: {},
        } as never,
      }),
    ).rejects.toMatchObject({ code: 'deployment_not_enabled' });
  });

  it('keeps swap disabled with no fake quote or execution', async () => {
    await expect(getSwapQuote({} as never)).rejects.toThrow('SWAP_NOT_ENABLED');

    const result = await executeSwap({ userConfirmed: true } as never);

    expect(result.status).toBe('disabled');
    expect(result.txHash).toBeNull();
  });
});

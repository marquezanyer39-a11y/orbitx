export const dexConstants = {
  feeRate: 0.001,
  simulatedSlippage: 0.0015,
  supportedDexByNetwork: {
    ethereum: ['Uniswap'],
    base: ['Base Swap'],
    bnb: ['PancakeSwap'],
    solana: ['Jupiter'],
  },
} as const;

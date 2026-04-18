export type TabParamList = {
  home: undefined;
  markets: undefined;
  trade: { pairId?: string; side?: 'buy' | 'sell' } | undefined;
  wallet: undefined;
  profile: undefined;
};

export type RootStackParamList = {
  '(tabs)': undefined;
  security: undefined;
  receive: { network?: string } | undefined;
  send: { network?: string } | undefined;
  pairSelector: { pairId?: string } | undefined;
  tradeChart: { pairId?: string } | undefined;
};

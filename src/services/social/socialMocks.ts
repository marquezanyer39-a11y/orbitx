export interface Gift {
  id: string;
  name: string;
  asset: string;
  amount: number;
  isMock: boolean;
}

// SOCIAL_MOCK - catalogo temporal. No mueve dinero real.
export const mockGiftCatalog: Gift[] = [
  {
    id: 'gift-star-usdt',
    name: 'Estrella QVEX',
    asset: 'USDT',
    amount: 1,
    isMock: true,
  },
  {
    id: 'gift-diamond-usdt',
    name: 'Diamante QVEX',
    asset: 'USDT',
    amount: 5,
    isMock: true,
  },
];

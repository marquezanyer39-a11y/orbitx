import { createOkxError, OKX_ERROR_CODES, sanitizeOkxMetadata } from './okx-errors.js';

function asObject(value) {
  return value && typeof value === 'object' ? value : {};
}

function asNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function asString(value, fallback = '') {
  const text = `${value ?? ''}`.trim();
  return text || fallback;
}

function nowIso() {
  return new Date().toISOString();
}

export function normalizeOkxSymbol(symbol) {
  return asString(symbol, 'UNKNOWN').toUpperCase();
}

export function mapOkxSide(value) {
  return `${value ?? ''}`.toLowerCase() === 'sell' ? 'sell' : 'buy';
}

export function mapOkxOrderType(value) {
  const normalized = `${value ?? ''}`.toLowerCase();
  if (normalized.includes('market')) return 'market';
  if (normalized.includes('stop')) return 'stop';
  return 'limit';
}

export function mapOkxOrderStatus(value) {
  const normalized = `${value ?? ''}`.toLowerCase();
  if (['filled', 'full_filled'].includes(normalized)) return 'filled';
  if (['canceled', 'cancelled'].includes(normalized)) return 'cancelled';
  if (['rejected', 'failed'].includes(normalized)) return 'rejected';
  if (['live', 'open', 'partially_filled'].includes(normalized)) return 'open';
  return 'pending';
}

export function mapOkxBalance(raw, accountId = 'okx-account') {
  const balance = asObject(raw);
  const asset = asString(balance.ccy ?? balance.asset ?? balance.currency, 'UNKNOWN').toUpperCase();
  const available = asNumber(balance.availBal ?? balance.available ?? balance.cashBal);
  const frozen = asNumber(balance.frozenBal ?? balance.frozen ?? balance.locked);
  const total = asNumber(balance.eq ?? balance.total ?? balance.balance, available + frozen);
  const updatedAt = asString(balance.uTime ?? balance.updatedAt, nowIso());

  return [
    {
      id: `okx:${accountId}:${asset}:available`,
      providerId: 'okx',
      accountId,
      asset,
      type: 'available',
      amount: available,
      isDemo: false,
      updatedAt,
      metadata: { source: 'okx-mapper' },
    },
    {
      id: `okx:${accountId}:${asset}:frozen`,
      providerId: 'okx',
      accountId,
      asset,
      type: 'frozen',
      amount: frozen,
      isDemo: false,
      updatedAt,
      metadata: { source: 'okx-mapper' },
    },
    {
      id: `okx:${accountId}:${asset}:total`,
      providerId: 'okx',
      accountId,
      asset,
      type: 'total',
      amount: total,
      usdValue: asNumber(balance.eqUsd ?? balance.usdValue, undefined),
      isDemo: false,
      updatedAt,
      metadata: { source: 'okx-mapper' },
    },
  ];
}

export function mapOkxBalances(raw, accountId = 'okx-account') {
  const rows = Array.isArray(raw) ? raw : asObject(raw).data;
  return (Array.isArray(rows) ? rows : []).flatMap((item) => mapOkxBalance(item, accountId));
}

export function mapOkxOrder(raw, accountId = 'okx-account') {
  const order = asObject(raw);
  const providerOrderId = asString(order.ordId ?? order.orderId, 'pending');
  const symbol = normalizeOkxSymbol(order.instId ?? order.symbol);
  const createdAt = asString(order.cTime ?? order.createdAt, nowIso());
  const updatedAt = asString(order.uTime ?? order.updatedAt, createdAt);

  return {
    id: `okx:${providerOrderId}`,
    providerId: 'okx',
    accountId,
    symbol,
    side: mapOkxSide(order.side),
    type: mapOkxOrderType(order.ordType ?? order.type),
    status: mapOkxOrderStatus(order.state ?? order.status),
    price: asNumber(order.px ?? order.price, undefined),
    quantity: asNumber(order.sz ?? order.quantity),
    filledQuantity: asNumber(order.accFillSz ?? order.filledQuantity),
    averagePrice: asNumber(order.avgPx ?? order.averagePrice, undefined),
    fee: asNumber(order.fee, undefined),
    feeAsset: asString(order.feeCcy ?? order.feeAsset, undefined),
    isSimulated: false,
    createdAt,
    updatedAt,
    providerOrderId,
    metadata: sanitizeOkxMetadata({ source: 'okx-mapper', rawStatus: order.state ?? order.status }),
  };
}

export function mapOkxTrade(raw, accountId = 'okx-account') {
  const trade = asObject(raw);
  const tradeId = asString(trade.tradeId ?? trade.fillId, 'pending');

  return {
    id: `okx:${tradeId}`,
    providerId: 'okx',
    accountId,
    orderId: asString(trade.ordId ?? trade.orderId, undefined),
    symbol: normalizeOkxSymbol(trade.instId ?? trade.symbol),
    side: mapOkxSide(trade.side),
    price: asNumber(trade.fillPx ?? trade.price),
    quantity: asNumber(trade.fillSz ?? trade.quantity),
    fee: asNumber(trade.fee, undefined),
    feeAsset: asString(trade.feeCcy ?? trade.feeAsset, undefined),
    isSimulated: false,
    executedAt: asString(trade.ts ?? trade.executedAt, nowIso()),
    metadata: { source: 'okx-mapper' },
  };
}

export function mapOkxPosition(raw, accountId = 'okx-account') {
  const position = asObject(raw);
  const symbol = normalizeOkxSymbol(position.instId ?? position.symbol);
  const side = `${position.posSide ?? position.side ?? 'net'}`.toLowerCase();

  return {
    id: `okx:${accountId}:${symbol}:${side}`,
    providerId: 'okx',
    accountId,
    symbol,
    side: side === 'long' || side === 'short' ? side : 'net',
    quantity: asNumber(position.pos ?? position.quantity),
    entryPrice: asNumber(position.avgPx ?? position.entryPrice),
    markPrice: asNumber(position.markPx ?? position.markPrice, undefined),
    unrealizedPnl: asNumber(position.upl ?? position.unrealizedPnl, undefined),
    leverage: asNumber(position.lever ?? position.leverage, undefined),
    liquidationPrice: asNumber(position.liqPx ?? position.liquidationPrice, undefined),
    updatedAt: asString(position.uTime ?? position.updatedAt, nowIso()),
    metadata: { source: 'okx-mapper' },
  };
}

export function mapOkxInstrument(raw) {
  const instrument = asObject(raw);
  const symbol = normalizeOkxSymbol(instrument.instId ?? instrument.symbol);

  return {
    id: `okx:${symbol}`,
    providerId: 'okx',
    symbol,
    baseAsset: asString(instrument.baseCcy ?? instrument.baseAsset, symbol.split('-')[0] ?? 'UNKNOWN'),
    quoteAsset: asString(instrument.quoteCcy ?? instrument.quoteAsset, symbol.split('-')[1] ?? 'USDT'),
    marketType: `${instrument.instType ?? ''}`.toUpperCase() === 'SWAP' ? 'futures' : 'spot',
    isActive: `${instrument.state ?? 'live'}`.toLowerCase() !== 'suspend',
    minOrderSize: asNumber(instrument.minSz ?? instrument.minOrderSize, undefined),
    tickSize: asNumber(instrument.tickSz ?? instrument.tickSize, undefined),
    lotSize: asNumber(instrument.lotSz ?? instrument.lotSize, undefined),
    updatedAt: nowIso(),
    metadata: { source: 'okx-mapper' },
  };
}

export function mapOkxAccountStatus(raw, userId = 'unknown') {
  const account = asObject(raw);

  return {
    id: `okx:${userId}`,
    providerId: 'okx',
    type: 'sub_account',
    status: account.linked ? 'disconnected' : 'not_configured',
    displayName: 'OKX Broker',
    isDemo: false,
    isRealTradingEnabled: false,
    updatedAt: nowIso(),
    metadata: sanitizeOkxMetadata({
      source: 'okx-mapper',
      permissions: account.permissions ?? [],
    }),
  };
}

export function mapOkxFee(raw) {
  const fee = asObject(raw);

  return {
    id: `okx:fee:${normalizeOkxSymbol(fee.instId ?? fee.symbol ?? fee.marketType ?? 'spot')}`,
    providerId: 'okx',
    symbol: fee.instId ? normalizeOkxSymbol(fee.instId) : undefined,
    marketType: `${fee.instType ?? fee.marketType ?? 'spot'}`.toUpperCase() === 'SWAP' ? 'futures' : 'spot',
    makerFeeRate: asNumber(fee.maker ?? fee.makerFeeRate),
    takerFeeRate: asNumber(fee.taker ?? fee.takerFeeRate),
    asset: fee.ccy ? asString(fee.ccy).toUpperCase() : undefined,
    updatedAt: nowIso(),
  };
}

export function mapOkxError(error) {
  if (error?.code && error?.message) {
    return {
      code: error.code,
      message: error.message,
      providerId: 'okx',
      isRetryable: ['OKX_RATE_LIMITED', 'OKX_REQUEST_FAILED'].includes(error.code),
      metadata: sanitizeOkxMetadata(error.metadata),
    };
  }

  return {
    code: OKX_ERROR_CODES.UNKNOWN_PROVIDER_ERROR,
    message: 'Error OKX no reconocido.',
    providerId: 'okx',
    isRetryable: false,
    metadata: sanitizeOkxMetadata(error),
  };
}

export function ensureNoRawOkxPayload(payload) {
  if (payload?.data && !Array.isArray(payload)) {
    throw createOkxError(
      OKX_ERROR_CODES.OKX_REQUEST_FAILED,
      'Payload OKX crudo detectado. Debe mapearse antes de responder al frontend.',
      undefined,
      500,
    );
  }

  return payload;
}

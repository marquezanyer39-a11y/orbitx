import { requestOkx } from './okx-http-client.js';
import {
  createOkxError,
  createRealTradingDisabledError,
  OKX_ERROR_CODES,
} from './okx-errors.js';
import {
  mapOkxInstrument,
  mapOkxOrder,
  mapOkxPosition,
  mapOkxTrade,
} from './okx-mappers.js';

function requireIdempotencyKey(idempotencyKey) {
  const value = `${idempotencyKey ?? ''}`.trim();
  if (!value) {
    throw createOkxError(
      OKX_ERROR_CODES.OKX_ORDER_REJECTED,
      'idempotencyKey requerido para operaciones OKX.',
      undefined,
      422,
    );
  }
  return value;
}

export async function getInstruments(env = process.env) {
  const raw = await requestOkx({ path: '/api/v5/public/instruments', query: { instType: 'SPOT' }, env });
  const rows = Array.isArray(raw) ? raw : raw?.data;
  return (Array.isArray(rows) ? rows : []).map(mapOkxInstrument);
}

export async function getTicker(symbol, env = process.env) {
  const normalizedSymbol = `${symbol ?? ''}`.trim().toUpperCase();
  const raw = await requestOkx({
    path: '/api/v5/market/ticker',
    query: { instId: normalizedSymbol },
    env,
  });
  const ticker = Array.isArray(raw?.data) ? raw.data[0] : {};

  return {
    symbol: normalizedSymbol,
    providerId: 'okx',
    price: Number(ticker?.last ?? 0),
    change24h: Number(ticker?.sodUtc8 ?? 0),
    high24h: Number(ticker?.high24h ?? 0),
    low24h: Number(ticker?.low24h ?? 0),
    volume24h: Number(ticker?.vol24h ?? 0),
    source: 'live',
    updatedAt: new Date().toISOString(),
  };
}

export async function getOrderBook(symbol, env = process.env) {
  const normalizedSymbol = `${symbol ?? ''}`.trim().toUpperCase();
  const raw = await requestOkx({
    path: '/api/v5/market/books',
    query: { instId: normalizedSymbol },
    env,
  });
  const book = Array.isArray(raw?.data) ? raw.data[0] : {};
  const mapLevel = (level) => {
    const price = Number(level?.[0] ?? 0);
    const quantity = Number(level?.[1] ?? 0);
    return { price, quantity, total: price * quantity };
  };

  return {
    symbol: normalizedSymbol,
    providerId: 'okx',
    bids: (book?.bids ?? []).map(mapLevel),
    asks: (book?.asks ?? []).map(mapLevel),
    source: 'live',
    updatedAt: new Date().toISOString(),
  };
}

export async function placeOrder(_userId, _orderRequest, idempotencyKey, _env = process.env) {
  requireIdempotencyKey(idempotencyKey);
  throw createRealTradingDisabledError('placeOrder OKX bloqueado: trading real no esta habilitado.');
}

export async function cancelOrder(_userId, _orderId, _env = process.env) {
  throw createRealTradingDisabledError('cancelOrder OKX bloqueado: trading real no esta habilitado.');
}

export async function getOpenOrders(userId, env = process.env) {
  const raw = await requestOkx({ path: '/api/v5/trade/orders-pending', env });
  const rows = Array.isArray(raw) ? raw : raw?.data;
  return (Array.isArray(rows) ? rows : []).map((item) => mapOkxOrder(item, `okx:${userId}`));
}

export async function getOrderHistory(userId, params = {}, env = process.env) {
  const raw = await requestOkx({ path: '/api/v5/trade/orders-history', query: params, env });
  const rows = Array.isArray(raw) ? raw : raw?.data;
  return (Array.isArray(rows) ? rows : []).map((item) => mapOkxOrder(item, `okx:${userId}`));
}

export async function getTradeHistory(userId, params = {}, env = process.env) {
  const raw = await requestOkx({ path: '/api/v5/trade/fills-history', query: params, env });
  const rows = Array.isArray(raw) ? raw : raw?.data;
  return (Array.isArray(rows) ? rows : []).map((item) => mapOkxTrade(item, `okx:${userId}`));
}

export async function getPositions(userId, env = process.env) {
  const raw = await requestOkx({ path: '/api/v5/account/positions', env });
  const rows = Array.isArray(raw) ? raw : raw?.data;
  return (Array.isArray(rows) ? rows : []).map((item) => mapOkxPosition(item, `okx:${userId}`));
}

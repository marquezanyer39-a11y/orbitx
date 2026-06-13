import express from 'express';

import { getAccountStatus, getBalances, getFees } from './okx-account-service.js';
import { getBrokerStatus, toTradingProviderStatus } from './okx-broker-service.js';
import { getOkxConnectUrl, handleOkxCallback, disconnectOkxAccount } from './okx-oauth-service.js';
import {
  getInstruments,
  getTicker,
  getOrderBook,
  placeOrder,
  cancelOrder,
  getOpenOrders,
  getOrderHistory,
  getTradeHistory,
  getPositions,
} from './okx-trading-service.js';
import { createTransfer } from './okx-transfer-service.js';
import { reconcileOkxWithLedger } from './okx-reconciliation-service.js';
import { toOkxErrorResponse } from './okx-errors.js';

function getUserId(req) {
  return `${req.headers['x-orbitx-user-id'] ?? req.query.userId ?? req.body?.userId ?? ''}`.trim();
}

function getIdempotencyKey(req) {
  return `${req.headers['idempotency-key'] ?? req.body?.idempotencyKey ?? ''}`.trim();
}

function sendError(res, error) {
  const safeError = toOkxErrorResponse(error);
  res.status(safeError.status).json(safeError.body);
}

function asyncRoute(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      sendError(res, error);
    }
  };
}

export function createOkxRouter() {
  const router = express.Router();

  router.get('/providers/okx/status', asyncRoute(async (_req, res) => {
    res.json(await getBrokerStatus());
  }));

  router.get('/providers/okx/connect-url', asyncRoute(async (req, res) => {
    res.json(await getOkxConnectUrl(getUserId(req), req.query.redirectUri));
  }));

  router.get('/providers/okx/callback', asyncRoute(async (req, res) => {
    res.json(await handleOkxCallback(req.query.code, req.query.state));
  }));

  router.post('/providers/okx/disconnect', asyncRoute(async (req, res) => {
    res.json(await disconnectOkxAccount(getUserId(req)));
  }));

  router.get('/trading/provider/status', asyncRoute(async (_req, res) => {
    const brokerStatus = await getBrokerStatus();
    res.json(toTradingProviderStatus(brokerStatus.status));
  }));

  router.get('/trading/provider/capabilities', asyncRoute(async (_req, res) => {
    const brokerStatus = await getBrokerStatus();
    res.json(brokerStatus.capabilities);
  }));

  router.get('/trading/account/status', asyncRoute(async (req, res) => {
    res.json(await getAccountStatus(getUserId(req)));
  }));

  router.get('/trading/instruments', asyncRoute(async (_req, res) => {
    res.json(await getInstruments());
  }));

  router.get('/trading/ticker', asyncRoute(async (req, res) => {
    res.json(await getTicker(req.query.symbol));
  }));

  router.get('/trading/orderbook', asyncRoute(async (req, res) => {
    res.json(await getOrderBook(req.query.symbol));
  }));

  router.get('/trading/balances', asyncRoute(async (req, res) => {
    res.json(await getBalances(getUserId(req)));
  }));

  router.post('/trading/orders', asyncRoute(async (req, res) => {
    res.status(403).json(await placeOrder(getUserId(req), req.body, getIdempotencyKey(req)));
  }));

  router.delete('/trading/orders/:id', asyncRoute(async (req, res) => {
    res.status(403).json(await cancelOrder(getUserId(req), req.params.id));
  }));

  router.get('/trading/orders/open', asyncRoute(async (req, res) => {
    res.json(await getOpenOrders(getUserId(req)));
  }));

  router.get('/trading/orders/history', asyncRoute(async (req, res) => {
    res.json(await getOrderHistory(getUserId(req), req.query));
  }));

  router.get('/trading/trades/history', asyncRoute(async (req, res) => {
    res.json(await getTradeHistory(getUserId(req), req.query));
  }));

  router.get('/trading/positions', asyncRoute(async (req, res) => {
    res.json(await getPositions(getUserId(req)));
  }));

  router.get('/trading/fees', asyncRoute(async (req, res) => {
    res.json(await getFees(getUserId(req)));
  }));

  router.post('/trading/transfers', asyncRoute(async (req, res) => {
    res.status(403).json(await createTransfer(getUserId(req), req.body, getIdempotencyKey(req)));
  }));

  router.post('/trading/reconcile', asyncRoute(async (req, res) => {
    res.json(await reconcileOkxWithLedger('okx', req.body?.asset));
  }));

  return router;
}

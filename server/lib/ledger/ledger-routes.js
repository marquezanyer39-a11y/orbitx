import express from 'express';

const DISABLED_RESPONSE = {
  code: 'LEDGER_BACKEND_DISABLED',
  message:
    'Ledger backend real aun no esta habilitado. Requiere auth, roles, rate limit, DB ACID e idempotencia antes de produccion.',
};

function disabledRoute(_req, res) {
  res.status(503).json(DISABLED_RESPONSE);
}

export function createLedgerRouter() {
  const router = express.Router();

  router.get('/ledger/balances/:userId', disabledRoute);
  router.get('/ledger/accounts/:userId', disabledRoute);
  router.get('/ledger/transactions/:userId', disabledRoute);
  router.post('/ledger/movements', disabledRoute);

  router.post('/pool/:poolId/subscribe', disabledRoute);
  router.post('/pool/:poolId/redeem', disabledRoute);
  router.get('/pool/:poolId/position/:userId', disabledRoute);
  router.post('/pool/:poolId/distribute-rewards', disabledRoute);

  router.post('/social/gifts/send', disabledRoute);
  router.post('/social/gifts/refund', disabledRoute);

  router.post('/rewards/credit', disabledRoute);
  router.post('/fees/collect', disabledRoute);

  router.post('/ledger/reconcile', disabledRoute);

  return router;
}

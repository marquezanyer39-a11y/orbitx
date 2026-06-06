# Trading Provider Contract

## Endpoints internos esperados

Trading:

- `GET /trading/provider/status`
- `GET /trading/provider/capabilities`
- `GET /trading/account/status`
- `GET /trading/instruments`
- `GET /trading/ticker?symbol=BTC-USDT`
- `GET /trading/orderbook?symbol=BTC-USDT`
- `GET /trading/balances`
- `GET /trading/orders/open`
- `GET /trading/orders/history`
- `GET /trading/trades/history`
- `GET /trading/positions`
- `GET /trading/fees`
- `POST /trading/orders`
- `DELETE /trading/orders/:id`
- `POST /trading/transfers`

Ledger:

- `GET /ledger/accounts`
- `GET /ledger/balances`
- `POST /ledger/transactions`
- `POST /ledger/pool/subscribe`
- `POST /ledger/pool/redeem`
- `POST /ledger/social/gifts`
- `POST /ledger/rewards/credit`
- `POST /ledger/fees/collect`
- `POST /ledger/withdrawals/request`
- `POST /ledger/withdrawals/complete`
- `POST /ledger/reconciliation/provider`

## Secretos

API secret de OKX, Binance, MEXC o cualquier proveedor nunca debe vivir en frontend. La firma privada se hace solo en backend.

## Broker code/tag

Si el proveedor usa broker code, affiliate tag o campaign tag, debe guardarse y firmarse en backend. El frontend solo recibe estados internos.

## Subcuentas

Las subcuentas se modelan como `TradingAccount` de tipo `sub_account`. El backend decide proveedor, permisos y reconciliacion.

## Permisos minimos

Para proveedor broker real:

- lectura de balances
- lectura de instrumentos
- lectura de ordenes
- creacion/cancelacion de ordenes si esta aprobado
- transfers internos solo si el contrato lo permite
- withdrawals deshabilitados por defecto hasta auditoria

## Auditoria y logging

Cada orden y movimiento debe registrar:

- user id
- provider id
- request id
- idempotency key
- payload interno
- respuesta normalizada
- provider reference
- timestamp
- resultado
- error normalizado si aplica

## Idempotency keys

Todo movimiento financiero requiere idempotency key:

- ordenes
- transfers
- withdrawals
- rewards
- fees
- pool subscribe/redeem
- social gifts

Sin idempotency key no debe ejecutarse dinero real.

## OKX Provider Backend Contract

La integracion OKX vive solo en backend:

```text
OrbitX App -> OrbitX Backend -> OKX Broker API
```

La app no debe llamar a OKX directamente, no debe firmar requests privadas y no debe recibir tokens OAuth ni secrets.

### Variables backend-only

- `OKX_BROKER_CLIENT_ID`
- `OKX_BROKER_CLIENT_SECRET`
- `OKX_BROKER_CODE`
- `OKX_API_BASE_URL`
- `OKX_ENV=sandbox|production`
- `OKX_WEBHOOK_SECRET`
- `OKX_ALLOW_PRODUCTION=false`
- `OKX_ENABLE_NETWORK_REQUESTS=false`
- `OKX_REAL_TRADING_ENABLED=false`

Ninguna variable OKX debe usar prefijo `EXPO_PUBLIC`.

### Endpoints provider management

- `GET /providers/okx/status`
- `GET /providers/okx/connect-url`
- `GET /providers/okx/callback`
- `POST /providers/okx/disconnect`

### Endpoints trading OKX preparados

- `GET /trading/provider/status`
- `GET /trading/provider/capabilities`
- `GET /trading/account/status`
- `GET /trading/instruments`
- `GET /trading/ticker`
- `GET /trading/orderbook`
- `GET /trading/balances`
- `POST /trading/orders`
- `DELETE /trading/orders/:id`
- `GET /trading/orders/open`
- `GET /trading/orders/history`
- `GET /trading/trades/history`
- `GET /trading/positions`
- `GET /trading/fees`
- `POST /trading/transfers`
- `POST /trading/reconcile`

### Errores normalizados OKX

- `PROVIDER_NOT_CONFIGURED`
- `REAL_TRADING_DISABLED`
- `OKX_AUTH_REQUIRED`
- `OKX_TOKEN_EXPIRED`
- `OKX_REQUEST_FAILED`
- `OKX_RATE_LIMITED`
- `OKX_PERMISSION_DENIED`
- `OKX_ACCOUNT_NOT_LINKED`
- `OKX_ORDER_REJECTED`
- `OKX_TRANSFER_REJECTED`
- `OKX_RECONCILIATION_MISMATCH`
- `NOT_IMPLEMENTED`
- `UNKNOWN_PROVIDER_ERROR`

### Estado actual

- OKX Broker esta preparado como stubs backend.
- Trading real sigue deshabilitado.
- Network requests a OKX estan bloqueados por defecto.
- Produccion queda bloqueada salvo `OKX_ALLOW_PRODUCTION=true`.
- `POST /trading/orders` y `POST /trading/transfers` requieren `idempotencyKey` y devuelven `REAL_TRADING_DISABLED` en esta fase.
- Reconciliacion OKX vs Ledger esta definida, pero no compara saldos reales hasta conectar Ledger Backend y proveedor aprobado.

### Readiness partner backend

Antes de activar sandbox o produccion OKX, el backend debe tener:

- Auth real para no confiar en `userId` enviado por frontend.
- RBAC para admin, finance y compliance.
- Provider accounts persistentes en `provider_accounts`.
- Tokens OAuth cifrados en `provider_oauth_tokens`.
- Idempotencia persistente en `idempotency_keys`.
- Audit logs en `backend_audit_logs`.
- Jobs de reconciliacion en `provider_reconciliation_jobs`.
- Rate limits y observabilidad.

Flags actuales esperados:

- `AUTH_REQUIRED=false` hasta integrar proveedor auth real.
- `RBAC_ENABLED=false` hasta cargar roles desde DB.
- `IDEMPOTENCY_PERSISTENCE_ENABLED=false` hasta tener DB ACID.
- `PROVIDER_ACCOUNTS_ENABLED=false` hasta migrar schema.
- `LEDGER_BACKEND_ENABLED=false` hasta completar ledger real.

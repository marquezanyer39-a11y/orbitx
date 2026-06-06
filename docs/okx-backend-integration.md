# OKX Backend Integration — OrbitX

## Arquitectura correcta

OrbitX debe integrar OKX solo por backend:

```text
OrbitX App
-> OrbitX Backend
-> OKX Broker API
```

La app movil nunca debe contener `OKX_BROKER_CLIENT_SECRET`, tokens OAuth, passphrases, API secrets ni firmas privadas. El frontend consume modelos internos OrbitX y endpoints internos `/trading/...` o `/providers/okx/...`.

## Estado de esta fase

La integracion queda preparada como contrato backend. No conecta OKX real, no activa trading real, no mueve fondos y no guarda tokens.

Servicios creados:

- `server/lib/providers/okx/okx-config.js`
- `server/lib/providers/okx/okx-errors.js`
- `server/lib/providers/okx/okx-http-client.js`
- `server/lib/providers/okx/okx-oauth-service.js`
- `server/lib/providers/okx/okx-broker-service.js`
- `server/lib/providers/okx/okx-account-service.js`
- `server/lib/providers/okx/okx-trading-service.js`
- `server/lib/providers/okx/okx-transfer-service.js`
- `server/lib/providers/okx/okx-reconciliation-service.js`
- `server/lib/providers/okx/okx-mappers.js`
- `server/lib/providers/okx/okx-routes.js`
- `server/lib/providers/okx/index.js`

## Variables backend-only

Estas variables viven solo en `server/.env` o en el entorno del proveedor backend. Nunca deben existir con prefijo `EXPO_PUBLIC`.

- `OKX_BROKER_CLIENT_ID`
- `OKX_BROKER_CLIENT_SECRET`
- `OKX_BROKER_CODE`
- `OKX_API_BASE_URL`
- `OKX_ENV=sandbox|production`
- `OKX_WEBHOOK_SECRET`
- `OKX_ALLOW_PRODUCTION=false`
- `OKX_ENABLE_NETWORK_REQUESTS=false`
- `OKX_REAL_TRADING_ENABLED=false`

`OKX_ALLOW_PRODUCTION`, `OKX_ENABLE_NETWORK_REQUESTS` y `OKX_REAL_TRADING_ENABLED` son flags de seguridad backend-only. Deben permanecer en `false` hasta tener aprobacion legal, auditoria, auth, roles, rate limits, DB cifrada, idempotencia y reconciliacion real.

## Provider status

`okx-config.js` devuelve estados seguros:

- `not_configured`: faltan `OKX_BROKER_CLIENT_ID`, `OKX_BROKER_CLIENT_SECRET` u `OKX_BROKER_CODE`.
- `disabled`: `OKX_ENV=production` sin `OKX_ALLOW_PRODUCTION=true`.
- `configured`: variables minimas presentes. Aun asi, trading y network pueden seguir bloqueados por flags.

`getOkxConfigSafe()` nunca devuelve `client_secret`, tokens ni secrets completos.

## OAuth / Broker flow futuro

Flujo futuro previsto:

1. App solicita al backend `/providers/okx/connect-url`.
2. Backend genera state seguro y URL OAuth si OKX esta aprobado.
3. OKX redirige a `/providers/okx/callback`.
4. Backend intercambia `authorization_code` por tokens.
5. Backend cifra tokens en DB y asocia `user_id -> provider_user_id`.
6. App recibe solo estado interno, nunca tokens.

En esta fase, `getOkxConnectUrl` y `handleOkxCallback` devuelven `NOT_IMPLEMENTED` o `PROVIDER_NOT_CONFIGURED`.

## Endpoints internos preparados

Provider management:

- `GET /providers/okx/status`
- `GET /providers/okx/connect-url`
- `GET /providers/okx/callback`
- `POST /providers/okx/disconnect`

Trading contract:

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

Los endpoints financieros reales siguen bloqueados. Los `POST` requieren `idempotencyKey` y deben recibir auth/roles/rate limit antes de cualquier entorno productivo.

## Mappers OKX -> OrbitX

`okx-mappers.js` prepara normalizacion de:

- balance OKX -> `TradingBalance`
- order OKX -> `TradingOrder`
- trade OKX -> `TradingTrade`
- position OKX -> `TradingPosition`
- instrument OKX -> `TradingInstrument`
- account status OKX -> `TradingAccount`
- fee OKX -> `TradingFee`
- error OKX -> `TradingError`

Regla: ningun payload crudo OKX debe llegar al frontend si contiene campos no normalizados o sensibles.

## Reconciliacion

Flujo futuro:

```text
OKX provider balance
vs
OrbitX internal ledger total
```

Si existe diferencia:

- no auto-ajustar;
- crear reporte;
- marcar revision manual;
- no crear `MANUAL_ADJUSTMENT` sin actor autorizado, aprobacion y audit trail.

En esta fase, `reconcileOkxWithLedger` devuelve `PROVIDER_NOT_CONFIGURED` o `NOT_IMPLEMENTED`.

## Que falta para produccion

- Aprobacion OKX Broker.
- OAuth real o modelo broker aprobado.
- DB para tokens cifrados.
- Auth middleware y RBAC.
- Rate limits.
- Idempotency persistente.
- Audit logs financieros.
- Ledger backend real conectado.
- Sandbox real.
- Monitoreo y alertas.
- KYC/AML/legal.
- Pruebas de reconciliacion.

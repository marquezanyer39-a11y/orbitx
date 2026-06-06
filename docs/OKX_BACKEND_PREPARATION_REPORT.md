# OKX Backend Integration — OrbitX

## 1. Resumen ejecutivo

Se preparo una capa backend segura para OKX Broker en `server/lib/providers/okx/`. Esta fase no conecta OKX real, no activa trading real, no mueve dinero real, no guarda tokens y no expone secrets al frontend.

La app movil sigue desacoplada: el frontend debe consumir modelos internos OrbitX y llamar al backend OrbitX. OKX queda detras del servidor.

## 2. Backend actual

El backend actual existe en `server/`, usa Express con JavaScript/MJS y carga variables con `server/bootstrap-env.mjs`. Actualmente expone endpoints de Astra/voz/imagen y tiene stubs previos de Ledger, Pool, Social, Rewards y Fees.

Hallazgos:

- `server/index.mjs` es el entrypoint Express.
- No hay router global centralizado, pero ya existe patron de router modular en `server/lib/ledger/ledger-routes.js`.
- No existe DB productiva conectada para ledger financiero.
- No existen scripts backend dedicados `test:server`, `lint:server` ni `typecheck:server`.
- La integracion OKX se monto de forma segura con `app.use(createOkxRouter())`.

## 3. Servicios OKX creados/preparados

- `server/lib/providers/okx/okx-config.js`: lee variables backend-only, expone config segura y bloquea production por defecto.
- `server/lib/providers/okx/okx-errors.js`: errores OKX normalizados y sanitizacion de metadata sensible.
- `server/lib/providers/okx/okx-http-client.js`: wrapper preparado, sin llamadas reales activas.
- `server/lib/providers/okx/okx-oauth-service.js`: stubs seguros de OAuth/connect/callback/refresh/disconnect.
- `server/lib/providers/okx/okx-broker-service.js`: estado broker, capabilities y mapping de provider status.
- `server/lib/providers/okx/okx-account-service.js`: contratos de account status, balances y fees.
- `server/lib/providers/okx/okx-trading-service.js`: contratos de instruments/ticker/orderbook/orders/trades/positions.
- `server/lib/providers/okx/okx-transfer-service.js`: contratos de transferencias bloqueadas.
- `server/lib/providers/okx/okx-reconciliation-service.js`: contrato de reconciliacion OKX vs Ledger.
- `server/lib/providers/okx/okx-mappers.js`: mappers OKX a modelos internos OrbitX.
- `server/lib/providers/okx/okx-routes.js`: endpoints internos seguros.
- `server/lib/providers/okx/index.js`: barrel backend.

Archivo modificado:

- `server/index.mjs`: monta `createOkxRouter()`.
- `server/.env.example`: documenta variables OKX backend-only.

## 4. Variables de entorno

Variables requeridas solo en backend:

- `OKX_BROKER_CLIENT_ID`
- `OKX_BROKER_CLIENT_SECRET`
- `OKX_BROKER_CODE`
- `OKX_API_BASE_URL`
- `OKX_ENV=sandbox|production`
- `OKX_WEBHOOK_SECRET`

Flags de seguridad backend-only:

- `OKX_ALLOW_PRODUCTION=false`
- `OKX_ENABLE_NETWORK_REQUESTS=false`
- `OKX_REAL_TRADING_ENABLED=false`

Confirmacion: no se agrego ninguna variable OKX con prefijo `EXPO_PUBLIC`.

## 5. Endpoints internos

Provider management:

| Endpoint | Estado |
|---|---|
| `GET /providers/okx/status` | preparado, seguro, sin secrets |
| `GET /providers/okx/connect-url` | stub seguro, devuelve `PROVIDER_NOT_CONFIGURED` o `NOT_IMPLEMENTED` |
| `GET /providers/okx/callback` | stub seguro |
| `POST /providers/okx/disconnect` | preparado, no revoca tokens reales porque no existen |

Trading contract:

| Endpoint | Estado |
|---|---|
| `GET /trading/provider/status` | preparado |
| `GET /trading/provider/capabilities` | preparado |
| `GET /trading/account/status` | preparado con estado no vinculado |
| `GET /trading/instruments` | contrato preparado, sin llamada real |
| `GET /trading/ticker` | contrato preparado, sin llamada real |
| `GET /trading/orderbook` | contrato preparado, sin llamada real |
| `GET /trading/balances` | contrato preparado, sin llamada real |
| `POST /trading/orders` | bloqueado, requiere `idempotencyKey`, devuelve `REAL_TRADING_DISABLED` |
| `DELETE /trading/orders/:id` | bloqueado, devuelve `REAL_TRADING_DISABLED` |
| `GET /trading/orders/open` | contrato preparado, sin llamada real |
| `GET /trading/orders/history` | contrato preparado, sin llamada real |
| `GET /trading/trades/history` | contrato preparado, sin llamada real |
| `GET /trading/positions` | contrato preparado, sin llamada real |
| `GET /trading/fees` | contrato preparado, sin llamada real |
| `POST /trading/transfers` | bloqueado, requiere `idempotencyKey`, devuelve `REAL_TRADING_DISABLED` |
| `POST /trading/reconcile` | stub seguro, sin auto-ajustes |

## 6. Seguridad

Confirmado:

- No hay secrets OKX en frontend.
- No hay variables `EXPO_PUBLIC_OKX`.
- No hay signing OKX en app movil.
- OKX real no esta conectado.
- Trading real no esta activado.
- Tokens OKX no se imprimen ni se devuelven.
- Production queda bloqueado por defecto con `OKX_ALLOW_PRODUCTION=false`.
- Network requests OKX quedan bloqueados por defecto con `OKX_ENABLE_NETWORK_REQUESTS=false`.
- Ordenes y transferencias reales devuelven `REAL_TRADING_DISABLED`.
- Los errores sanitizan metadata sensible (`secret`, `token`, `authorization`, `apiKey`, `clientSecret`, etc.).
- No se tocaron Web3, WalletConnect, seed phrase, private keys, Home balance ni Ledger mock frontend.

## 7. Mappers

`okx-mappers.js` prepara normalizacion de:

- OKX balance -> `TradingBalance`
- OKX order -> `TradingOrder`
- OKX trade -> `TradingTrade`
- OKX position -> `TradingPosition`
- OKX instrument -> `TradingInstrument`
- OKX account status -> `TradingAccount`
- OKX fee -> `TradingFee`
- OKX error -> error interno OrbitX

Regla aplicada: no devolver payload crudo OKX al frontend si contiene datos sensibles o no normalizados.

## 8. Reconciliacion

`okx-reconciliation-service.js` prepara `reconcileOkxWithLedger(providerId, asset)`.

Flujo futuro:

```text
OKX provider balance
vs
OrbitX Internal Ledger total
```

Estado actual:

- Sin credenciales OKX: `PROVIDER_NOT_CONFIGURED`.
- Sin Ledger real: `NOT_IMPLEMENTED`.
- No compara saldos reales.
- No crea auto-ajustes.
- No crea `MANUAL_ADJUSTMENT`.

## 9. Documentacion creada

- `docs/okx-backend-integration.md`
- `docs/okx-security-checklist.md`
- `docs/okx-backend-test-cases.md`
- `docs/OKX_BACKEND_PREPARATION_REPORT.md`

Documentacion actualizada:

- `docs/trading-provider-contract.md`
- `server/.env.example`

## 10. Tests/casos de prueba

No existe test setup backend dedicado. Se documentaron casos en `docs/okx-backend-test-cases.md`.

Casos cubiertos:

- `okx-config` sin variables -> `not_configured`.
- Production bloqueado por defecto.
- Config segura sin secrets completos.
- Mapper balance.
- Mapper order.
- `placeOrder` -> `REAL_TRADING_DISABLED`.
- Provider sin envs -> `PROVIDER_NOT_CONFIGURED`.
- Sanitizacion de metadata sensible.
- Endpoints con `idempotencyKey`.
- Reconciliacion sin auto-ajustes.

## 11. Validacion

- `node --check server/index.mjs` y modulos OKX: OK.
- `npm run typecheck`: OK.
- `npm run lint`: OK, 0 errores.
- `npm test -- --passWithNoTests`: OK, 5 archivos / 18 tests.
- `npx expo-doctor`: OK, 18/18 usando `NODE_OPTIONS=--use-system-ca`.

Nota: `expo-doctor` exigio alinear patch versions de paquetes Expo SDK 55. Se actualizaron con `npx expo install` usando `NODE_OPTIONS=--use-system-ca` para superar el certificado local.

Scripts backend:

- `npm run test:server`: no existe.
- `npm run lint:server`: no existe.
- `npm run typecheck:server`: no existe.

## 12. Riesgos pendientes

- Aprobacion OKX Broker.
- Credenciales reales y gestion segura de secretos.
- OAuth real y storage cifrado de tokens.
- DB real para provider user mapping.
- Auth middleware y RBAC en backend.
- Rate limits.
- Audit logs financieros.
- Idempotencia persistente.
- Ledger backend real conectado.
- Sandbox OKX real.
- Reconciliacion real.
- Legal/KYC/AML.
- Monitoreo y alertas.
- Revision de `npm audit`: npm reporto vulnerabilidades existentes tras instalar patches Expo; no se aplico `npm audit fix` para evitar cambios no controlados.

## 13. Siguiente paso recomendado

Antes de conectar OKX real:

1. Implementar auth middleware backend y roles admin/user.
2. Crear DB para `provider_accounts`, tokens cifrados, idempotency keys y audit logs.
3. Implementar tests backend dedicados para config, errores, mappers y rutas.
4. Probar OAuth y lectura en sandbox con cuenta OKX aprobada.
5. Conectar reconciliacion contra Ledger Backend real.
6. Solo despues habilitar `OKX_ENABLE_NETWORK_REQUESTS=true` en sandbox.
7. Mantener `OKX_REAL_TRADING_ENABLED=false` hasta auditoria financiera y legal.

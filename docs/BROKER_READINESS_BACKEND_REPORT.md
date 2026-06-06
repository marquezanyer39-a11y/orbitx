# Broker Readiness Backend - OrbitX

## 1. Resumen ejecutivo

Se preparo la base backend interna para una futura aprobacion OKX Broker sin conectar OKX real, sin activar trading real y sin mover dinero. La fase agrego stubs seguros de Auth/RBAC, idempotencia persistente, provider accounts, schema SQL/documentacion y material tecnico para presentar OrbitX a OKX.

Nada queda productivo todavia. Los nuevos servicios fallan cerrados cuando no hay DB/auth real y devuelven estados como `AUTH_NOT_IMPLEMENTED`, `RBAC_DISABLED`, `IDEMPOTENCY_DISABLED`, `PROVIDER_ACCOUNTS_DISABLED`, `PROVIDER_NOT_CONFIGURED` o `REAL_TRADING_DISABLED`.

## 2. Estado actual

### Ledger

- Existe `server/lib/ledger/` con validadores, doble entrada e idempotencyKey.
- Existen rutas ledger deshabilitadas por defecto.
- No hay DB real conectada.
- No mueve dinero real.
- No esta conectado al Home ni al frontend.

### OKX Provider

- Existe `server/lib/providers/okx/` con stubs seguros.
- OKX real no esta conectado.
- `OKX_ENABLE_NETWORK_REQUESTS=false`.
- `OKX_REAL_TRADING_ENABLED=false`.
- `OKX_ALLOW_PRODUCTION=false`.
- Produccion queda bloqueada por defecto.

### Auth

- Se creo capa backend preparada en `server/lib/auth/`.
- No hay proveedor auth real conectado.
- Endpoints financieros que usen esta capa no deben abrirse sin actor backend validado.

### Roles/RBAC

- Se definieron roles: `user`, `admin`, `compliance`, `finance`, `support`, `developer_readonly`.
- RBAC queda preparado, pero `RBAC_ENABLED=false` hasta tener DB/auth real.

### Idempotency

- Se creo servicio de idempotencia persistente preparado.
- No usa memoria como simulacion productiva.
- Sin DB real devuelve `IDEMPOTENCY_DISABLED`.

### Provider accounts

- Se creo servicio de provider accounts preparado.
- No guarda tokens.
- No persiste provider accounts sin DB.
- Sin DB real devuelve `PROVIDER_ACCOUNTS_DISABLED`.

## 3. Archivos creados

- `server/lib/auth/auth-errors.js`
- `server/lib/auth/auth-middleware.js`
- `server/lib/auth/roles.js`
- `server/lib/auth/index.js`
- `server/lib/idempotency/idempotency-errors.js`
- `server/lib/idempotency/idempotency-service.js`
- `server/lib/idempotency/index.js`
- `server/lib/providers/provider-accounts-errors.js`
- `server/lib/providers/provider-accounts-service.js`
- `server/lib/providers/index.js`
- `docs/backend-provider-accounts-schema.md`
- `docs/okx-broker-application-flow.md`
- `docs/okx-demo-presentation-outline.md`
- `docs/okx-partner-readiness-checklist.md`
- `docs/BROKER_READINESS_BACKEND_REPORT.md`

## 4. Archivos modificados

- `server/.env.example`: se agregaron flags seguros de backend readiness.
- `docs/backend-ledger-architecture.md`: se corrigio encoding del titulo y se agrego seccion de readiness OKX Broker.
- `docs/trading-provider-contract.md`: se agrego seccion de readiness partner backend.

## 5. DB schema preparado

Documentado en `docs/backend-provider-accounts-schema.md`.

Tablas preparadas:

- `provider_accounts`: vinculo usuario OrbitX con proveedor.
- `provider_oauth_tokens`: tokens cifrados por provider account.
- `idempotency_keys`: idempotencia persistente para POST financieros.
- `backend_audit_logs`: auditoria backend inmutable.
- `backend_roles`: roles backend.
- `provider_reconciliation_jobs`: jobs de reconciliacion provider vs ledger.

Reglas incluidas:

- Tokens nunca sin cifrar.
- `idempotencyKey` unico.
- Mismo key + payload distinto = `IDEMPOTENCY_CONFLICT`.
- Audit logs sin secrets.
- Reconciliacion sin auto-ajustes.
- Roles admin/finance/compliance para acciones sensibles.

## 6. Auth/RBAC

Preparado:

- `requireAuth(req, res, next)`
- `requireRole(roles)`
- `requireAdmin`
- `getRequestActor(req)`
- `createAuthError(code, message, metadata)`

Comportamiento seguro actual:

- Si no hay actor backend real, no confia en headers del frontend.
- Si auth no esta configurado, devuelve `AUTH_NOT_IMPLEMENTED`.
- Si RBAC no esta habilitado, devuelve `RBAC_DISABLED`.

Falta:

- Integrar proveedor auth real.
- Validar JWT/session backend.
- Cargar roles desde DB.
- Rate limit por actor/IP.

## 7. Idempotency

Preparado:

- `requireIdempotencyKey(req)`
- `createRequestHash(payload)`
- `checkIdempotency(key, operationType)`
- `saveProcessingKey(key, operationType, userId, requestHash)`
- `saveCompletedKey(key, responseSnapshot)`
- `saveFailedKey(key, error)`
- `replayIdempotentResponse(key)`

Comportamiento seguro actual:

- POST financiero sin key debe fallar con 422.
- No hay simulacion productiva en memoria.
- Sin DB real devuelve `IDEMPOTENCY_DISABLED`.
- Hash sanitiza claves sensibles antes de calcular snapshot.

Falta:

- Implementar tabla `idempotency_keys`.
- Ejecutar operaciones dentro de DB transaction.
- Guardar/replay de `response_snapshot`.

## 8. Provider Accounts

Preparado:

- `getProviderAccount(userId, providerId)`
- `createProviderAccount(userId, providerId, metadata)`
- `updateProviderAccountStatus(providerAccountId, status)`
- `linkProviderUser(userId, providerId, providerUserId)`
- `disconnectProviderAccount(userId, providerId)`
- `getProviderPermissions(userId, providerId)`
- `getProviderAccountStatus(userId, providerId)`

Comportamiento seguro actual:

- Valida `providerId`, `userId` y status.
- No guarda tokens.
- No acepta provider user real desde cliente.
- Sin DB real devuelve `PROVIDER_ACCOUNTS_DISABLED`.

Falta:

- Migracion DB real.
- OAuth real backend.
- Cifrado de tokens.
- Audit log de cambios.

## 9. Ledger readiness

Se reforzo la documentacion del ledger para dejar claro que:

- El ledger backend sigue en modo contrato/stub.
- No debe habilitarse sin `LEDGER_BACKEND_ENABLED=true`.
- Requiere DB ACID, auth, RBAC, audit logs e idempotencia persistente.
- No debe conectarse al Home ni reemplazar mocks frontend todavia.

## 10. OKX Broker Flow

Documentado en `docs/okx-broker-application-flow.md`.

Resumen:

```text
OrbitX App
-> OrbitX Backend Auth
-> OrbitX Backend Ledger
-> Provider Accounts
-> OKX Broker API
-> Reconciliation
```

El flujo define:

- OAuth futuro.
- Tokens cifrados en backend.
- Ordenes con idempotencia.
- Transfers/withdrawals bloqueados hasta approval.
- Reconciliacion OKX vs OrbitX Ledger.
- Productos internos: Pool, Social Gifts, Rewards y VIP.

## 11. Demo para OKX

Documentado en `docs/okx-demo-presentation-outline.md`.

Incluye:

- Presentacion de OrbitX.
- Problema que resuelve.
- Pantallas clave para demo.
- Arquitectura tecnica.
- Seguridad.
- Modelo broker.
- Roadmap 90 dias.
- Solicitud a OKX: broker approval, sandbox, OAuth/Broker access y terms.

## 12. Partner Readiness Checklist

Documentado en `docs/okx-partner-readiness-checklist.md`.

Resumen:

- Listo: no secrets frontend, trading bloqueado, Bot Futures seguro, OKX no conectado.
- Parcial: APK interna, OKX provider backend, ledger backend, provider accounts, auth/RBAC, idempotencia, reconciliacion.
- Pendiente: sandbox, DB real, token encryption, monitoring, rate limits, support runbooks.
- Bloqueante: OKX approval, KYC/AML, legal/compliance y auditoria antes de dinero real.

## 13. Seguridad

Confirmaciones:

- No OKX real.
- No trading real.
- No dinero real.
- No withdrawals.
- No Web3 tocado.
- No WalletConnect tocado.
- No seed/private keys.
- No Home balance.
- No ledger al Home.
- No secrets agregados.
- No `EXPO_PUBLIC` secrets.
- No tokens OKX.
- No requests reales a OKX.
- No endpoints financieros productivos abiertos.

Busqueda de patrones peligrosos:

- No se encontraron `EXPO_PUBLIC_OKX`, `api.okx.com`, `OKX_SECRET`, `BINANCE_SECRET`, `MEXC_SECRET`, `isRealTradingEnabled: true` ni `allowOrderPlacement: true` en codigo backend/frontend.
- Las menciones detectadas estan en documentacion o `.env.example` como flags apagados.

## 14. Validacion

- `node --check server/index.mjs`: OK.
- `node --check` en archivos nuevos de `server/lib/`: OK.
- Imports de `server/lib/auth`, `server/lib/idempotency` y `server/lib/providers`: OK.
- `npm run typecheck`: OK.
- `npm run lint`: OK, 0 errores / 0 warnings.
- `npm test -- --passWithNoTests`: OK, 5 archivos, 18 tests.
- `npx expo-doctor`: OK, 18/18.

Scripts backend dedicados:

- `npm run test:server`: no existe.
- `npm run lint:server`: no existe.
- `npm run typecheck:server`: no existe.

## 15. Riesgos pendientes

- OKX approval.
- Acceso sandbox OKX.
- DB real Supabase/PostgreSQL.
- Token encryption/KMS.
- Auth real.
- RBAC persistente.
- KYC/AML.
- Legal/compliance.
- Monitoring y alertas.
- Rate limits.
- Observabilidad.
- Reconciliacion real.
- Audit logs productivos.
- Race conditions/concurrency tests.
- Soporte operativo.

## 16. Siguiente paso recomendado

El proximo paso tecnico real debe ser crear migraciones Supabase/PostgreSQL para:

1. `provider_accounts`.
2. `provider_oauth_tokens`.
3. `idempotency_keys`.
4. `backend_audit_logs`.
5. `backend_roles`.
6. `provider_reconciliation_jobs`.

Luego integrar auth real y RBAC antes de cualquier sandbox OKX. No habilitar `OKX_ENABLE_NETWORK_REQUESTS`, `OKX_REAL_TRADING_ENABLED`, `PROVIDER_ACCOUNTS_ENABLED`, `IDEMPOTENCY_PERSISTENCE_ENABLED` ni `LEDGER_BACKEND_ENABLED` hasta que DB, auth, roles, cifrado, audit logs y rate limits esten listos.

# Backend Ledger OrbitX — Plan e Implementacion Base

## 1. Resumen ejecutivo

Se preparo la base del Ledger Backend real de OrbitX sin activar dinero real. La fase creo schema SQL para Supabase/PostgreSQL, tipos backend, servicios base apagados por diseno, contratos de rutas internas deshabilitadas y documentacion contable para ledger, pool, social gifts, rewards, fees e idempotencia.

No se conecto OKX, Binance ni MEXC. No se toco Web3, WalletConnect, seed phrase, private keys, Home balance ni frontend sensible.

## 2. Estado actual del backend

Existe backend Express/MJS en `server/index.mjs` para Astra y endpoints auxiliares. No existe conexion DB productiva ni Supabase server-side para ledger. No existen rutas ledger montadas publicamente. El backend no tiene scripts dedicados de test/lint/typecheck.

## 3. Gap analysis

Falta para pasar de mock/frontend a ledger backend real:
- DB Supabase/PostgreSQL provisionada.
- Variables server-side seguras.
- Auth middleware.
- RBAC/admin roles.
- DB transactions atomicas.
- Row locking o aislamiento serializable.
- Idempotency store real.
- Audit log productivo.
- Tests backend automatizados.
- Reconciliacion con proveedor real aprobada.
- Monitoreo y alertas.

## 4. Arquitectura propuesta

```text
OrbitX App
-> OrbitX Backend
-> Ledger Service
-> Ledger Database
-> Product Services: Pool / Social / Rewards / Fees
-> Reconciliation Service
-> Provider Adapter futuro: OKX / Binance / MEXC
```

La app no depende de OKX. La app consume modelos OrbitX. El backend traduce hacia proveedores cuando exista integracion aprobada.

## 5. Modelo de datos

Tablas:
- `ledger_accounts`
- `ledger_transactions`
- `ledger_entries`
- `ledger_balances`
- `ledger_audit_log`
- `provider_reconciliations`
- `pool_positions`
- `social_gifts`

El dinero se representa con `numeric(28,8)` en DB y string en JavaScript. `amount_minor` queda disponible para unidades minimas.

## 6. Schema SQL

Schema creado en:

```text
server/db/ledger-schema.sql
```

Documentacion de schema:

```text
docs/backend-ledger-schema.md
```

## 7. Tipos y contratos

Tipos backend creados:

```text
server/lib/ledger/ledger-types.d.ts
```

Incluyen:
- `LedgerAccount`
- `LedgerAccountType`
- `LedgerTransaction`
- `LedgerTransactionType`
- `LedgerEntry`
- `LedgerDirection`
- `LedgerTransactionStatus`
- `LedgerMovementRequest`
- `LedgerReconciliationResult`
- `LedgerError`
- `LedgerErrorCode`
- `MoneyAmount`
- `LedgerAsset`
- `IdempotencyKey`
- `PoolPosition`
- `SocialGift`

## 8. Servicios creados o propuestos

Servicios creados como base segura:

```text
server/lib/ledger/ledger-errors.js
server/lib/ledger/ledger-service.js
server/lib/ledger/ledger-reconciliation.js
server/lib/ledger/ledger-routes.js
server/lib/pool/pool-service.js
server/lib/social/social-gifts-service.js
server/lib/rewards/rewards-service.js
server/lib/fees/fees-service.js
```

Los servicios validan inputs basicos y doble entrada, pero lanzan `LEDGER_DISABLED` si no hay DB real. No mueven dinero externo ni interno productivo.

## 9. Endpoints preparados/documentados

Rutas contractuales preparadas en `ledger-routes.js`, no montadas en `server/index.mjs`:

- `GET /ledger/balances/:userId`
- `GET /ledger/accounts/:userId`
- `GET /ledger/transactions/:userId`
- `POST /ledger/movements`
- `POST /pool/:poolId/subscribe`
- `POST /pool/:poolId/redeem`
- `GET /pool/:poolId/position/:userId`
- `POST /pool/:poolId/distribute-rewards`
- `POST /social/gifts/send`
- `POST /social/gifts/refund`
- `POST /rewards/credit`
- `POST /fees/collect`
- `POST /ledger/reconcile`

No se montan publicamente porque aun faltan auth, RBAC, rate limit y DB transaction real.

## 10. Flujo Pool

Entrar:

```text
DEBIT  user.available
CREDIT user.pool
type: POOL_SUBSCRIBE
```

Salir:

```text
DEBIT  user.pool
CREDIT user.available
type: POOL_REDEEM
```

Reward:

```text
DEBIT  orbitx.orbitx_reserve
CREDIT user.rewards
type: POOL_REWARD / REWARD_DISTRIBUTION
```

## 11. Flujo Social Gifts

Enviar gift:

```text
DEBIT  sender.social
CREDIT receiver.social
type: SOCIAL_GIFT
```

Refund:

```text
DEBIT  receiver.social
CREDIT sender.social
type: SOCIAL_GIFT_REFUND
```

## 12. Flujo Rewards

```text
DEBIT  orbitx.orbitx_reserve
CREDIT user.rewards
type: REWARD_DISTRIBUTION
```

Regla: no acreditar rewards sin reserva suficiente.

## 13. Flujo Fees

Cobro:

```text
DEBIT  user.available
CREDIT orbitx.fees
type: FEE_COLLECT
```

Refund:

```text
DEBIT  orbitx.fees
CREDIT user.available
type: FEE_REFUND
```

## 14. Reconciliacion

La reconciliacion compara total interno por asset contra saldo reportado por proveedor:

```text
internalTotal = available + trading + pool + social + rewards + locked + fees + pending_withdrawal
providerTotal = saldo proveedor
difference = providerTotal - internalTotal
```

No hace auto-ajustes. Si hay diferencia, crea reporte para revision manual futura.

## 15. Idempotencia

Cada POST financiero debe tener `idempotencyKey` unico. La DB usa `ledger_transactions.idempotency_key unique`.

La misma key debe devolver el resultado original, no duplicar el movimiento.

## 16. Seguridad

Protecciones definidas:
- doble entrada;
- amount decimal como string;
- no float productivo;
- audit log;
- idempotencyKey unico;
- entries/audit log inmutables;
- rutas no montadas sin auth;
- no provider secrets en frontend;
- no auto-adjustment silencioso.

Pendiente:
- auth real;
- RBAC;
- rate limits;
- DB transactions;
- row locks;
- observabilidad.

## 17. Que NO se activo

- No OKX real.
- No Binance real.
- No MEXC real.
- No dinero real.
- No trading real.
- No frontend sensible tocado.
- No Web3 tocado.
- No WalletConnect tocado.
- No Home balance tocado.
- No seed/private keys tocadas.

## 18. Tests o casos de prueba

No existe runner backend dedicado en `server/`. Se documento la suite minima en:

```text
docs/backend-ledger-test-cases.md
```

Los tests frontend existentes no fueron modificados por esta fase.

## 19. Riesgos pendientes

- DB real aun no provisionada.
- Auth/RBAC no implementado.
- KYC/AML/legal pendiente.
- Integracion provider pendiente.
- Reconciliacion real pendiente.
- Race conditions deben resolverse con DB transaction y locks.
- Monitoreo y alertas pendientes.
- Auditoria externa pendiente.
- Scripts server de test/lint/typecheck pendientes.

## 20. Siguiente paso recomendado

Orden sugerido:

1. Crear proyecto DB/Supabase y ejecutar schema en entorno staging.
2. Agregar variables server-side seguras.
3. Implementar auth/RBAC/rate limit antes de montar rutas.
4. Implementar ledger service real con DB transaction.
5. Crear tests backend automatizados.
6. Conectar pool/social/rewards a ledger backend en staging.
7. Reconciliar contra provider sandbox o reporte manual.
8. Solo despues evaluar broker provider real.

## 21. Validacion

- `npm run typecheck`: paso sin errores.
- `npm test -- --passWithNoTests`: paso, 5 archivos y 18 tests.
- `npm run lint`: paso sin errores ni warnings.
- `npx expo-doctor`: primer intento fallo por certificado/API externa; reintento con `NODE_OPTIONS=--use-system-ca` paso 18/18.
- `node --check server/lib/...`: paso para los servicios backend creados.
- Scripts backend dedicados `test:server`, `lint:server`, `typecheck:server`: no existen actualmente en `server/package.json`.

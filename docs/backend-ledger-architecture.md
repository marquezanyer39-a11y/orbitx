# Backend Ledger OrbitX - Arquitectura

Este documento define la base del ledger backend real de OrbitX. No activa dinero real, no conecta OKX/Binance/MEXC y no reemplaza los mocks del frontend.

## Objetivo

OrbitX necesita un ledger interno propio para distribuir fondos entre productos internos sin depender de modelos de un proveedor externo. El proveedor broker puede custodiar o ejecutar, pero la app y los productos OrbitX deben leer modelos internos controlados.

Arquitectura objetivo:

```text
OrbitX App
-> OrbitX Backend
-> Ledger Service
-> Ledger Database
-> Reconciliation Service
-> Provider Adapter futuro: OKX / Binance / MEXC
```

## Separacion de responsabilidades

Frontend:
- Muestra saldos y estados autorizados por backend.
- Nunca firma requests privadas de proveedor.
- Nunca guarda API secrets de exchanges.
- Nunca calcula dinero productivo a partir de mocks.
- No mezcla Web3, Home balance ni mocks de ledger con dinero real.

Backend:
- Valida input, auth, roles, idempotencia y rate limits.
- Ejecuta movimientos contables dentro de transacciones DB atomicas.
- Actualiza snapshots derivados.
- Registra audit trail.
- Reconcila contra proveedor externo.
- Expone contratos internos seguros.

Proveedor externo:
- Reporta saldos de custodia/ejecucion.
- Ejecuta trading o movimientos externos cuando exista aprobacion.
- No define el modelo interno de OrbitX.

## Cuentas internas

Tipos de cuenta:
- `available`: fondos disponibles del usuario dentro de OrbitX.
- `trading`: fondos destinados a trading.
- `pool`: fondos aportados al pool interno.
- `social`: fondos usados para regalos sociales.
- `rewards`: recompensas acreditadas al usuario.
- `locked`: fondos bloqueados por una operacion pendiente.
- `fees`: comisiones internas de OrbitX.
- `pending_withdrawal`: retiros solicitados y aun no completados.
- `provider_reserve`: espejo interno del saldo custodiado/reportado por proveedor.
- `orbitx_reserve`: reservas internas OrbitX, como rewards reserve.
- `adjustment`, `bonus`, `chargeback`, `dispute`: cuentas operativas controladas.

## Doble entrada

Toda transaccion debe tener al menos:
- un debit;
- un credit;
- mismo asset;
- total debit igual a total credit.

Ejemplo pool:

```text
DEBIT  user.available  500 USDT
CREDIT user.pool       500 USDT
type: POOL_SUBSCRIBE
```

Ejemplo reward:

```text
DEBIT  orbitx.orbitx_reserve  50 USDT
CREDIT user.rewards           50 USDT
type: REWARD_DISTRIBUTION
```

Nada aparece ni desaparece sin contraparte.

## Idempotencia

Cada POST financiero requiere `idempotencyKey`.

Si llega dos veces la misma operacion:
- no crea dos movimientos;
- devuelve el resultado original;
- no duplica pool, reward, gift ni fee.

Esto protege contra doble click, retry de red y replay accidental.

## Reconciliacion

La reconciliacion compara:

```text
internalTotal = available + trading + pool + social + rewards + locked + fees + pending_withdrawal
providerTotal = saldo reportado por proveedor externo
difference = providerTotal - internalTotal
```

Reglas:
- No hacer auto-ajustes silenciosos.
- Si hay diferencia, registrar `provider_reconciliations`.
- `MANUAL_ADJUSTMENT` requiere actor autorizado y audit trail.

## Readiness actual para OKX Broker

El ledger backend esta preparado como contrato/stub, no como sistema productivo.

Existe:
- Validacion de assets, montos positivos e idempotencyKey.
- Validacion de doble entrada.
- Rutas ledger deshabilitadas por defecto.
- Documentacion de schema SQL y casos de prueba.
- Separacion conceptual entre ledger interno y provider externo.

Falta antes de conectar OKX o dinero real:
- DB real PostgreSQL/Supabase con transacciones ACID.
- Auth backend real.
- RBAC para admin, finance y compliance.
- Idempotencia persistente en `idempotency_keys`.
- Audit logs persistentes.
- Provider accounts para vincular usuarios con OKX.
- Token encryption.
- Reconciliacion real contra `provider_reconciliation_jobs`.

Regla operativa: ningun endpoint ledger debe habilitarse hasta que `LEDGER_BACKEND_ENABLED=true` exista junto con auth, RBAC, idempotencia persistente, audit logs y DB real.

## Seguridad pendiente antes de produccion

- Auth obligatoria.
- Role-based access control.
- Rate limiting.
- DB transactions con aislamiento fuerte.
- Row-level locking donde aplique.
- Observabilidad y alertas.
- KYC/AML/legal.
- Auditoria externa del ledger.
- Integracion broker aprobada.

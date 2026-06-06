# Backend Ledger OrbitX — Schema SQL

SQL listo para Supabase/PostgreSQL:

```text
server/db/ledger-schema.sql
```

Este schema no esta conectado a dinero real en esta fase.

## Tablas

### ledger_accounts

Representa cuentas internas por usuario, asset y tipo.

Campos:
- `id uuid primary key`
- `user_id uuid nullable`
- `account_type text not null`
- `asset text not null`
- `status text not null default 'active'`
- `provider_id text nullable`
- `allow_negative boolean default false`
- `metadata jsonb default '{}'`
- `created_at timestamptz`
- `updated_at timestamptz`

Constraints:
- `account_type` limitado a tipos aprobados.
- `status` limitado a `active`, `frozen`, `closed`.
- `asset = upper(asset)`.
- unique por usuario/tipo/asset/provider.

### ledger_transactions

Cabecera de operacion contable.

Campos:
- `id uuid primary key`
- `transaction_type text not null`
- `status text not null`
- `asset text not null`
- `amount_decimal numeric(28,8) not null`
- `amount_minor text nullable`
- `idempotency_key text not null unique`
- `reference_type text nullable`
- `reference_id text nullable`
- `provider_id text nullable`
- `provider_reference text nullable`
- `created_by uuid nullable`
- `metadata jsonb default '{}'`
- timestamps

Reglas:
- `amount_decimal > 0`
- `idempotency_key` unico
- no delete historico
- transacciones finales `completed`, `failed` o `reversed` no se editan
- reversos mediante transaccion compensatoria

### ledger_entries

Lineas de doble entrada.

Campos:
- `id uuid primary key`
- `transaction_id uuid references ledger_transactions(id)`
- `account_id uuid references ledger_accounts(id)`
- `direction text not null`
- `asset text not null`
- `amount_decimal numeric(28,8) not null`
- `amount_minor text nullable`
- `balance_after_decimal numeric(28,8) nullable`
- `created_at timestamptz`

Reglas:
- `direction` solo `debit` o `credit`.
- `amount_decimal > 0`.
- no update/delete.
- cada transaccion completed debe estar balanceada por asset.

### ledger_balances

Snapshot derivado para performance. No reemplaza a `ledger_entries` como fuente de verdad.

Campos:
- `account_id uuid`
- `asset text`
- `balance_decimal numeric(28,8)`
- `locked_decimal numeric(28,8)`
- `updated_at timestamptz`
- primary key `(account_id, asset)`

Reglas:
- Actualizar dentro de la misma DB transaction que entries.
- Si falla snapshot, la operacion completa hace rollback.

### ledger_audit_log

Auditoria inmutable de operaciones financieras.

Campos:
- `id uuid primary key`
- `actor_id uuid nullable`
- `action text`
- `entity_type text`
- `entity_id uuid nullable`
- `before jsonb nullable`
- `after jsonb nullable`
- `ip_address text nullable`
- `user_agent text nullable`
- `metadata jsonb`
- `created_at timestamptz`

Reglas:
- no update/delete.
- registrar toda operacion financiera.

### provider_reconciliations

Reportes de comparacion contra proveedor externo.

Campos:
- `provider_id`
- `asset`
- `internal_total_decimal`
- `provider_total_decimal`
- `difference_decimal`
- `status`
- `severity`
- `report jsonb`
- `created_at`

Estados:
- `open`
- `reviewed`
- `resolved`

Severidad:
- `ok`
- `warning`
- `critical`

### pool_positions

Posiciones internas de pool.

Campos:
- `user_id`
- `pool_id`
- `asset`
- `principal_amount_decimal`
- `ranking_amount_decimal`
- `reward_amount_decimal`
- `status`

Reglas:
- `principal_amount` registra aporte real.
- `ranking_amount` puede tener cap de producto.
- `reward_amount` no puede superar reserva disponible.

### social_gifts

Registra gifts sociales vinculados al ledger.

Campos:
- `sender_id`
- `receiver_id`
- `gift_id`
- `asset`
- `amount_decimal`
- `ledger_transaction_id`
- `status`
- `metadata`

Reverso:
- Un refund crea transaccion compensatoria, no borra el gift original.

## Indices principales

- `ledger_accounts(user_id, asset)`
- `ledger_accounts(account_type, asset)`
- `ledger_transactions(idempotency_key)`
- `ledger_transactions(reference_type, reference_id)`
- `ledger_entries(transaction_id)`
- `ledger_entries(account_id)`
- `provider_reconciliations(provider_id, asset, created_at)`
- `pool_positions(user_id, pool_id)`
- `social_gifts(sender_id, created_at)`
- `social_gifts(receiver_id, created_at)`

## Precision monetaria

No usar `number`/float en backend productivo.

Opciones:
- `amount_minor` como string de unidades minimas.
- `amount_decimal numeric(28,8)` en DB y string en JavaScript.

Ejemplo:

```text
USDT 10.50 -> amount_decimal: "10.50"
USDT 10.50 con 6 decimals -> amount_minor: "10500000"
```

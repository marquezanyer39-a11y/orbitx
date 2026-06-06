# OrbitX Internal Ledger

## Que es

El ledger interno es el registro contable de movimientos dentro de OrbitX. En esta fase es mock controlado y no mueve dinero real.

## Doble entrada contable

Cada movimiento debe tener:

- `debitAccountId`
- `creditAccountId`
- `amount`
- `asset`
- `transactionType`
- `status`
- `referenceId`
- `createdAt`

Regla central: nada aparece de la nada y nada desaparece sin registro.

## Cuentas internas

El ledger separa:

- `available`
- `trading`
- `pool`
- `social`
- `rewards`
- `locked`
- `fees`
- `pending_withdrawal`
- `provider_reserve`
- `orbitx_reserve`
- `adjustment`
- `bonus`
- `chargeback`
- `dispute`

## Pool, social gifts y rewards

Pool:

- `POOL_SUBSCRIBE`: available -> pool
- `POOL_REDEEM`: pool -> available
- `POOL_REWARD`: reserve -> rewards/available segun regla futura

Social:

- `SOCIAL_GIFT`: sender.social -> receiver.social
- `SOCIAL_GIFT_REFUND`: receiver.social -> sender.social

Rewards:

- `REWARD_DISTRIBUTION`: orbitx.rewards_reserve -> user.rewards

Fees:

- `FEE_COLLECT`: user.available -> orbitx.fees
- `FEE_REFUND`: orbitx.fees -> user.available

## Reconciliacion con proveedor

`reconcileWithProviderBalance(providerId, asset, providerBalance)` suma saldos internos por asset y compara contra el saldo reportado por el proveedor externo.

En produccion, esta reconciliacion debe usar base de datos ACID, snapshots, auditoria, idempotency keys y alertas.

## Que NO debe mezclarse

El ledger interno mock no debe alimentar:

- Home balance
- Wallet/Web3
- saldos reales
- ordenes reales
- movimientos de proveedor externo

## Riesgos si se disena mal

- dinero duplicado
- saldos negativos invisibles
- fees sin trazabilidad
- rewards sin reserva
- diferencias contra proveedor no detectadas
- fraude o errores operativos sin auditoria

## Falta para produccion

- base de datos transaccional
- idempotency keys
- locks por cuenta
- auditoria inmutable
- reconciliacion real
- alertas
- KYC/AML
- autorizacion backend
- pruebas financieras

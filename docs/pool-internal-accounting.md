# Pool Interno OrbitX — Contabilidad

Este documento define la contabilidad del pool interno. No promete rendimiento, no activa dinero real y no conecta proveedor externo.

## Entrar al pool

Movimiento:

```text
DEBIT  user.available  amount asset
CREDIT user.pool       amount asset
type: POOL_SUBSCRIBE
```

Requisitos:
- `idempotencyKey` unico.
- saldo disponible suficiente.
- cuenta `available` activa.
- cuenta `pool` activa.
- transaccion DB atomica.
- audit log.

## ranking_amount

`principal_amount_decimal` registra el aporte completo.

`ranking_amount_decimal` registra el monto usado para ranking. Puede tener cap de producto, por ejemplo maximo 10 USDT, si OrbitX lo define en backend.

Ejemplo:

```text
aporte real: 50 USDT
ranking cap: 10 USDT
principal_amount_decimal: "50.00000000"
ranking_amount_decimal: "10.00000000"
```

## Salir del pool

Movimiento:

```text
DEBIT  user.pool       amount asset
CREDIT user.available  amount asset
type: POOL_REDEEM
```

No se edita la transaccion original; se registra un movimiento nuevo.

## Distribuir premios

Movimiento recomendado:

```text
DEBIT  orbitx.orbitx_reserve  reward asset
CREDIT user.rewards           reward asset
type: POOL_REWARD o REWARD_DISTRIBUTION
```

Reglas:
- No distribuir mas que la reserva disponible.
- Batch idempotente por `distributionId`.
- Cada usuario tiene idempotencyKey deterministico.
- Si falla un item critico, rollback o compensacion controlada segun politica aprobada.
- Registrar audit log y reporte de distribucion.

## Riesgos si se implementa mal

- Doble pago por retry.
- Ranking manipulado por aportes duplicados.
- Reward sin reserva real.
- Diferencia contra proveedor externo.
- Falta de trazabilidad legal/contable.

## Estado actual

En esta fase solo quedan preparados schema, servicios stubs y documentacion. El pool productivo requiere DB real, auth, roles, reservas y QA financiero.

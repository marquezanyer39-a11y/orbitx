# Social Gifts OrbitX — Contabilidad

Este documento define el flujo contable de regalos sociales. No activa dinero real y no conecta proveedor externo.

## Enviar gift

Movimiento base:

```text
DEBIT  sender.social    amount asset
CREDIT receiver.social  amount asset
type: SOCIAL_GIFT
```

Requisitos:
- sender con saldo suficiente.
- receiver valido.
- gift activo.
- idempotencyKey unico.
- audit log.
- DB transaction atomica.

## Fee opcional

Si OrbitX cobra fee, usar movimiento separado:

```text
DEBIT  sender.available  fee asset
CREDIT orbitx.fees       fee asset
type: FEE_COLLECT
```

No mezclar fee y gift en una operacion ambigua.

## Reversar gift

No borrar el gift original.

Movimiento compensatorio:

```text
DEBIT  receiver.social  amount asset
CREDIT sender.social    amount asset
type: SOCIAL_GIFT_REFUND
```

Reglas:
- requiere razon;
- requiere actor autorizado;
- requiere audit log;
- debe validar que receiver tenga saldo suficiente o activar flujo de disputa.

## Auditoria

`social_gifts` conserva estado de negocio: `sent`, `refunded`, `failed`.

`ledger_transactions` y `ledger_entries` conservan la verdad contable.

## Estado actual

La integracion real queda bloqueada hasta tener DB, auth, rate limit, roles y pruebas financieras.


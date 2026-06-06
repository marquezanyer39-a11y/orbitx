# Backend Ledger OrbitX — Casos de Prueba

No existe framework backend dedicado en `server/` al momento de esta fase. Estos casos deben convertirse en tests automatizados cuando se agregue runner backend.

## Casos criticos

1. `moveAvailableToPool` crea un debit en `user.available` y un credit en `user.pool`.
2. `subscribeToPool` con la misma `idempotencyKey` devuelve el resultado original y no duplica entries.
3. `transferSocialGift` mueve saldo de `sender.social` a `receiver.social`.
4. `creditReward` falla si `orbitx_reserve` no tiene saldo suficiente.
5. `collectFee` mueve `user.available` a `orbitx.fees`.
6. `reconcileWithProviderBalance` devuelve `severity: "ok"` cuando provider e internal coinciden.
7. `reconcileWithProviderBalance` devuelve `warning` o `critical` cuando hay mismatch.
8. Cualquier movimiento con `amount <= 0` falla.
9. Cualquier movimiento que deje saldo negativo falla salvo `allow_negative = true`.
10. `refundGift` crea transaccion inversa y no borra el gift original.
11. Una transaccion `completed` no se permite si sus entries no estan balanceadas.
12. `idempotencyKey` repetida no duplica pool, reward, gift ni fee.
13. Reconciliacion no crea auto-ajuste.
14. `MANUAL_ADJUSTMENT` requiere actor admin futuro y audit trail.
15. Si falla audit log, snapshot o validacion de saldo, toda la transaccion hace rollback.
16. `ledger_entries` no permite update/delete.
17. `ledger_audit_log` no permite update/delete.
18. El backend no convierte `amount_decimal` a `number`.

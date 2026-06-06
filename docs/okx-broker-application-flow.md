# OKX Broker Application Flow - OrbitX

Este documento resume como OrbitX debe presentarse y prepararse tecnicamente para una futura aprobacion como broker/partner de OKX.

Estado: preparacion interna. OKX real no esta conectado, trading real esta bloqueado y withdrawals no estan activos.

## 1. Que es OrbitX

OrbitX es una app mobile crypto/fintech construida con React Native + Expo. Su propuesta combina:

- Exchange-style UI.
- Wallet Web3 externa y local separadas.
- Trading demo preparado para backend broker.
- Pool mensual interno en modo no productivo.
- Social Gifts y Rewards preparados sobre ledger interno.
- Perfil premium, VIP visual y Rango OrbitX.
- Bot Futures bloqueado hasta backend seguro.

## 2. Modelo de integracion

Arquitectura obligatoria:

```text
OrbitX App
-> OrbitX Backend Auth
-> OrbitX Backend Ledger
-> Provider Accounts
-> OKX Broker API
-> Reconciliation
```

OrbitX App nunca debe llamar a OKX directamente. OKX vive exclusivamente en backend.

## 3. Por que no hay secrets en frontend

La app movil es un cliente no confiable. Por eso:

- No guarda OKX API secrets.
- No guarda OKX client_secret.
- No firma requests privadas.
- No recibe refresh tokens OKX.
- No expone variables OKX con `EXPO_PUBLIC`.

El backend gestiona OAuth, tokens cifrados, idempotencia, audit logs y RBAC.

## 4. OAuth futuro

Flujo esperado:

1. Usuario inicia conexion OKX desde OrbitX App.
2. App llama a OrbitX Backend para pedir connect URL.
3. Backend genera state seguro y URL OKX.
4. Usuario autoriza en OKX.
5. OKX redirige al backend con authorization code.
6. Backend intercambia code por tokens.
7. Backend cifra tokens antes de persistir.
8. Backend crea o actualiza `provider_accounts`.
9. App solo recibe estado normalizado: conectado, permisos, proveedor.

Estado actual:

- `okx-oauth-service.js` existe como stub seguro.
- Si faltan credenciales, devuelve `PROVIDER_NOT_CONFIGURED`.
- Tokens reales aun no se intercambian ni guardan.

## 5. Ordenes

Flujo futuro:

```text
App -> Backend /trading/orders -> Auth/RBAC -> Idempotency
-> Ledger lock -> OKX order -> Ledger settlement -> Audit log -> Response OrbitX
```

Reglas:

- Cada POST requiere `idempotencyKey`.
- No se confia en `userId` enviado por frontend.
- No se devuelve raw OKX payload al cliente.
- No se marca orden como real sin confirmacion del proveedor.

Estado actual:

- `okx-trading-service.js` devuelve `REAL_TRADING_DISABLED`.
- Trading real no esta activo.

## 6. Transferencias y withdrawals

Flujo futuro:

- Transfers internas requieren auth, RBAC, ledger y provider permissions.
- Withdrawals requieren KYC/AML, approvals, audit logs y proveedor aprobado.
- Cualquier salida de fondos debe ser idempotente y auditable.

Estado actual:

- `okx-transfer-service.js` bloquea movimientos reales.
- Withdrawals no estan activos.

## 7. Reconciliacion

Flujo futuro:

```text
OKX provider balance
vs
OrbitX internal ledger total
```

Si hay diferencia:

- Crear `provider_reconciliation_jobs`.
- Marcar severity: ok/warning/critical.
- Revisar manualmente.
- No crear auto-ajustes.
- No crear `MANUAL_ADJUSTMENT` sin finance/admin + audit trail.

Estado actual:

- Reconciliacion esta documentada y stubbeada.
- No compara OKX real porque no hay provider real ni ledger DB productivo.

## 8. Productos internos OrbitX

### Pool interno

- Usa ledger double-entry.
- Aporte real y ranking amount deben diferenciarse.
- No promete retorno fijo.
- No puede distribuir mas que la reward reserve.

### Social Gifts

- Usa ledger double-entry.
- Refunds son transacciones compensatorias.
- Fees, si aplican, van por `FEE_COLLECT`.

### Rewards

- Salen de `orbitx_reserve`.
- Batch distribution debe ser idempotente.
- Requiere audit log.

### VIP

- Visual y logica mock/controlada hoy.
- Backend VIP real debe integrarse despues con ledger, roles y compliance.

## 9. Que no esta activo todavia

- Trading real.
- Withdrawals.
- OKX production.
- OKX sandbox real.
- Pool con dinero real.
- Rewards con dinero real.
- Bot Futures real.
- Provider accounts DB real.
- Token encryption real.

## 10. Roadmap para sandbox

1. Aprobar acceso OKX Broker sandbox.
2. Habilitar DB real para provider accounts, idempotency y audit logs.
3. Implementar auth real y RBAC.
4. Implementar token encryption.
5. Probar OAuth en sandbox.
6. Probar read-only balances.
7. Probar ordenes sandbox con idempotencia.
8. Probar reconciliacion sandbox.

## 11. Roadmap para produccion

1. Revision legal/KYC/AML.
2. Auditoria de seguridad backend.
3. Runbooks operativos.
4. Monitoring y alertas.
5. Rate limits.
6. Aprobacion OKX production.
7. Rollout interno.
8. Beta cerrada controlada.

## 12. Requisitos pendientes

- OKX broker approval.
- Credenciales sandbox.
- Credenciales production.
- KYC/AML.
- Legal/compliance.
- DB real con backups.
- Cifrado de tokens.
- Observabilidad.
- Auditoria externa.

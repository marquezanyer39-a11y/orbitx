# OKX Security Checklist — OrbitX

## Secrets y tokens

- [ ] `OKX_BROKER_CLIENT_SECRET` vive solo en backend.
- [ ] No existe ninguna variable OKX con prefijo `EXPO_PUBLIC`.
- [ ] Tokens OAuth se cifran antes de guardarse en DB.
- [ ] Refresh tokens nunca se envian al frontend.
- [ ] Headers privados y firmas no se imprimen en logs.
- [ ] `getOkxConfigSafe()` no devuelve secrets completos.

## Frontend

- [ ] La app movil no llama a `api.okx.com`.
- [ ] La app movil no firma requests privadas.
- [ ] La app movil no recibe tokens OKX.
- [ ] Bot Futures no acepta API Key/API Secret en frontend.
- [ ] Trading Adapter frontend consume solo OrbitX Backend.

## Backend

- [ ] `OKX_ENV=production` bloqueado por defecto.
- [ ] `OKX_ALLOW_PRODUCTION=false` por defecto.
- [ ] `OKX_ENABLE_NETWORK_REQUESTS=false` por defecto.
- [ ] `OKX_REAL_TRADING_ENABLED=false` por defecto.
- [ ] Endpoints `POST` requieren `idempotencyKey`.
- [ ] Endpoints financieros requieren auth middleware antes de produccion.
- [ ] Endpoints admin requieren roles.
- [ ] Rate limits activos antes de sandbox real.
- [ ] Audit logs obligatorios para ordenes, transfers y reconciliacion.

## Trading y dinero

- [ ] `placeOrder` devuelve `REAL_TRADING_DISABLED` en esta fase.
- [ ] `createTransfer` devuelve `REAL_TRADING_DISABLED` en esta fase.
- [ ] No se mueven fondos reales.
- [ ] No se crean ordenes reales.
- [ ] No se activan withdrawals.
- [ ] No se devuelven payloads crudos OKX al cliente.

## Reconciliacion

- [ ] Reconciliacion solo compara y reporta.
- [ ] No hay auto-ajustes silenciosos.
- [ ] `MANUAL_ADJUSTMENT` requiere actor autorizado y audit trail.
- [ ] Diferencias con proveedor se marcan para revision manual.

## Operacion segura futura

- [ ] Sandbox OKX validado antes de production.
- [ ] Contrato broker revisado legalmente.
- [ ] KYC/AML definido.
- [ ] Observabilidad y alertas activas.
- [ ] Pruebas de replay/doble click/race conditions.
- [ ] Backups y retencion de auditoria definidos.

# OKX Demo Presentation Outline - OrbitX

Este outline sirve para preparar una demo tecnica y comercial de OrbitX ante OKX. No implica aprobacion ni integracion productiva.

## 1. Presentacion de OrbitX

- App mobile crypto/fintech.
- Enfoque exchange + social + Web3.
- React Native + Expo.
- Arquitectura preparada para broker backend.

## 2. Problema que resuelve

- Usuarios quieren operar y gestionar crypto desde una experiencia mobile mas simple.
- Muchos productos mezclan wallet, exchange y social sin controles claros.
- OrbitX separa Web3, broker trading, ledger interno y productos sociales.

## 3. App movil actual

Pantallas a mostrar:

- Home.
- Mercados.
- Trade demo.
- Wallet/Web3.
- Pool mensual.
- Perfil/Rango OrbitX.
- Browser.
- Bot Futures bloqueado seguro.

## 4. Seguridad visible en demo

- Bot Futures no acepta API Key/API Secret en frontend.
- Trading real esta bloqueado.
- Pool no promete ganancias garantizadas.
- Wallet Web3 separa wallet externa y local.
- No se pide seed phrase.

## 5. Arquitectura tecnica

```text
OrbitX App
-> OrbitX Backend
-> Auth/RBAC
-> Trading Adapter Layer
-> Provider Accounts
-> OKX Broker API
-> Internal Ledger
-> Reconciliation
```

Puntos clave:

- OKX solo en backend.
- No secrets en frontend.
- No raw OKX payloads hacia app.
- Idempotencia para POST financieros.
- Audit logs para movimientos sensibles.

## 6. Ledger interno

Productos internos:

- Pool mensual.
- Social Gifts.
- Rewards.
- Fees.
- VIP futuro.

Reglas:

- Doble entrada.
- No saldos negativos salvo cuentas internas autorizadas.
- No auto-ajustes silenciosos.
- Reconciliacion contra provider reserve.

## 7. Modelo broker

OKX como:

- Proveedor de ejecucion.
- Proveedor de liquidez.
- Proveedor de custodia/estado externo.
- Fuente para reconciliacion.

OrbitX como:

- Mobile frontend.
- Social/engagement layer.
- Broker UI.
- Ledger interno y productos propios.

## 8. Paises objetivo

Completar antes de presentar:

- Pais base de operacion.
- Paises iniciales.
- Restricciones regulatorias.
- Paises excluidos.

## 9. Volumen esperado

Completar con estimaciones conservadoras:

- Usuarios APK interna.
- Beta cerrada.
- MAU esperado.
- Volumen mensual objetivo.
- Productos por fase.

## 10. Roadmap 90 dias

### Dias 0-30

- APK interna Android.
- QA Web3 real.
- Auth/RBAC backend.
- DB provider accounts.
- OKX sandbox application.

### Dias 31-60

- OAuth sandbox.
- Balances read-only sandbox.
- Idempotency persistente.
- Ledger DB real.
- Reconciliacion sandbox.

### Dias 61-90

- Ordenes sandbox.
- QA financiera interna.
- Monitoring/audit.
- Legal/KYC/AML.
- Preparacion beta cerrada.

## 11. Solicitud a OKX

- Broker approval.
- OAuth/Broker access.
- Sandbox credentials.
- Documentacion tecnica.
- Requisitos de compliance.
- Condiciones partner/rebate.
- Soporte tecnico de integracion.

## 12. Demo checklist

- Mostrar APK instalada.
- Mostrar Trade en modo demo.
- Mostrar Bot Futures bloqueado.
- Mostrar Pool sin promesa de rendimiento.
- Mostrar backend status OKX `not_configured`/`disabled`.
- Mostrar documentacion de seguridad.
- Mostrar schema provider accounts/idempotency/audit.

# OKX Partner Readiness Checklist - OrbitX

Estado honesto de preparacion para una futura conversacion/aplicacion OKX Broker.

| Area | Estado | Evidencia | Riesgo | Siguiente paso |
|---|---|---|---|---|
| APK interna Android | parcial | Build readiness documentado y validaciones pasan | QA real en dispositivos sigue pendiente | Instalar APK y capturar bugs |
| App mobile premium | parcial | Perfil, Rango, Pool, Browser y Web3 mejorados | Modulos demo pueden confundir si no se etiquetan | QA visual Android |
| OKX provider backend | parcial | Stubs seguros en `server/lib/providers/okx/` | Sin credenciales ni sandbox | Solicitar sandbox/approval |
| No secrets frontend | listo | OKX vars son backend-only y sin `EXPO_PUBLIC` | Requiere auditoria continua | Gate en CI |
| Trading real bloqueado | listo | `OKX_REAL_TRADING_ENABLED=false`, frontend trade mock | Activacion futura requiere controles | Mantener flags false |
| Bot Futures seguro | listo | API Key/Secret bloqueadas en frontend | Backend bot real pendiente | Disenar OAuth/backend bot |
| Backend ledger design | parcial | Docs/schema/stubs de ledger | Sin DB real ni auth productiva | Implementar DB real |
| Provider accounts schema | parcial | `docs/backend-provider-accounts-schema.md` | Falta migracion DB real | Crear migration Supabase |
| Auth/RBAC | parcial | Stubs `server/lib/auth/` | Sin proveedor auth real | Integrar Supabase/JWT |
| Idempotency persistente | parcial | Stubs `server/lib/idempotency/` | Sin tabla real activa | Implementar con DB transaction |
| Audit logs | parcial | Schema documentado | Sin persistencia real | Implementar writes atomicos |
| Token encryption | pendiente | Reglas documentadas | Bloqueante antes de OAuth real | Elegir KMS/secret rotation |
| OKX OAuth | pendiente | Flujo documentado/stub | Bloqueante para conectar usuario OKX | Implementar en sandbox |
| OKX sandbox | pendiente | No hay credenciales | Bloqueante para pruebas broker | Solicitar acceso |
| Reconciliacion | parcial | Servicios y schema preparados | Sin provider real ni ledger DB | Implementar job DB |
| Observabilidad | pendiente | No hay stack definido | Riesgo operativo | Logs estructurados + alertas |
| Rate limits | pendiente | Documentado | Riesgo abuso/API | Agregar middleware |
| KYC/AML | bloqueante | No implementado | Bloqueante beta financiera | Definir proveedor/proceso |
| Legal/compliance | bloqueante | No implementado | Bloqueante produccion | Revision legal |
| Soporte operativo | pendiente | No documentado en detalle | Riesgo launch | Runbooks y soporte |

## Clasificacion resumida

### Listo

- No secrets OKX en frontend.
- Trading real bloqueado.
- Bot Futures sin API Key/API Secret frontend.
- OKX real no conectado.

### Parcial

- APK interna.
- Backend OKX provider.
- Ledger backend.
- Provider accounts.
- Auth/RBAC.
- Idempotencia.
- Reconciliacion.

### Pendiente

- OKX sandbox.
- DB real.
- Token encryption.
- Monitoring.
- Rate limits.
- Support runbooks.

### Bloqueante

- OKX approval.
- KYC/AML.
- Legal/compliance.
- Auditoria financiera/seguridad antes de dinero real.

## Decision recomendada

OrbitX esta en buena posicion para presentar una demo tecnica controlada, pero no debe solicitar produccion ni operar dinero real hasta completar auth, DB, idempotencia persistente, token encryption, ledger real, KYC/legal y sandbox OKX.

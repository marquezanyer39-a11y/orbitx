# OrbitX Public Release Checklist

Estados permitidos:

- ✅ Bien
- 🟡 Parcial
- 🔴 Falta
- ⛔ Bloqueante
- 🧪 Requiere QA
- 🔒 Bloqueado por seguridad

## 1. Mobile App

| Punto | Estado | Prioridad | Responsable | Accion |
|---|---|---|---|---|
| Home estable | 🟡 Parcial | Alta | Mobile | QA Android real, verificar balance y estados de red. |
| Perfil estable | ✅ Bien | Media | Mobile | Mantener QA visual en pantallas pequeñas. |
| Rango OrbitX estable | ✅ Bien | Media | Mobile/Product | Validar copy y flujo desde Perfil. |
| Pool mensual estable | 🟡 Parcial | Alta | Mobile/Product | Mantener marcado como mock/controlado; probar CTA y safe area. |
| Wallet principal estable | 🟡 Parcial | Alta | Mobile/Web3 | QA de wallet local, spot demo y Web3 separadas. |
| Web3 estable | 🧪 Requiere QA | Alta | Web3 | Probar en APK con MetaMask/Trust/Coinbase y redes reales. |
| Send EVM probado | 🧪 Requiere QA | Alta | Web3/QA | Probar direccion invalida, rechazo firma y monto pequeño controlado. |
| Browser probado | 🧪 Requiere QA | Media | Mobile/QA | Verificar WebView en Android real y returnTo. |
| Astra estable | 🟡 Parcial | Media | Mobile/AI | Probar permisos, voz/TTS, background y latencia. |
| i18n español/ingles completo | 🟡 Parcial | Media | Mobile/i18n | Completar strings restantes y corregir mojibake residual. |
| UI compacta Android | 🟡 Parcial | Alta | Design/Mobile | QA 360dp, 390dp y pantallas grandes. |
| Safe areas correctas | 🧪 Requiere QA | Alta | QA | Probar Pool, Browser, Wallet y tabs. |
| Sin textos rotos | 🟡 Parcial | Media | i18n | Corregir texto Polygon con mojibake residual. |
| Sin pantallas negras | 🧪 Requiere QA | Alta | QA | Especialmente Browser/WebView y charts. |
| Sin crashes | 🧪 Requiere QA | Alta | QA | Smoke test completo APK interna. |

## 2. Trading / Broker

| Punto | Estado | Prioridad | Responsable | Accion |
|---|---|---|---|---|
| OKX approval | ⛔ Bloqueante | Critica | CTO/Legal | Solicitar aprobacion formal y requisitos de partner. |
| OKX sandbox | 🔴 Falta | Critica | Backend | Obtener credenciales sandbox. |
| OAuth real | 🔴 Falta | Alta | Backend | Implementar solo despues de auth, DB y cifrado. |
| Trading endpoints reales | 🔒 Bloqueado por seguridad | Critica | Backend | Mantener stubs hasta approval. |
| Order execution | 🔒 Bloqueado por seguridad | Critica | Backend/Trading | No activar sin sandbox, ledger, idempotencia y compliance. |
| Cancel orders | 🔴 Falta | Alta | Backend | Implementar en sandbox. |
| Order history | 🔴 Falta | Alta | Backend | Implementar con mappers OrbitX. |
| Fees | 🔴 Falta | Media | Backend/Product | Normalizar desde proveedor y mostrar claro. |
| Positions | 🔴 Falta | Media | Backend | Solo si broker/futuros aprobado. |
| Provider account mapping | 🟡 Parcial | Alta | Backend | Schema/stubs listos; falta DB real. |
| Reconciliacion | 🟡 Parcial | Alta | Backend/Finance | Jobs documentados; falta ejecucion real. |
| Trading real bloqueado hasta aprobacion | ✅ Bien | Critica | CTO | Mantener flags false. |

## 3. Ledger / Finanzas internas

| Punto | Estado | Prioridad | Responsable | Accion |
|---|---|---|---|---|
| Backend Ledger real | 🟡 Parcial | Critica | Backend | Convertir stubs a servicios DB atomicos. |
| Double-entry accounting | 🟡 Parcial | Critica | Backend/Finance | Validadores/stubs listos; falta DB real. |
| DB real | 🔴 Falta | Critica | Backend | Crear migraciones Supabase/PostgreSQL. |
| Idempotency persistente | 🟡 Parcial | Critica | Backend | Stubs listos; falta tabla y transacciones. |
| Audit logs | 🟡 Parcial | Critica | Backend/Security | Schema listo; falta persistencia. |
| Provider reconciliation | 🟡 Parcial | Alta | Backend/Finance | Falta proveedor real y ledger DB. |
| Pool accounting | 🟡 Parcial | Alta | Backend/Product | Documentado; frontend sigue mock/controlado. |
| Social gifts accounting | 🟡 Parcial | Media | Backend/Product | Documentado/stub; no productivo. |
| Rewards reserve | 🔴 Falta | Alta | Backend/Finance | Implementar reservas reales antes de rewards. |
| Fees accounting | 🟡 Parcial | Alta | Backend/Finance | Stubs; falta DB y politicas. |
| No negative balances | 🟡 Parcial | Critica | Backend | Regla documentada; falta enforcement DB. |
| No auto-ajustes silenciosos | ✅ Bien | Critica | Finance | Mantener manual review. |

## 4. Seguridad

| Punto | Estado | Prioridad | Responsable | Accion |
|---|---|---|---|---|
| No secrets en frontend | ✅ Bien | Critica | Security | Mantener auditoria automatizada. |
| No API keys en app | ✅ Bien | Critica | Security | Mantener Bot Futures bloqueado. |
| No seed expuesta | 🧪 Requiere QA | Critica | Security/QA | Auditar flujos de reveal/import en APK. |
| No private keys expuestas | 🧪 Requiere QA | Critica | Security/QA | Prueba manual y revision de logs. |
| WalletConnect seguro | 🧪 Requiere QA | Alta | Web3 | Probar sesiones, disconnect y rechazo. |
| Auth backend | 🟡 Parcial | Critica | Backend | Stubs listos; falta JWT/session real. |
| RBAC | 🟡 Parcial | Critica | Backend | Roles definidos; falta DB enforcement. |
| Rate limits | 🔴 Falta | Alta | Backend | Agregar middleware por endpoint. |
| Token encryption | 🔴 Falta | Critica | Backend/Security | Definir KMS/secret rotation. |
| Audit logs | 🟡 Parcial | Critica | Backend/Security | Falta persistencia real. |
| Secure logs | 🟡 Parcial | Alta | Backend/Security | Sanitizar y centralizar logs. |
| Error handling | 🟡 Parcial | Media | Backend/Mobile | Normalizacion avanzada por modulo. |
| Session security | 🟡 Parcial | Alta | Backend/Mobile | Completar Supabase/Auth en EAS preview. |

## 5. Legal / Compliance

| Punto | Estado | Prioridad | Responsable | Accion |
|---|---|---|---|---|
| Terminos y condiciones | 🔴 Falta | Critica | Legal | Crear terminos para app crypto/fintech. |
| Politica de privacidad | 🔴 Falta | Critica | Legal | Incluir datos, wallet, analytics y backend. |
| Risk disclosures | 🔴 Falta | Critica | Legal/Product | Crypto, trading, Web3, rewards y pool. |
| Trading disclaimers | 🔴 Falta | Critica | Legal/Product | Requerido antes de beta financiera. |
| KYC/AML | ⛔ Bloqueante | Critica | Compliance | Definir proveedor/proceso. |
| Paises permitidos | ⛔ Bloqueante | Critica | Legal | Definir geofencing y jurisdicciones. |
| Soporte legal | 🔴 Falta | Alta | Legal | Flujos para reclamos/disputas. |
| Politica de retiros | 🔴 Falta | Critica | Finance/Legal | Necesaria antes de withdrawals. |
| Politica de recompensas | 🔴 Falta | Alta | Legal/Product | Evitar promesas de rentabilidad. |
| Proteccion de datos | 🔴 Falta | Alta | Legal/Security | Definir GDPR/LPDP/region objetivo. |

## 6. Backend / Infraestructura

| Punto | Estado | Prioridad | Responsable | Accion |
|---|---|---|---|---|
| Backend productivo | 🟡 Parcial | Alta | Backend/Ops | Astra backend existe; financiero no productivo. |
| DB productiva | 🔴 Falta | Critica | Backend/Ops | Crear Supabase/PostgreSQL productivo. |
| Backups | 🔴 Falta | Critica | Ops | Politica diaria + restore drills. |
| Monitoring | 🔴 Falta | Alta | Ops | Agregar uptime, metrics y alerts. |
| Logs | 🟡 Parcial | Alta | Backend/Ops | Centralizar logs sanitizados. |
| Alerts | 🔴 Falta | Alta | Ops | Alertas para errores, latencia y reconciliacion. |
| Health checks | 🟡 Parcial | Media | Backend | `/health` existe; ampliar financiero. |
| Rate limiting | 🔴 Falta | Alta | Backend/Security | Requerido antes de exponer endpoints. |
| Error tracking | 🔴 Falta | Media | Mobile/Ops | Sentry u alternativa. |
| CI/CD | 🟡 Parcial | Media | DevOps | Scripts locales; falta pipeline formal. |
| Environment separation | 🟡 Parcial | Alta | DevOps | EAS profiles existen; falta env policy. |
| Sandbox vs production | 🟡 Parcial | Alta | Backend/Ops | Flags listos; falta enforcement operacional. |

## 7. QA / Testing

| Punto | Estado | Prioridad | Responsable | Accion |
|---|---|---|---|---|
| QA Android real | 🧪 Requiere QA | Critica | QA | Matriz de dispositivos fisicos. |
| QA con wallets reales | 🧪 Requiere QA | Critica | Web3/QA | MetaMask, Trust, Coinbase. |
| QA WebView | 🧪 Requiere QA | Alta | QA | Browser, enlaces, pantallas negras. |
| QA Astra voz | 🧪 Requiere QA | Media | QA/AI | Permisos, latencia, TTS/STT. |
| QA cambio idioma | 🧪 Requiere QA | Media | QA/i18n | ES/EN en pantallas principales. |
| QA performance | 🧪 Requiere QA | Alta | QA/Mobile | Low-end Android y navegacion rapida. |
| QA low-end Android | 🧪 Requiere QA | Alta | QA | 3-4GB RAM, Android 10-12. |
| Unit tests | 🟡 Parcial | Media | Engineering | 18 tests; ampliar cobertura. |
| Backend tests | 🔴 Falta | Alta | Backend | No hay scripts server dedicados. |
| E2E tests futuros | 🔴 Falta | Media | QA | Maestro/Detox o plan manual formal. |
| Security tests | 🔴 Falta | Critica | Security | Secret scan, auth, wallet flows. |

## 8. Producto / Negocio

| Punto | Estado | Prioridad | Responsable | Accion |
|---|---|---|---|---|
| Modelo de ingresos | 🔴 Falta | Alta | Product/Finance | Definir fees, spread, broker terms. |
| Comisiones visibles | 🔴 Falta | Alta | Product/UX | Mostrar antes de dinero real. |
| Rewards claros | 🟡 Parcial | Media | Product/Legal | Evitar promesas, explicar demo/condiciones. |
| VIP real | 🔴 Falta | Media | Product/Backend | Backend VIP y reglas reales. |
| Roadmap OKX | 🟡 Parcial | Alta | CTO | Outline listo; falta approval/sandbox. |
| Pitch para partners | 🟡 Parcial | Media | CTO/Product | Outline creado; falta deck final. |
| Soporte al usuario | 🔴 Falta | Alta | Ops/Product | Helpdesk, FAQ, escalamiento. |
| Documentacion de producto | 🟡 Parcial | Media | Product | Completar docs user-facing. |
| Pagina web | 🔴 Falta | Media | Growth | Landing publica/compliance. |
| Material de marca | 🟡 Parcial | Baja | Brand | Pulir para partner/public launch. |

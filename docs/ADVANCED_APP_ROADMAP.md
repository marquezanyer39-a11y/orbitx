# OrbitX Advanced App Roadmap

Este roadmap ordena el trabajo por impacto real para llevar OrbitX desde APK interna hasta app publica avanzada. No asume OKX aprobado ni trading real activo.

## Nivel 1 - Antes de segunda APK interna

| Accion | Por que importa | Modulo | Dificultad | Riesgo | Impacto |
|---|---|---|---|---|---|
| QA Android real en 3-5 dispositivos | La app ya compila, pero WebView, WalletConnect, safe areas y permisos solo se validan bien en fisico. | Android/EAS | Media | Alto si se omite | Alto |
| Corregir mojibake residual en Polygon/Web3 | Un texto roto en Web3 da mala percepcion y erosiona confianza. | i18n/Web3 | Baja | Bajo | Medio |
| Validar Pool mensual en pantallas pequenas | El Pool fue redisenado, pero CTA/safe area necesita QA visual real. | Pool | Baja | Medio | Medio |
| Verificar Supabase/Auth en EAS preview | Auth incompleto bloquea beta tecnica y sesiones reales. | Auth/Mobile | Media | Alto | Alto |
| Crear matriz de bugs QA | Sin bug template, el QA se vuelve informal y se pierden regresiones. | QA | Baja | Medio | Alto |
| Smoke test WalletConnect en APK | WalletConnect suele fallar distinto en APK/dev client que en Expo Go. | Web3 | Media | Alto | Alto |

## Nivel 2 - Antes de beta tecnica cerrada

| Accion | Por que importa | Modulo | Dificultad | Riesgo | Impacto |
|---|---|---|---|---|---|
| Completar i18n ES/EN en pantallas principales | Una beta tecnica debe evitar textos mixtos/rotos. | i18n | Media | Medio | Medio |
| Ampliar tests de portfolio, Web3 helpers y feature flags | Protege contra volver a sumar mocks o activar trading. | Testing | Media | Alto | Alto |
| Refactor incremental AstraScreen/useAstraVoice restante | Aun son archivos grandes y sensibles a performance. | Astra | Alta | Medio | Medio |
| QA Browser/WebView con sitios reales | WebView negro o bloqueado puede romper percepcion premium. | Browser | Media | Alto | Medio |
| Documentar runbook APK interna | Facilita reproducir builds y pruebas. | Release | Baja | Medio | Medio |
| Definir policy de demos/mocks en UI | Evita que usuarios beta confundan demo con dinero real. | Product/UX | Media | Alto | Alto |

## Nivel 3 - Antes de presentar formalmente a OKX

| Accion | Por que importa | Modulo | Dificultad | Riesgo | Impacto |
|---|---|---|---|---|---|
| Preparar deck tecnico/comercial para OKX | OKX necesita entender modelo, riesgo y arquitectura. | Partner | Media | Alto | Alto |
| Cerrar checklist no-secrets frontend | Es punto critico para cualquier broker. | Security | Baja | Critico | Alto |
| Preparar demo controlada con APK | Una demo estable mejora credibilidad. | Release/Product | Media | Alto | Alto |
| Documentar paises objetivo y restricciones | Broker/compliance necesita jurisdiccion clara. | Legal/Product | Media | Critico | Alto |
| Definir volumen esperado y modelo de ingresos | Partner terms dependen de volumen/comisiones. | Business | Media | Medio | Alto |
| Mantener OKX stubs bloqueados | Evita parecer produccion falsa. | Backend OKX | Baja | Critico | Alto |

## Nivel 4 - Antes de OKX sandbox

| Accion | Por que importa | Modulo | Dificultad | Riesgo | Impacto |
|---|---|---|---|---|---|
| Crear migraciones DB provider/auth/idempotency | OAuth y ordenes sandbox requieren persistencia real. | Backend DB | Alta | Critico | Alto |
| Integrar Auth backend real | No se puede confiar en userId del frontend. | Auth/RBAC | Alta | Critico | Alto |
| Implementar RBAC persistente | Reconciliacion, rewards y admin requieren roles. | RBAC | Media | Alto | Alto |
| Implementar token encryption | Tokens OKX no pueden guardarse en claro. | Security | Alta | Critico | Alto |
| Implementar idempotency DB | Evita doble orden, doble gift o doble reward. | Idempotency | Alta | Critico | Alto |
| Agregar rate limiting | Protege endpoints y credenciales. | Backend Security | Media | Alto | Medio |

## Nivel 5 - Antes de beta financiera

| Accion | Por que importa | Modulo | Dificultad | Riesgo | Impacto |
|---|---|---|---|---|---|
| Implementar Backend Ledger real ACID | Sin ledger real no hay producto financiero seguro. | Ledger | Alta | Critico | Alto |
| Implementar reconciliacion provider vs ledger | Detecta diferencias antes de afectar usuarios. | Reconciliation | Alta | Critico | Alto |
| Probar OKX sandbox read-only | Primer paso seguro antes de ordenes. | OKX | Media | Alto | Alto |
| Probar ordenes sandbox con idempotencia | Validar lifecycle sin dinero real. | Trading | Alta | Critico | Alto |
| Crear KYC/AML plan | Beta financiera sin KYC/legal es riesgo serio. | Compliance | Alta | Critico | Alto |
| Agregar monitoring/error tracking | Sin observabilidad no hay operacion financiera responsable. | Ops | Media | Alto | Alto |

## Nivel 6 - Antes de lanzamiento publico

| Accion | Por que importa | Modulo | Dificultad | Riesgo | Impacto |
|---|---|---|---|---|---|
| Completar terminos, privacidad y risk disclosures | Requisito legal y de confianza. | Legal | Alta | Critico | Alto |
| Ejecutar auditoria externa de seguridad | App fintech/crypto publica necesita revision externa. | Security | Alta | Critico | Alto |
| Hardening de withdrawals | Retiros son el punto de mayor riesgo financiero. | Backend/Finance | Alta | Critico | Alto |
| Soporte operativo y runbooks | Usuarios reales necesitan soporte y escalamiento. | Ops | Media | Alto | Medio |
| E2E tests de flujos criticos | Reduce regresiones en login, wallet, trade y send. | QA | Alta | Alto | Alto |
| Plan de incident response | Necesario para fallos Web3, provider o ledger. | Ops/Security | Media | Alto | Alto |

## Nivel 7 - App publica avanzada

| Accion | Por que importa | Modulo | Dificultad | Riesgo | Impacto |
|---|---|---|---|---|---|
| Multi-provider broker abstraction real | Permite OKX/Binance/MEXC sin rehacer la app. | Trading Adapter | Alta | Medio | Alto |
| Ledger analytics y reporting financiero | Necesario para finanzas, auditoria y crecimiento. | Ledger/Finance | Alta | Alto | Alto |
| VIP backend real | Convierte VIP visual en producto medible. | VIP | Media | Medio | Medio |
| Rewards productivo con reservas | Rewards sin reserve real puede crear pasivos. | Rewards | Alta | Alto | Alto |
| Observabilidad avanzada | Escala operativa y soporte. | Ops | Media | Medio | Alto |
| Growth/partner dashboard | Ayuda a partners y negocio. | Product/Backend | Media | Bajo | Medio |

## Orden recomendado inmediato

1. QA Android real.
2. Corregir copy/mojibake residual.
3. Confirmar Supabase/Auth en EAS preview.
4. Crear migraciones DB backend.
5. Implementar auth real + RBAC.
6. Implementar idempotencia persistente.
7. Preparar demo/deck OKX.

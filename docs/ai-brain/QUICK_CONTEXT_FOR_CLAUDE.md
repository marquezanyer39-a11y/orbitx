# QUICK CONTEXT FOR CLAUDE

## Resumen operativo corto

- Nombre oficial del proyecto: `QVEX`.
- Nombres anteriores: `OrbitX`, `KIRO`, `Orbixt`.
- QVEX es una app financiera / cripto tipo super app con frontend Expo + React Native + TypeScript y backend Node con modulos sensibles.
- El repo mezcla branding nuevo `QVEX` con naming heredado `OrbitX`.
- Hay muchos cambios pendientes ya presentes en el repo antes de que Claude empiece.
- Claude no debe asumir que esos cambios son correctos; primero debe auditarlos y separarlos.

## Que es QVEX

QVEX busca unificar wallet, Web3, trading, social, asistencia IA, launchpad y servicios financieros en una sola plataforma. El proyecto combina flujos demo, beta visual, integraciones parciales y bases para arquitectura real.

## Modulos principales

- Astra
- Wallet / Web3
- Social
- Backend / server
- Ledger
- Providers
- Rewards
- Notifications
- Trading
- Bot Futures
- Create Token
- Ramp
- Security

## Reglas criticas

- No tocar `privateKey`.
- No tocar `mnemonic`.
- No tocar `seed phrase`.
- No tocar `signTransaction`.
- No tocar `sendTransaction`.
- No modificar `package.json` sin autorizacion.
- No hacer commit sin autorizacion.
- No usar `git reset --hard`.
- Astra nunca mueve dinero real sola.

## Como debe trabajar Claude

1. Leer primero este archivo.
2. Leer `CURRENT_PENDING_CHANGES.md`.
3. Leer `02-AI_RULES.md`.
4. Leer `07-SECURITY_RULES.md`.
5. Leer solo el skill del modulo activo.
6. No leer todo el repo si no es necesario.
7. Trabajar por fases pequenas.
8. No mezclar wallet, backend, Astra, social y trading en una sola fase.
9. Tratar cada modulo sensible como una auditoria antes de una implementacion.
10. Reportar siempre archivos modificados, riesgos y validaciones.

## Estrategia recomendada

- Empezar por auditoria y clasificacion de cambios pendientes.
- Separar cambios por modulo antes de pensar en commits.
- Detectar primero archivos eliminados, archivos nuevos y migraciones de estructura.
- Si un modulo toca dinero, auth, providers o ledger, frenar y validar alcance.

## Recordatorio de contexto

- El AI Brain existe para reducir consumo de tokens y evitar que Claude relea todo el repo.
- La fuente de contexto prioritaria esta en `docs/ai-brain/`.
- Si falta contexto para una tarea, ampliar lectura solo del modulo activo y no del proyecto completo.

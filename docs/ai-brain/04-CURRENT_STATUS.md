# CURRENT STATUS

## Identidad actual

- Nombre actual del proyecto: `QVEX`.
- Nombres anteriores o heredados: `OrbitX`, `KIRO`, `Orbixt`.
- Estado observable: el branding actual ya empuja fuerte a QVEX, pero el repositorio sigue mezclando naming heredado.

## Fotografia tecnica actual

- El frontend tiene estructura activa en `app/` y `src/`.
- Existe un modulo Astra amplio tanto en frontend como en backend.
- Hay base para wallet, trading, social, launchpad y browser Web3.
- El backend ya contiene piezas sensibles para `auth`, `ledger`, `providers`, `social` y `astra`.
- En `server/db/ledger-schema.sql` ya hay senales de diseno contable serio e inmutabilidad.
- Existe una gran cantidad de cambios pendientes en el repo fuera de `docs/ai-brain/`.
- Claude tomara el proyecto desde este punto de partida, no desde un arbol limpio.

## Fases revisadas en esta auditoria documental

- Fase 0: verificacion de restricciones del usuario.
- Fase 1: confirmacion de que `docs/ai-brain/` no existia.
- Fase 2: lectura minima de estructura del repo.
- Fase 3: deteccion de branding actual y legado.
- Fase 4: documentacion del cerebro tecnico.
- Fase 5: preparacion de contexto compacto para Claude.

## Fases pendientes del proyecto

- Consolidacion total de naming de marca a `QVEX`.
- Auditoria completa de wallet y Web3.
- Auditoria completa de auth y recuperacion de cuenta.
- Auditoria completa de `server/lib/providers/`.
- Validacion de limites entre simulacion Astra y operaciones reales.
- Reconciliacion entre frontend demo y backend productivo.
- Auditoria y clasificacion de cambios pendientes antes de programacion directa.

## Riesgos actuales

- Mezcla de branding `QVEX` y `OrbitX`, con riesgo de cambios inconsistentes.
- Posible confusion entre flujos demo, beta visual y flujos realmente operativos.
- Superficie sensible distribuida entre frontend y backend.
- Riesgo alto si una IA toca wallet, providers, auth o ledger sin contexto suficiente.
- Presencia de rutas y modulos de desarrollo que no deben confundirse con paths de produccion.
- Gran volumen de cambios sin clasificar por modulo, con riesgo de mezclar trabajo nuevo con trabajo previo.

## Siguiente auditoria recomendada

Prioridad recomendada:

1. Auditoria y clasificacion de cambios pendientes por modulo antes de programar.
2. Auditoria de `server/lib/providers/` y contratos de integracion.
3. Auditoria de wallet / Web3 en `src/services/wallet/`, `src/services/web3/` y `src/screens/WalletScreen/`.
4. Auditoria de `server/lib/auth/` y flujos `app/auth/`.
5. Auditoria de coherencia de branding para planificar migracion completa a QVEX.

## Nota operativa

Toda futura IA debe considerar este archivo una fotografia inicial, no una certificacion de seguridad. El primer trabajo de Claude debe ser auditoria y clasificacion, no programacion directa. El cerebro tecnico debe usarse como fuente principal de contexto para reducir consumo de tokens antes de leer mas del repo.

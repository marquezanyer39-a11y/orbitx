# PROJECT BRAIN

## Que es QVEX

QVEX es la identidad actual del proyecto. Tecnica e historicamente el repositorio todavia conserva rastros de nombres anteriores:

- `OrbitX`: nombre previo mas visible en el repo, README, rutas y piezas de branding heredadas.
- `KIRO`: nombre historico mencionado por direccion del proyecto, aunque no aparece de forma dominante en el arbol actual.
- `Orbixt`: variante historica de naming que debe tratarse como legado de marca.

Para cualquier IA, la regla practica es esta: el producto actual se llama `QVEX`, pero el codigo y la documentacion todavia pueden referirse a `OrbitX` y a identificadores heredados.

## Objetivo de la app

QVEX apunta a ser una app financiera y cripto de tipo super app con capas de:

- wallet y experiencia Web3
- trading y market data
- launchpad / creacion de tokens
- social / feed / creator economy
- automatizacion asistida por IA mediante Astra
- backend con ledger, providers, auth y reconciliacion

El repo mezcla estado demo, flujos simulados, integraciones parciales y bases de una futura arquitectura real de operaciones.

## Vision tecnica resumida

- Frontend principal en Expo + React Native + TypeScript.
- Navegacion basada en `app/` con Expo Router.
- Gran parte del dominio vive hoy en `src/`.
- Astra tiene presencia tanto en frontend (`src/astra/`) como en backend (`server/lib/astra/`).
- El backend contiene piezas sensibles para auth, ledger, providers, social y futuras operaciones reales.
- El proyecto ya muestra una intencion clara de endurecer seguridad, separar providers y mover logica critica al backend.

## Modulos principales

- `app/`: rutas y entrypoints visibles de la app.
- `src/astra/`: cerebro funcional de Astra, simulacion, riesgo, UI y tooling interno.
- `src/services/wallet/` y `src/screens/WalletScreen/`: experiencia wallet y flujos relacionados.
- `src/services/providers/`, `src/services/trading/`, `src/services/web3/`: conectividad de dominio sensible.
- `src/social/` y `src/services/social/`: modulo social y economia de creadores.
- `server/lib/astra/`: orquestacion backend de Astra.
- `server/lib/ledger/`: piezas para contabilidad interna y trazabilidad financiera.
- `server/lib/providers/`: integraciones con providers, incluyendo OKX.
- `server/lib/auth/`: autenticacion backend.
- `server/db/`: esquema de ledger y persistencia sensible.

## Reglas generales de interpretacion

- Asumir que `QVEX` es el nombre vigente del producto.
- Tratar todo rastro `OrbitX` como legado pendiente de consolidacion, no como una segunda app distinta.
- No asumir que un flujo visual beta es un flujo financiero real.
- No asumir que una simulacion Astra esta autorizada para operar dinero real.
- No mover logica sensible desde backend a frontend.
- No simplificar seguridad para "hacer que funcione rapido".

## Vision tecnica deseada

La direccion aparente del proyecto es evolucionar desde una app rica en demos y flujos asistidos hacia una plataforma mas robusta con:

- branding unificado en QVEX
- operaciones reales desacopladas del frontend
- providers y signing aislados
- ledger auditable e inmutable
- Astra asistiva, contextual y segura
- rollout por fases con controles de seguridad visibles

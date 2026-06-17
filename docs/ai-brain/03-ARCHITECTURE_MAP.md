# ARCHITECTURE MAP

Mapa base del proyecto para orientacion rapida de cualquier IA.

## Vista general

- `app/`: rutas de Expo Router y entrypoints de navegacion.
- `src/`: logica principal de frontend, dominio, servicios, componentes y estado.
- `server/`: backend Node con Astra, auth, ledger, providers y DB schema.
- `docs/`: documentacion funcional, auditorias previas y reportes.

## Mapa solicitado

### `app/`

- Existe.
- Contiene tabs, auth, bot futures, social, ramp, token, trade y rutas de desarrollo.
- Sensibilidad: media.
- Riesgo: cambios aqui pueden exponer rutas sensibles o confundir flujos de demo vs real.

### `src/`

- Existe.
- Es el nucleo del frontend actual.
- Sensibilidad: alta por mezcla de UI, servicios, seguridad, Web3 y branding.

### `src/astra/`

- Existe.
- Contiene config, contexto, eventos, memoria, relevancia, riesgo, simulacion, tools y UI.
- Sensibilidad: alta.
- Modulo sensible: si.

### `src/wallet/`

- No existe como carpeta autonoma en el arbol actual.
- Equivalentes actuales mas cercanos:
  - `src/services/wallet/`
  - `src/screens/WalletScreen/`
  - `src/components/wallet/`
  - `src/services/web3/`
- Sensibilidad: alta.
- Modulo sensible: si.

### `server/`

- Existe.
- Aloja logica de backend y piezas candidatas a operaciones reales.
- Sensibilidad: critica.

### `server/lib/astra/`

- Existe.
- Area de orquestacion y control backend de Astra.
- Sensibilidad: alta.
- Modulo sensible: si.

### `server/lib/ledger/`

- Existe.
- Area financiera interna.
- Sensibilidad: critica.
- Modulo sensible: si.

### `server/lib/social/`

- Existe.
- Backend del dominio social.
- Sensibilidad: media a alta.
- Modulo sensible: moderado.

### `server/lib/providers/`

- Existe.
- Integra proveedores y contiene subcarpetas como `okx`.
- Sensibilidad: critica.
- Modulo sensible: si.

### `server/db/`

- Existe.
- Contiene al menos `ledger-schema.sql`.
- Sensibilidad: critica.
- Modulo sensible: si.

## Otras zonas importantes detectadas

- `server/lib/auth/`: auth backend, modulo sensible.
- `src/services/providers/`: acceso de frontend a proveedores, modulo sensible.
- `src/services/security/`: reglas y capas de seguridad del frontend.
- `src/services/ledger/`: dominio financiero en frontend, sensible por coordinacion con backend.
- `src/services/web3/`: Web3, signing potencial y conectividad externa.
- `src/config/runtimeMode.ts`: flags de modo seguro / demo de QVEX.

## Convenciones de sensibilidad

- `Critica`: auth, signing, ledger, providers, transacciones, reconciliacion, DB financiera.
- `Alta`: wallet, Astra, seguridad, integraciones externas, runtime mode.
- `Media`: rutas, social, UI con dependencias de negocio.
- `Baja`: branding visual, textos, documentacion no operativa.

## Regla para futuras IA

Si una tarea toca cualquier modulo marcado como sensible, la IA debe detener el impulso de refactor rapido y entrar en modo de auditoria primero.

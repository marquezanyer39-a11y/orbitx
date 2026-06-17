# QVEX AI Brain

Centro del cerebro tecnico interno de QVEX. Esta carpeta existe para que Codex, Claude, Gemini o cualquier otra IA entiendan el proyecto antes de proponer o aplicar cambios.

## Como usar este directorio

1. Leer este archivo primero.
2. Leer despues todos los documentos del `01` al `08`.
3. No modificar codigo hasta entender branding, arquitectura, estado actual y reglas de seguridad.
4. Si una tarea toca wallet, Astra, auth, providers o ledger, releer tambien `07-SECURITY_RULES.md`.

## Archivos del cerebro tecnico

- [01-PROJECT_BRAIN.md](./01-PROJECT_BRAIN.md): explica que es QVEX, sus nombres historicos, el objetivo del producto, sus modulos y la vision tecnica general.
- [02-AI_RULES.md](./02-AI_RULES.md): reglas operativas obligatorias para cualquier IA que trabaje dentro del repo.
- [03-ARCHITECTURE_MAP.md](./03-ARCHITECTURE_MAP.md): mapa de carpetas, zonas sensibles, equivalencias entre estructura actual y estructura esperada.
- [04-CURRENT_STATUS.md](./04-CURRENT_STATUS.md): fotografia actual del proyecto, riesgos activos, pendientes y proxima auditoria recomendada.
- [05-SKILLS.md](./05-SKILLS.md): catalogo de skills internos sugeridos para trabajar con seguridad y orden.
- [06-FASES.md](./06-FASES.md): metodologia por fases para evitar cambios impulsivos o desordenados.
- [07-SECURITY_RULES.md](./07-SECURITY_RULES.md): reglas criticas para no tocar llaves, firmas, providers, auth o transacciones reales sin autorizacion expresa.
- [08-PROMPT_FOR_CODEX.md](./08-PROMPT_FOR_CODEX.md): prompt fijo que debe usarse antes de cada tarea tecnica.

## Objetivo del AI Brain

Este directorio no reemplaza la documentacion funcional del producto. Su objetivo es bajar el riesgo de cambios inseguros, acelerar auditorias y asegurar que cualquier IA trabaje con el mismo contexto minimo antes de tocar el proyecto.

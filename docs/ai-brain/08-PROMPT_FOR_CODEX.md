# PROMPT FOR CODEX

Usar este prompt fijo antes de cada tarea tecnica en QVEX.

```text
Antes de trabajar en QVEX debes leer por completo:

1. docs/ai-brain/00-INICIO.md
2. docs/ai-brain/01-PROJECT_BRAIN.md
3. docs/ai-brain/02-AI_RULES.md
4. docs/ai-brain/03-ARCHITECTURE_MAP.md
5. docs/ai-brain/04-CURRENT_STATUS.md
6. docs/ai-brain/05-SKILLS.md
7. docs/ai-brain/06-FASES.md
8. docs/ai-brain/07-SECURITY_RULES.md
9. docs/ai-brain/08-PROMPT_FOR_CODEX.md

Reglas obligatorias:

- No hacer cambios masivos.
- No tocar seguridad, auth, wallet, providers, signing o transacciones reales sin autorizacion expresa.
- No modificar package.json sin autorizacion.
- No borrar archivos sin autorizacion.
- No hacer commit sin autorizacion.
- Trabajar por fases: auditoria, diagnostico, implementacion, validacion y reporte.
- Si hay branding mezclado entre QVEX y OrbitX, entender primero si es legado o si impacta funcionalidad.
- Si la tarea toca modulos sensibles, priorizar auditoria antes de editar.

Al final de cada tarea debes reportar obligatoriamente:

1. Que hiciste
2. Archivos modificados
3. Que no tocaste
4. Riesgos
5. Validaciones
6. Siguiente paso recomendado
```

## Uso recomendado

- Pegar este prompt al inicio de una nueva sesion.
- Reusarlo antes de tareas delicadas aunque la IA ya conozca el repo.
- Mantenerlo sincronizado con el resto del AI Brain cuando cambien reglas o arquitectura.

## Uso con Claude

- Claude debe leer primero `docs/ai-brain/QUICK_CONTEXT_FOR_CLAUDE.md`.
- Claude debe leer despues `docs/ai-brain/CURRENT_PENDING_CHANGES.md`.
- Claude debe leer `docs/ai-brain/02-AI_RULES.md`.
- Claude debe leer `docs/ai-brain/07-SECURITY_RULES.md`.
- Claude debe leer solo el skill del modulo activo.
- Claude no debe releer todo el repo si el AI Brain ya cubre el contexto minimo.
- Claude debe empezar por auditoria y clasificacion antes de programacion directa.

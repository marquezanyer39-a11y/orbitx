# AI RULES

Reglas obligatorias para cualquier IA que trabaje en este repositorio.

## Reglas base

- No hacer cambios masivos sin auditoria previa.
- No tocar seguridad, auth, wallet, providers, ledger o transacciones sin autorizacion explicita.
- No modificar `package.json` salvo autorizacion expresa.
- No borrar archivos salvo autorizacion expresa.
- No hacer commit salvo autorizacion expresa.
- No instalar dependencias salvo autorizacion expresa.
- No hacer refactors grandes sin dividir el trabajo por fases.
- No sobrescribir documentacion o configuraciones existentes sin leerlas primero.

## Reglas de operacion

- Trabajar siempre con alcance acotado.
- Reportar antes y despues de cada cambio relevante.
- Preferir cambios pequenos, auditables y reversibles.
- Revisar branding heredado antes de renombrar identificadores.
- Marcar explicitamente cualquier zona sensible o ambigua.
- Si hay conflicto entre velocidad y seguridad, priorizar seguridad.

## Reglas de lectura minima antes de editar

Antes de tocar codigo, una IA debe:

1. Leer `00-INICIO.md`.
2. Leer `01-PROJECT_BRAIN.md`.
3. Leer `03-ARCHITECTURE_MAP.md`.
4. Leer `04-CURRENT_STATUS.md`.
5. Leer `07-SECURITY_RULES.md` si la tarea roza wallet, auth, Astra, providers o backend.

## Reglas sobre cambios delicados

- No cambiar contratos de providers sin diagnostico.
- No alterar flujos de wallet por intuicion.
- No reemplazar controles de seguridad por mocks silenciosos.
- No mover secretos, llaves o firmas al frontend.
- No habilitar operaciones reales solo porque un flujo demo "ya se ve listo".

## Regla final de reporte

Toda IA debe cerrar su trabajo con un reporte claro de:

1. Que hizo.
2. Que archivos toco.
3. Que no toco.
4. Riesgos detectados.
5. Validaciones ejecutadas.
6. Siguiente paso recomendado.

# FASES

Metodologia de trabajo recomendada para cualquier IA dentro de QVEX.

## Fase 1. Auditoria

- Leer el AI Brain completo.
- Identificar el modulo objetivo.
- Marcar si la tarea toca zona sensible.
- Confirmar restricciones antes de editar.

## Fase 2. Diagnostico

- Entender el problema real.
- Localizar archivos implicados.
- Separar causa raiz de sintomas.
- Detectar impactos laterales posibles.

## Fase 3. Refactor o implementacion controlada

- Aplicar cambios pequenos.
- Evitar cambios masivos.
- Mantener el alcance limitado al objetivo aprobado.
- No mezclar mejoras no solicitadas con cambios criticos.

## Fase 4. Validacion

- Revisar que no se afecten modulos sensibles adyacentes.
- Confirmar que no se alteraron rutas, auth, providers o signing por accidente.
- Ejecutar validaciones solo si estan permitidas y son necesarias.

## Fase 5. Reporte

Toda IA debe entregar:

1. Que hizo.
2. Que archivos modifico.
3. Que no toco.
4. Riesgos.
5. Validaciones.
6. Siguiente paso recomendado.

## Fase 6. Commit solo con autorizacion

- No hacer commit por defecto.
- No preparar cambios irreversibles sin aprobacion.
- Si hay permiso, resumir primero que se va a commitear.

## Regla transversal

Si una tarea entra en conflicto con seguridad, wallet, ledger, auth, Astra operativa o providers, volver a Fase 1 antes de continuar.

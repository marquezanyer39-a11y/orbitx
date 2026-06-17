# SECURITY RULES

Reglas criticas de seguridad para cualquier IA que trabaje en QVEX.

## Prohibiciones directas

- No tocar `privateKey` sin autorizacion expresa.
- No tocar `mnemonic` sin autorizacion expresa.
- No tocar `seed phrase` sin autorizacion expresa.
- No tocar `signTransaction` sin autorizacion expresa.
- No tocar `sendTransaction` sin autorizacion expresa.
- No tocar `providers` sin autorizacion expresa.
- No tocar `auth` sin autorizacion expresa.
- No tocar transacciones reales sin autorizacion expresa.

## Reglas de wallet y Web3

- Nunca pedir ni exponer secretos por logs, UI o mocks.
- Nunca mover firma real al frontend por conveniencia.
- Nunca asumir que una wallet externa ya esta aprobada para operar.
- Si se detecta logica de firma o envio, tratarla como critica.

## Reglas de backend financiero

- Ledger, balances, reconciliacion y providers son superficie critica.
- No romper invariantes de inmutabilidad.
- No suavizar controles para acelerar demos.
- No mezclar dinero real con simulacion.

## Reglas de Astra

- Astra puede explicar, asistir, recomendar o simular.
- Astra no debe mover dinero real por si sola.
- Astra no debe ejecutar flujos financieros reales sin autorizacion expresa y boundary backend auditado.
- Todo puente entre Astra y acciones operativas debe considerarse modulo critico.

## Reglas de auth

- No alterar login, recovery, sesiones o permisos por intuicion.
- No reducir validaciones de seguridad para "destrabar" una tarea.
- No exponer estados internos sensibles en errores visibles al usuario.

## Regla de escalacion

Si una IA detecta que la tarea roza firmas, envio de fondos, providers reales, credenciales, recovery o auth, debe frenar, reportar riesgo y pedir confirmacion antes de continuar.

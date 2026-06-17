# SKILLS

Skills internos sugeridos para trabajar con QVEX de manera segura y ordenada.

## 1. Auditoria segura

Objetivo:
Revisar zonas sensibles sin cambiar comportamiento.

Uso:
- leer arquitectura
- identificar modulos criticos
- detectar deuda o riesgo
- proponer cambios pequenos y auditables

Reglas:
- no editar primero
- reportar hallazgos antes de actuar
- separar hallazgos criticos de mejoras cosmeticas

## 2. Wallet segura

Objetivo:
Trabajar en wallet, Web3 y signing sin poner en riesgo fondos ni secretos.

Uso:
- revisar `src/services/wallet/`
- revisar `src/services/web3/`
- revisar `src/screens/WalletScreen/`
- validar limites entre wallet local, wallet externa y firma real

Reglas:
- nunca mover secretos al frontend
- nunca pedir seed phrase por comodidad tecnica
- nunca habilitar signing real sin autorizacion expresa

## 3. Backend audit

Objetivo:
Auditar backend de operaciones, providers, auth y ledger.

Uso:
- revisar `server/lib/`
- revisar `server/db/`
- mapear dependencias entre auth, providers y ledger

Reglas:
- priorizar integridad de datos
- no simplificar invariantes financieras
- documentar side effects antes de cambiar codigo

## 4. Astra

Objetivo:
Trabajar sobre Astra sin confundir simulacion, soporte contextual y ejecucion real.

Uso:
- revisar `src/astra/`
- revisar `server/lib/astra/`
- identificar limites de tools, memoria, riesgo y UI

Reglas:
- Astra puede asistir, explicar y simular
- Astra no debe operar fondos reales sola
- todo puente entre Astra y operaciones debe auditarse

## 5. Branding QVEX

Objetivo:
Ordenar naming y experiencia de marca sin romper compatibilidad tecnica.

Uso:
- localizar `OrbitX`, `QVEX`, `KIRO`, `Orbixt`
- diferenciar branding visible de ids tecnicos heredados

Reglas:
- no renombrar masivamente sin plan
- preservar compatibilidad cuando un identificador legado tenga impacto tecnico
- documentar toda deuda de naming

## 6. Refactor seguro

Objetivo:
Reducir deuda tecnica con cambios pequenos, reversibles y medibles.

Uso:
- refactors por modulo
- limpieza localizada
- extraccion de helpers o boundaries claros

Reglas:
- no mezclar refactor con cambios de negocio sin avisar
- cambiar una capa a la vez
- validar impacto antes de ampliar alcance

## 7. Reporte de commits

Objetivo:
Preparar reportes claros de cambios cuando exista autorizacion para commitear.

Uso:
- resumir cambios
- listar archivos
- explicar riesgos y validaciones

Reglas:
- no hacer commit sin permiso
- si no hubo permiso, dejar reporte listo pero no ejecutar commit

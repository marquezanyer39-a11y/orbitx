# OrbitX Growth Architecture

## Base de crecimiento

Trading Adapter Layer e Internal Ledger permiten que OrbitX crezca sin rehacer la app cada vez que cambie el proveedor, el producto financiero o el motor de ejecucion.

## Por que evita rehacer pantallas

La app consume:

- `tradingService`
- modelos internos `Trading*`
- servicios de ledger internos

El proveedor queda detras del backend/adapters. Si hoy se usa OKX y manana Binance, MEXC o motor propio, la UI mantiene la misma forma de consumir datos.

## Fronteras

Frontend:

- UI
- estados demo honestos
- consumo de modelos OrbitX
- validaciones ligeras

Backend:

- secretos
- firma de proveedor
- ejecucion real
- ledger productivo
- auditoria
- reconciliacion
- permisos
- KYC/AML

## Riesgos de mal diseno

- dependencia directa de OKX en la app
- secrets en frontend
- saldos internos mezclados con Web3
- demos que parecen dinero real
- proveedor imposible de reemplazar
- ordenes sin idempotency keys
- ledger sin doble entrada

## Roadmap recomendado

1. Mock controlado: adapter mock y ledger mock aislado.
2. Proveedor broker externo: OKX/Binance/MEXC via backend firmado.
3. Multi-provider: seleccionar proveedor por region, liquidez o disponibilidad.
4. Motor propio parcial: matching interno para pares seleccionados.
5. Motor propio completo: provider `orbitx` productivo con reconciliacion y reservas propias.

# Legacy Review — OrbitX

Esta lista documenta archivos o rutas que parecen legacy, duplicadas o de revisión futura, pero que no se eliminaron porque no hay evidencia suficiente para hacerlo sin riesgo.

| Archivo | Tipo | Evidencia | Riesgo | Recomendación |
|---|---|---|---|---|
| `app/bot.tsx` | Ruta legacy | Alias directo a `BotFuturesOverviewScreen`; convive con `app/bot-futures/*`. | Medio: puede exponer entrada antigua al flujo de bot. | Mantener por ahora; decidir si redirigir a `/bot-futures` tras QA. |
| `app/create.tsx` | Ruta legacy | Redirige a `/create-token`. | Bajo. | Mantener como compatibilidad/deep link. |
| `app/trade/index.tsx` | Ruta legacy | Redirige a `/spot`. | Bajo. | Mantener como compatibilidad/deep link. |
| `src/navigation/AppNavigator.ts` | Helper legacy/activo | Importado por Home, Markets, Favorites y Astra actions. | Medio si se elimina. | No borrar; migrar helpers gradualmente a rutas Expo Router tipadas. |
| `src/navigation/TabNavigator.ts` | Helper activo | Usado por `app/(tabs)/_layout.tsx` para tab order. | Alto si se elimina. | Mantener. |
| `components/wallet/Web3AssetsList.tsx` | Componente posiblemente legacy | No se detectaron imports activos directos en `app/` o `src/`. | Bajo/medio: puede estar reservado para wallet modular futura. | Revisar visualmente tras QA; no borrar todavía. |
| `components/wallet/Web3NetworkFilter.tsx` | Componente posiblemente legacy | No se detectaron imports activos directos. | Bajo/medio. | Revisar tras QA. |
| `components/wallet/Web3WalletSummary.tsx` | Componente posiblemente legacy | No se detectaron imports activos directos. | Bajo/medio. | Revisar tras QA. |
| `services/trade/oneInch.ts` | Servicio legacy sensible | Usa mnemonic/local wallet y es importado por servicios root de trade/listing. | Alto: toca firma local; fuera de alcance de esta limpieza. | Auditar antes de cualquier producción; no conectar a UI pública. |
| `services/trade/orbitTrade.ts` | Servicio legacy sensible | Importa `oneInch`. | Alto. | Mantener aislado; revisar antes de swap real. |
| `services/listing/liquidityLock.ts` | Servicio sensible | Usa mnemonic para signer. | Alto. | No tocar sin fase dedicada de seguridad wallet/local deploy. |
| `services/liquidity/evmLiquidity.ts` | Servicio sensible | Usa mnemonic para signer. | Alto. | No tocar sin fase dedicada. |
| `services/tokens/evmMemecoin.ts` | Servicio sensible | Usa mnemonic para signer. | Alto. | No tocar sin fase dedicada. |
| `src/services/dex/swapSimulation.ts` | Demo activo | Usado por `src/hooks/useTradeForm.ts`. | Medio si el copy se confunde con swap real. | Mantener etiquetado como simulación; no activar swap real. |

## Nota de seguridad

No se eliminaron rutas ni servicios que pudieran afectar Web3, WalletConnect, envío EVM/ERC-20, Trading Adapter, Internal Ledger, Home balance, seed phrase o private keys.

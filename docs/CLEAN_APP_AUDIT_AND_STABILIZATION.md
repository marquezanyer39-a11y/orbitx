# Clean App Audit & Stabilization — OrbitX

## 1. Resumen ejecutivo

Se ejecutó una limpieza conservadora orientada a APK interna limpia. No se reescribió la app, no se eliminaron rutas sensibles y no se tocó lógica Web3, WalletConnect/Reown, envío EVM/ERC-20, Home balance, Trading Adapter, Internal Ledger ni OKX real.

Se limpiaron archivos temporales de lint, se reforzaron flags declarativas seguras, se corrigieron textos visibles sin cambiar comportamiento y se documentaron rutas/servicios dudosos en `docs/legacy-review.md` en lugar de borrarlos.

## 2. Estado antes de limpieza

| Área | Hallazgo | Estado | Acción |
|---|---|---|---|
| Navegación | Expo Router con tabs principales y varias rutas wrapper/redirect. | Funcional con rutas legacy controladas. | Documentar, no borrar. |
| Home balance | `usePortfolioData` excluye Spot demo cuando `trade.isDemoMode` está activo y fuerza Cuenta Local a `0`. | Seguro. | Sin cambios. |
| Web3 | Web3 Wallet, Send, DApps Hub, Browser y servicios ERC-20 existen. | Activo/parcial usable. | Sin cambios. |
| Trading | Trading real deshabilitado por flags. | Seguro. | Solo copy de error, sin lógica. |
| Ledger/Pool/Social | Frontend mock/controlado. | No productivo. | Flags explícitas/documentación. |
| Archivos temporales | `lint_*.txt` en raíz. | Basura local. | Eliminados e ignorados. |
| Legacy sensible | Servicios root con mnemonic en flows antiguos. | Riesgo alto si se conectan. | Documentados, no tocados. |

## 3. Rutas activas

| Ruta | Pantalla/acción | Estado | Recomendación |
|---|---|---|---|
| `/home` | Home tab | Activa | Mantener. |
| `/market` | Markets tab | Activa | Mantener. |
| `/spot` | Trade/Spot tab | Demo/controlada | Mantener con etiquetas demo. |
| `/wallet` | Wallet principal | Activa | Mantener. |
| `/wallet-web3` | Web3 Wallet | Activa | QA Android real. |
| `/wallet-local` | Cuenta Local | Demo/controlada | Mantener como no productiva. |
| `/wallet-spot` | Spot Wallet | Demo/controlada | Mantener como demo. |
| `/send` | Send EVM/ERC-20 | Activa | QA con monto pequeño. |
| `/dapps` | DApps Hub | Activa | QA Browser/returnTo. |
| `/browser` | Browser WebView | Activa | QA Android físico. |
| `/pool` | Pool mensual | Mock/controlado | Mantener sin dinero real. |
| `/profile` | Perfil tab | Activa | Mantener. |
| `/profile-vip` | Rango OrbitX | Activa oculta | Mantener accesible desde Perfil. |
| `/create-token*` | Crear Token flow | Parcial real EVM/demo según paso | Mantener con copy honesto. |
| `/bot-futures/*` | Bot Futures seguro | Bloqueado/backend pendiente | Mantener sin API secrets. |
| `/social/*` | Social/Gifts | Mock/parcial | Mantener etiquetado. |
| `/ramp/*` | Ramp | Parcial/proveedor pendiente | Mantener como parcial. |

## 4. Rutas legacy / huérfanas

| Ruta/archivo | Estado | Recomendación |
|---|---|---|
| `app/bot.tsx` | Alias legacy hacia Bot Futures overview. | Mantener por ahora; evaluar redirect a `/bot-futures` tras QA. |
| `app/create.tsx` | Redirect a `/create-token`. | Mantener para compatibilidad. |
| `app/trade/index.tsx` | Redirect a `/spot`. | Mantener para compatibilidad. |
| `components/wallet/Web3AssetsList.tsx` | Posible componente legacy no importado directo. | No borrar todavía. |
| `components/wallet/Web3NetworkFilter.tsx` | Posible componente legacy no importado directo. | No borrar todavía. |
| `components/wallet/Web3WalletSummary.tsx` | Posible componente legacy no importado directo. | No borrar todavía. |

Ver detalle ampliado en `docs/legacy-review.md`.

## 5. Archivos eliminados

| Archivo | Motivo |
|---|---|
| `lint_after.txt` | Salida temporal heredada de lint. |
| `lint_after_pass1.txt` | Salida temporal heredada de lint. |
| `lint_baseline.txt` | Baseline temporal heredado. |
| `lint_final.txt` | Salida temporal heredada de lint. |
| `lint_walletconnect_microfix.txt` | Salida temporal heredada de lint. |

## 6. Archivos modificados

| Archivo | Cambio |
|---|---|
| `.gitignore` | Se agregó `lint_*.txt` para evitar basura local de auditorías. |
| `src/constants/featureStatus.ts` | Se agregaron flags explícitas para `swap`, `dapps`, `ledger`, `pool`, `social` y `broker`; se mantuvo `trade.isRealTradingEnabled=false` y `allowOrderPlacement=false`. |
| `src/screens/WalletScreen/LocalAccountScreen.tsx` | Corrección de copy visible: “Cuenta Local está en modo demo...”. |
| `src/screens/BotFuturesConnectSuccessScreen/index.tsx` | Copy corregido en español y reforzado: backend seguro pendiente, sin secrets guardados. |
| `src/services/trading/tradingErrors.ts` | Solo copy de errores en español; sin cambios de lógica. |
| `docs/legacy-review.md` | Lista de rutas/servicios dudosos no eliminados. |
| `docs/CLEAN_APP_AUDIT_AND_STABILIZATION.md` | Reporte de esta fase. |

## 7. Archivos dudosos no eliminados

| Archivo | Motivo |
|---|---|
| `services/trade/oneInch.ts` | Usa mnemonic y signer local; requiere auditoría dedicada antes de swap real. |
| `services/trade/orbitTrade.ts` | Depende de `oneInch`; no borrar sin rastreo completo. |
| `services/listing/liquidityLock.ts` | Usa signer local; zona sensible. |
| `services/liquidity/evmLiquidity.ts` | Usa signer local; zona sensible. |
| `services/tokens/evmMemecoin.ts` | Usa signer local; zona sensible. |
| `src/navigation/AppNavigator.ts` | Helper todavía usado por Home/Markets/Favorites/Astra. |
| `src/navigation/TabNavigator.ts` | Usado por tabs reales. |

## 8. Feature flags

| Módulo | Estado final |
|---|---|
| `trade` | Demo, provider `mock`, `isRealTradingEnabled=false`, `allowOrderPlacement=false`. |
| `web3` | DApps Hub habilitado, swap real deshabilitado, warning DApps habilitado. |
| `swap` | `isEnabled=false`, provider `disabled`, coming soon activo. |
| `dapps` | Catálogo whitelisted activo con advertencia. |
| `ledger` | Mock controlado, no productivo, aislado de Home/Wallet real. |
| `pool` | Mock/controlado, no dinero real. |
| `social` | Mock/controlado, no dinero real. |
| `broker` | OKX no conectado, sandbox pendiente, trading real deshabilitado. |

## 9. Módulos reales vs demo

| Módulo | Estado | Real/mock/parcial/próximamente | Riesgo | Próximo paso |
|---|---|---|---|---|
| Home | Funcional | Parcial real Web3 + filtros demo | Medio | QA Android y verificar copy en pantalla chica. |
| Wallet principal | Funcional | Parcial | Medio | QA navegación y claridad local/externa. |
| Web3 Wallet | Parcial usable | Real on-chain para wallet externa | Alto | QA físico MetaMask/Trust/Coinbase. |
| Send EVM/ERC-20 | Parcial usable | Real con firma usuario | Alto | QA con monto pequeño y rechazo de firma. |
| DApps Hub | Funcional | Whitelist | Medio | QA warning + returnTo. |
| Browser | Funcional | WebView real | Medio | QA WebView Android para evitar pantalla negra. |
| Trade/Spot | Demo | Mock/controlado | Alto si se confunde | Mantener etiquetas demo. |
| Pool mensual | Visual/mock | Mock/controlado | Alto si se confunde | Mantener sin dinero real. |
| Bot Futures | Bloqueado seguro | Backend pendiente | Alto si se reabre API secret | Mantener bloqueo. |
| Internal Ledger | Mock aislado | Mock/controlado | Alto | No conectar a Home hasta backend real. |
| OKX/Broker | Stubs/backend pendiente | No conectado | Alto | Sandbox solo tras aprobación/credenciales. |
| Crear Token | Parcial | Deploy EVM parcial + pasos demo | Alto | QA y copy honesto por paso. |

## 10. Home

- Confirmado: Home no suma Spot demo cuando `FEATURE_STATUS.trade.isDemoMode` está activo.
- Confirmado: Cuenta Local se fuerza a `0` en `usePortfolioData`.
- Confirmado: ledger mock, pool mock y rewards mock no alimentan Home.
- Confirmado: Web3 externo puede sumar si hay wallet conectada y balance real estimado.

## 11. Wallet/Web3

- Wallet externa y wallet local se mantienen separadas.
- Web3 Wallet, DApps Hub, Browser y Send no se modificaron en lógica.
- Swap sigue como “Próximamente”, sin cotización ni ejecución real.
- DApps Hub sigue activo por flags y con advertencia.
- Cuenta Local conserva estado demo/controlado y copy explícito.

## 12. Seguridad

- Sin seed phrase tocada.
- Sin private keys tocadas.
- Sin API secrets agregados.
- Sin OKX real conectado.
- Sin trading real activado.
- Sin swap real activado.
- Sin Home balance modificado.
- Sin Ledger mock conectado a Home.
- Sin logs sensibles nuevos.
- Sin saldo falso ni hash falso agregado.

## 13. UI/UX

Corregido:

- Copy de Bot Futures con acentos y mensaje de backend seguro pendiente.
- Copy de Cuenta Local indicando claramente modo demo.
- Feature flags con textos más claros para estados demo/bloqueados.

Pendiente para QA:

- Pantallas Android pequeñas.
- Safe areas en Pool y Browser.
- Browser WebView en dispositivo físico.
- DApps warning y retorno a DApps Hub.
- Send EVM/ERC-20 con wallet real.

## 14. Dependencias

`package.json` fue revisado. No se eliminaron dependencias porque hay módulos sensibles y dependencias de runtime Web3/Expo/Reown/WebView/Supabase que requieren evidencia fuerte antes de removerse.

## 15. Validación

| Comando | Resultado |
|---|---|
| `npm run typecheck` | OK |
| `npm run lint` | OK, 0 errores / 0 warnings |
| `npm test -- --passWithNoTests` | OK, 7 archivos / 26 tests |
| `npx expo-doctor` | Falló inicialmente por certificado/red de Expo API, no por código |
| `$env:NODE_OPTIONS='--use-system-ca'; npx expo-doctor` | OK, 18/18 checks |

## 16. Qué queda pendiente antes de APK

- QA Android físico completo.
- Confirmar WebView sin pantalla negra.
- Confirmar WalletConnect/Reown en APK instalada.
- Probar Send EVM/ERC-20 con monto pequeño y rechazo de firma.
- Revisar rutas legacy `app/bot.tsx`, `app/create.tsx`, `app/trade/index.tsx` tras QA.
- Auditar servicios root sensibles que usan mnemonic antes de producción.

## 17. Recomendación final

OrbitX queda más limpia y coherente para una APK interna, sin cambios de lógica sensible. Está lista para continuar con QA Android real, pero no para beta financiera ni público: siguen pendientes OKX sandbox/aprobación, backend ledger real, auth/RBAC productivo, reconciliación real, KYC/legal y auditoría profunda de servicios legacy con mnemonic.

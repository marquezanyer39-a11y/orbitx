# Web3 DApps Hub + Swap UX — OrbitX

## 1. Resumen ejecutivo

Se implementó una mejora focalizada de UX Web3 sin activar swaps reales ni tocar WalletConnect core. OrbitX ahora tiene un DApps Hub con catálogo whitelisted, ruta propia `/dapps`, apertura segura hacia Browser con advertencia previa y botón Swap visible como “Próximamente” sin cotizaciones ni ejecución real.

La arquitectura mantiene la regla: wallet externa y DApps externas viven separadas de wallet local, Trading Adapter, Ledger, Home balance, OKX y backend financiero.

## 2. Problemas encontrados antes de esta fase

| Área | Estado previo | Riesgo |
|---|---|---|
| Browser | WebView/hub genérico con links mixtos | DApps sin whitelist central |
| DApps | No existía catálogo profesional centralizado | UX pobre y riesgo de abrir URLs no verificadas |
| Web3 Wallet | Acciones rápidas no distinguían Swap vs DApps Hub | Descubrimiento Web3 poco claro |
| Swap | No había contrato futuro formal disabled | Riesgo de mock ambiguo |
| Seguridad DApps | No había warning bloqueante antes de abrir DApp | Usuario podía entrar sin recordatorio de riesgo |

## 3. Archivos revisados

| Archivo | Existe | Estado actual DApps | Estado actual Swap | Calidad UX | Riesgo al modificar |
|---|---:|---|---|---|---|
| src/screens/WalletScreen/Web3WalletScreen.tsx | Sí | Card genérica Web3 | Sin flujo visual | Buena | Medio |
| src/screens/SendScreen/index.tsx | Sí | No aplica | No swap | Parcial por envío | Alto, no se modificó |
| app/browser.tsx | Sí | Wrapper | No aplica | Correcto | Bajo |
| src/screens/BrowserScreen/* | Sí | Browser modular | No aplica | Buena base | Medio |
| src/services/web3/web3NetworkConfig.ts | Sí | Redes EVM | No swap | Correcta | Medio |
| src/services/wallet/tokenRegistry.ts | Sí | Tokens EVM | No swap | Correcta | Medio |
| src/constants/featureStatus.ts | Sí | Sin flags DApps/Swap | Sin flags Swap | Parcial | Bajo |
| app/_layout.tsx | Sí | Sin ruta dapps | No aplica | Correcta | Bajo |

Respuestas explícitas:
- ¿El Browser actual es solo un WebView genérico? Parcialmente sí: ya tenía hub, pero no catálogo DApps whitelisted.
- ¿Existe ya algún catálogo de DApps? No centralizado; solo links en `constants/externalLinks.ts`.
- ¿Cómo se maneja el cambio de red actualmente? Desde Web3 Wallet vía Reown/AppKit y `switchExternalWalletNetwork`.
- ¿Los botones de acción en Web3WalletScreen están bien organizados? Parcial; ahora separan Enviar, Recibir, Intercambiar y DApps.
- Estado de feature flags Web3: ahora existe `FEATURE_STATUS.web3` con DApps habilitado y Swap real deshabilitado.

## 4. Archivos creados

| Archivo | Propósito |
|---|---|
| app/dapps.tsx | Ruta Expo Router para DApps Hub |
| src/constants/dappsCatalog.ts | Catálogo central whitelisted y helpers |
| src/constants/dappsCatalog.test.ts | Tests de whitelist y búsqueda |
| src/screens/DappsScreen/index.tsx | Pantalla DApps Hub |
| src/services/web3/swap/swapTypes.ts | Tipos futuros de swap |
| src/services/web3/swap/swapProviderAdapter.ts | Adapter disabled |
| src/services/web3/swap/swapService.ts | Servicio disabled sin quotes falsas |
| src/services/web3/swap/index.ts | Exports swap |
| docs/WEB3_DAPPS_SWAP_UX.md | Reporte de la fase |

## 5. Archivos modificados

| Archivo | Cambio |
|---|---|
| app/_layout.tsx | Registro de ruta `dapps` |
| src/constants/featureStatus.ts | Flags Web3/DApps/Swap |
| src/screens/BrowserScreen/BrowserScreen.tsx | Warning de DApps antes del WebView |
| src/screens/BrowserScreen/BrowserHeader.tsx | Título dinámico de DApp |
| src/screens/BrowserScreen/BrowserWebView.tsx | Error robusto y pull-to-refresh |
| src/screens/BrowserScreen/browserStyles.ts | Estilos warning DApps |
| src/screens/BrowserScreen/useBrowserViewModel.ts | Whitelist DApps, warning session-only, errores |
| src/screens/WalletScreen/Web3WalletScreen.tsx | Acciones rápidas + modal Swap Coming Soon |
| src/screens/WalletScreen/web3/web3WalletStyles.ts | Estilos modal Swap |

## 6. DApps Hub (detalles y categorías)

Categorías:
- DEX
- Lending
- NFT
- Portfolio
- Bridge
- Staking

DApps incluidas:
- Uniswap: `https://app.uniswap.org/`
- Aave: `https://app.aave.com/`
- OpenSea: `https://opensea.io/`
- DeFiLlama: `https://defillama.com/`
- Stargate: `https://stargate.finance/`
- PancakeSwap: `https://pancakeswap.finance/`
- Lido: `https://stake.lido.fi/`
- Zapper: `https://zapper.xyz/`

Helpers creados:
- `getEnabledDapps()`
- `getDappsByCategory()`
- `getDappsByChain()`
- `getDappById()`
- `searchDapps()`
- `isWhitelistedDappUrl()`

## 7. Integración Browser

El flujo seguro quedó:

1. Web3 Wallet → DApps Hub.
2. DApps Hub → Browser con `dappId`, `initialUrl`, `title`, `source=dapp`, `returnTo=/dapps`.
3. Browser valida que la URL coincida con el catálogo.
4. Si la URL no está whitelisted, bloquea y vuelve al home del Browser.
5. Si está whitelisted, muestra advertencia antes de montar el WebView.
6. Usuario acepta y recién ahí carga la DApp.

Mejoras:
- Título dinámico de DApp.
- `returnTo` conserva regreso al Hub.
- Error state si WebView falla.
- Pull-to-refresh habilitado en WebView.
- Sin inyección JavaScript peligrosa.

## 8. Implementación Swap (Coming Soon)

Swap quedó visible como acción “Intercambiar” en Web3 Wallet, pero no ejecuta ni cotiza.

El modal explica:
- Proveedor seguro futuro.
- Cotización verificable futura.
- Slippage visible futuro.
- Resumen antes de firma.
- Approvals exactos.

El servicio de swap:
- No genera cotizaciones falsas.
- No ejecuta transacciones.
- Devuelve `SWAP_NOT_ENABLED`.
- Mantiene contrato futuro tipado.

## 9. Feature Flags

Se agregó `FEATURE_STATUS.web3`:

| Flag | Valor | Estado |
|---|---|---|
| dappsHubEnabled | true | Hub activo |
| swapEnabled | false | Swap real bloqueado |
| swapProvider | disabled | Sin proveedor real |
| showSwapComingSoon | true | Modal informativo activo |
| dappsWarningEnabled | true | Warning DApps activo |
| web3ActionsCompactMode | true | Acciones compactas |

## 10. Mejoras de UX realizadas

- Acciones rápidas claras: Recibir, Enviar, Intercambiar, DApps.
- DApps Hub con búsqueda, filtros, riesgo visible y estado empty.
- Wallet conectada visible en DApps Hub.
- Riesgo bajo/medio/alto visible en cada DApp.
- Browser no carga DApp antes de advertencia.
- Swap aparece como funcionalidad futura, sin simular mercado.

## 11. Seguridad — Confirmación detallada

- [x] No seed phrase.
- [x] No private keys.
- [x] No secrets en storage.
- [x] No WalletConnect core tocado.
- [x] No envío EVM/erc20 existente roto.
- [x] No swap real activado.
- [x] No cotizaciones falsas.
- [x] No ejecuciones falsas.
- [x] No URLs DApps no verificadas desde el Hub.
- [x] No inyección JS peligrosa en WebView.
- [x] No historial sensible persistente.
- [x] No logs sensibles agregados.
- [x] No Trading Adapter tocado.
- [x] No Internal Ledger tocado.
- [x] No OKX/Broker tocado.
- [x] No Pool/Social/Rewards tocados.
- [x] Home balance no tocado.

## 12. QA Android Checklist

| Caso | Acción | Esperado | Estado |
|---|---|---|---|
| Abrir Hub | Web3 Wallet → DApps | Carga `/dapps` | PENDING APK |
| Buscar DApp | Buscar “swap” | Muestra Uniswap/PancakeSwap | PENDING APK |
| Filtrar categoría | Tap DEX | Solo DEX | PENDING APK |
| Abrir Uniswap | Tap Uniswap | Warning antes de WebView | PENDING APK |
| Aceptar warning | Tap “Entiendo” | Carga app.uniswap.org | PENDING APK |
| Cancelar warning | Tap Cancelar | Vuelve al Hub | PENDING APK |
| URL no whitelist | Abrir Browser dapp con URL inválida | Bloquea y muestra mensaje | PENDING DEV |
| Error WebView | Cortar red/cargar inválida | Error state y reintentar | PENDING APK |
| Pull refresh | Deslizar refresh | WebView recarga | PENDING APK |
| Swap | Tap Intercambiar | Modal próximamente | PENDING APK |
| Cerrar Swap | Tap Entendido | Modal cierra | PENDING APK |
| WalletConnect | Conectar wallet | No cambia core | PENDING APK |
| Envío nativo/ERC-20 | Ir a Send | Flujo existente sigue | PENDING APK |

## 13. Validación técnica

| Comando | Resultado |
|---|---|
| npm run typecheck | OK |
| npm run lint | OK, 0 errores |
| npm test -- --passWithNoTests | OK, 7 archivos / 26 tests |
| npx expo-doctor | OK con `NODE_OPTIONS=--use-system-ca`, 18/18 checks |

## 14. Limitaciones y próximos pasos

- QA Android físico pendiente para WebView real.
- DApps no usan conexión inyectada propia de OrbitX; dependen del comportamiento del sitio y wallet externa.
- Swap real sigue pendiente de proveedor seguro como 0x/1inch u otro.
- No hay analytics de DApps en esta fase.
- No hay deep linking avanzado por DApp todavía.
- No se persiste aceptación de warning entre sesiones para evitar almacenamiento innecesario.

## 15. Riesgos mitigados

| Riesgo | Mitigación |
|---|---|
| Abrir DApps falsas | Catálogo whitelisted + `isWhitelistedDappUrl` |
| Usuario firma sin advertencia | Warning bloqueante antes de WebView |
| Swap falso | Swap service disabled sin quotes |
| Approval ilimitado | No se activó UI de approvals |
| Romper WalletConnect | No se tocó provider/core |
| Historial sensible | Sin persistencia nueva de historial DApps |
| Logs sensibles | No se agregaron logs |

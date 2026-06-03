# Web3 Wallet Completa — OrbitX

## 0. Estado inicial detectado

| Archivo | Existe | Tiene ERC-20 | Tiene envío real | Usa mock | Riesgo si se toca |
|---|---:|---:|---:|---:|---|
| src/providers/ExternalWalletProvider.tsx | Sí | Parcial | No firma directo | No | Alto: WalletConnect/Reown core |
| src/services/walletConnectService.ts | Sí | No | No | No | Alto: conexión Reown |
| src/services/web3/web3NetworkConfig.ts | Sí | Parcial | Config red | No | Medio |
| src/services/web3/web3BalanceService.ts | Sí | No completo | No | No | Medio |
| src/services/web3/web3TransactionService.ts | Sí | No completo | Nativo EVM sí | No | Alto: envío nativo existente |
| src/services/web3/web3Errors.ts | Sí | Parcial | No | No | Bajo |
| src/services/wallet/tokenRegistry.ts | Sí | Parcial | No | No | Medio |
| src/services/wallet/externalWalletBalances.ts | Sí | Sí, lectura | No | No | Alto: balances reales externos |
| src/hooks/useExternalWalletBalances.ts | Sí | Sí, lectura | No | No | Medio |
| src/screens/WalletScreen/Web3WalletScreen.tsx | Sí | Lista parcial | No | No | Medio |
| src/screens/SendScreen/index.tsx | Sí | No | Nativo externo sí | No | Alto |
| src/utils/validators.ts | Sí | No | No | No | Bajo |

Stack Web3 detectado:
- Conexión: Reown/AppKit + WalletConnect.
- Runtime EVM: ethers v5.
- Redes: Ethereum, Base, BNB Chain y Polygon.
- ABI ERC-20 previo: parcial dentro de balance service; ahora centralizado.

## 1. Resumen ejecutivo

| Función | Estado |
|---|---|
| Lectura saldo nativo | Funcional, preservada |
| Lectura ERC-20 | Funcional/parcial, ahora con resultados tipados |
| Envío nativo | Funcional, preservado y envuelto con flujo seguro nuevo |
| Envío ERC-20 | Preparado en servicio y UI con resumen previo |
| Approvals | Preparado, no activo en UI productiva |
| Token Registry | Completo para redes mínimas solicitadas |
| Errores normalizados | Completo con códigos Web3 en español |
| Explorer | Preparado con URLs por red |

## 2. Token Registry

| Red | chainId | symbol | contrato | decimals | enabled | pendingAddress |
|---|---:|---|---|---:|---:|---:|
| Ethereum | 1 | ETH | nativo | 18 | Sí | No |
| Ethereum | 1 | USDT | 0xdAC17F958D2ee523a2206206994597C13D831ec7 | 6 | Sí | No |
| Ethereum | 1 | USDC | 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 | 6 | Sí | No |
| Base | 8453 | ETH | nativo | 18 | Sí | No |
| Base | 8453 | USDC | 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 | 6 | Sí | No |
| Base | 8453 | USDbC | 0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA | 6 | Sí | No |
| BNB Chain | 56 | BNB | nativo | 18 | Sí | No |
| BNB Chain | 56 | USDT | 0x55d398326f99059fF775485246999027B3197955 | 18 | Sí | No |
| BNB Chain | 56 | USDC | 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d | 18 | Sí | No |
| Polygon | 137 | MATIC | nativo | 18 | Sí | No |
| Polygon | 137 | USDT | 0xc2132D05D31c914a87C6611C10748AEb04B58e8F | 6 | Sí | No |
| Polygon | 137 | USDC.e | 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174 | 6 | Sí | No |
| Polygon | 137 | USDC | 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359 | 6 | Sí | No |
| Ethereum | 1 | SAITAMA | null | 18 | No | Sí |

Se preservaron tokens adicionales que ya existían en el registry previo, sin inventar contratos nuevos.

## 3. Redes soportadas

| Red | chainId | nativo | ERC-20 | switch | explorer | estado |
|---|---:|---|---|---|---|---|
| Ethereum | 1 | Sí | Sí | Sí | Etherscan | Activa |
| Base | 8453 | Sí | Sí | Sí | Basescan | Activa |
| BNB Chain | 56 | Sí | Sí | Sí | BscScan | Activa |
| Polygon | 137 | Sí | Sí | Limitado en UI | Polygonscan | Activa |

## 4. Balance Service

- `getNativeBalance` devuelve `success` con balance `"0"` cuando el saldo real es cero.
- En errores RPC devuelve `balance: null`, nunca saldo falso.
- `getErc20Balance` maneja errores por token sin romper toda la wallet.
- `getWalletTokenBalances` usa `Promise.allSettled`.
- Timeout RPC configurado en 10 segundos.

## 5. Transaction Service

- El envío nativo existente no fue eliminado.
- Se agregaron `sendNativeTransaction` y `sendErc20Transaction`.
- ERC-20 usa `transfer(to, amount)` con calldata real.
- `buildErc20TransferData` convierte monto humano a unidades base.
- Toda transacción retorna hash real o error; no se inventa hash.
- La UI muestra resumen antes de pedir firma.

## 6. Approvals

Approvals quedaron preparados en `src/services/web3/web3ApprovalService.ts`, pero no conectados a UI productiva.

Reglas aplicadas:
- No se usa `uint256.max` por defecto.
- El monto de aprobación es exacto.
- Requiere confirmación explícita futura.
- No se conecta a swap, pool ni contratos externos en esta fase.

Advertencia futura obligatoria:
“Autorizar tokens permite que un contrato use parte de tu saldo. Revisa siempre el monto y la dirección del contrato antes de aprobar.”

## 7. Errores normalizados

| Código | Mensaje |
|---|---|
| USER_REJECTED | Firma rechazada por el usuario. |
| INSUFFICIENT_FUNDS | Saldo insuficiente para cubrir el monto y el gas. |
| INSUFFICIENT_GAS | Saldo nativo insuficiente para cubrir el gas. |
| INVALID_ADDRESS | Dirección no válida. |
| INVALID_AMOUNT | Monto no válido. |
| UNSUPPORTED_CHAIN | Red no compatible con OrbitX. |
| CHAIN_MISMATCH | La red de tu wallet no coincide con la seleccionada. |
| RPC_TIMEOUT | Tiempo de espera agotado. Intenta de nuevo. |
| TOKEN_SEND_DISABLED | El envío de este token no está habilitado. |
| TX_REVERTED | La transacción fue revertida por el contrato. |

## 8. UI Web3WalletScreen

Se agregó Chain ID visible en la tarjeta de red y se preservó la separación entre wallet local y wallet externa. No se conectó ledger, cuenta local demo, spot demo ni trading.

## 9. UI SendScreen

Se agregó:
- Selección de token externo por red.
- Saldo disponible del token seleccionado.
- Resumen obligatorio antes de firma.
- Botón “Firmar con wallet”.
- Flujo ERC-20 usando wallet externa.
- Envío desde wallet local bloqueado por seguridad en esta fase.

## 10. Archivos modificados

| Archivo | Tipo de cambio |
|---|---|
| src/services/wallet/tokenRegistry.ts | Registry EVM + helpers |
| src/services/web3/web3NetworkConfig.ts | Config red + explorer helpers |
| src/services/web3/web3BalanceService.ts | Resultados tipados nativo/ERC-20 |
| src/services/web3/web3TransactionService.ts | Transacciones nativas/ERC-20 seguras |
| src/services/web3/web3Errors.ts | Errores normalizados |
| src/utils/validators.ts | Validadores Web3 |
| src/screens/WalletScreen/Web3WalletScreen.tsx | Chain ID visible |
| src/screens/WalletScreen/web3/useWeb3WalletViewModel.ts | Exposición chainId |
| src/screens/WalletScreen/web3/Web3NetworkCard.tsx | Display chainId |
| src/screens/SendScreen/index.tsx | Token selector + resumen + ERC-20 |

## 11. Archivos creados

| Archivo | Propósito |
|---|---|
| src/services/web3/erc20Abi.ts | ABI mínimo ERC-20 |
| src/services/web3/web3ApprovalService.ts | Approvals preparados |
| src/services/web3/web3Explorer.ts | Helpers explorer |
| src/services/web3/web3TransactionService.test.ts | Tests calldata/registry |
| docs/WEB3_WALLET_IMPLEMENTATION.md | Reporte |

## 12. Seguridad — Confirmación

- [x] Sin seed phrase
- [x] Sin private keys
- [x] Sin saldo falso
- [x] Sin hash falso
- [x] Sin firma sin confirmación
- [x] Sin approval ilimitado por defecto
- [x] Sin logs sensibles
- [x] Sin mezcla wallet local/externa
- [x] Home no afectado
- [x] Trading Adapter no afectado
- [x] Internal Ledger no afectado

## 13. QA Android — Checklist

| Caso | Wallet | Red | Acción | Esperado | Estado | Observación |
|---|---|---|---|---|---|---|
| Conectar | MetaMask | ETH | Tap conectar | Address y chainId visibles | PENDING | Probar en APK |
| Leer saldo nativo | MetaMask | ETH | Ver pantalla | Balance ETH real | PENDING | Probar en APK |
| Leer ERC-20 | MetaMask | ETH | Ver pantalla | USDT/USDC si hay saldo | PENDING | Probar en APK |
| Actualizar saldo | MetaMask | ETH | Tap refresh | Saldo actualizado | PENDING | Probar en APK |
| Enviar nativo | MetaMask | ETH | Enviar monto pequeño | Hash real, explorer | PENDING | No usar monto grande |
| Rechazar firma | MetaMask | ETH | Rechazar en wallet | Error en español | PENDING | Probar en APK |
| Enviar ERC-20 | MetaMask | ETH | Enviar token soportado | Hash real | PENDING | Probar con monto mínimo |
| Address inválida | MetaMask | ETH | Input inválido | Mensaje validación | PENDING | |
| Monto 0 | MetaMask | ETH | Monto 0 | Bloqueado | PENDING | |
| Saldo insuficiente | MetaMask | ETH | Monto > saldo | Mensaje claro | PENDING | |
| Gas insuficiente | MetaMask | ETH | Sin ETH para gas | Mensaje claro | PENDING | |
| Red no compatible | MetaMask | - | Chain no soportada | Mensaje claro | PENDING | |
| Desconectar | MetaMask | ETH | Tap desconectar | Estado limpio | PENDING | |

## 14. Limitaciones conocidas

- Swap 0x/1inch no implementado.
- Pools Web3 reales no implementados.
- Solana no incluida en esta fase ERC-20/EVM.
- Approvals no están activos en UI.
- QA físico pendiente en Trust Wallet y Coinbase Wallet.
- No se probó envío real desde APK en dispositivo físico.

## 15. Validación

| Comando | Resultado |
|---|---|
| npm run typecheck | OK |
| npx tsc --noEmit | No requerido, typecheck usa tsc |
| npm run lint | OK, 0 errores / 0 warnings |
| npm test -- --passWithNoTests | OK, 6 archivos / 22 tests |
| npx expo-doctor | OK con `NODE_OPTIONS=--use-system-ca`, 18/18 checks |

Nota: `npx expo-doctor` sin `NODE_OPTIONS=--use-system-ca` falló por verificación TLS/certificado local contra la API de Expo, no por código del proyecto.

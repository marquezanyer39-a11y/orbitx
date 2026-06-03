# APIs conectadas en OrbitX

Este documento lista las APIs y proveedores ya integrados en OrbitX, ordenados por prioridad funcional y separados por estado real.

## 1. APIs activas y ya conectadas

### 1. OrbitX Backend
- Estado: activo
- Variable: `EXPO_PUBLIC_ORBITX_BACKEND_URL`
- Uso principal:
  - backend general de OrbitX
  - endpoints de Astra
  - integraciones que dependen del servidor propio
- Archivos:
  - `app.config.js`
  - `eas.json`
  - `src/services/astra/astraRuntimeConfig.ts`
  - `src/services/astra/astraApi.ts`

### 2. Reown / WalletConnect
- Estado: activo
- Variable: `EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID`
- Uso principal:
  - conectar wallet externa
  - leer `address`
  - leer `chainId`
  - cambiar red
  - firmar y enviar transacciones EVM
- Archivos:
  - `src/services/walletConnectService.ts`
  - `src/providers/ExternalWalletProvider.tsx`
  - `src/screens/WalletScreen/Web3WalletScreen.tsx`
  - `src/screens/SendScreen/index.tsx`
  - `src/services/web3/web3TransactionService.ts`

### 3. RPC publicos EVM y Solana
- Estado: activos
- Variables:
  - `EXPO_PUBLIC_ETHEREUM_RPC_URL`
  - `EXPO_PUBLIC_BASE_RPC_URL`
  - `EXPO_PUBLIC_BNB_RPC_URL`
  - `EXPO_PUBLIC_SOLANA_RPC_URL`
- Uso principal:
  - lectura de balances locales
  - lectura de balances externos
  - lectura on-chain
- Archivos:
  - `constants/onchain.ts`
  - `src/services/wallet/tokenRegistry.ts`
  - `src/services/wallet/externalWalletBalances.ts`
  - `src/services/wallet/walletBalances.ts`
  - `src/services/web3/web3BalanceService.ts`

### 4. Binance REST API
- Estado: activa
- Variable: no requiere clave en la integración actual
- Base URL: `https://api.binance.com/api/v3`
- Uso principal:
  - feed de mercado
  - precios y datos realtime/fallback para trading
- Archivos:
  - `src/services/api/realtimeMarket.ts`
  - `src/hooks/useRealtimeMarketFeed.ts`
  - `src/hooks/useRealtimePrice.ts`

### 5. CoinGecko API
- Estado: activa
- Variable: no requiere clave en la integración actual
- Base URL: `https://api.coingecko.com/api/v3`
- Uso principal:
  - precios de mercado
  - fallback de datos de mercado
- Archivos:
  - `src/services/api/coingecko.ts`
  - `src/hooks/useLiveMarkets.ts`

### 6. Supabase
- Estado: configurado y listo
- Variables:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Uso principal:
  - auth
  - backend cloud ligado a usuario
- Archivos:
  - `.env.example`
  - `src/i18n/resources.generated.ts`
  - código de auth/store relacionado en el proyecto

## 2. APIs preparadas pero no confirmadas como activas en esta build

### 7. Astra backend legacy opcional
- Estado: opcional / legado
- Variable:
  - `EXPO_PUBLIC_ASTRA_VOICE_API_URL`
- Nota:
  - no aparece presente en `.env` actual
  - el proyecto ya usa `EXPO_PUBLIC_ORBITX_BACKEND_URL` como backend principal
- Archivos:
  - `app.config.js`
  - `.env.example`

### 8. News API
- Estado: preparada por entorno
- Variable:
  - `EXPO_PUBLIC_NEWS_API_KEY`
- Uso esperado:
  - noticias fallback o macro/politica
- Archivo:
  - `.env.example`

### 9. CoinMarketCap API
- Estado: preparada por entorno
- Variable:
  - `EXPO_PUBLIC_CMC_API_KEY`
- Uso esperado:
  - noticias crypto principales
- Archivo:
  - `.env.example`

### 10. 1inch API
- Estado: preparada por entorno
- Variables:
  - `EXPO_PUBLIC_ONEINCH_API_KEY`
  - `EXPO_PUBLIC_ONEINCH_API_URL`
- Uso esperado:
  - swap / cotizaciones / routing
- Archivo:
  - `.env.example`

### 11. 0x API
- Estado: preparada por entorno
- Variable:
  - `EXPO_PUBLIC_ZEROX_API_KEY`
- Uso esperado:
  - cotizaciones / ejecución swap
- Archivo:
  - `.env.example`

### 12. Jupiter API
- Estado: preparada por entorno
- Variables:
  - `EXPO_PUBLIC_JUPITER_API_URL`
  - `EXPO_PUBLIC_JUPITER_API_KEY`
- Uso esperado:
  - integración Solana / swap / cotizaciones
- Archivo:
  - `.env.example`

## 3. APIs de ramp / fiat preparadas

### 13. Transak
- Estado: preparada
- Variables:
  - `EXPO_PUBLIC_TRANSAK_API_KEY`
  - `EXPO_PUBLIC_TRANSAK_QUOTE_ENDPOINT`
  - `EXPO_PUBLIC_TRANSAK_WIDGET_SESSION_URL`
  - `EXPO_PUBLIC_TRANSAK_REFERRER_DOMAIN`
- Uso esperado:
  - on-ramp / off-ramp
- Archivo:
  - `.env.example`

### 14. MoonPay
- Estado: preparada
- Variables:
  - `EXPO_PUBLIC_MOONPAY_API_KEY`
  - `EXPO_PUBLIC_MOONPAY_QUOTE_ENDPOINT`
  - `EXPO_PUBLIC_MOONPAY_WIDGET_SESSION_URL`
- Uso esperado:
  - on-ramp / off-ramp
- Archivo:
  - `.env.example`

## 4. Resumen corto por orden real de importancia hoy

1. `EXPO_PUBLIC_ORBITX_BACKEND_URL` -> backend principal OrbitX
2. `EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID` -> conexión wallet externa real
3. RPCs públicos EVM/Solana -> balances y lectura on-chain
4. Binance REST -> mercado realtime
5. CoinGecko -> fallback y precios
6. Supabase -> auth/configuración cloud
7. Astra legacy opcional -> compatibilidad antigua
8. News / CMC / 1inch / 0x / Jupiter / Transak / MoonPay -> preparados, no confirmados como activos en esta build

## 5. Variables presentes en el entorno actual

- `EXPO_PUBLIC_ORBITX_BACKEND_URL`: presente
- `EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID`: presente
- `EXPO_PUBLIC_SUPABASE_URL`: presente
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: presente
- `EXPO_PUBLIC_ASTRA_VOICE_API_URL`: ausente

## 6. Nota importante

Que una variable exista en `.env.example` no significa que la API ya esté activa en la app actual.

Para OrbitX hoy, las integraciones que sí están más claramente vivas y funcionales son:
- OrbitX backend
- Reown / WalletConnect
- RPCs públicos
- Binance
- CoinGecko
- Supabase

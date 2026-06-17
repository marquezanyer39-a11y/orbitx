# CURRENT PENDING CHANGES

Este archivo registra el estado de cambios pendientes que ya existian en el repo antes de que Claude empiece a trabajar desde este punto.

## Regla de interpretacion

- Claude NO debe asumir que todos estos cambios son correctos.
- Claude debe auditar, separar y validar por fases.
- Claude NO debe hacer `git add .`.
- Claude NO debe hacer commit general.
- Cada commit futuro debe ser aislado por modulo.

## Estado actual capturado con `git status --short`

```text
 M components/charts/OrbitLightweightChart.tsx
 M components/charts/chartData.ts
 M components/charts/lightweightChartHtml.ts
 M components/create-token/CreateTokenWizard.tsx
 M components/create-token/TokenLaunchModal.tsx
 M constants/externalLinks.ts
 M constants/i18n.ts
 M constants/networks.ts
 M constants/onchain.ts
 M constants/storage.ts
 M constants/theme.ts
 M constants/trading.ts
 D src/components/astra/AstraLauncherButton.tsx
 M src/components/astra/AstraMessageBubble.tsx
 M src/components/botFutures/ApiKeysFormCard.tsx
 M src/components/botFutures/AstraIntelligenceCard.tsx
 M src/components/botFutures/BotFuturesCommandHeader.tsx
 M src/components/botFutures/BotFuturesFlowCard.tsx
 D src/components/botFutures/BotLiveMetricStrip.tsx
 M src/components/botFutures/BotOperationalSummary.tsx
 D src/components/botFutures/BotOverviewHeroCard.tsx
 D src/components/botFutures/BotStatusCard.tsx
 M src/components/botFutures/CommandEmergencyBlock.tsx
 M src/components/botFutures/ConnectionStatusCard.tsx
 D src/components/botFutures/ExchangeOptionCard.tsx
 D src/components/botFutures/ModeOptionCard.tsx
 M src/components/botFutures/PriorityActionTile.tsx
 M src/components/botFutures/RiskDisclosureCard.tsx
 M src/components/security/TwoFactorSetupSheet.tsx
 M src/components/trade/BuySellToggle.tsx
 D src/components/trade/FullscreenChartPanel.tsx
 M src/components/trade/OrderTypeTabs.tsx
 M src/components/trade/QuickPercentBar.tsx
 D src/components/trade/RecentTrades.tsx
 D src/components/trade/TradeActionPanel.tsx
 M src/components/trade/TradeActivityPanel.tsx
 D src/components/trade/TradeBalanceCard.tsx
 D src/components/trade/TradeDepthCard.tsx
 M src/components/trade/TradeForm.tsx
 D src/components/trade/TradeMarketTabs.tsx
 M src/components/trade/TradeOrderBookPanel.tsx
 D src/constants/colors.ts
 M src/constants/social.ts
 M src/hooks/useAstraVoice.ts
 M src/hooks/useLiveMarkets.ts
 M src/hooks/usePortfolioData.ts
 M src/hooks/useSecurityCenter.ts
 M src/hooks/useSocialFeed.ts
 M src/hooks/useTradeForm.ts
 M src/hooks/useUserPreferences.ts
 M src/i18n/resources.generated.ts
 M src/i18n/runtimeOverrides.ts
 M src/providers/ExternalWalletProvider.tsx
 M src/services/api/coingecko.ts
 M src/services/astra/astraApi.ts
 M src/services/astra/astraCapabilities.ts
 M src/services/astra/astraCore.ts
 M src/services/astraTTS.ts
 M src/services/convert/convertCopy.ts
 M src/services/marketRealtime/geckoTerminal.ts
 M src/services/profile/profileData.ts
 M src/services/ramp/providers/moonpayAdapter.ts
 M src/services/ramp/providers/transakAdapter.ts
 M src/services/ramp/rampConfig.ts
 M src/services/ramp/rampCopy.ts
 M src/services/rewardsPool/poolCopy.ts
 M src/services/security/securityCenter.ts
 M src/services/security/twoFactor.ts
 M src/store/authStore.ts
 M src/store/botFuturesStore.ts
 M src/types/index.ts
 M src/utils/validators.ts
 M utils/biometrics.ts
 M utils/wallet.ts
?? app/demo/app.tsx
?? app/safe-start.tsx
?? docs/ai-brain/
?? docs/pdf/
?? src/constants/tradingProviders.ts
?? src/core/i18n/
?? src/core/networks/
?? src/core/onchain/
?? src/core/storage/
?? src/core/theme/
?? src/core/trading/
?? src/demo/
?? src/hooks/astraVoice/
?? src/services/ledger/
?? src/services/pool/
?? src/services/trading/adapters/
?? src/services/trading/index.ts
?? src/services/trading/tradingErrors.ts
?? src/services/trading/tradingMappers.ts
?? src/services/trading/tradingProviderConfig.ts
?? src/services/trading/tradingService.test.ts
?? src/services/web3/swap/index.ts
?? src/services/web3/web3BalanceService.ts
?? src/services/web3/web3Explorer.ts
?? src/store/createTokenDraftStore.ts
?? src/types/ledger.ts
?? src/types/trading.ts
?? stitch_design_pool16/
```

## Clasificacion por modulos

### 1. Charts / trading charts

- `components/charts/OrbitLightweightChart.tsx`
- `components/charts/chartData.ts`
- `components/charts/lightweightChartHtml.ts`

### 2. Create Token

- `components/create-token/CreateTokenWizard.tsx`
- `components/create-token/TokenLaunchModal.tsx`

### 3. Constants / core migration

- `constants/externalLinks.ts`
- `constants/i18n.ts`
- `constants/networks.ts`
- `constants/onchain.ts`
- `constants/storage.ts`
- `constants/theme.ts`
- `constants/trading.ts`
- `src/constants/social.ts`
- `src/constants/colors.ts` eliminado
- `src/constants/tradingProviders.ts` nuevo
- `src/core/i18n/` nuevo
- `src/core/networks/` nuevo
- `src/core/onchain/` nuevo
- `src/core/storage/` nuevo
- `src/core/theme/` nuevo
- `src/core/trading/` nuevo

### 4. Astra

- `src/components/astra/AstraLauncherButton.tsx` eliminado
- `src/components/astra/AstraMessageBubble.tsx`
- `src/hooks/useAstraVoice.ts`
- `src/hooks/astraVoice/` nuevo
- `src/services/astra/astraApi.ts`
- `src/services/astra/astraCapabilities.ts`
- `src/services/astra/astraCore.ts`
- `src/services/astraTTS.ts`

### 5. Bot Futures

- `src/components/botFutures/ApiKeysFormCard.tsx`
- `src/components/botFutures/AstraIntelligenceCard.tsx`
- `src/components/botFutures/BotFuturesCommandHeader.tsx`
- `src/components/botFutures/BotFuturesFlowCard.tsx`
- `src/components/botFutures/BotLiveMetricStrip.tsx` eliminado
- `src/components/botFutures/BotOperationalSummary.tsx`
- `src/components/botFutures/BotOverviewHeroCard.tsx` eliminado
- `src/components/botFutures/BotStatusCard.tsx` eliminado
- `src/components/botFutures/CommandEmergencyBlock.tsx`
- `src/components/botFutures/ConnectionStatusCard.tsx`
- `src/components/botFutures/ExchangeOptionCard.tsx` eliminado
- `src/components/botFutures/ModeOptionCard.tsx` eliminado
- `src/components/botFutures/PriorityActionTile.tsx`
- `src/components/botFutures/RiskDisclosureCard.tsx`

### 6. Trade UI

- `src/components/trade/BuySellToggle.tsx`
- `src/components/trade/FullscreenChartPanel.tsx` eliminado
- `src/components/trade/OrderTypeTabs.tsx`
- `src/components/trade/QuickPercentBar.tsx`
- `src/components/trade/RecentTrades.tsx` eliminado
- `src/components/trade/TradeActionPanel.tsx` eliminado
- `src/components/trade/TradeActivityPanel.tsx`
- `src/components/trade/TradeBalanceCard.tsx` eliminado
- `src/components/trade/TradeDepthCard.tsx` eliminado
- `src/components/trade/TradeForm.tsx`
- `src/components/trade/TradeMarketTabs.tsx` eliminado
- `src/components/trade/TradeOrderBookPanel.tsx`

### 7. Security

- `src/components/security/TwoFactorSetupSheet.tsx`
- `src/services/security/securityCenter.ts`
- `src/services/security/twoFactor.ts`

### 8. Hooks

- `src/hooks/useLiveMarkets.ts`
- `src/hooks/usePortfolioData.ts`
- `src/hooks/useSecurityCenter.ts`
- `src/hooks/useSocialFeed.ts`
- `src/hooks/useTradeForm.ts`
- `src/hooks/useUserPreferences.ts`

### 9. i18n

- `src/i18n/resources.generated.ts`
- `src/i18n/runtimeOverrides.ts`

### 10. Providers / External Wallet

- `src/providers/ExternalWalletProvider.tsx`

### 11. Services

- `src/services/api/coingecko.ts`
- `src/services/convert/convertCopy.ts`
- `src/services/marketRealtime/geckoTerminal.ts`
- `src/services/profile/profileData.ts`
- `src/services/ramp/providers/moonpayAdapter.ts`
- `src/services/ramp/providers/transakAdapter.ts`
- `src/services/ramp/rampConfig.ts`
- `src/services/ramp/rampCopy.ts`
- `src/services/rewardsPool/poolCopy.ts`

### 12. Stores

- `src/store/authStore.ts`
- `src/store/botFuturesStore.ts`
- `src/store/createTokenDraftStore.ts` nuevo

### 13. Utils / wallet / biometrics

- `src/types/index.ts`
- `src/utils/validators.ts`
- `utils/biometrics.ts`
- `utils/wallet.ts`
- `src/types/ledger.ts` nuevo
- `src/types/trading.ts` nuevo

### 14. Nuevos archivos `app/demo`, `safe-start`, `services/ledger`, `services/pool`, `services/trading`, `services/web3`

- `app/demo/app.tsx`
- `app/safe-start.tsx`
- `src/demo/`
- `src/services/ledger/`
- `src/services/pool/`
- `src/services/trading/adapters/`
- `src/services/trading/index.ts`
- `src/services/trading/tradingErrors.ts`
- `src/services/trading/tradingMappers.ts`
- `src/services/trading/tradingProviderConfig.ts`
- `src/services/trading/tradingService.test.ts`
- `src/services/web3/swap/index.ts`
- `src/services/web3/web3BalanceService.ts`
- `src/services/web3/web3Explorer.ts`

### 15. Archivos eliminados

- `src/components/astra/AstraLauncherButton.tsx`
- `src/components/botFutures/BotLiveMetricStrip.tsx`
- `src/components/botFutures/BotOverviewHeroCard.tsx`
- `src/components/botFutures/BotStatusCard.tsx`
- `src/components/botFutures/ExchangeOptionCard.tsx`
- `src/components/botFutures/ModeOptionCard.tsx`
- `src/components/trade/FullscreenChartPanel.tsx`
- `src/components/trade/RecentTrades.tsx`
- `src/components/trade/TradeActionPanel.tsx`
- `src/components/trade/TradeBalanceCard.tsx`
- `src/components/trade/TradeDepthCard.tsx`
- `src/components/trade/TradeMarketTabs.tsx`
- `src/constants/colors.ts`

### 16. `docs/ai-brain`

- `docs/ai-brain/` nuevo y no trackeado en este punto.

### 17. `docs/pdf`

- `docs/pdf/` nuevo y no trackeado en este punto.

### 18. `stitch_design_pool16`

- `stitch_design_pool16/` nuevo y no trackeado en este punto.

## Instruccion operativa para Claude

- Empezar por separar el trabajo en fases pequenas.
- Auditar primero un solo modulo activo.
- Validar si los borrados y archivos nuevos corresponden a una migracion real o a cambios incompletos.
- Nunca mezclar en un mismo commit cambios de wallet, backend, Astra, social y trading.

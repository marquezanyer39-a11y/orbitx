Resultado inicial de find src -type f | sort: bash no esta disponible en este Windows; se uso equivalente PowerShell y se pega el arbol capturado abajo.
# Trading Adapter + Internal Ledger - OrbitX

## 1. Arbol de archivos detectado al inicio

Intento exacto: `bash -lc "find src -type f | sort"`.
Resultado: fallo porque `bash` no esta disponible en este entorno Windows. Equivalente usado: `Get-ChildItem -Path src -Recurse -File | Sort-Object`.

<pre>
src/components/astra/AstraAnimatedLogo.tsx
src/components/astra/AstraEntryPoint.tsx
src/components/astra/AstraFlowStepper.tsx
src/components/astra/AstraHeader.tsx
src/components/astra/AstraInputBar.tsx
src/components/astra/AstraLogo.tsx
src/components/astra/AstraMessageBubble.tsx
src/components/astra/AstraQuickChips.tsx
src/components/astra/AstraRuntimeBridge.tsx
src/components/astra/AstraVoiceSheet.tsx
src/components/botFutures/ApiKeysFormCard.tsx
src/components/botFutures/AstraIntelligenceCard.tsx
src/components/botFutures/AstraLiveHintCard.tsx
src/components/botFutures/AstraLivePanel.tsx
src/components/botFutures/BotActivityLogCard.tsx
src/components/botFutures/BotConfigFieldCard.tsx
src/components/botFutures/BotConfigOptionRow.tsx
src/components/botFutures/BotControlBar.tsx
src/components/botFutures/BotEmptyStateCard.tsx
src/components/botFutures/BotFuturesCommandHeader.tsx
src/components/botFutures/BotFuturesCommandHero.tsx
src/components/botFutures/BotFuturesFlowCard.tsx
src/components/botFutures/BotFuturesHeader.tsx
src/components/botFutures/BotFuturesWizardHeader.tsx
src/components/botFutures/BotFuturesWizardStepBar.tsx
src/components/botFutures/BotHistoryCard.tsx
src/components/botFutures/BotOperationalSummary.tsx
src/components/botFutures/BotQuickSummaryCard.tsx
src/components/botFutures/BotSectionTitle.tsx
src/components/botFutures/BotSegmentedModeTabs.tsx
src/components/botFutures/BotSignalCard.tsx
src/components/botFutures/CommandEmergencyBlock.tsx
src/components/botFutures/ConfirmStartCard.tsx
src/components/botFutures/ConnectionGuideCard.tsx
src/components/botFutures/ConnectionStatusCard.tsx
src/components/botFutures/ConnectionSuccessCard.tsx
src/components/botFutures/EmergencyActionCard.tsx
src/components/botFutures/ExchangeAvailabilityPill.tsx
src/components/botFutures/ExchangeSelectionCard.tsx
src/components/botFutures/LivePositionCard.tsx
src/components/botFutures/ModeSelectionCard.tsx
src/components/botFutures/PerformanceBreakdownCard.tsx
src/components/botFutures/PerformanceKpiCard.tsx
src/components/botFutures/PriorityActionGrid.tsx
src/components/botFutures/PriorityActionTile.tsx
src/components/botFutures/RiskDisclosureCard.tsx
src/components/botFutures/RiskLimitCard.tsx
src/components/botFutures/RiskModeNoticeCard.tsx
src/components/botFutures/RiskWarningCard.tsx
src/components/botFutures/StrategyPresetCard.tsx
src/components/botFutures/TradeDetailHeroCard.tsx
src/components/botFutures/TradeLevelCard.tsx
src/components/botFutures/TradeManagementCard.tsx
src/components/botFutures/useBotFuturesOnboarding.ts
src/components/common/EmptyState.tsx
src/components/common/ErrorState.tsx
src/components/common/LoadingState.tsx
src/components/common/PrimaryButton.tsx
src/components/common/ScreenContainer.tsx
src/components/common/SectionHeader.tsx
src/components/convert/ConvertAssetSelectorSheet.tsx
src/components/convert/ConvertConfirmSheet.tsx
src/components/market/MarketList.tsx
src/components/market/MarketRow.tsx
src/components/market/PriceChangeBadge.tsx
src/components/rewardsPool/AstraEntry.tsx
src/components/rewardsPool/LiveParticipantsList.tsx
src/components/rewardsPool/ParticipateBottomSheet.tsx
src/components/rewardsPool/PoolCountdownPill.tsx
src/components/rewardsPool/PoolFinalResultsCard.tsx
src/components/rewardsPool/PoolHeader.tsx
src/components/rewardsPool/PoolProgressBar.tsx
src/components/rewardsPool/PoolStateBanner.tsx
src/components/rewardsPool/RewardsBreakdown.tsx
src/components/rewardsPool/UserPoolPositionCard.tsx
src/components/security/TwoFactorSetupSheet.tsx
src/components/social/GiftAnimationOverlay.tsx
src/components/social/LiveFeatureErrorBoundary.tsx
src/components/social/SocialDisclaimerModal.tsx
src/components/social/SocialFeedItem.tsx
src/components/social/SocialGiftsModal.tsx
src/components/trade/BuySellToggle.tsx
src/components/trade/OrderBook.tsx
src/components/trade/OrderTypeTabs.tsx
src/components/trade/QuickPercentBar.tsx
src/components/trade/TradeActivityPanel.tsx
src/components/trade/TradeChart.tsx
src/components/trade/TradeForm.tsx
src/components/trade/TradeHeader.tsx
src/components/trade/TradeOrderBookPanel.tsx
src/components/wallet/AddressCard.tsx
src/components/wallet/AssetList.tsx
src/components/wallet/BalanceCard.tsx
src/components/wallet/RampActionGrid.tsx
src/components/wallet/SeedRevealCard.tsx
src/components/wallet/WalletActions.tsx
src/components/wallet/WalletHeader.tsx
src/components/wallet/WalletTabs.tsx
src/constants/appConfig.ts
src/constants/featureStatus.ts
src/constants/social.ts
src/constants/spacing.ts
src/constants/vipRanks.ts
src/hooks/useAstra.ts
src/hooks/useAstraVoice.ts
src/hooks/useExternalWallet.ts
src/hooks/useExternalWalletBalances.ts
src/hooks/useLiveMarkets.ts
src/hooks/useMarketData.ts
src/hooks/useMonthlyRewardsPool.ts
src/hooks/useNewsFeed.ts
src/hooks/usePairChartData.ts
src/hooks/usePortfolioData.ts
src/hooks/useProfileData.ts
src/hooks/useRealtimeCandles.ts
src/hooks/useRealtimeMarketFeed.ts
src/hooks/useRealtimePrice.ts
src/hooks/useRewardsPool.ts
src/hooks/useSecurity.ts
src/hooks/useSecurityCenter.ts
src/hooks/useSecurityStatus.ts
src/hooks/useSocialFeed.ts
src/hooks/useTradeForm.ts
src/hooks/useUserPreferences.ts
src/hooks/useWallet.ts
src/i18n/resources.generated.ts
src/i18n/runtimeOverrides.ts
src/navigation/AppNavigator.tsx
src/navigation/TabNavigator.tsx
src/providers/ExternalWalletProvider.tsx
src/screens/AstraScreen/index.tsx
src/screens/BotFuturesActivityScreen/index.tsx
src/screens/BotFuturesConfigurationScreen/index.tsx
src/screens/BotFuturesConfirmStartScreen/index.tsx
src/screens/BotFuturesConnectExchangeScreen/index.tsx
src/screens/BotFuturesConnectGuideScreen/index.tsx
src/screens/BotFuturesConnectKeysScreen/index.tsx
src/screens/BotFuturesConnectSuccessScreen/index.tsx
src/screens/BotFuturesDisclaimerScreen/index.tsx
src/screens/BotFuturesHistoryScreen/index.tsx
src/screens/BotFuturesLivePositionsScreen/index.tsx
src/screens/BotFuturesModeScreen/index.tsx
src/screens/BotFuturesOverviewScreen/index.tsx
src/screens/BotFuturesPerformanceScreen/index.tsx
src/screens/BotFuturesRiskManagerScreen/index.tsx
src/screens/BotFuturesSignalsScreen/index.tsx
src/screens/BotFuturesStrategyScreen/index.tsx
src/screens/BotFuturesTradeDetailScreen/index.tsx
src/screens/ConvertScreen/index.tsx
src/screens/CreateTokenScreen/AirdropConfigScreen.tsx
src/screens/CreateTokenScreen/LiquidityConfigScreen.tsx
src/screens/CreateTokenScreen/PublicationConfigScreen.tsx
src/screens/CreateTokenScreen/TokenCreatedScreen.tsx
src/screens/CreateTokenScreen/TokenReviewPlaceholderScreen.tsx
src/screens/FavoritesScreen/index.tsx
src/screens/HistoryScreen/index.tsx
src/screens/HomeScreen/index.tsx
src/screens/LanguageScreen/index.tsx
src/screens/MarketsScreen/index.tsx
src/screens/MonthlyRewardsPoolScreen/index.tsx
src/screens/NotificationsScreen/index.tsx
src/screens/PairSelectorScreen/index.tsx
src/screens/PersonalizationScreen/index.tsx
src/screens/PrivacyScreen/index.tsx
src/screens/ProfileScreen/index.tsx
src/screens/ProfileScreen/OrbitXRankScreen.tsx
src/screens/RampFlowScreen/index.tsx
src/screens/RampResultScreen/index.tsx
src/screens/RampSummaryScreen/index.tsx
src/screens/ReceiveScreen/index.tsx
src/screens/SecurityScreen/index.tsx
src/screens/SendScreen/index.tsx
src/screens/SocialCommentsScreen/index.tsx
src/screens/SocialCreateScreen/index.tsx
src/screens/SocialCreatorScreen/index.tsx
src/screens/SocialFeedScreen/index.tsx
src/screens/SocialLiveSetupScreen/index.tsx
src/screens/SocialMessagesScreen/index.tsx
src/screens/TradeScreen/index.tsx
src/screens/WalletScreen/index.tsx
src/screens/WalletScreen/LocalAccountScreen.tsx
src/screens/WalletScreen/SpotWalletScreen.tsx
src/screens/WalletScreen/Web3WalletScreen.tsx
src/services/api/coingecko.ts
src/services/api/market.ts
src/services/api/realtimeMarket.ts
src/services/astra/astraActions.ts
src/services/astra/astraApi.ts
src/services/astra/astraCapabilities.ts
src/services/astra/astraContext.ts
src/services/astra/astraCore.ts
src/services/astra/astraImageStudio.ts
src/services/astra/astraRuntimeConfig.ts
src/services/astra/astraVoiceActions.ts
src/services/astra/astraVoiceApi.ts
src/services/astra/astraVoiceCopy.ts
src/services/astra/astraVoiceProfiles.ts
src/services/astraTTS.ts
src/services/convert/convertCopy.ts
src/services/convert/convertService.ts
src/services/dex/dexClient.ts
src/services/dex/dexConstants.ts
src/services/dex/swapSimulation.ts
src/services/marketRealtime/geckoTerminal.ts
src/services/marketRealtime/providerResolver.ts
src/services/profile/profileData.ts
src/services/providers/rpcProviders.ts
src/services/ramp/providers/moonpayAdapter.ts
src/services/ramp/providers/transakAdapter.ts
src/services/ramp/rampBridge.ts
src/services/ramp/rampConfig.ts
src/services/ramp/rampCopy.ts
src/services/ramp/rampService.ts
src/services/rewardsPool/poolCopy.ts
src/services/rewardsPool/poolMath.ts
src/services/rewardsPool/poolSeed.ts
src/services/security/securityCenter.ts
src/services/security/twoFactor.ts
src/services/social/contentModeration.ts
src/services/social/liveGiftService.ts
src/services/social/socialMediaStorage.ts
src/services/tokens/externalWalletTokenDeployment.ts
src/services/vip/vipService.ts
src/services/wallet/createWallet.ts
src/services/wallet/externalWalletBalances.ts
src/services/wallet/importWallet.ts
src/services/wallet/secureWalletStorage.ts
src/services/wallet/tokenDiscovery.ts
src/services/wallet/tokenRegistry.ts
src/services/wallet/walletBalances.ts
src/services/wallet/walletProfile.ts
src/services/wallet/walletSend.ts
src/services/walletConnectService.ts
src/services/web3/web3BalanceService.ts
src/services/web3/web3Errors.ts
src/services/web3/web3NetworkConfig.ts
src/services/web3/web3TransactionService.ts
src/store/astraStore.ts
src/store/authStore.ts
src/store/botFuturesStore.ts
src/store/convertStore.ts
src/store/createTokenDraftStore.ts
src/store/marketStore.ts
src/store/monthlyRewardsPoolStore.ts
src/store/profileStore.ts
src/store/rampStore.ts
src/store/securityCenterStore.ts
src/store/socialStore.ts
src/store/tradeStore.ts
src/store/uiStore.ts
src/store/walletStore.ts
src/types/astra.ts
src/types/astraVoice.ts
src/types/convert.ts
src/types/index.ts
src/types/market.ts
src/types/navigation.ts
src/types/ramp.ts
src/types/rewardsPool.ts
src/types/security.ts
src/types/social.ts
src/types/trade.ts
src/types/vip.ts
src/types/wallet.ts
src/utils/copyToClipboard.ts
src/utils/devLog.ts
src/utils/formatCurrency.ts
src/utils/formatPercent.ts
src/utils/portfolioTotals.ts
src/utils/tradePairs.ts
src/utils/tradeRealtimeUi.ts
src/utils/validators.ts
src/utils/vipRanks.ts
</pre>

## 2. Resumen ejecutivo

Se creo una arquitectura base para trading y ledger interno sin activar dinero real. La app queda preparada para consumir modelos internos OrbitX mediante `tradingService`, mientras los adapters traducen hacia proveedores actuales o futuros. El ledger queda como mock aislado con doble entrada contable para pool, social, rewards, fees, locks y reconciliacion.

No se conecto OKX real, no se crearon ordenes reales, no se movieron fondos reales y no se tocaron WalletConnect, seed phrase, private keys, Web3 ni Home balance.

## 3. Estado actual de Trade

- Que es real: feeds de mercado desde Binance/CoinGecko, UI de Trade, store local, order book visual y datos realtime/fallback.
- Que es demo: ordenes en `useTradeForm` y `tradeStore`, saldos Spot demo cuando `FEATURE_STATUS.trade.isDemoMode` es true.
- Que esta preparado: modelos internos `Trading*`, adapters, `tradingService`, feature flags y contrato de backend.
- Que queda pendiente: backend broker real, firma server-side, idempotency keys, motor de ordenes real, compliance, QA financiero.
- Que no se toco: Wallet/Web3, seed phrase, private keys, Home balance real, Create Token y backend productivo.

## 4. Archivos creados

- `src/types/trading.ts`
- `src/types/ledger.ts`
- `src/constants/tradingProviders.ts`
- `src/services/trading/index.ts`
- `src/services/trading/tradingService.ts`
- `src/services/trading/tradingErrors.ts`
- `src/services/trading/tradingMappers.ts`
- `src/services/trading/tradingProviderConfig.ts`
- `src/services/trading/adapters/tradingAdapter.ts`
- `src/services/trading/adapters/mockTradingAdapter.ts`
- `src/services/trading/adapters/okxTradingAdapter.ts`
- `src/services/trading/adapters/binanceTradingAdapter.ts`
- `src/services/trading/adapters/mexcTradingAdapter.ts`
- `src/services/trading/adapters/bybitTradingAdapter.ts`
- `src/services/trading/adapters/orbitxEngineAdapter.ts`
- `src/services/trading/adapters/notConfiguredAdapter.ts`
- `src/services/trading/adapters/index.ts`
- `src/services/ledger/index.ts`
- `src/services/ledger/ledgerService.ts`
- `src/services/ledger/ledgerAccounts.ts`
- `src/services/ledger/ledgerTransactions.ts`
- `src/services/ledger/ledgerReconciliation.ts`
- `src/services/ledger/ledgerErrors.ts`
- `src/services/ledger/ledgerMocks.ts`
- `src/services/pool/index.ts`
- `src/services/pool/poolService.ts`
- `src/services/pool/poolTypes.ts`
- `src/services/pool/poolMocks.ts`
- `src/services/social/index.ts`
- `src/services/social/giftsService.ts`
- `src/services/social/socialLedgerService.ts`
- `src/services/social/socialMocks.ts`
- `docs/orbitx-trading-adapter.md`
- `docs/orbitx-internal-ledger.md`
- `docs/orbitx-growth-architecture.md`
- `docs/trading-provider-contract.md`
- `docs/IMPLEMENTATION_REPORT.md`

## 5. Archivos modificados

- `src/constants/featureStatus.ts`: se agrego `trade.mode`, `provider`, `isRealTradingEnabled`, `showDemoLabels`, `requiresBackend`, `allowOrderPlacement`, `allowFutures` y `allowInternalTransfers`, conservando `isDemoMode`, `dataSourceLabel` y `notice` para compatibilidad.
- `src/types/index.ts`: se exportaron `trading` y `ledger`.

## 6. Modelos de trading

`src/types/trading.ts` define modelos internos OrbitX desacoplados de OKX: providers, cuentas, balances, instrumentos, tickers, order book, velas, ordenes, trades, posiciones, fees, transfers, capacidades, configuracion, quotes, resultados y errores.

La app debe depender de estos tipos internos. Los campos especificos de OKX/Binance/MEXC deben mapearse dentro de adapters/backend.

## 7. Trading Adapter Layer

- `ITradingAdapter`: interfaz comun con status, capacidades, cuenta, instrumentos, ticker, order book, balances, ordenes, trades, posiciones, fees, place/cancel order, transfer interno y health.
- `mockTradingAdapter`: demo controlado; `placeOrder` devuelve `status: "simulated"` e `isSimulated: true`.
- `okxTradingAdapter`: preparado para llamar solo a OrbitX Backend. No contiene API secret ni firma requests privadas en frontend.
- `binance/mexc/bybit`: future providers que retornan `not_configured` o fallan honestamente al pedir ejecucion.
- `orbitxEngineAdapter`: placeholder para matching engine propio futuro.

## 8. Trading Service

`src/services/trading/tradingService.ts` es el punto unico de entrada para la app movil. Expone `getCurrentTradingProvider`, `setTradingProvider`, `getTradingCapabilities`, `getProviderStatus`, `getAccountStatus`, `getInstruments`, `getTicker`, `getOrderBook`, `getBalances`, `getOpenOrders`, `getOrderHistory`, `getTradeHistory`, `getPositions`, `getFees`, `placeOrder`, `cancelOrder` y `transferInternal`.

Si `FEATURE_STATUS.trade.isRealTradingEnabled === false`, `placeOrder` delega al mock adapter.

## 9. Feature flags

`FEATURE_STATUS.trade` queda en modo seguro: `mode: "demo"`, `provider: "mock"`, `isRealTradingEnabled: false`, `showDemoLabels: true`, `requiresBackend: true`, `allowOrderPlacement: false`, `allowFutures: false`, `allowInternalTransfers: false`.

Esto evita afirmar trading real sin backend aprobado.

## 10. Internal Ledger

`src/types/ledger.ts` define cuentas, balances, assets, entradas, transacciones, reconciliacion, auditoria y errores. `LedgerEntry` y `LedgerTransaction` siempre incluyen `debitAccountId` y `creditAccountId`.

El ledger mock separa available, trading, pool, social, rewards, locked, fees, pending_withdrawal, provider_reserve y orbitx_reserve.

## 11. Ledger Service

`src/services/ledger/ledgerService.ts` ofrece `getUserLedgerBalance`, `getLedgerAccounts`, `createLedgerTransaction`, `moveAvailableToPool`, `movePoolToAvailable`, `transferSocialGift`, `creditReward`, `lockBalance`, `unlockBalance`, `collectFee`, `refundFee`, `requestWithdrawal`, `completeWithdrawal`, `reconcileWithProviderBalance` y `validateLedgerTransaction`.

Todas las funciones son mock controlado y no mueven dinero real.

## 12. Ejemplos de movimientos doble entrada

- Entrar al pool: debit `user.available`, credit `user.pool`, type `POOL_SUBSCRIBE`.
- Salir del pool: debit `user.pool`, credit `user.available`, type `POOL_REDEEM`.
- Regalo social: debit `sender.social`, credit `receiver.social`, type `SOCIAL_GIFT`.
- Reward: debit `orbitx.rewards_reserve`, credit `user.rewards`, type `REWARD_DISTRIBUTION`.
- Fee: debit `user.available`, credit `orbitx.fees`, type `FEE_COLLECT`.

## 13. Reconciliacion

`src/services/ledger/ledgerReconciliation.ts` suma saldos internos mock por asset para available, trading, pool, social, rewards, locked, fees y pending_withdrawal. Luego compara contra el saldo reportado por proveedor y devuelve `matched`, `internalTotal`, `providerTotal`, `difference`, `severity`, `message` y `checkedAt`.

No mueve dinero real.

## 14. Documentacion creada

- `docs/orbitx-trading-adapter.md`: explica adapters, OKX via backend, proveedores futuros y secretos solo en backend.
- `docs/orbitx-internal-ledger.md`: explica ledger, doble entrada, cuentas internas, reconciliacion y riesgos.
- `docs/orbitx-growth-architecture.md`: explica roadmap de mock, broker externo, multi-provider y motor propio.
- `docs/trading-provider-contract.md`: define contrato de endpoints, permisos minimos, auditoria, logs e idempotency keys.

## 15. Seguridad - Confirmacion explicita

- [x] Sin API secrets en frontend
- [x] Sin seed phrase
- [x] Sin private keys
- [x] Sin dinero real
- [x] Mocks aislados
- [x] Home no afectado
- [x] Ledger no mezclado con Web3

## 16. Migracion futura

Para pasar de OKX a motor propio, la app debe seguir consumiendo `tradingService`. El backend/adapters reemplazan la implementacion del proveedor. Las pantallas conservan modelos OrbitX (`TradingOrder`, `TradingBalance`, `TradingPosition`, etc.) y no se rehacen por cambiar de proveedor.

## 17. Que falta para produccion

- Backend real
- Base de datos con ACID
- Idempotency keys
- Auditoria y logging
- KYC/AML
- Proveedor aprobado
- Legal/compliance
- Reconciliacion real
- Monitoreo y alertas
- QA financiero

## 18. Validacion

- `npx tsc --noEmit`: paso sin errores.
- `npx expo-doctor`: paso sin errores criticos, 18/18 checks.
- `npm run lint`: no existe script `lint` en `package.json`.



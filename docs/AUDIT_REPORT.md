# Auditoría Trading Adapter + Internal Ledger — OrbitX

## Paso 0 — Árbol de archivos solicitado

Comando solicitado: `find src -type f | sort`

Resultado en PowerShell: el comando `find` resolvió al ejecutable de Windows y falló con `FIND: formato de parámetros incorrecto`. Para no perder la auditoría, se ejecutó el equivalente seguro en PowerShell y este es el resultado completo:

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
src/constants/tradingProviders.ts
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
src/services/ledger/index.ts
src/services/ledger/ledgerAccounts.ts
src/services/ledger/ledgerErrors.ts
src/services/ledger/ledgerMocks.ts
src/services/ledger/ledgerReconciliation.ts
src/services/ledger/ledgerService.ts
src/services/ledger/ledgerTransactions.ts
src/services/marketRealtime/geckoTerminal.ts
src/services/marketRealtime/providerResolver.ts
src/services/pool/index.ts
src/services/pool/poolMocks.ts
src/services/pool/poolService.ts
src/services/pool/poolTypes.ts
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
src/services/social/giftsService.ts
src/services/social/index.ts
src/services/social/liveGiftService.ts
src/services/social/socialLedgerService.ts
src/services/social/socialMediaStorage.ts
src/services/social/socialMocks.ts
src/services/tokens/externalWalletTokenDeployment.ts
src/services/trading/adapters/binanceTradingAdapter.ts
src/services/trading/adapters/bybitTradingAdapter.ts
src/services/trading/adapters/index.ts
src/services/trading/adapters/mexcTradingAdapter.ts
src/services/trading/adapters/mockTradingAdapter.ts
src/services/trading/adapters/notConfiguredAdapter.ts
src/services/trading/adapters/okxTradingAdapter.ts
src/services/trading/adapters/orbitxEngineAdapter.ts
src/services/trading/adapters/tradingAdapter.ts
src/services/trading/index.ts
src/services/trading/tradingErrors.ts
src/services/trading/tradingMappers.ts
src/services/trading/tradingProviderConfig.ts
src/services/trading/tradingService.ts
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
src/types/ledger.ts
src/types/market.ts
src/types/navigation.ts
src/types/ramp.ts
src/types/rewardsPool.ts
src/types/security.ts
src/types/social.ts
src/types/trade.ts
src/types/trading.ts
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

Comando solicitado: `find docs -type f | sort`

Resultado en PowerShell: el comando `find` resolvió al ejecutable de Windows y falló con `FIND: formato de parámetros incorrecto`. Equivalente PowerShell ejecutado:

<pre>
docs/apis-conectadas-orbitx.md
docs/IMPLEMENTATION_REPORT.md
docs/monthly-rewards-pool.md
docs/orbitx-growth-architecture.md
docs/orbitx-internal-ledger.md
docs/orbitx-trading-adapter.md
docs/trading-provider-contract.md
</pre>

## 0. Archivos verificados
- ✅ existe src/types/trading.ts
- ✅ existe src/types/ledger.ts
- ✅ existe src/constants/tradingProviders.ts
- ✅ existe src/constants/featureStatus.ts
- ✅ existe src/services/trading/tradingService.ts
- ✅ existe src/services/trading/tradingErrors.ts
- ✅ existe src/services/trading/tradingMappers.ts
- ✅ existe src/services/trading/tradingProviderConfig.ts
- ✅ existe src/services/trading/adapters/tradingAdapter.ts
- ✅ existe src/services/trading/adapters/mockTradingAdapter.ts
- ✅ existe src/services/trading/adapters/okxTradingAdapter.ts
- ✅ existe src/services/trading/adapters/binanceTradingAdapter.ts
- ✅ existe src/services/trading/adapters/mexcTradingAdapter.ts
- ✅ existe src/services/trading/adapters/bybitTradingAdapter.ts
- ✅ existe src/services/trading/adapters/orbitxEngineAdapter.ts
- ✅ existe src/services/trading/adapters/index.ts
- ✅ existe src/services/ledger/ledgerService.ts
- ✅ existe src/services/ledger/ledgerAccounts.ts
- ✅ existe src/services/ledger/ledgerTransactions.ts
- ✅ existe src/services/ledger/ledgerReconciliation.ts
- ✅ existe src/services/ledger/ledgerErrors.ts
- ✅ existe src/services/ledger/ledgerMocks.ts
- ✅ existe src/services/ledger/index.ts
- ✅ existe src/services/pool/poolService.ts
- ✅ existe src/services/pool/poolTypes.ts
- ✅ existe src/services/pool/poolMocks.ts
- ✅ existe src/services/social/socialLedgerService.ts
- ✅ existe src/services/social/giftsService.ts
- ✅ existe src/services/social/socialMocks.ts
- ✅ existe docs/orbitx-trading-adapter.md
- ✅ existe docs/orbitx-internal-ledger.md
- ✅ existe docs/orbitx-growth-architecture.md
- ✅ existe docs/trading-provider-contract.md
- ✅ existe docs/IMPLEMENTATION_REPORT.md
No hay archivos esperados faltantes.

## 1. Resumen ejecutivo

Estado general: ⚠️ Arquitectura base correcta para fase controlada, con trading real bloqueado y ledger mock aislado. No se detectaron API secrets ni conexión directa a OKX dentro de la nueva capa Trading Adapter + Internal Ledger.

Veredicto ejecutivo: la capa nueva está lista para la siguiente fase de backend real, pero no está lista para producción financiera. El riesgo rojo encontrado no pertenece a la capa nueva de adapters, sino a un flujo existente de Bot Futures que solicita API Key/Secret en frontend. Ese flujo debe bloquearse o migrarse a backend antes de cualquier integración broker real.

## 2. Trading Adapter Layer

- ✅ `tradingAdapter.ts`: `ITradingAdapter` existe, está exportada y define todos los métodos requeridos: provider status, capabilities, account, instruments, ticker, order book, balances, orders, trades, positions, fees, place/cancel order, transfer y health.
- ✅ Los retornos usan modelos internos OrbitX desde `src/types/trading.ts`; no se exponen modelos crudos de OKX a la app.
- ✅ `tradingService.ts`: existe como punto central de consumo y selecciona adapter internamente. `placeOrder` revisa `FEATURE_STATUS.trade.isRealTradingEnabled` y delega al mock si el trading real está deshabilitado.
- ✅ No se encontraron imports directos de adapters desde `app/`, `components/` o pantallas. La UI no consume adapters directamente.
- ⚠️ `src/services/trading/index.ts` exporta adapters desde el barrel público. No rompe hoy porque ninguna pantalla los importa, pero para producción conviene no exportarlos públicamente y dejar solo `tradingService` como API de app.
- ✅ `mockTradingAdapter.ts`: está marcado como mock/demo; `placeOrder` devuelve `status: 'simulated'`, `isSimulated: true` y warning de simulación. No afecta saldos reales ni Home.
- ✅ `okxTradingAdapter.ts`: no contiene API secret, no firma requests en frontend y usa endpoints internos `/trading/...` sobre el backend OrbitX. Si no hay backend configurado lanza `PROVIDER_NOT_CONFIGURED`.
- ✅ `binanceTradingAdapter.ts`, `mexcTradingAdapter.ts` y `bybitTradingAdapter.ts`: existen, implementan la interfaz mediante adapter no configurado y quedan como proveedores futuros no productivos.
- ✅ `orbitxEngineAdapter.ts`: existe como placeholder del motor propio futuro, implementa la interfaz y retorna estado no configurado.
- ⚠️ `tradingMappers.ts`: mapea respuestas externas a modelos internos, pero usa casteos y fallback simple. Correcto para esta fase, insuficiente para producción sin validación runtime/schema.

## 3. Feature flags

- ✅ `FEATURE_STATUS.trade.mode`: `demo`.
- ✅ `FEATURE_STATUS.trade.provider`: `mock`.
- ✅ `FEATURE_STATUS.trade.isRealTradingEnabled`: `false`.
- ✅ `FEATURE_STATUS.trade.allowOrderPlacement`: `false`.
- ✅ `FEATURE_STATUS.trade.showDemoLabels`: `true`.
- ✅ `FEATURE_STATUS.trade.allowFutures`: `false`.
- ✅ `FEATURE_STATUS.trade.allowInternalTransfers`: `false`.
- ✅ No se encontró `isRealTradingEnabled: true` ni `allowOrderPlacement: true` en `src/`.

Conclusión: trading real está bloqueado por frontend y no puede activarse accidentalmente sin modificar explícitamente `src/constants/featureStatus.ts`.

## 4. Internal Ledger

- ✅ `src/types/ledger.ts`: `LedgerEntry` tiene `debitAccountId` y `creditAccountId` requeridos, no opcionales.
- ✅ `LedgerTransactionType` incluye los tipos requeridos: pool, social gift, rewards, fees, trade lock/unlock, withdrawals, reconciliación y ajustes.
- ✅ `LedgerAccountType` incluye `available`, `trading`, `pool`, `social`, `rewards`, `locked`, `fees`, `pending_withdrawal`, `provider_reserve`, `orbitx_reserve` y otros estados internos.
- ✅ `LedgerReconciliationResult` incluye `matched`, `internalTotal`, `providerTotal`, `difference`, `severity`, `message`, `checkedAt`.
- ✅ `moveAvailableToPool`: debita `user.available` y acredita `user.pool`.
- ✅ `movePoolToAvailable`: debita `user.pool` y acredita `user.available`.
- ✅ `transferSocialGift`: debita `sender.social` y acredita `receiver.social`.
- ✅ `creditReward`: debita `orbitx.rewards_reserve` y acredita `user.rewards`.
- ✅ `collectFee`: debita `user.available` y acredita `orbitx.fees`.
- ✅ Ningún movimiento revisado crea dinero sin una cuenta debitada.
- ⚠️ El mock actual modela una entrada con ambos campos debit/credit. Para backend financiero real conviene evolucionar a journal entries persistidas con líneas contables separadas, transacción ACID e idempotency keys.
- ✅ `ledgerReconciliation.ts`: solo compara saldos, no mueve dinero.
- ✅ Reconciliación suma `available + trading + pool + social + rewards + locked + fees + pending_withdrawal`.
- ✅ Devuelve severidad `ok`, `warning` o `critical` según diferencia.
- ✅ `ledgerMocks.ts`: marcado como `LEDGER_MOCK`, aislado y sin conexión a Home/Wallet/Web3.

## 5. Pool y Social

- ✅ `poolService.ts`: `subscribeToPool`, `redeemFromPool` y `distributePoolReward` usan funciones del ledger mock/controlado.
- ✅ `poolService.ts`: no conecta proveedor externo real y quedó marcado como `POOL_MOCK`.
- ✅ `giftsService.ts`: `sendGift` usa `transferSocialGift` del ledger.
- ✅ `socialLedgerService.ts`: `refundGift` usa `createLedgerTransaction` con doble entrada mock.
- ✅ `giftsService.ts` y `socialLedgerService.ts`: quedaron marcados como `SOCIAL_MOCK`.
- ✅ `poolMocks.ts` y `socialMocks.ts`: existen y están aislados.
- ✅ No se encontró integración de mocks de pool/social con Home o Wallet.

## 6. Seguridad

Patrones buscados en `src/`: `secret`, `apiKey`, `api_key`, `privateKey`, `private_key`, `seedPhrase`, `seed_phrase`, `mnemonic`, `OKX_SECRET`, strings de activación real, `connectToOKX`, `api.okx.com` y flags inseguros.

Hallazgos:

- ✅ Nueva capa Trading/Ledger: sin API secrets hardcodeados, sin llamadas directas a `api.okx.com`, sin signing frontend y sin activación de trading real.
- ✅ No se encontró `OKX_SECRET`, `connectToOKX`, `api.okx.com`, `isRealTradingEnabled: true` ni `allowOrderPlacement: true`.
- 🔴 `src/components/botFutures/ApiKeysFormCard.tsx:33`: pantalla existente solicita “Pega tus claves API”.
- 🔴 `src/components/botFutures/ApiKeysFormCard.tsx:36`: campo visible “Clave API (API Key)”.
- 🔴 `src/components/botFutures/ApiKeysFormCard.tsx:57`: campo visible “Clave Secreta (Secret Key)”.
- 🔴 `src/screens/BotFuturesConnectKeysScreen/index.tsx:17`: lee `apiKey` desde store frontend.
- 🔴 `src/screens/BotFuturesConnectKeysScreen/index.tsx:18`: lee `secretKey` desde store frontend.
- 🔴 `src/store/botFuturesStore.ts:17`: estado frontend contiene `apiKey`.
- 🔴 `src/store/botFuturesStore.ts:18`: estado frontend contiene `secretKey`.
- 🟡 `src/store/botFuturesStore.ts`: el persist parcial conserva solo metadata y key enmascarada, no el secret completo, pero el flujo sigue siendo inaceptable para producción financiera porque el frontend recibe credenciales de exchange.
- 🟡 `src/services/wallet/tokenDiscovery.ts:7-9`: usa `EXPO_PUBLIC_MORALIS_API_KEY`, `EXPO_PUBLIC_ALCHEMY_API_KEY`, `EXPO_PUBLIC_COVALENT_API_KEY`. Son claves públicas por diseño, pero deben tener cuotas/restricciones de dominio/proyecto.
- 🟡 `src/services/ramp/rampConfig.ts:101` y `src/services/ramp/rampConfig.ts:110`: referencias públicas a Transak/MoonPay. No se clasifican como secrets privados, pero deben revisarse antes de activar ramp real.
- ✅ Referencias existentes a seed/mnemonic aparecen en módulos de wallet/seguridad ya existentes. No fueron tocadas en esta fase.

Confirmación explícita:

- [ ] Sin API secrets en frontend: no hay secrets hardcodeados, pero existe flujo frontend para introducir API Key/Secret de Bot Futures. Debe bloquearse antes de producción.
- [x] Sin seed phrase tocada en esta fase.
- [x] Sin private keys tocadas en esta fase.
- [x] Sin dinero real activado.
- [x] Mocks aislados.
- [x] Home no afectado por ledger mock.
- [x] Wallet/Web3 no afectados.

## 7. Documentación

- ✅ `docs/orbitx-trading-adapter.md`: completo. Explica el adapter layer, desacoplamiento de OKX, proveedores futuros, motor propio, frontend/backend y API secrets nunca en frontend.
- ✅ `docs/orbitx-internal-ledger.md`: completo. Explica doble entrada, cuentas internas, pool/social/rewards/fees, reconciliación y faltantes de producción.
- ✅ `docs/orbitx-growth-architecture.md`: completo. Describe roadmap mock → broker → multi-provider → motor propio y riesgos arquitectónicos.
- ✅ `docs/trading-provider-contract.md`: completo. Lista endpoints internos, backend signing, idempotency, auditoría/logging y límites frontend.
- ✅ `docs/IMPLEMENTATION_REPORT.md`: existe y lista la implementación/validación de la fase anterior. Formato legible y suficiente para trazabilidad.

## 8. Correcciones aplicadas

- `src/services/pool/poolService.ts`: se agregó comentario `POOL_MOCK` para dejar claro que el servicio es temporal y no mueve dinero real.
- `src/services/social/giftsService.ts`: se agregó comentario `SOCIAL_MOCK` para dejar claro que regalos sociales usan ledger mock/controlado.
- `src/services/social/socialLedgerService.ts`: se agregó comentario `SOCIAL_MOCK` al flujo de refund temporal.

No se crearon archivos faltantes. No se conectó proveedor real. No se modificaron pantallas, wallet, Web3, seed phrase ni Home balance.

## 9. Archivos faltantes

Ninguno. Todos los archivos esperados de la fase Trading Adapter + Internal Ledger existen.

## 10. Riesgos para producción

🔴 Bloqueantes:

- El flujo existente de Bot Futures pide API Key/Secret en frontend. Antes de broker real debe eliminarse, bloquearse o migrarse a backend seguro con OAuth/subcuentas/permisos mínimos.
- Trading real sigue sin backend financiero productivo, idempotency keys, auditoría, logging, reconciliación real, KYC/AML y aprobación legal.
- El ledger actual es mock/in-memory. No puede usarse para dinero real sin base de datos ACID, locks transaccionales y auditoría inmutable.

🟡 Importantes:

- `tradingMappers.ts` necesita validación runtime/schema antes de aceptar payloads reales de proveedor.
- El barrel `src/services/trading/index.ts` exporta adapters. Conviene restringir export público para reforzar que la app solo consuma `tradingService`.
- Reconciliación actual usa mocks; debe conectarse a backend y provider balances reales antes de producción.
- Public API keys de token/ramp requieren restricciones, cuotas y revisión de exposición.

🟢 Mejoras:

- Añadir tests unitarios para adapters, feature flags, ledger movements y reconciliación.
- Añadir lint formal al proyecto.
- Documentar diagrama operativo de incidentes/reconciliación.

## 11. Validación técnica

- ✅ `npx tsc --noEmit`: pasó sin errores.
- ✅ `npx expo-doctor`: pasó 18/18 checks, sin issues detectados.
- ⚠️ `npm run lint`: no existe script `lint` en `package.json`; npm devolvió `Missing script: "lint"`.

## 12. Veredicto final

La arquitectura Trading Adapter + Internal Ledger quedó correcta, segura y desacoplada para la fase actual de mock controlado. OKX no está conectado real, el frontend no contiene secrets de OKX, el trading real está bloqueado por feature flags y el ledger mock no alimenta Home, Wallet ni Web3.

Está lista para la siguiente fase de diseño/conexión de backend real, siempre que se mantenga el principio: la app consume modelos OrbitX y el backend/adapters traducen hacia proveedores externos.

Antes de avanzar a producción o broker real, debe resolverse obligatoriamente el flujo de Bot Futures que solicita API Key/Secret en frontend, implementar backend con signing seguro, persistencia ACID para ledger, idempotency keys, auditoría, reconciliación real, controles KYC/AML y monitoreo operativo.

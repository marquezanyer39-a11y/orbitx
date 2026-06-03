# Estado de Arquitectura OrbitX

## 0. Árbol de archivos detectado

Comandos POSIX solicitados:

- `find src -type f | sort`: falló en PowerShell con `FIND: formato de parámetros incorrecto`.
- `find docs -type f | sort`: falló por el mismo motivo.
- `find app -type f | sort`: falló por el mismo motivo.

Equivalente usado: `Get-ChildItem -Path <dir> -Recurse -File | Sort-Object FullName`.

### src/

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

### docs/

<pre>
docs/apis-conectadas-orbitx.md
docs/AUDIT_REPORT.md
docs/IMPLEMENTATION_REPORT.md
docs/monthly-rewards-pool.md
docs/orbitx-growth-architecture.md
docs/orbitx-internal-ledger.md
docs/orbitx-trading-adapter.md
docs/trading-provider-contract.md
</pre>

### app/

<pre>
app/(tabs)/_layout.tsx
app/(tabs)/create-token.tsx
app/(tabs)/create-token-airdrop.tsx
app/(tabs)/create-token-created.tsx
app/(tabs)/create-token-liquidity.tsx
app/(tabs)/create-token-publication.tsx
app/(tabs)/create-token-review.tsx
app/(tabs)/home.tsx
app/(tabs)/market.tsx
app/(tabs)/profile.tsx
app/(tabs)/profile-vip.tsx
app/(tabs)/spot.tsx
app/(tabs)/wallet.tsx
app/(tabs)/wallet-local.tsx
app/(tabs)/wallet-spot.tsx
app/(tabs)/wallet-web3.tsx
app/_layout.tsx
app/+not-found.tsx
app/astra.tsx
app/auth/reset.tsx
app/bot.tsx
app/bot-futures/activity.tsx
app/bot-futures/configuration.tsx
app/bot-futures/confirm-start.tsx
app/bot-futures/connect-exchange.tsx
app/bot-futures/connect-guide.tsx
app/bot-futures/connect-keys.tsx
app/bot-futures/connect-success.tsx
app/bot-futures/disclaimer.tsx
app/bot-futures/history.tsx
app/bot-futures/index.tsx
app/bot-futures/live-positions.tsx
app/bot-futures/mode.tsx
app/bot-futures/overview.tsx
app/bot-futures/performance.tsx
app/bot-futures/risk-manager.tsx
app/bot-futures/signals.tsx
app/bot-futures/strategy.tsx
app/bot-futures/trade-detail.tsx
app/browser.tsx
app/convert.tsx
app/create.tsx
app/favorites.tsx
app/forgot-password.tsx
app/history.tsx
app/index.tsx
app/language.tsx
app/login.tsx
app/notifications.tsx
app/pair-selector.tsx
app/personalization.tsx
app/pool.tsx
app/privacy.tsx
app/ramp/flow.tsx
app/ramp/result.tsx
app/ramp/summary.tsx
app/rango-orbitx.tsx
app/receive.tsx
app/register.tsx
app/security.tsx
app/send.tsx
app/social/comments/[postId].tsx
app/social/create.tsx
app/social/creator/[creatorId].tsx
app/social/index.tsx
app/social/live.tsx
app/social/messages.tsx
app/token/[id].tsx
app/trade/chart.tsx
app/trade/index.tsx
</pre>

### Archivos críticos

- ✅ existe src/types/trading.ts
- ✅ existe src/types/ledger.ts
- ✅ existe src/constants/featureStatus.ts
- ✅ existe src/constants/tradingProviders.ts
- ✅ existe src/services/trading/tradingService.ts
- ✅ existe src/services/trading/adapters/tradingAdapter.ts
- ✅ existe src/services/trading/adapters/mockTradingAdapter.ts
- ✅ existe src/services/trading/adapters/okxTradingAdapter.ts
- ✅ existe src/services/ledger/ledgerService.ts
- ✅ existe src/services/ledger/ledgerMocks.ts
- ✅ existe src/services/ledger/ledgerReconciliation.ts
- ✅ existe src/services/pool/poolService.ts
- ✅ existe src/services/social/giftsService.ts
- ✅ existe docs/IMPLEMENTATION_REPORT.md
- ✅ existe docs/AUDIT_REPORT.md

## 1. Resumen ejecutivo

OrbitX está en estado parcial alto para desarrollo y razonablemente cerca de APK interna, pero no está lista para beta financiera ni producción. La UI principal, Perfil/Rango, Wallet, Web3 y navegación ya tienen una base usable. La capa Web3 tiene lectura, refresh, cambio de red y envío EVM externo, pero aún requiere QA real en Android y pruebas con wallets reales.

Trading Adapter e Internal Ledger están bien planteados como arquitectura, pero siguen en modo mock/preparado. Bot Futures ya no acepta API Secret en frontend, lo cual baja un riesgo rojo importante, pero el backend seguro sigue pendiente. Trade, Spot, Cuenta Local, Pool, Social/Gifts y partes de Crear Token siguen teniendo mocks o flujos parciales. El mayor riesgo técnico ahora es confundir módulos demo con funcionalidad financiera real si no se mantiene el etiquetado y los feature flags.

## 2. Mapa general del proyecto

| Carpeta | Archivos | Contenido | Clasificación | Observación |
|---|---:|---|---|---|
| app/ | 70 | Rutas Expo Router, tabs, redirects y pantallas top-level | B | Bien trazable, pero hay varias rutas legacy/duplicadas que conviene revisar antes de clean build final. |
| src/screens/ | 53 | Pantallas principales y subpantallas | C | Muchas pantallas grandes con lógica y UI juntas; usable, pero pide separación gradual. |
| src/components/ | 98 | Componentes UI por dominio | B | Bastante modular; Bot Futures y Astra tienen muchos componentes específicos. |
| src/services/ | 83 | APIs, Web3, wallet, trading, ledger, token deploy, ramp, Astra | B | Buen avance hacia capas; todavía conviven servicios reales, mocks y fallbacks. |
| src/hooks/ | 22 | Hooks de datos, wallet, mercados, seguridad, Astra | B | Correcto; algunos hooks son grandes y sensibles a rerenders. |
| src/store/ | 14 | Zustand stores | B | Orden razonable; stores grandes como wallet/auth/astra deben dividirse luego. |
| src/constants/ | 6 | Feature flags, trading providers, VIP, social | A | Buena centralización. |
| src/types/ | 15 | Tipos de dominio | A | Correcto; trading/ledger/vip están desacoplados. |
| src/utils/ | 9 | Formato, validación, portfolio, VIP | B | Correcto; algunos helpers financieros merecen tests. |
| src/providers/ | 1 | ExternalWalletProvider | B | Muy relevante y algo grande; mantener aislado. |
| src/i18n/ | 2 | Recursos generados y overrides runtime | C | Archivo generado enorme y overrides grandes; necesita tooling/flujo claro. |
| docs/ | 8 | Reportes y arquitectura | B | Buena base, falta doc específica de Bot Futures security. |

## 3. Estado por módulo

| Módulo | % | Estado | Real/Mock | Riesgos | Próximo paso | Clasificación |
|---|---:|---|---|---|---|---|
| Home | 78 | Funcional alto | Real + fuentes filtradas | Depende de Web3 y mercado; no debe sumar demos | QA Android y tests de total balance | B |
| Perfil | 82 | Funcional alto | Real + métricas locales | Pantalla grande; métricas no auditadas financieramente | QA visual y separar componentes si crece | B |
| Rango OrbitX | 78 | Funcional visual alto | Mock VIP aislado | Sin backend VIP | Conectar backend VIP después | B |
| Wallet principal | 76 | Funcional alto | Real + demos etiquetados | Complejidad alta en balance total | Tests de portfolioTotals | B |
| Web3 Wallet | 72 | Parcial usable | Real parcial | Archivo grande, Polygon switch parcial, provider externo variable | QA Android con wallet real | B |
| Send EVM | 68 | Parcial usable | Real EVM externo | Requiere pruebas reales controladas y UX de errores | Testnet/mainnet con monto mínimo | B |
| Spot Wallet | 45 | Demo avanzado | Demo | No broker real | Mantener etiquetado hasta backend trading | C |
| Cuenta Local | 40 | Demo avanzado | Demo | Puede confundirse con dinero bancario si no se lee el aviso | Decidir proveedor bancario o mantener bloqueada | C |
| Trade | 48 | Demo avanzado | Demo + market real | Órdenes demo; no ejecución real | Conectar solo vía tradingService/backend | C |
| Trading Adapter Layer | 78 | Arquitectura preparada | Mock + adapters preparados | Adapter exportable desde barrel; sin backend real | Backend contract + tests | B |
| Internal Ledger | 64 | Parcial mock | Mock aislado | In-memory/mock; no ACID | Backend ledger real con DB transaccional | C |
| Pool | 42 | Mock controlado | Mock ledger | No dinero real | Backend y reglas de producto | C |
| Social/Gifts | 44 | Mock/controlado | Mock ledger + social local | Gifts no financieros reales | Separar social real vs monetización | C |
| Bot Futures | 38 | Bloqueado seguro | Visual/demo | Backend pendiente; no operar real | Crear backend seguro/OAuth | C |
| Crear Token | 68 | Parcial real | Deploy EVM real + pasos mock | Liquidez/airdrop/publicación no reales | QA deploy + ERC20 audits + redes | B |
| Astra | 58 | Prototipo avanzado | Backend/fallback local | Pantalla y voz grandes, fallback variable | Refactor y límites de datos financieros | C |
| Browser | 62 | Parcial usable | WebView real | Archivo grande, QA Android crítico | Separar browser hub/WebView | B |
| Markets/precios | 72 | Funcional alto | CoinGecko/Binance/GeckoTerminal + fallback | Fallback puede ocultar fallas de live | Mostrar fuente y freshness | B |
| Auth/Supabase | 68 | Parcial usable | Supabase si config, local fallback | Fallback local no equivale auth productiva | QA flows y políticas de sesión | B |
| Feature flags | 84 | Sólido | Config local | Sin remote config | Mantener flags bloqueantes | A |
| Theme/diseño | 72 | Coherente alto | N/A | Hardcodes residuales y pantallas legacy | Pasada visual incremental | B |
| i18n/textos | 60 | Parcial | Recursos generados + overrides | Mojibake residual en tabs create-token | Fase de texto final | C |
| Seguridad | 66 | Parcial alta | N/A | Seed/wallet sensibles, logs devWarn, QA pendiente | Threat model y QA dispositivo | B |
| Performance | 55 | Prototipo avanzado | N/A | Archivos grandes, WebViews, Astra voice | Refactors focalizados | C |
| Navegación | 76 | Funcional alto | N/A | Rutas duplicadas/legacy controladas | QA deep links y rutas ocultas | B |

## 4. Arquitectura actual

La app está organizada con Expo Router en pp/, pantallas en src/screens/, componentes de dominio en src/components/, stores Zustand en src/store/, servicios en src/services/, tipos en src/types/ y constantes en src/constants/.

La mejor parte de la arquitectura actual es que los dominios financieros nuevos ya empiezan a separarse: services/trading usa adapters, services/ledger está aislado, services/web3 concentra red/balance/transacciones y utils/portfolioTotals.ts evita sumar demos al Home. La parte más débil es que aún hay pantallas enormes con lógica de negocio, UI, mocks y estado local mezclados, especialmente Astra, Browser, Wallet Web3 y Crear Token.

## 5. Lo que está bien

- Trading real sigue bloqueado con FEATURE_STATUS.trade.isRealTradingEnabled: false y allowOrderPlacement: false.
- OKX adapter no llama directamente a OKX ni firma requests en frontend.
- Bot Futures ya no captura API Key/Secret en el frontend activo.
- Home y Wallet filtran Spot demo y Cuenta Local demo para no sumarlos como dinero real.
- Rango OrbitX usa mock VIP aislado y no toca balances reales.
- Web3 externo tiene separación de provider, redes, errores y transacciones EVM.
- Los docs de Trading Adapter, Ledger y contrato de provider existen y son coherentes.

## 6. Lo que está desordenado

- Hay pantallas y componentes de más de 900 líneas con demasiadas responsabilidades.
- src/i18n/resources.generated.ts y untimeOverrides.ts son enormes; el flujo de i18n necesita orden de generación y revisión.
- Conviven rutas nuevas, redirects y rutas legacy; no están rotas, pero falta una fase de limpieza tras QA.
- Algunos textos tienen mojibake residual, por ejemplo títulos ocultos de create-token en tabs y mensajes Web3 Polygon.
- components/common/Screen.tsx vive fuera de src/ y pesa más de 2000 líneas; es deuda de arquitectura.
- services/trading/index.ts exporta adapters, lo que no rompe ahora, pero debilita la regla de que la app consuma solo 	radingService.

## 7. Archivos grandes o pesados

| Líneas | Archivo | Recomendación |
|---:|---|---|
| 4755 | src/i18n/resources.generated.ts | Generado; no editar manualmente, revisar pipeline i18n. |
| 2145 | components/common/Screen.tsx | Riesgo alto de componente común sobredimensionado; dividir después. |
| 1365 | src/screens/CreateTokenScreen/AirdropConfigScreen.tsx | Dividir UI, validaciones y datos estáticos. |
| 1349 | app/trade/chart.tsx | Separar chart runtime, data adapters y UI. |
| 1310 | src/screens/WalletScreen/Web3WalletScreen.tsx | Dividir wallet externa, local assets, red y refresh. |
| 1236 | components/create-token/CreateTokenWizard.tsx | Legacy grande; revisar si aún se usa frente a pantallas nuevas. |
| 1132 | src/hooks/useAstraVoice.ts | Alto riesgo de rendimiento; separar estado, TTS y reconocimiento. |
| 1126 | src/screens/CreateTokenScreen/LiquidityConfigScreen.tsx | Dividir formularios y helpers. |
| 1070 | src/screens/ConvertScreen/index.tsx | Dividir flujo, sheets y cálculos. |
| 1017 | src/screens/AstraScreen/index.tsx | Dividir UI, contexto, acciones y voz. |
| 974 | src/i18n/runtimeOverrides.ts | Convertir en módulos por dominio si crece más. |
| 972 | src/screens/ProfileScreen/index.tsx | Perfil funcional, pero aún denso. |
| 935 | src/screens/ProfileScreen/OrbitXRankScreen.tsx | Visual correcto; luego separar cards y helpers visuales. |
| 906 | app/browser.tsx | WebView y browser hub juntos; separar cuando haya QA Android estable. |
| 904 | src/screens/WalletScreen/LocalAccountScreen.tsx | Demo bancario grande; mantener claro como demo. |
| 867 | src/store/walletStore.ts | Store crítico y grande; dividir actions/selectors después. |

## 8. Seguridad

Hallazgos principales:

- ✅ Sin OKX_SECRET ni BINANCE_SECRET en src/.
- ✅ Sin isRealTradingEnabled: true ni allowOrderPlacement: true.
- ✅ Sin llamadas directas a api.okx.com.
- ✅ api.binance.com existe solo en src/services/api/realtimeMarket.ts para market data público, no para trading privado.
- ✅ Bot Futures tiene mensaje y bloqueo explícito: no recibe API secrets en frontend.
- 🟡 Hay referencias a seedPhrase y mnemonic en wallet/security, esperadas para wallet local; no se tocaron en esta fase.
- 🟡 2FA genera y guarda secret en SecureStore; correcto para 2FA, sensible para QA.
- 🟡 devWarn aparece muchas veces; no vi console.log con seed/key/balance sensible, pero conviene auditar logs antes de release.
- 🟡 console.warn en WalletConnect runtime unavailable no expone datos sensibles.

Checklist:

- [x] Sin API secrets hardcodeados en frontend.
- [x] Sin API keys privadas hardcodeadas.
- [x] Sin seed phrase en logs detectados.
- [x] Sin private keys en código detectadas por patrón.
- [x] Trading real deshabilitado (isRealTradingEnabled: false).
- [x] allowOrderPlacement: false.
- [x] Bot Futures bloqueado en frontend.
- [x] OKX adapter no llama a OKX directamente.
- [x] Ledger mock no alimenta Home balance.
- [x] Ledger mock no mezclado con Web3/Wallet.
- [x] AsyncStorage de Bot Futures ya no guarda credenciales.
- [x] SecureStore se usa para 2FA y wallet local sensible.
- [x] No hay console.log sensible detectado.

## 9. Datos reales vs mocks

| Fuente | Archivo | Real/Mock | Alimenta UI | Riesgo | Recomendación |
|---|---|---|---|---|---|
| Web3 balance local | src/services/wallet/walletBalances.ts | Real/parcial | Wallet/Home | Medio | Mantener separado de wallet externa. |
| Web3 balance externo | src/services/wallet/externalWalletBalances.ts | Real | Wallet/Home | Medio | QA por red y errores RPC. |
| Send EVM | src/services/web3/web3TransactionService.ts | Real externo | SendScreen | Alto | Probar rechazo, gas y chain mismatch. |
| Ledger mock | src/services/ledger/ledgerMocks.ts | Mock | Pool/Social | Alto | No conectar a Home ni Wallet. |
| Pool mock | src/services/pool/poolMocks.ts | Mock | Pool UI | Medio | Etiquetar hasta backend. |
| Social gifts mock | src/services/social/socialMocks.ts | Mock | Social/Gifts | Medio | No presentar como dinero real. |
| Spot/demo trade | src/screens/WalletScreen/SpotWalletScreen.tsx | Demo | Wallet/Spot | Alto | Mantener `Modo demo`. |
| Local Account | src/screens/WalletScreen/LocalAccountScreen.tsx | Demo | Wallet Local | Alto | No sumarlo como saldo real. |
| CoinGecko | src/services/api/coingecko.ts | Real público | Markets/Home/Trade fallback | Bajo | Manejar rate limits y freshness. |
| Binance REST/WS | src/services/api/realtimeMarket.ts | Real público | Trade/Charts | Medio | No confundir market data con trading execution. |
| GeckoTerminal | src/services/marketRealtime/geckoTerminal.ts | Real público | Markets/Trade fallback | Medio | Señalar fuente cuando sea fallback. |
| VIP mock | src/services/vip/vipService.ts | Mock aislado | Perfil/Rango | Bajo | Conectar backend VIP futuro. |
| Bot Futures | src/store/botFuturesStore.ts | Demo/bloqueado | Bot UI | Medio | Backend seguro antes de real. |
| Crear Token deploy | src/services/tokens/externalWalletTokenDeployment.ts | Real EVM parcial | Crear Token | Alto | Auditar contrato/bytecode y QA real. |
| Astra | src/services/astra/* | Backend/fallback | Astra UI | Medio | No prometer datos financieros reales. |
| Supabase auth | src/store/authStore.ts | Real si env | Auth/Profile | Medio | QA sesiones, recovery y fallback local. |

## 10. Navegación

| Ruta | Estado | Recomendación |
|---|---|---|
| /(tabs)/home, market, spot, wallet, profile | Activas como tabs | Mantener. |
| /(tabs)/profile-vip | Oculta, mantiene Perfil activo | Correcto. |
| /rango-orbitx | Redirect legacy a /profile-vip | Mantener por compatibilidad. |
| /(tabs)/wallet-web3, wallet-spot, wallet-local | Ocultas | Correcto. |
| /(tabs)/create-token-* | Ocultas bajo tab Operar | Correcto; corregir mojibake en títulos luego. |
| /bot-futures/* | Rutas activas de módulo Bot | Mantener bloqueadas para real. |
| /browser | Activa | QA Android/WebView. |
| /send | Activa | QA EVM real controlado. |
| /token/[id] | Activa | Revisar si duplica TokenCreatedScreen. |
| /bot | Alias overview | Mantener o documentar legacy. |

Verificaciones:

- [x] No existe tab visible Ranks.
- [x] Rango OrbitX está accesible desde Perfil y mantiene Perfil activo con profile-vip oculto.
- [x] Wallet subrutas están ocultas con href: null.
- [x] Bot Futures bloqueado no rompe navegación.
- [x] Browser tiene ruta clara.
- [x] SendScreen tiene ruta clara.
- [x] Hay rutas legacy, pero no eliminarlas antes de QA.

## 11. Performance

Problemas detectados:

| Archivo | Impacto | Problema | Solución recomendada | Prioridad |
|---|---|---|---|---|
| src/hooks/useAstraVoice.ts | Alto | Voz, timers, TTS, recognition y fallback en un hook grande | Separar runtime, playback, recognition y state machine | Alta |
| app/browser.tsx | Medio | Hub browser + WebView + navegación en un archivo | Separar WebView runtime y browser home | Media |
| src/screens/WalletScreen/Web3WalletScreen.tsx | Alto | Wallet local, externa, red, refresh y listas en una pantalla | Separar cards y hooks selectores | Alta |
| src/screens/AstraScreen/index.tsx | Medio | UI y lógica conversacional grande | Separar paneles y estado | Media |
| app/trade/chart.tsx | Medio | Chart runtime y datos live/fallback juntos | Extraer chart service/hook | Media |
| src/screens/CreateTokenScreen/* | Medio | Formularios largos con data estática | Separar constantes, validación y cards | Media |
| src/i18n/resources.generated.ts | Bajo | Archivo generado enorme | No editar manualmente; cuidar pipeline | Baja |

## 12. Documentación

| Doc | Existe | Actualizado | Coherente con código | Acción |
|---|---|---|---|---|
| docs/IMPLEMENTATION_REPORT.md | Sí | Parcial | Sí | Mantener; puede archivarse luego como histórico. |
| docs/AUDIT_REPORT.md | Sí | Sí | Sí | Mantener. |
| docs/orbitx-trading-adapter.md | Sí | Sí | Sí | Mantener. |
| docs/orbitx-internal-ledger.md | Sí | Sí | Sí | Mantener. |
| docs/orbitx-growth-architecture.md | Sí | Sí | Sí | Mantener. |
| docs/trading-provider-contract.md | Sí | Sí | Sí | Mantener. |
| docs/apis-conectadas-orbitx.md | Sí | Parcial | Requiere revisión tras Web3/Bot | Actualizar antes de beta técnica. |
| docs/monthly-rewards-pool.md | Sí | Parcial | No auditado profundamente | Revisar antes de activar rewards. |
| docs/bot-futures-security.md | No | No | N/A | Crear en siguiente fase. |

## 13. Correcciones mínimas aplicadas

Sin correcciones de código aplicadas durante esta auditoría general. Se generó este reporte de estado.

Nota: el estado auditado ya incluye la corrección previa de Bot Futures, donde se bloqueó el ingreso de API Key/Secret en frontend y se migró el store a orbitx-bot-futures-store-v2 sin credenciales.

## 14. Estado en porcentajes

### Por módulo

| Módulo | % | Estado | Real/Mock | Riesgos | Próximo paso | Clasificación |
|---|---:|---|---|---|---|---|
| Home | 78 | Funcional alto | Real + fuentes filtradas | Depende de Web3 y mercado; no debe sumar demos | QA Android y tests de total balance | B |
| Perfil | 82 | Funcional alto | Real + métricas locales | Pantalla grande; métricas no auditadas financieramente | QA visual y separar componentes si crece | B |
| Rango OrbitX | 78 | Funcional visual alto | Mock VIP aislado | Sin backend VIP | Conectar backend VIP después | B |
| Wallet principal | 76 | Funcional alto | Real + demos etiquetados | Complejidad alta en balance total | Tests de portfolioTotals | B |
| Web3 Wallet | 72 | Parcial usable | Real parcial | Archivo grande, Polygon switch parcial, provider externo variable | QA Android con wallet real | B |
| Send EVM | 68 | Parcial usable | Real EVM externo | Requiere pruebas reales controladas y UX de errores | Testnet/mainnet con monto mínimo | B |
| Spot Wallet | 45 | Demo avanzado | Demo | No broker real | Mantener etiquetado hasta backend trading | C |
| Cuenta Local | 40 | Demo avanzado | Demo | Puede confundirse con dinero bancario si no se lee el aviso | Decidir proveedor bancario o mantener bloqueada | C |
| Trade | 48 | Demo avanzado | Demo + market real | Órdenes demo; no ejecución real | Conectar solo vía tradingService/backend | C |
| Trading Adapter Layer | 78 | Arquitectura preparada | Mock + adapters preparados | Adapter exportable desde barrel; sin backend real | Backend contract + tests | B |
| Internal Ledger | 64 | Parcial mock | Mock aislado | In-memory/mock; no ACID | Backend ledger real con DB transaccional | C |
| Pool | 42 | Mock controlado | Mock ledger | No dinero real | Backend y reglas de producto | C |
| Social/Gifts | 44 | Mock/controlado | Mock ledger + social local | Gifts no financieros reales | Separar social real vs monetización | C |
| Bot Futures | 38 | Bloqueado seguro | Visual/demo | Backend pendiente; no operar real | Crear backend seguro/OAuth | C |
| Crear Token | 68 | Parcial real | Deploy EVM real + pasos mock | Liquidez/airdrop/publicación no reales | QA deploy + ERC20 audits + redes | B |
| Astra | 58 | Prototipo avanzado | Backend/fallback local | Pantalla y voz grandes, fallback variable | Refactor y límites de datos financieros | C |
| Browser | 62 | Parcial usable | WebView real | Archivo grande, QA Android crítico | Separar browser hub/WebView | B |
| Markets/precios | 72 | Funcional alto | CoinGecko/Binance/GeckoTerminal + fallback | Fallback puede ocultar fallas de live | Mostrar fuente y freshness | B |
| Auth/Supabase | 68 | Parcial usable | Supabase si config, local fallback | Fallback local no equivale auth productiva | QA flows y políticas de sesión | B |
| Feature flags | 84 | Sólido | Config local | Sin remote config | Mantener flags bloqueantes | A |
| Theme/diseño | 72 | Coherente alto | N/A | Hardcodes residuales y pantallas legacy | Pasada visual incremental | B |
| i18n/textos | 60 | Parcial | Recursos generados + overrides | Mojibake residual en tabs create-token | Fase de texto final | C |
| Seguridad | 66 | Parcial alta | N/A | Seed/wallet sensibles, logs devWarn, QA pendiente | Threat model y QA dispositivo | B |
| Performance | 55 | Prototipo avanzado | N/A | Archivos grandes, WebViews, Astra voice | Refactors focalizados | C |
| Navegación | 76 | Funcional alto | N/A | Rutas duplicadas/legacy controladas | QA deep links y rutas ocultas | B |

### Por tipo de release

| Release | % estimado | Bloqueantes |
|---|---:|---|
| APK interna | 78 | QA Android real, revisión visual de pantallas grandes, confirmar env WalletConnect. |
| Beta técnica | 62 | Tests de navegación, QA Web3, docs actualizadas, performance Astra/Browser. |
| Beta financiera | 38 | Backend trading/ledger real, KYC/AML, auditoría contratos, monitoreo, soporte, legal. |
| Lanzamiento público | 28 | Cumplimiento, seguridad externa, escalabilidad backend, soporte, observabilidad, beta financiera superada. |

## 15. Roadmap técnico

### Nivel 1 — Antes de APK interna

| Qué hacer | Por qué | Archivos afectados | Dificultad | Riesgo si se omite |
|---|---|---|---|---|
| QA Android físico de Home, Wallet, Web3, Perfil, Rango, Browser, Send | Validar crash, WebView, WalletConnect y layout real | app/, src/screens/* | Media | Alto |
| Corregir mojibake visible residual | Evita sensación de app rota | app/(tabs)/_layout.tsx, web3NetworkConfig.ts | Baja | Medio |
| Confirmar variables EAS/WalletConnect | Sin projectId real, Web3 falla en APK | app.config.js, eas.json | Baja | Alto |
| Revisar logs devWarn en release | Evita ruido y posible exposición accidental | src/utils/devLog.ts, hooks/services | Baja | Medio |

### Nivel 2 — Antes de beta técnica

| Qué hacer | Por qué | Archivos afectados | Dificultad | Riesgo si se omite |
|---|---|---|---|---|
| Añadir lint formal | Hoy no existe script lint | package.json | Baja | Medio |
| Tests de portfolioTotals y feature flags | Evita sumar demos como reales | src/utils/portfolioTotals.ts, featureStatus.ts | Media | Alto |
| Separar Browser y Astra en módulos más pequeños | Reduce riesgo de bugs y lentitud | app/browser.tsx, AstraScreen, useAstraVoice | Alta | Medio |
| QA de navegación completa | Rutas legacy y ocultas pueden sorprender | app/ | Media | Medio |

### Nivel 3 — Antes de conectar OKX/Binance/MEXC

| Qué hacer | Por qué | Archivos afectados | Dificultad | Riesgo si se omite |
|---|---|---|---|---|
| Backend broker seguro | Secrets y signing nunca en app | server/backend futuro, trading adapters | Alta | Crítico |
| Idempotency keys y audit log | Órdenes financieras requieren trazabilidad | docs/trading-provider-contract.md, backend | Alta | Crítico |
| Restringir exports de adapters | Refuerza 	radingService como único punto de entrada | src/services/trading/index.ts | Baja | Medio |
| Validación runtime de payloads provider | Evita romper UI con respuestas externas raras | tradingMappers.ts | Media | Alto |

### Nivel 4 — Antes de beta financiera

| Qué hacer | Por qué | Archivos afectados | Dificultad | Riesgo si se omite |
|---|---|---|---|---|
| Ledger real con DB ACID | El ledger mock no sirve para dinero real | services/ledger, backend | Alta | Crítico |
| Reconciliación real con proveedor | Detecta diferencias internas vs broker | ledgerReconciliation/backend | Alta | Crítico |
| KYC/AML y legal | Producto financiero real | backend/product/legal | Alta | Crítico |
| Auditoría contrato Crear Token | Deploy real necesita contrato revisado | externalWalletTokenDeployment.ts | Alta | Alto |

### Nivel 5 — Antes de lanzamiento público

| Qué hacer | Por qué | Archivos afectados | Dificultad | Riesgo si se omite |
|---|---|---|---|---|
| Observabilidad, crash reporting y alertas | Operación pública requiere monitoreo | app/backend | Alta | Crítico |
| Seguridad externa/pentest | Wallet/trading son alto riesgo | todo | Alta | Crítico |
| Soporte, términos, disclaimers financieros | Reduce riesgo legal y operativo | app/docs/legal | Media | Alto |
| Clean build final con eliminación de legacy | Reduce superficie de bug | app/src/components legacy | Media | Medio |

## 16. Qué NO hacer todavía

- No activar trading real desde frontend.
- No conectar OKX/Binance/MEXC sin backend firmado, auditoría e idempotency.
- No usar ledger mock para Home, Wallet ni saldos reales.
- No pedir API Secret dentro de la app.
- No mezclar wallet local y wallet externa como una sola fuente sin etiqueta.
- No eliminar rutas legacy hasta terminar QA Android.
- No prometer beta financiera mientras Trade, Spot, Cuenta Local, Pool y VIP backend sigan parciales.
- No lanzar Crear Token como producto financiero completo sin auditar contrato, gas, errores y redes.

## 17. Validación

- `npx tsc --noEmit`: ✅ pasó sin errores.
- `npx expo-doctor`: ✅ pasó 18/18 checks, sin issues detectados.
- `npm run lint`: ⚠️ no existe script `lint` en `package.json`; npm devolvió `Missing script: "lint"`.
## 18. Conclusión CTO

OrbitX está razonablemente lista para una APK interna de QA, no para beta financiera. La app ya tiene una arquitectura mejor encaminada que una maqueta: Web3 real parcial, balances filtrados, adapters desacoplados, ledger aislado y Bot Futures bloqueado. Pero todavía hay demasiados módulos mock o parciales para usuarios reales con dinero.

El siguiente paso más importante es QA Android real con foco en Web3, Send EVM, Browser y navegación. El riesgo técnico más urgente después de eso es construir backend seguro para trading/ledger antes de tocar cualquier broker real.




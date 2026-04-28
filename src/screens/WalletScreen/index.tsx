import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ExternalWalletConnectSheet } from '../../../components/wallet/ExternalWalletConnectSheet';
import { pickLanguageText } from '../../../constants/i18n';
import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useI18n } from '../../../hooks/useI18n';
import { AddressCard } from '../../components/wallet/AddressCard';
import { AssetList } from '../../components/wallet/AssetList';
import { BalanceCard } from '../../components/wallet/BalanceCard';
import { SeedRevealCard } from '../../components/wallet/SeedRevealCard';
import { WalletActions } from '../../components/wallet/WalletActions';
import { WalletHeader } from '../../components/wallet/WalletHeader';
import { WalletPinSheet } from '../../../components/wallet/WalletPinSheet';
import { WalletSeedSecurityScreen } from '../../../components/wallet/WalletSeedSecurityScreen';
import { WalletTabs } from '../../components/wallet/WalletTabs';
import { RampActionGrid } from '../../components/wallet/RampActionGrid';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { SectionHeader } from '../../components/common/SectionHeader';
import { useWallet } from '../../hooks/useWallet';
import { useMarketData } from '../../hooks/useMarketData';
import { navigateToTrade } from '../../navigation/AppNavigator';
import { useUiStore } from '../../store/uiStore';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { formatCurrency } from '../../utils/formatCurrency';
import { useAstra } from '../../hooks/useAstra';
import { useAstraStore } from '../../store/astraStore';
import { useExternalWallet } from '../../hooks/useExternalWallet';

const NETWORKS = ['base', 'ethereum', 'bnb', 'solana'] as const;
type SeedModalMode = 'reveal' | 'export' | 'backup';

function maskAddress(address: string) {
  if (!address) {
    return '';
  }

  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

export default function WalletScreen() {
  const params = useLocalSearchParams<{ astraAction?: string; astraTab?: string }>();
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const wallet = useWallet();
  const externalWalletRuntime = useExternalWallet();
  const showToast = useUiStore((state) => state.showToast);
  const { markets } = useMarketData('markets');
  const { openAstra, language } = useAstra();
  const rememberAstraContext = useAstraStore((state) => state.rememberContext);
  const recordAstraError = useAstraStore((state) => state.recordError);
  const { createWallet, isWalletReady } = wallet;
  const [activeTab, setActiveTab] = useState<'spot' | 'web3'>('spot');
  const [seedPhraseInput, setSeedPhraseInput] = useState('');
  const [connectSheetVisible, setConnectSheetVisible] = useState(false);
  const [seedModalVisible, setSeedModalVisible] = useState(false);
  const [seedModalMode, setSeedModalMode] = useState<SeedModalMode>('reveal');
  const [pinSheetVisible, setPinSheetVisible] = useState(false);
  const [pendingSeedModeAfterPin, setPendingSeedModeAfterPin] = useState<SeedModalMode | null>(null);
  const lastAstraActionRef = useRef<string>('');

  useEffect(() => {
    wallet.syncCreatedTokens();
    void wallet.refreshSecurityStatus();
  }, [wallet.refreshSecurityStatus, wallet.syncCreatedTokens]);

  useEffect(() => {
    if (!wallet.isWalletReady && activeTab === 'web3') {
      setActiveTab('spot');
    }
  }, [activeTab, wallet.isWalletReady]);

  useEffect(() => {
    if (!wallet.error) {
      return;
    }

    recordAstraError({
      surface: 'wallet',
      title: pickLanguageText(
        language,
        {
          en: 'Wallet issue',
          es: 'Problema de billetera',
          pt: 'Problema na carteira',
          'zh-Hans': '\u94b1\u5305\u95ee\u9898',
          hi: 'Wallet \u0938\u092e\u0938\u094d\u092f\u093e',
          ru: '\u041f\u0440\u043e\u0431\u043b\u0435\u043c\u0430 \u043a\u043e\u0448\u0435\u043b\u044c\u043a\u0430',
          ar: '\u0645\u0634\u0643\u0644\u0629 \u0641\u064a \u0627\u0644\u0645\u062d\u0641\u0638\u0629',
          id: 'Masalah wallet',
        },
        'en',
      ),
      body: wallet.error,
      linkedGuideId: 'resolve_error',
    });
  }, [language, recordAstraError, wallet.error]);

  useEffect(() => {
    if (params.astraTab === 'web3' && activeTab !== 'web3') {
      setActiveTab('web3');
    }
  }, [activeTab, params.astraTab]);

  useEffect(() => {
    const action = params.astraAction?.trim();
    if (!action) {
      lastAstraActionRef.current = '';
      return;
    }

    const key = `${params.astraTab ?? ''}:${action}:${isWalletReady ? 'ready' : 'empty'}`;
    if (lastAstraActionRef.current === key) {
      return;
    }

    lastAstraActionRef.current = key;

    if (params.astraTab === 'web3' && activeTab !== 'web3') {
      setActiveTab('web3');
    }

    if (action === 'create' && !isWalletReady) {
      void createWallet();
      return;
    }

    if (action === 'connect-external') {
      setConnectSheetVisible(true);
    }
  }, [
    activeTab,
    createWallet,
    isWalletReady,
    params.astraAction,
    params.astraTab,
  ]);

  const totalWeb3 = wallet.assets.reduce((sum, asset) => sum + asset.usdValue, 0);
  const spotAssets = useMemo(() => {
    const marketMap = new Map(markets.map((item) => [item.baseSymbol.toUpperCase(), item]));

    return wallet.spotBalances.map((balance) => {
      const market = marketMap.get(balance.symbol);
      const price = balance.symbol === 'USDT' || balance.symbol === 'USDC' ? 1 : market?.price ?? 0;

      return {
        id: `spot-${balance.symbol}`,
        symbol: balance.symbol,
        name: balance.symbol,
        amount: balance.amount,
        usdValue: balance.amount * price,
        network: 'spot' as const,
        environment: 'spot' as const,
        image: market?.image,
      };
    });
  }, [markets, wallet.spotBalances]);
  const totalSpot = spotAssets.reduce((sum, asset) => sum + asset.usdValue, 0);
  const totalBalance = totalSpot + totalWeb3;
  const activeReceiveAddress = wallet.receiveAddresses[wallet.selectedNetwork] || wallet.walletAddress;
  const isSyncingBalances = wallet.web3Phase === 'balances' || wallet.web3Phase === 'details';
  const hasNetworkIssues = NETWORKS.some(
    (network) => wallet.networkSyncState[network].status === 'error',
  );
  const showSyncStatus =
    wallet.isWalletReady &&
    (isSyncingBalances || wallet.showingCachedBalances || hasNetworkIssues);
  const walletHeaderSubtitle = useMemo(() => {
    if (wallet.loading && !wallet.isWalletReady) {
      return t('walletView.searchingLinkedWallet');
    }

    if (wallet.error) {
      return wallet.error;
    }

    if (wallet.isWalletReady && wallet.walletSource === 'remote') {
      return t('walletView.remoteWalletFound');
    }

    if (wallet.isWalletReady) {
      return t('walletView.localWalletReady');
    }

    return t('walletView.createOrImport');
  }, [t, wallet.error, wallet.isWalletReady, wallet.loading, wallet.walletSource]);
  const seedCardConfig = useMemo(() => {
    if (!wallet.mnemonicStored) {
      return null;
    }

    if (!wallet.securityStatus.seedPhraseConfirmedAt) {
      return {
        title: t('seedReveal.title'),
        body: t('seedReveal.backupBody'),
        primaryLabel: t('seedReveal.backupAction'),
        primaryMode: 'backup' as const,
        secondaryLabel: t('seedReveal.exportAction'),
        secondaryMode: 'export' as const,
      };
    }

    return {
      title: t('seedReveal.title'),
      body: t('seedReveal.revealBody'),
      primaryLabel: t('seedReveal.revealAction'),
      primaryMode: 'reveal' as const,
      secondaryLabel: t('seedReveal.exportAction'),
      secondaryMode: 'export' as const,
    };
  }, [
    t,
    wallet.mnemonicStored,
    wallet.securityStatus.seedPhraseConfirmedAt,
  ]);
  const astraWalletContext = useMemo(
    () => ({
      surface: 'wallet' as const,
      path: '/wallet',
      language,
      screenName: pickLanguageText(
        language,
        {
          en: 'Wallet',
          es: 'Billetera',
          pt: 'Carteira',
          'zh-Hans': '\u94b1\u5305',
          hi: 'Wallet',
          ru: '\u041a\u043e\u0448\u0435\u043b\u0435\u043a',
          ar: '\u0627\u0644\u0645\u062d\u0641\u0638\u0629',
          id: 'Wallet',
        },
        'en',
      ),
      summary: wallet.error
        ? language === 'en'
          ? `Wallet detected this issue: ${wallet.error}`
          : `Billetera detecto este problema: ${wallet.error}`
        : wallet.isWalletReady
          ? language === 'en'
            ? `Your Web3 space is ready on ${wallet.selectedNetwork.toUpperCase()} with ${wallet.assets.length} assets and ${wallet.externalWallet.address ? 'one external wallet connected.' : 'no external wallet connected.'}`
            : `Tu espacio Web3 esta listo en ${wallet.selectedNetwork.toUpperCase()} con ${wallet.assets.length} activos y ${wallet.externalWallet.address ? 'una billetera externa conectada.' : 'sin billetera externa conectada.'}`
          : language === 'en'
            ? 'You still do not have a created or imported wallet.'
            : 'Todavia no tienes una billetera creada o importada.',
      currentTask: wallet.isWalletReady
        ? activeTab === 'web3'
          ? 'wallet_web3_management'
          : 'wallet_spot_overview'
        : 'wallet_setup',
      selectedEntity: {
        type: 'wallet_network',
        network: wallet.selectedNetwork,
        status: wallet.isWalletReady ? 'ready' : 'missing',
      },
      uiState: {
        activeTab,
        selectedNetwork: wallet.selectedNetwork,
        assetsCount: wallet.assets.length,
        spotAssetsCount: spotAssets.length,
        createdTokensCount: wallet.createdTokens.length,
        hasExternalWallet: Boolean(wallet.externalWallet.address),
        walletError: wallet.error ?? null,
      },
      labels: {
        networkLabel: wallet.selectedNetwork.toUpperCase(),
        totalBalanceLabel: formatCurrency(totalBalance),
        totalSpotLabel: formatCurrency(totalSpot),
        totalWeb3Label: formatCurrency(totalWeb3),
        activeTabLabel: activeTab,
        externalWalletLabel: wallet.externalWallet.address
          ? maskAddress(wallet.externalWallet.address)
          : undefined,
      },
      walletReady: wallet.isWalletReady,
      seedBackedUp: Boolean(wallet.securityStatus.seedPhraseConfirmedAt),
      externalWalletConnected: Boolean(wallet.externalWallet.address),
      errorBody: wallet.error ?? undefined,
    }),
    [
      activeTab,
      language,
      spotAssets.length,
      totalBalance,
      totalSpot,
      totalWeb3,
      wallet.assets.length,
      wallet.createdTokens.length,
      wallet.error,
      wallet.externalWallet.address,
      wallet.isWalletReady,
      wallet.securityStatus.seedPhraseConfirmedAt,
      wallet.selectedNetwork,
    ],
  );

  useEffect(() => {
    rememberAstraContext(astraWalletContext);
  }, [astraWalletContext, rememberAstraContext]);

  function openSeedFlow(mode: SeedModalMode) {
    setSeedModalMode(mode);
    setSeedModalVisible(true);
  }

  function closeSeedFlow() {
    setSeedModalVisible(false);
    void wallet.refreshSecurityStatus();
  }

  return (
    <ScreenContainer contentContainerStyle={styles.content} backgroundMode="plain">
      <WalletHeader
        totalBalanceLabel={formatCurrency(totalBalance)}
        subtitle={walletHeaderSubtitle}
        onRefresh={() => void wallet.refreshBalances()}
        onInfo={() =>
            openAstra({
              ...astraWalletContext,
              surfaceTitle: pickLanguageText(
                language,
                {
                  en: 'Wallet',
                  es: 'Billetera',
                  pt: 'Carteira',
                  'zh-Hans': '\u94b1\u5305',
                  hi: 'Wallet',
                  ru: '\u041a\u043e\u0448\u0435\u043b\u0435\u043a',
                  ar: '\u0627\u0644\u0645\u062d\u0641\u0638\u0629',
                  id: 'Wallet',
                },
                'en',
              ),
            })
        }
      />

      <WalletTabs value={activeTab} onChange={setActiveTab} />

      {showSyncStatus ? (
        <View
          style={[
            styles.syncCard,
            {
              backgroundColor: withOpacity(colors.fieldBackground, 0.24),
              borderColor: withOpacity(colors.borderStrong, 0.42),
            },
          ]}
        >
          <View style={styles.syncHeaderRow}>
            <View style={styles.syncCopy}>
              <Text style={[styles.syncTitle, { color: colors.text }]}>
                {isSyncingBalances
                  ? t('walletView.syncingBalances')
                  : hasNetworkIssues
                    ? t('walletView.partialNetworkUpdate')
                    : t('walletView.usingCachedBalances')}
              </Text>
              <Text style={[styles.syncBody, { color: colors.textMuted }]}>
                {wallet.showingCachedBalances
                  ? t('walletView.usingCachedBalances')
                  : hasNetworkIssues
                    ? wallet.error ?? t('walletView.partialNetworkUpdate')
                    : t('walletView.syncingBalances')}
              </Text>
            </View>

            {(hasNetworkIssues || wallet.web3Phase === 'error') ? (
              <PrimaryButton
                label={t('walletView.retryUpdate')}
                tone="secondary"
                onPress={() => void wallet.refreshBalances()}
              />
            ) : null}
          </View>

          <View style={styles.syncNetworkRow}>
            {NETWORKS.map((network) => {
              const state = wallet.networkSyncState[network];
              const tone =
                state.status === 'error'
                  ? colors.loss
                  : state.status === 'loading'
                    ? colors.primary
                    : colors.profit;
              const statusLabel =
                state.status === 'error'
                  ? t('walletView.networkStatusError')
                  : state.status === 'loading'
                    ? t('walletView.networkStatusUpdating')
                    : t('walletView.networkStatusUpdated');

              return (
                <View
                  key={network}
                  style={[
                    styles.syncNetworkChip,
                    {
                      backgroundColor: withOpacity(tone, 0.08),
                      borderColor: withOpacity(tone, 0.28),
                    },
                  ]}
                >
                  <Text style={[styles.syncNetworkLabel, { color: colors.text }]}>
                    {network.toUpperCase()}
                  </Text>
                  <Text style={[styles.syncNetworkState, { color: tone }]}>{statusLabel}</Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      <View style={styles.balanceRow}>
        <BalanceCard
          title={t('walletView.spotBalanceTitle')}
          value={formatCurrency(totalSpot)}
          body={t('walletView.spotBalanceBody')}
          icon="server-outline"
        />
        <BalanceCard
          title={t('walletView.web3BalanceTitle')}
          value={formatCurrency(totalWeb3)}
          body={t('walletView.web3BalanceBody')}
          icon="git-network-outline"
        />
      </View>

      <WalletActions
        onDeposit={() => router.push('/receive')}
        onReceive={() => router.push('/receive')}
        onSend={() => router.push('/send')}
        onWithdraw={() => router.push('/send')}
        onTrade={() => navigateToTrade(router)}
      />

      <View
        style={[
          styles.transakCard,
          {
            backgroundColor: withOpacity(colors.surfaceElevated, 0.24),
            borderColor: withOpacity(colors.borderStrong, 0.42),
          },
        ]}
      >
        <View style={styles.transakHeaderRow}>
          <View style={styles.transakCopy}>
            <Text style={[styles.transakTitle, { color: colors.text }]}>{t('walletView.buySellCrypto')}</Text>
            <Text style={[styles.transakSubtitle, { color: colors.textMuted }]}>{t('walletView.externalProviderPartner')}</Text>
          </View>

          <View style={styles.transakBrandBlock}>
            <View style={styles.transakBrandRow}>
              <View style={[styles.transakBadge, { backgroundColor: '#FFFFFF' }]}>
                <Text style={styles.transakBadgeText}>TR</Text>
              </View>
              <Text style={[styles.transakBrandName, { color: colors.textSoft }]}>transak</Text>
            </View>
            <Text style={[styles.transakBrandNote, { color: colors.textMuted }]}>{t('walletView.externalProviderRegulated')}</Text>
          </View>
        </View>

        <RampActionGrid
          buyLabel={t('common.buy')}
          sellLabel={t('common.sell')}
          convertLabel={pickLanguageText(
            language,
            {
              en: 'Convert',
              es: 'Convertir',
              pt: 'Converter',
              'zh-Hans': '\u5151\u6362',
              hi: '\u0915\u0928\u094d\u0935\u0930\u094d\u091f',
              ru: '\u041a\u043e\u043d\u0432\u0435\u0440\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c',
              ar: '\u062a\u062d\u0648\u064a\u0644',
              id: 'Konversi',
            },
            'en',
          )}
          payLabel={pickLanguageText(
            language,
            {
              en: 'Pay',
              es: 'Pagar',
              pt: 'Pagar',
              'zh-Hans': '\u652f\u4ed8',
              hi: '\u092d\u0941\u0917\u0924\u093e\u0928',
              ru: '\u041e\u043f\u043b\u0430\u0442\u0438\u0442\u044c',
              ar: '\u062f\u0641\u0639',
              id: 'Bayar',
            },
            'en',
          )}
          onBuy={() => router.push({ pathname: '/ramp/summary', params: { mode: 'buy' } })}
          onSell={() => router.push({ pathname: '/ramp/summary', params: { mode: 'sell' } })}
          onConvert={() => router.push('/convert')}
          onPay={() => router.push({ pathname: '/ramp/summary', params: { mode: 'pay' } })}
        />
      </View>

      {activeTab === 'spot' ? (
        <>
          <View style={styles.spotSection}>
            <Text style={[styles.spotSectionTitle, { color: colors.text }]}>{t('walletView.spotAssetsTitle')}</Text>
            <Text style={[styles.spotSectionBody, { color: colors.textMuted }]}>
              {t('walletView.spotAssetsBody')}
            </Text>
          </View>
          {spotAssets.length ? <AssetList assets={spotAssets} /> : null}
        </>
      ) : (
        <>
          <SectionHeader
              title={t('walletView.web3SpaceTitle')}
              subtitle={
                wallet.walletSource === 'remote'
                  ? t('walletView.web3SpaceRemoteBody')
                  : t('walletView.web3SpaceBody')
              }
              rightSlot={
              wallet.isWalletReady || wallet.loading ? null : (
                <PrimaryButton label={t('walletView.createWallet')} onPress={() => void wallet.createWallet()} />
              )
            }
          />

          {wallet.isWalletReady ? (
            <>
              <View style={styles.networkRow}>
                {NETWORKS.map((network) => {
                  const active = wallet.selectedNetwork === network;
                  return (
                    <Pressable
                      key={network}
                      onPress={() => wallet.setSelectedNetwork(network)}
                      style={[
                        styles.networkChip,
                        {
                          backgroundColor: active ? colors.primarySoft : colors.fieldBackground,
                          borderColor: active ? colors.borderStrong : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.networkLabel,
                          { color: active ? colors.text : colors.textMuted },
                        ]}
                      >
                        {network.toUpperCase()}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <AddressCard
                network={wallet.selectedNetwork.toUpperCase()}
                address={activeReceiveAddress}
                onCopy={async () => {
                  if (!activeReceiveAddress) {
                    return;
                  }
                  await copyToClipboard(activeReceiveAddress);
                  showToast(t('walletView.addressCopied'), 'success');
                }}
              />

              <AssetList assets={wallet.assets} />

              {seedCardConfig ? (
                <SeedRevealCard
                  title={seedCardConfig.title}
                  body={seedCardConfig.body}
                  primaryLabel={seedCardConfig.primaryLabel}
                  onPrimaryPress={() => openSeedFlow(seedCardConfig.primaryMode)}
                  secondaryLabel={seedCardConfig.secondaryLabel}
                  onSecondaryPress={() => openSeedFlow(seedCardConfig.secondaryMode)}
                />
              ) : (
                <View
                  style={[
                    styles.tokenRow,
                    {
                      backgroundColor: withOpacity(colors.fieldBackground, 0.18),
                      borderColor: withOpacity(colors.border, 0.54),
                    },
                  ]}
                >
                  <View style={styles.tokenCopy}>
                    <Text style={[styles.tokenTitle, { color: colors.text }]}>
                      {t('walletView.walletFoundTitle')}
                    </Text>
                    <Text style={[styles.tokenBody, { color: colors.textMuted }]}>
                      {t('walletView.walletFoundBody')}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.section}>
                <SectionHeader
                  title={t('walletView.externalWalletTitle')}
                  subtitle={t('walletView.externalWalletBody')}
                  rightSlot={
                    <PrimaryButton
                      label={
                        wallet.externalWallet.address
                          ? t('walletView.updateConnection')
                          : t('walletView.connectConnection')
                      }
                      tone="secondary"
                      onPress={() => setConnectSheetVisible(true)}
                    />
                  }
                />

                <View
                    style={[
                      styles.tokenRow,
                      {
                        backgroundColor: withOpacity(colors.fieldBackground, 0.18),
                        borderColor: withOpacity(colors.border, 0.54),
                      },
                    ]}
                >
                  <View style={styles.tokenCopy}>
                    <Text style={[styles.tokenTitle, { color: colors.text }]}>
                      {externalWalletRuntime.isConnected
                        ? 'Wallet externa conectada'
                        : externalWalletRuntime.disabledReason
                          ? 'WalletConnect no disponible'
                          : t('walletView.noExternalWallet')}
                    </Text>
                    <Text style={[styles.tokenBody, { color: colors.textMuted }]}>
                      {externalWalletRuntime.isConnected
                        ? `${externalWalletRuntime.walletName ?? 'Wallet externa'} · ${maskAddress(
                            wallet.externalWallet.address,
                          )}`
                        : externalWalletRuntime.disabledReason ?? t('walletView.externalWalletHint')}
                    </Text>
                    {externalWalletRuntime.isConnected ? (
                      <Text style={[styles.tokenBody, { color: colors.textSoft }]}>
                        Red actual: {externalWalletRuntime.chainLabel}
                      </Text>
                    ) : null}
                    <Text style={[styles.tokenBody, { color: colors.textMuted }]}>
                      OrbitX no guarda tu frase semilla. Las firmas se aprueban desde tu wallet externa.
                    </Text>
                  </View>

                  {wallet.externalWallet.address ? (
                    <PrimaryButton
                      label={t('walletView.disconnectConnection')}
                      tone="ghost"
                      onPress={() => void externalWalletRuntime.disconnect()}
                    />
                  ) : null}
                </View>
              </View>

              <View style={styles.section}>
                <SectionHeader
                  title={t('walletView.createdTokensTitle')}
                  subtitle={t('walletView.createdTokensBody')}
                />
                {wallet.createdTokens.length ? (
                  wallet.createdTokens.map((token) => (
                    <View
                      key={token.id}
                    style={[
                      styles.tokenRow,
                      {
                        backgroundColor: withOpacity(colors.fieldBackground, 0.18),
                        borderColor: withOpacity(colors.border, 0.54),
                      },
                    ]}
                    >
                      <View style={styles.tokenCopy}>
                        <Text style={[styles.tokenTitle, { color: colors.text }]}>{token.symbol}</Text>
                        <Text style={[styles.tokenBody, { color: colors.textMuted }]}>
                          {token.name} - {token.network}
                        </Text>
                      </View>
                      <Text style={[styles.tokenState, { color: colors.primary }]}>
                        {token.status.replace('_', ' ')}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.helper, { color: colors.textMuted }]}>
                    {t('walletView.createdTokensEmpty')}
                  </Text>
                )}
              </View>
            </>
          ) : (
            <View style={styles.importCard}>
              <Text style={[styles.importTitle, { color: colors.text }]}>
                {wallet.loading ? t('walletView.importSearchingTitle') : t('walletView.importTitle')}
              </Text>
              <Text style={[styles.importBody, { color: colors.textMuted }]}>
                {wallet.loading
                  ? t('walletView.importSearchingBody')
                  : t('walletView.importBody')}
              </Text>
              <View
                style={[
                  styles.importWarningCard,
                  {
                    backgroundColor: withOpacity(colors.fieldBackground, 0.24),
                    borderColor: withOpacity(colors.borderStrong, 0.42),
                  },
                ]}
              >
                <Text style={[styles.importWarningTitle, { color: colors.text }]}>
                  {t('walletView.importWarningTitle')}
                </Text>
                <Text style={[styles.importWarningBody, { color: colors.textMuted }]}>
                  {t('walletView.importWarningBody')}
                </Text>
              </View>
              <TextInput
                value={seedPhraseInput}
                onChangeText={setSeedPhraseInput}
                multiline
                placeholder={t('walletView.importPlaceholder')}
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.seedInput,
                  {
                    color: colors.text,
                    backgroundColor: colors.fieldBackground,
                    borderColor: colors.border,
                  },
                ]}
              />
              <PrimaryButton
                label={t('walletView.importButton')}
                tone="secondary"
                onPress={() => void wallet.importWallet(seedPhraseInput)}
              />

              <PrimaryButton
                label={t('walletView.connectExternalButton')}
                tone="secondary"
                onPress={() => setConnectSheetVisible(true)}
              />

              {wallet.externalWallet.address ? (
                <View
                  style={[
                    styles.tokenRow,
                    {
                      backgroundColor: colors.fieldBackground,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.tokenCopy}>
                    <Text style={[styles.tokenTitle, { color: colors.text }]}>
                      {externalWalletRuntime.isConnected
                        ? 'Wallet externa conectada'
                        : t('walletView.externalLinkedTitle')}
                    </Text>
                    <Text style={[styles.tokenBody, { color: colors.textMuted }]}>
                      {maskAddress(wallet.externalWallet.address)}
                    </Text>
                    {externalWalletRuntime.isConnected ? (
                      <Text style={[styles.tokenBody, { color: colors.textSoft }]}>
                        {externalWalletRuntime.walletName ?? 'Wallet externa'} · {externalWalletRuntime.chainLabel}
                      </Text>
                    ) : null}
                  </View>
                  <PrimaryButton
                    label={t('walletView.disconnectConnection')}
                    tone="ghost"
                    onPress={() => void externalWalletRuntime.disconnect()}
                  />
                </View>
              ) : null}
            </View>
          )}
        </>
      )}

      {wallet.error ? (
        <View
          style={[
            styles.errorCard,
            { backgroundColor: colors.lossSoft, borderColor: colors.loss },
          ]}
        >
          <Text style={[styles.errorText, { color: colors.loss }]}>{wallet.error}</Text>
          <PrimaryButton
            label={pickLanguageText(
              language,
              {
                en: 'Ask Astra',
                es: 'Preguntar a Astra',
                pt: 'Perguntar para Astra',
                'zh-Hans': '\u95ee Astra',
                hi: 'Astra se puchho',
                ru: '\u0421\u043f\u0440\u043e\u0441\u0438\u0442\u044c Astra',
                ar: '\u0627\u0633\u0623\u0644 Astra',
                id: 'Tanya Astra',
              },
              'en',
            )}
            tone="secondary"
            onPress={() =>
              openAstra({
                surface: 'error',
                surfaceTitle: pickLanguageText(
                  language,
                  {
                    en: 'Wallet',
                    es: 'Billetera',
                    pt: 'Carteira',
                    'zh-Hans': '\u94b1\u5305',
                    hi: 'Wallet',
                    ru: '\u041a\u043e\u0448\u0435\u043b\u0435\u043a',
                    ar: '\u0627\u0644\u0645\u062d\u0641\u0638\u0629',
                    id: 'Wallet',
                  },
                  'en',
                ),
                summary: pickLanguageText(
                  language,
                  {
                    en: 'Astra can help you recover the Wallet flow without losing context.',
                    es: 'Astra puede ayudarte a recuperar el flujo de Billetera sin perder contexto.',
                    pt: 'A Astra pode ajudar voce a recuperar o fluxo da carteira sem perder contexto.',
                    'zh-Hans': 'Astra \u53ef\u4ee5\u5e2e\u4f60\u5728\u4e0d\u4e22\u5931\u4e0a\u4e0b\u6587\u7684\u60c5\u51b5\u4e0b\u6062\u590d Wallet \u6d41\u7a0b\u3002',
                    hi: 'Astra context khoye bina Wallet flow recover karne mein madad kar sakti hai.',
                    ru: 'Astra \u043f\u043e\u043c\u043e\u0436\u0435\u0442 \u0432\u043e\u0441\u0441\u0442\u0430\u043d\u043e\u0432\u0438\u0442\u044c \u043f\u043e\u0442\u043e\u043a Wallet \u0431\u0435\u0437 \u043f\u043e\u0442\u0435\u0440\u0438 \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442\u0430.',
                    ar: '\u064a\u0645\u0643\u0646 Astra \u0623\u0646 \u062a\u0633\u0627\u0639\u062f\u0643 \u0639\u0644\u0649 \u0627\u0633\u062a\u0639\u0627\u062f\u0629 \u062a\u062f\u0641\u0642 Wallet \u062f\u0648\u0646 \u0641\u0642\u062f\u0627\u0646 \u0627\u0644\u0633\u064a\u0627\u0642.',
                    id: 'Astra bisa membantumu memulihkan alur Wallet tanpa kehilangan konteks.',
                  },
                  'en',
                ),
                currentTask: astraWalletContext.currentTask,
                selectedEntity: astraWalletContext.selectedEntity,
                uiState: astraWalletContext.uiState,
                labels: astraWalletContext.labels,
                errorTitle: pickLanguageText(
                  language,
                  {
                    en: 'Wallet error',
                    es: 'Error de billetera',
                    pt: 'Erro da carteira',
                    'zh-Hans': '\u94b1\u5305\u9519\u8bef',
                    hi: 'Wallet error',
                    ru: '\u041e\u0448\u0438\u0431\u043a\u0430 wallet',
                    ar: '\u062e\u0637\u0623 \u0641\u064a wallet',
                    id: 'Error wallet',
                  },
                  'en',
                ),
                errorBody: wallet.error ?? undefined,
              })
            }
          />
        </View>
      ) : null}

      <ExternalWalletConnectSheet
        visible={connectSheetVisible}
        onClose={() => setConnectSheetVisible(false)}
      />

      <WalletSeedSecurityScreen
        visible={seedModalVisible}
        mode={seedModalMode}
        biometricsEnabled={wallet.securityStatus.biometricsEnabled}
        pinEnabled={wallet.securityStatus.pinEnabled}
        onClose={closeSeedFlow}
        onRequirePinSetup={() => {
          setPendingSeedModeAfterPin(seedModalMode);
          setSeedModalVisible(false);
          setPinSheetVisible(true);
        }}
        onConfirmed={() => void wallet.refreshSecurityStatus()}
      />

      <WalletPinSheet
        visible={pinSheetVisible}
        onClose={() => {
          setPendingSeedModeAfterPin(null);
          setPinSheetVisible(false);
        }}
        onSaved={() => {
          void wallet.refreshSecurityStatus();
          if (pendingSeedModeAfterPin) {
            const resumeMode = pendingSeedModeAfterPin;
            setPendingSeedModeAfterPin(null);
            setPinSheetVisible(false);
            setSeedModalMode(resumeMode);
            setSeedModalVisible(true);
          }
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
  },
  syncCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 10,
  },
  syncHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  syncCopy: {
    flex: 1,
    gap: 4,
  },
  syncTitle: {
    fontFamily: FONT.semibold,
    fontSize: 12,
    lineHeight: 16,
  },
  syncBody: {
    fontFamily: FONT.regular,
    fontSize: 10,
    lineHeight: 15,
  },
  syncNetworkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  syncNetworkChip: {
    borderWidth: 1,
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 2,
  },
  syncNetworkLabel: {
    fontFamily: FONT.semibold,
    fontSize: 10,
  },
  syncNetworkState: {
    fontFamily: FONT.medium,
    fontSize: 9,
  },
  balanceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  transakCard: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 12,
    gap: 12,
  },
  transakHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  transakCopy: {
    flex: 1,
    gap: 4,
  },
  transakTitle: {
    fontFamily: FONT.bold,
    fontSize: 14,
    letterSpacing: 0.2,
  },
  transakSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 15,
  },
  transakBrandBlock: {
    alignItems: 'flex-end',
    gap: 4,
    paddingTop: 2,
  },
  transakBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  transakBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transakBadgeText: {
    fontFamily: FONT.bold,
    fontSize: 11,
    color: '#101015',
    letterSpacing: -0.1,
  },
  transakBrandName: {
    fontFamily: FONT.semibold,
    fontSize: 15,
  },
  transakBrandNote: {
    fontFamily: FONT.regular,
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'right',
  },
  spotSection: {
    gap: 4,
    paddingTop: 2,
  },
  spotSectionTitle: {
    fontFamily: FONT.bold,
    fontSize: 15,
  },
  spotSectionBody: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  networkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  networkChip: {
    minHeight: 34,
    borderWidth: 1,
    borderRadius: RADII.pill,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkLabel: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  section: {
    gap: 8,
  },
  tokenRow: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  tokenCopy: {
    flex: 1,
    gap: 2,
  },
  tokenTitle: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  tokenBody: {
    fontFamily: FONT.regular,
    fontSize: 10,
  },
  tokenState: {
    fontFamily: FONT.semibold,
    fontSize: 11,
    textTransform: 'capitalize',
  },
  helper: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  importCard: {
    gap: 10,
  },
  importWarningCard: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  importWarningTitle: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  importWarningBody: {
    fontFamily: FONT.regular,
    fontSize: 10,
    lineHeight: 15,
  },
  errorCard: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  errorText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 17,
  },
  importTitle: {
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  importBody: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  seedInput: {
    minHeight: 96,
    borderWidth: 1,
    borderRadius: RADII.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: FONT.medium,
    fontSize: 12,
    textAlignVertical: 'top',
  },
});

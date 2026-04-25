import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ExternalWalletConnectSheet } from '../../../components/wallet/ExternalWalletConnectSheet';
import { pickLanguageText } from '../../../constants/i18n';
import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { AddressCard } from '../../components/wallet/AddressCard';
import { AssetList } from '../../components/wallet/AssetList';
import { BalanceCard } from '../../components/wallet/BalanceCard';
import { SeedRevealCard } from '../../components/wallet/SeedRevealCard';
import { WalletActions } from '../../components/wallet/WalletActions';
import { WalletHeader } from '../../components/wallet/WalletHeader';
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

const NETWORKS = ['base', 'ethereum', 'bnb', 'solana'] as const;

function maskAddress(address: string) {
  if (!address) {
    return '';
  }

  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

export default function WalletScreen() {
  const params = useLocalSearchParams<{ astraAction?: string; astraTab?: string }>();
  const { colors } = useAppTheme();
  const wallet = useWallet();
  const showToast = useUiStore((state) => state.showToast);
  const { markets } = useMarketData('markets');
  const { openAstra, language } = useAstra();
  const rememberAstraContext = useAstraStore((state) => state.rememberContext);
  const recordAstraError = useAstraStore((state) => state.recordError);
  const { createWallet, isWalletReady } = wallet;
  const [activeTab, setActiveTab] = useState<'spot' | 'web3'>('spot');
  const [seedPhraseInput, setSeedPhraseInput] = useState('');
  const [connectSheetVisible, setConnectSheetVisible] = useState(false);
  const [externalWalletLoading, setExternalWalletLoading] = useState(false);
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
  const walletHeaderSubtitle = useMemo(() => {
    if (wallet.loading && !wallet.isWalletReady) {
      return 'Buscando la wallet vinculada a tu cuenta...';
    }

    if (wallet.error) {
      return wallet.error;
    }

    if (wallet.isWalletReady && wallet.walletSource === 'remote') {
      return 'Wallet encontrada y vinculada a tu cuenta. Este dispositivo esta en modo seguro de consulta.';
    }

    if (wallet.isWalletReady) {
      return 'Wallet activa en este dispositivo.';
    }

    return 'Crea o importa tu billetera para comenzar';
  }, [wallet.error, wallet.isWalletReady, wallet.loading, wallet.walletSource]);
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

      <View style={styles.balanceRow}>
        <BalanceCard
          title="Saldo Spot"
          value={formatCurrency(totalSpot)}
          body="Fondos listos para operar dentro de OrbitX."
          icon="server-outline"
        />
        <BalanceCard
          title="Saldo Web3"
          value={formatCurrency(totalWeb3)}
          body="Activos on-chain bajo tu control."
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
            <Text style={[styles.transakTitle, { color: colors.text }]}>COMPRAR / VENDER CRIPTO</Text>
            <Text style={[styles.transakSubtitle, { color: colors.textMuted }]}>Socio proveedor externo</Text>
          </View>

          <View style={styles.transakBrandBlock}>
            <View style={styles.transakBrandRow}>
              <View style={[styles.transakBadge, { backgroundColor: '#FFFFFF' }]}>
                <Text style={styles.transakBadgeText}>TR</Text>
              </View>
              <Text style={[styles.transakBrandName, { color: colors.textSoft }]}>transak</Text>
            </View>
            <Text style={[styles.transakBrandNote, { color: colors.textMuted }]}>Transak: Socio regulado</Text>
          </View>
        </View>

        <RampActionGrid
          buyLabel="Comprar"
          sellLabel="Vender"
          convertLabel="Convertir"
          payLabel="Pagar"
          onBuy={() => router.push({ pathname: '/ramp/summary', params: { mode: 'buy' } })}
          onSell={() => router.push({ pathname: '/ramp/summary', params: { mode: 'sell' } })}
          onConvert={() => router.push('/convert')}
          onPay={() => router.push({ pathname: '/ramp/summary', params: { mode: 'pay' } })}
        />
      </View>

      {activeTab === 'spot' ? (
        <>
          <View style={styles.spotSection}>
            <Text style={[styles.spotSectionTitle, { color: colors.text }]}>Activos Spot</Text>
            <Text style={[styles.spotSectionBody, { color: colors.textMuted }]}>
              Tu saldo disponible para ordenes y simulacion.
            </Text>
          </View>
          {spotAssets.length ? <AssetList assets={spotAssets} /> : null}
        </>
      ) : (
        <>
          <SectionHeader
              title="Espacio Web3"
              subtitle={
                wallet.walletSource === 'remote'
                  ? 'Wallet encontrada en tu cuenta. Puedes ver direcciones y balances sin exponer secretos.'
                  : 'Billetera real, seguridad y seguimiento on-chain.'
              }
              rightSlot={
              wallet.isWalletReady || wallet.loading ? null : (
                <PrimaryButton label="Crear billetera" onPress={() => void wallet.createWallet()} />
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
                  showToast('Direccion copiada', 'success');
                }}
              />

              <AssetList assets={wallet.assets} />

              {wallet.mnemonicStored ? (
                <SeedRevealCard
                  body="Tu frase semilla da acceso total a tu billetera. Nunca la compartas."
                  onReveal={() => router.push('/security')}
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
                      Wallet encontrada
                    </Text>
                    <Text style={[styles.tokenBody, { color: colors.textMuted }]}>
                      Esta instalacion puede consultar direcciones, saldos e historial publico, pero no contiene tu seed phrase ni tu clave privada.
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.section}>
                <SectionHeader
                  title="Billetera externa"
                  subtitle="Vincula una direccion publica de MetaMask para seguirla y usarla como opcion adicional."
                  rightSlot={
                    <PrimaryButton
                      label={wallet.externalWallet.address ? 'Actualizar' : 'Conectar'}
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
                      {wallet.externalWallet.provider === 'metamask'
                        ? 'MetaMask vinculada'
                        : 'Sin billetera externa'}
                    </Text>
                    <Text style={[styles.tokenBody, { color: colors.textMuted }]}>
                      {wallet.externalWallet.address
                        ? maskAddress(wallet.externalWallet.address)
                        : 'Conecta una direccion publica si quieres seguir una billetera externa sin romper tu flujo Web3.'}
                    </Text>
                  </View>

                  {wallet.externalWallet.address ? (
                    <PrimaryButton
                      label="Desconectar"
                      tone="ghost"
                      onPress={() => wallet.disconnectExternalWallet()}
                    />
                  ) : null}
                </View>
              </View>

              <View style={styles.section}>
                <SectionHeader
                  title="Mis tokens creados"
                  subtitle="Tus lanzamientos siguen visibles desde Web3."
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
                    Aun no has creado tokens desde OrbitX.
                  </Text>
                )}
              </View>
            </>
          ) : (
            <View style={styles.importCard}>
              <Text style={[styles.importTitle, { color: colors.text }]}>
                {wallet.loading ? 'Buscando wallet...' : 'Importar billetera'}
              </Text>
              <Text style={[styles.importBody, { color: colors.textMuted }]}>
                {wallet.loading
                  ? 'Estamos revisando si tu cuenta ya tiene una wallet publica vinculada.'
                  : 'Pega tu frase semilla para restaurar una billetera existente.'}
              </Text>
              <TextInput
                value={seedPhraseInput}
                onChangeText={setSeedPhraseInput}
                multiline
                placeholder="palabra1 palabra2 palabra3 ..."
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
                label="Importar billetera"
                tone="secondary"
                onPress={() => void wallet.importWallet(seedPhraseInput)}
              />

              <PrimaryButton
                label="Conectar billetera externa"
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
                      {wallet.externalWallet.provider === 'metamask'
                        ? 'MetaMask vinculada'
                        : 'Billetera externa vinculada'}
                    </Text>
                    <Text style={[styles.tokenBody, { color: colors.textMuted }]}>
                      {maskAddress(wallet.externalWallet.address)}
                    </Text>
                  </View>
                  <PrimaryButton
                    label="Desconectar"
                    tone="ghost"
                    onPress={() => wallet.disconnectExternalWallet()}
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
        loading={externalWalletLoading}
        currentProvider={wallet.externalWallet.provider ?? undefined}
        currentAddress={wallet.externalWallet.address}
        onClose={() => setConnectSheetVisible(false)}
        onSelect={async (provider, address) => {
          setExternalWalletLoading(true);
          const connected = await wallet.connectExternalWallet(provider, address);
          setExternalWalletLoading(false);

          if (connected) {
            setConnectSheetVisible(false);
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

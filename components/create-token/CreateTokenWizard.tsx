import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  ACTIVE_LAUNCH_CHAINS,
  ORBIT_CHAIN_CONFIG,
  buildExplorerAddressUrl,
  buildExplorerTxUrl,
  getLaunchChainConfig,
} from '../../constants/networks';
import { FONT, RADII, SPACING, withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import {
  createExternalDexListing,
  createOrbitxProtectedListing,
} from '../../services/listing/orbitxListing';
import {
  buildAstraImagePromptSuggestions,
  generateAstraImage,
  getAstraImageAvailability,
  type AstraGeneratedImage,
} from '../../src/services/astra/astraImageStudio';
import { useAstraStore } from '../../src/store/astraStore';
import {
  deployRealMemecoin,
  estimateRealMemecoinDeployment,
  supportsRealMemecoinCreation,
} from '../../services/tokens/evmMemecoin';
import {
  estimateRealLiquidityCreation,
  supportsRealLiquidityCreation,
  type LiquidityPairKind,
} from '../../services/liquidity/evmLiquidity';
import { useWalletStore } from '../../src/store/walletStore';
import { useOrbitStore } from '../../store/useOrbitStore';
import type {
  DexLaunchNetwork,
  ExternalWalletProvider,
  LaunchChain,
} from '../../types';
import { formatCurrency } from '../../utils/format';
import { maskAddress } from '../../utils/wallet';
import { GlassCard } from '../common/GlassCard';
import { PageHeader } from '../common/PageHeader';
import { PrimaryButton } from '../common/PrimaryButton';
import { Screen } from '../common/Screen';
import { SectionHeader } from '../common/SectionHeader';
import { SegmentedControl } from '../common/SegmentedControl';
import { TokenAvatar } from '../common/TokenAvatar';
import { OrbitInput } from '../forms/OrbitInput';
import { ExternalWalletConnectSheet } from '../wallet/ExternalWalletConnectSheet';
import { WalletSetupFlow } from '../wallet/WalletSetupFlow';
import { TokenLaunchModal, type TokenLaunchDecision } from './TokenLaunchModal';

type WizardStep = 'wallet' | 'network' | 'config' | 'costs' | 'signature' | 'result';
type WalletSource = 'orbitx' | 'external';
type LaunchIntent = 'orbitx' | 'dex';
type DeployStatus = 'idle' | 'estimating' | 'awaiting_signature' | 'deploying' | 'confirmed' | 'failed';
type ListingStage =
  | 'idle'
  | 'external_listing'
  | 'orbitx_checks'
  | 'orbitx_liquidity'
  | 'orbitx_validation'
  | 'orbitx_lock'
  | 'completed'
  | 'failed';

interface CreateTokenWizardProps {
  standalone?: boolean;
}

interface DeploymentEstimateState {
  nativeCostEstimate: number;
  usdCostEstimate: number;
  deployerAddress: string;
  gasLimit: string;
}

interface DeploymentResultState extends DeploymentEstimateState {
  contractAddress: string;
  transactionHash: string;
  network: 'ethereum' | 'base' | 'bnb';
}

const steps: Array<{ key: WizardStep; label: string }> = [
  { key: 'wallet', label: 'Wallet' },
  { key: 'network', label: 'Red' },
  { key: 'config', label: 'Token' },
  { key: 'costs', label: 'Coste' },
  { key: 'signature', label: 'Firma' },
  { key: 'result', label: 'Resultado' },
];

function getOrbitxSourceAddress(
  chain: LaunchChain,
  receiveAddresses: {
    ethereum: string;
    base: string;
    bnb: string;
    solana: string;
  },
) {
  if (chain === 'bnb') return receiveAddresses.bnb;
  if (chain === 'ethereum') return receiveAddresses.ethereum;
  if (chain === 'solana') return receiveAddresses.solana;
  return receiveAddresses.base;
}

function hasCompleteReceiveAddresses(addresses: {
  ethereum: string;
  base: string;
  bnb: string;
  solana: string;
}) {
  return Boolean(addresses.ethereum && addresses.base && addresses.bnb && addresses.solana);
}

function getNativeTokenId(chain: LaunchChain) {
  return chain === 'bnb' ? 'bnb' : 'eth';
}

function getNetworkLabel(chain: LaunchChain) {
  if (chain === 'bnb') return 'BNB Chain';
  if (chain === 'base') return 'Base';
  if (chain === 'ethereum') return 'Ethereum';
  if (chain === 'solana') return 'Solana';
  return 'TRON';
}

export function CreateTokenWizard({ standalone = false }: CreateTokenWizardProps) {
  const { colors } = useAppTheme();
  const appLanguage = useOrbitStore((state) => state.settings.language);
  const profile = useOrbitStore((state) => state.profile);
  const tokens = useOrbitStore((state) => state.tokens);
  const walletFuture = useOrbitStore((state) => state.walletFuture);
  const primaryWalletReady = useWalletStore((state) => state.isWalletReady);
  const primaryReceiveAddresses = useWalletStore((state) => state.receiveAddresses);
  const createToken = useOrbitStore((state) => state.createToken);
  const markTokenReadyToList = useOrbitStore((state) => state.markTokenReadyToList);
  const updateTokenRecord = useOrbitStore((state) => state.updateTokenRecord);
  const launchToken = useOrbitStore((state) => state.launchToken);
  const showToast = useOrbitStore((state) => state.showToast);
  const connectExternalWallet = useOrbitStore((state) => state.connectExternalWallet);
  const rememberAstraContext = useAstraStore((state) => state.rememberContext);

  const [step, setStep] = useState<WizardStep>('wallet');
  const [chain, setChain] = useState<LaunchChain>('base');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [supply, setSupply] = useState('1000000');
  const [decimals, setDecimals] = useState('18');
  const [logo, setLogo] = useState<string | null>(null);
  const [imageSourceMode, setImageSourceMode] = useState<'upload' | 'astra'>('upload');
  const [astraImagePrompt, setAstraImagePrompt] = useState('');
  const [astraImageStatus, setAstraImageStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [astraImageError, setAstraImageError] = useState('');
  const [generatedImages, setGeneratedImages] = useState<AstraGeneratedImage[]>([]);
  const [astraAvailabilityState, setAstraAvailabilityState] = useState<
    'checking' | 'available' | 'unavailable' | 'unknown'
  >('checking');
  const [astraAvailabilityMessage, setAstraAvailabilityMessage] = useState(
    'Verificando la disponibilidad de Astra + Gemini Nano Banana...',
  );
  const [walletSource, setWalletSource] = useState<WalletSource>('orbitx');
  const [connectorVisible, setConnectorVisible] = useState(false);
  const [walletSetupVisible, setWalletSetupVisible] = useState(false);
  const [walletSetupMode, setWalletSetupMode] = useState<'create' | 'seed' | 'import'>('create');
  const [launchModalVisible, setLaunchModalVisible] = useState(false);
  const [launchIntent, setLaunchIntent] = useState<LaunchIntent>('orbitx');
  const [pairKind, setPairKind] = useState<LiquidityPairKind>('native');
  const [tokenLiquidityAmount, setTokenLiquidityAmount] = useState('100000');
  const [dexLaunchNetwork, setDexLaunchNetwork] = useState<DexLaunchNetwork>('base');
  const [dexLaunchLiquidity, setDexLaunchLiquidity] = useState('2500');
  const [launchSummary, setLaunchSummary] = useState<{
    mode: 'orbitx' | 'dex';
    label: string;
    liquidityPoolUsd: number;
    estimatedFeeUsd: number;
    poolAddress: string;
  } | null>(null);
  const [estimate, setEstimate] = useState<DeploymentEstimateState | null>(null);
  const [liquidityFeeUsd, setLiquidityFeeUsd] = useState(0);
  const [estimateMessage, setEstimateMessage] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState<DeployStatus>('idle');
  const [deployError, setDeployError] = useState('');
  const [listingStage, setListingStage] = useState<ListingStage>('idle');
  const [listingError, setListingError] = useState('');
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResultState | null>(null);
  const [resultTokenId, setResultTokenId] = useState<string | null>(null);

  const orbitWalletFutureReady =
    hasCompleteReceiveAddresses(walletFuture.receiveAddresses) && !walletFuture.simulated;
  const orbitxReceiveAddresses = hasCompleteReceiveAddresses(primaryReceiveAddresses)
    ? primaryReceiveAddresses
    : walletFuture.receiveAddresses;
  const walletReady = primaryWalletReady || orbitWalletFutureReady;
  const externalConnected = Boolean(
    walletFuture.externalWallet.provider && walletFuture.externalWallet.address,
  );
  const currentStepIndex = steps.findIndex((item) => item.key === step);
  const previewSymbol = symbol.trim().toUpperCase() || 'MEME';
  const previewName = name.trim() || 'Orbit Meme';
  const supplyNumber = Number(supply);
  const decimalsNumber = Number(decimals);
  const chainConfig = getLaunchChainConfig(chain);
  const canCreateRealOnChain = supportsRealMemecoinCreation(chain);
  const supportedCreationChains = useMemo(
    () => ACTIVE_LAUNCH_CHAINS.filter((network) => supportsRealMemecoinCreation(network.launchChain)),
    [],
  );
  const resultToken = useMemo(
    () => tokens.find((token) => token.id === resultTokenId) ?? null,
    [resultTokenId, tokens],
  );
  const createdTokens = useMemo(
    () =>
      tokens
        .filter((token) => token.isUserCreated && token.creator === profile.handle)
        .slice(0, 5),
    [profile.handle, tokens],
  );
  const sourceAddress =
    walletSource === 'orbitx'
      ? getOrbitxSourceAddress(chain, orbitxReceiveAddresses)
      : walletFuture.externalWallet.address;
  const astraPromptSuggestions = useMemo(
    () =>
      buildAstraImagePromptSuggestions({
        language: appLanguage,
        tokenName: previewName,
        tokenSymbol: previewSymbol,
        description,
      }),
    [appLanguage, description, previewName, previewSymbol],
  );
  const astraCreateTokenContext = useMemo(
    () => ({
      surface: 'create_token' as const,
      path: '/create-token',
      language: appLanguage,
      screenName: appLanguage === 'en' ? 'Create token' : 'Crear token',
      summary: walletReady
        ? `Create token wizard in step ${steps[currentStepIndex]?.label ?? step} on ${getNetworkLabel(chain)}.`
        : 'Create token wizard is waiting for a ready wallet before launch.',
      currentTask: `create_token_${step}`,
      selectedEntity: {
        type: 'token_draft',
        name: previewName,
        symbol: previewSymbol,
        network: chain,
        provider: walletSource,
      },
      uiState: {
        createTokenStage: step,
        imageSourceMode,
        astraImageStatus,
        astraAvailability: astraAvailabilityState,
        generatedImagesCount: generatedImages.length,
        walletSource,
        walletReady,
        externalConnected,
        canCreateRealOnChain,
        estimateReady: Boolean(estimate),
        deployStatus,
        listingStage,
      },
      labels: {
        stepLabel: steps[currentStepIndex]?.label,
        networkLabel: getNetworkLabel(chain),
        walletSourceLabel: walletSource,
        astraAvailabilityLabel: astraAvailabilityState,
        imageModeLabel: imageSourceMode,
      },
      walletReady,
      externalWalletConnected: externalConnected,
    }),
    [
      appLanguage,
      astraAvailabilityState,
      astraImageStatus,
      canCreateRealOnChain,
      chain,
      currentStepIndex,
      deployStatus,
      estimate,
      externalConnected,
      generatedImages.length,
      imageSourceMode,
      listingStage,
      previewName,
      previewSymbol,
      step,
      walletReady,
      walletSource,
    ],
  );

  useEffect(() => {
    rememberAstraContext(astraCreateTokenContext);
  }, [astraCreateTokenContext, rememberAstraContext]);

  useEffect(() => {
    if (chain === 'ethereum') {
      setDexLaunchNetwork('ethereum');
      return;
    }
    if (chain === 'base') {
      setDexLaunchNetwork('base');
      return;
    }
    if (chain === 'bnb') {
      setDexLaunchNetwork('bnb');
      return;
    }
    setDexLaunchNetwork('solana');
  }, [chain]);

  useEffect(() => {
    const nextSupply = Number(supply);
    if (!Number.isFinite(nextSupply) || nextSupply <= 0) {
      return;
    }

    const suggested = Math.max(Math.floor(nextSupply * 0.1), 1);
    setTokenLiquidityAmount(String(suggested));
  }, [supply]);

  useEffect(() => {
    let cancelled = false;
    const hasValidConfig =
      name.trim().length > 0 &&
      previewSymbol.length >= 2 &&
      Number.isFinite(supplyNumber) &&
      supplyNumber > 0 &&
      Number.isInteger(decimalsNumber) &&
      decimalsNumber > 0;

    if (!hasValidConfig) {
      setEstimate(null);
      setEstimateMessage('Completa nombre, simbolo, decimales y supply para calcular el deploy.');
      setIsEstimating(false);
      return () => undefined;
    }

    if (!canCreateRealOnChain) {
      setEstimate(null);
      setEstimateMessage('La creacion real queda activa primero en Ethereum, Base y BNB Chain.');
      setIsEstimating(false);
      return () => undefined;
    }

    if (walletSource !== 'orbitx') {
      setEstimate(null);
      setEstimateMessage('La firma real con wallet externa queda preparada para la siguiente fase.');
      setIsEstimating(false);
      return () => undefined;
    }

    if (!walletReady) {
      setEstimate(null);
      setEstimateMessage('Activa primero tu wallet OrbitX para estimar el deploy real.');
      setIsEstimating(false);
      return () => undefined;
    }

    setIsEstimating(true);
    setDeployStatus('estimating');
    setEstimateMessage('');

    void (async () => {
      try {
        const nativeTokenId = getNativeTokenId(chain);
        const nativeTokenPrice = tokens.find((token) => token.id === nativeTokenId)?.price ?? 0;
        const nextEstimate = await estimateRealMemecoinDeployment(
          chain,
          { name: previewName, symbol: previewSymbol, supply, decimals: decimalsNumber },
          nativeTokenPrice,
        );

        if (cancelled) return;
        setEstimate(nextEstimate);
        setDeployStatus('idle');
      } catch (error) {
        if (cancelled) return;
        setEstimate(null);
        setDeployStatus('failed');
        setEstimateMessage(
          error instanceof Error ? error.message : 'No pudimos calcular el coste real del deploy.',
        );
      } finally {
        if (!cancelled) {
          setIsEstimating(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    canCreateRealOnChain,
    chain,
    decimalsNumber,
    name,
    previewName,
    previewSymbol,
    supply,
    supplyNumber,
    tokens,
    walletReady,
    walletSource,
  ]);

  useEffect(() => {
    let cancelled = false;

    if (
      !deploymentResult ||
      !resultToken ||
      !resultToken.contractAddress ||
      !resultToken.tokenSupply ||
      !supportsRealLiquidityCreation(resultToken.chain ?? chain)
    ) {
      setLiquidityFeeUsd(0);
      return () => undefined;
    }

    const tokenAmount = Number(tokenLiquidityAmount);
    const quoteAmount = Number(dexLaunchLiquidity);
    if (!Number.isFinite(tokenAmount) || tokenAmount <= 0 || !Number.isFinite(quoteAmount) || quoteAmount <= 0) {
      setLiquidityFeeUsd(0);
      return () => undefined;
    }

    void (async () => {
      try {
        const contractAddress = resultToken.contractAddress;
        if (!contractAddress) {
          return;
        }
        const nativeTokenId = getNativeTokenId(resultToken.chain ?? chain);
        const nativeTokenPrice = tokens.find((token) => token.id === nativeTokenId)?.price ?? 0;
        const liquidityEstimate = await estimateRealLiquidityCreation({
          chain: resultToken.chain ?? chain,
          tokenAddress: contractAddress,
          pair: pairKind,
          tokenAmount: tokenLiquidityAmount,
          quoteAmount: dexLaunchLiquidity,
          nativeTokenPriceUsd: nativeTokenPrice,
        });

        if (!cancelled) {
          setLiquidityFeeUsd(liquidityEstimate.estimatedFeeUsd);
        }
      } catch {
        if (!cancelled) {
          setLiquidityFeeUsd(0);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chain, deploymentResult, dexLaunchLiquidity, pairKind, resultToken, tokenLiquidityAmount, tokens]);

  useEffect(() => {
    let cancelled = false;

    if (imageSourceMode !== 'astra') {
      return () => undefined;
    }

    setAstraAvailabilityState('checking');
    setAstraAvailabilityMessage('Verificando la disponibilidad de Astra + Gemini Nano Banana...');

    void (async () => {
      const availability = await getAstraImageAvailability(appLanguage);
      if (cancelled) {
        return;
      }

      setAstraAvailabilityState(
        availability.state === 'available'
          ? 'available'
          : availability.state === 'unavailable'
            ? 'unavailable'
            : 'unknown',
      );
      setAstraAvailabilityMessage(availability.message);
    })();

    return () => {
      cancelled = true;
    };
  }, [appLanguage, imageSourceMode]);

  async function handlePickLogo() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      showToast('Necesitamos permiso para elegir la imagen.', 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled) {
      setLogo(result.assets[0]?.uri ?? null);
    }
  }

  function handleApplyAstraPrompt(prompt: string) {
    setImageSourceMode('astra');
    setAstraImagePrompt(prompt);
    setAstraImageError('');
  }

  function handleSelectGeneratedImage(image: AstraGeneratedImage) {
    setLogo(image.imageUrl);
    setImageSourceMode('astra');
    showToast('Imagen de Astra seleccionada como base del token.', 'success');
  }

  async function handleGenerateAstraImage() {
    if (astraAvailabilityState === 'unavailable') {
      const message =
        astraAvailabilityMessage ||
        'La generacion visual con Astra no esta disponible en este entorno.';
      setAstraImageStatus('error');
      setAstraImageError(message);
      showToast(message, 'info');
      return;
    }

    const prompt = astraImagePrompt.trim();
    if (!prompt) {
      showToast('Define primero un prompt visual para Astra.', 'error');
      return;
    }

    setImageSourceMode('astra');
    setAstraImageStatus('loading');
    setAstraImageError('');

    try {
      const result = await generateAstraImage({
        prompt,
        language: appLanguage,
        tokenName: previewName,
        tokenSymbol: previewSymbol,
        description,
      });

      setGeneratedImages(result.images);
      setAstraImageStatus('ready');
      if (result.images[0]) {
        setLogo(result.images[0].imageUrl);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No pudimos generar la imagen con Astra.';
      setGeneratedImages([]);
      setAstraImageStatus('error');
      setAstraImageError(message);
      showToast(message, 'info');
    }
  }

  async function handleConnectProvider(provider: ExternalWalletProvider, address?: string) {
    const result = await connectExternalWallet(provider, address);
    if (result.ok) {
      setWalletSource('external');
      setConnectorVisible(false);
    }
  }

  function openWalletSetup(mode: 'create' | 'seed' | 'import') {
    setWalletSetupMode(mode);
    setWalletSetupVisible(true);
  }

  function handleWalletReady() {
    setWalletSetupVisible(false);
    setWalletSource('orbitx');
    if (step === 'wallet') {
      setStep('network');
      showToast('Wallet OrbitX lista. Continuamos con la red del token.', 'success');
    }
  }

  function moveToNextStep() {
    if (step === 'wallet') {
      if (walletSource === 'external') {
        setWalletSource('orbitx');
        showToast(
          'La creacion real de memecoins funciona ahora con OrbitX Wallet. Continuamos con tu wallet interna.',
          'info',
        );

        if (!walletReady) {
          openWalletSetup('create');
          return;
        }
      }

      if (!walletReady) {
        openWalletSetup('create');
        return;
      }
    }

    if (step === 'config') {
      if (
        !name.trim() ||
        previewSymbol.length < 2 ||
        !Number.isFinite(supplyNumber) ||
        supplyNumber <= 0 ||
        !Number.isInteger(decimalsNumber) ||
        decimalsNumber <= 0
      ) {
        showToast('Completa nombre, simbolo, decimales y supply.', 'error');
        return;
      }

      if (
        tokens.some(
          (token) =>
            token.symbol.toLowerCase() === previewSymbol.toLowerCase() ||
            token.name.toLowerCase() === name.trim().toLowerCase(),
        )
      ) {
        showToast('Ese nombre o simbolo ya existe.', 'error');
        return;
      }
    }

    if (step === 'costs' && !estimate && canCreateRealOnChain) {
      showToast(estimateMessage || 'Espera la estimacion real antes de continuar.', 'error');
      return;
    }

    const nextStep = steps[currentStepIndex + 1]?.key;
    if (nextStep) {
      setStep(nextStep);
    }
  }

  async function handleCreateToken() {
    if (!canCreateRealOnChain) {
      showToast('La creacion real queda activa primero en Ethereum, Base y BNB Chain.', 'error');
      return;
    }

    if (walletSource !== 'orbitx') {
      showToast('La firma real con wallet externa queda preparada para la siguiente fase.', 'error');
      return;
    }

    if (!walletReady) {
      openWalletSetup('create');
      return;
    }

    if (!estimate) {
      showToast(estimateMessage || 'Necesitamos una estimacion real antes de desplegar.', 'error');
      return;
    }

    setDeployError('');
    setDeployStatus('awaiting_signature');
    setIsDeploying(true);

    try {
      const nativeTokenId = getNativeTokenId(chain);
      const nativeTokenPrice = tokens.find((token) => token.id === nativeTokenId)?.price ?? 0;
      setDeployStatus('deploying');
      const nextDeployment = await deployRealMemecoin(
        chain,
        { name: previewName, symbol: previewSymbol, supply, decimals: decimalsNumber },
        nativeTokenPrice,
      );

      const registration = createToken({
        name: previewName,
        symbol: previewSymbol,
        decimals: decimalsNumber,
        logo,
        description,
        supply,
        chain,
        launchVenue: 'orbitx',
        contractAddress: nextDeployment.contractAddress,
        deploymentTxHash: nextDeployment.transactionHash,
        deployerAddress: nextDeployment.deployerAddress,
      });

      if (!registration.ok) {
        showToast('El token se desplego on-chain, pero no pudimos registrarlo dentro de OrbitX.', 'error');
      }

      if (registration.ok && registration.tokenId) {
        markTokenReadyToList(registration.tokenId);
      }

      setDeploymentResult(nextDeployment);
      setResultTokenId(registration.tokenId ?? null);
      setLaunchSummary(null);
      setDeployStatus('confirmed');
      setStep('result');

      if (registration.ok && registration.tokenId) {
        setLaunchIntent('orbitx');
        setLaunchModalVisible(true);
      }
    } catch (error) {
      setDeployStatus('failed');
      setDeployError(
        error instanceof Error ? error.message : 'No pudimos desplegar el token real en blockchain.',
      );
      showToast(
        error instanceof Error ? error.message : 'No pudimos desplegar el token real en blockchain.',
        'error',
      );
    } finally {
      setIsDeploying(false);
    }
  }

  async function handleConfirmLaunch(decision: TokenLaunchDecision) {
    if (!resultTokenId || !resultToken?.contractAddress || !resultToken.tokenSupply || !resultToken.chain) {
      return;
    }

    if (!supportsRealLiquidityCreation(resultToken.chain)) {
      showToast('La liquidez real queda activa primero en Ethereum y BNB Chain.', 'error');
      return;
    }

    if (!decision.tokenLiquidityAmount || !decision.quoteLiquidityAmount) {
      showToast('Define un monto real para token y quote.', 'error');
      return;
    }

    let protectedStage: ListingStage = 'idle';
    protectedStage = decision.listingType === 'external' ? 'external_listing' : 'orbitx_checks';
    setListingError('');
    setListingStage(protectedStage);

    try {
      const nativeTokenId = getNativeTokenId(resultToken.chain);
      const nativeTokenPrice = tokens.find((token) => token.id === nativeTokenId)?.price ?? 0;

      let payload;

      if (decision.listingType === 'external') {
        payload = await createExternalDexListing({
          token: resultToken,
          pairKind: decision.pairKind,
          tokenAmount: String(decision.tokenLiquidityAmount),
          quoteAmount: String(decision.quoteLiquidityAmount),
          nativeTokenPriceUsd: nativeTokenPrice,
        });
      } else {
        updateTokenRecord(resultTokenId, {
          listingType: 'orbitx_protected',
          listingStatus: 'orbitx_listing_pending_checks',
        });

        payload = await createOrbitxProtectedListing({
          token: resultToken,
          pairKind: decision.pairKind,
          tokenAmount: String(decision.tokenLiquidityAmount),
          quoteAmount: String(decision.quoteLiquidityAmount),
          nativeTokenPriceUsd: nativeTokenPrice,
          lockDurationDays: decision.lockDurationDays,
          onStageChange: (stage) => {
            protectedStage =
              stage === 'checks'
                ? 'orbitx_checks'
                : stage === 'liquidity'
                  ? 'orbitx_liquidity'
                  : stage === 'validation'
                    ? 'orbitx_validation'
                    : 'orbitx_lock';
            setListingStage(protectedStage);

            if (stage === 'checks') {
              updateTokenRecord(resultTokenId, {
                listingType: 'orbitx_protected',
                listingStatus: 'orbitx_listing_pending_checks',
              });
            }

            if (stage === 'liquidity') {
              updateTokenRecord(resultTokenId, {
                listingType: 'orbitx_protected',
                listingStatus: 'orbitx_listing_pending_liquidity',
              });
            }

            if (stage === 'lock') {
              updateTokenRecord(resultTokenId, {
                listingType: 'orbitx_protected',
                listingStatus: 'orbitx_listing_pending_lock',
              });
            }
          },
          onSafetyReport: (report) => {
            updateTokenRecord(resultTokenId, {
              listingType: 'orbitx_protected',
              contractSafety: report,
              listingStatus:
                report.status === 'passed'
                  ? 'orbitx_listing_pending_liquidity'
                  : 'orbitx_listing_checks_failed',
            });
          },
          onValidationReport: (report) => {
            updateTokenRecord(resultTokenId, {
              listingType: 'orbitx_protected',
              preListingValidation: report,
              listingStatus:
                report.status === 'passed'
                  ? 'orbitx_listing_pending_lock'
                  : 'orbitx_listing_checks_failed',
            });
          },
          onLiquidityCreated: (liquidity) => {
            updateTokenRecord(resultTokenId, {
              listingType: 'orbitx_protected',
              listingStatus: 'orbitx_listing_pending_lock',
              poolAddress: liquidity.pairAddress,
              poolReference: liquidity.pairAddress,
              quoteTokenId: liquidity.quoteTokenId,
              quoteAddress: liquidity.quoteAddress,
              quoteDecimals: liquidity.quoteDecimals,
              tokenDecimals: liquidity.tokenDecimals,
              liquidityPoolUsd: liquidity.liquidityPoolUsd,
              liquidityTxHash: liquidity.transactionHash,
              chainId: liquidity.chain === 'ethereum' ? 1 : liquidity.chain === 'bnb' ? 56 : 8453,
              price: liquidity.priceUsd,
              marketCap: liquidity.marketCapUsd,
              liquidity: {
                listingType: 'orbitx_protected',
                network: resultToken.chain!,
                dexVenue: resultToken.chain === 'bnb' ? 'pancakeswap' : 'uniswap',
                poolAddress: liquidity.pairAddress,
                creatorWallet: liquidity.creatorAddress,
                tokenAddress: resultToken.contractAddress!,
                pairKind: decision.pairKind,
                quoteTokenId: liquidity.quoteTokenId,
                quoteAddress: liquidity.quoteAddress,
                quoteDecimals: liquidity.quoteDecimals,
                tokenDecimals: liquidity.tokenDecimals,
                tokenAmount: String(decision.tokenLiquidityAmount),
                quoteAmount: String(decision.quoteLiquidityAmount),
                liquidityAmountUsd: liquidity.liquidityPoolUsd,
                lpTokenAmount: liquidity.lpTokenAmount,
                createdAt: new Date().toISOString(),
                txHash: liquidity.transactionHash,
              },
            });
          },
        });
      }

      const result = launchToken(resultTokenId, payload);

      if (!result.ok || !result.poolAddress) {
        return;
      }

      setLaunchSummary({
        mode: payload.mode,
        label:
          payload.listingType === 'orbitx_protected'
            ? 'OrbitX Protected'
            : `${payload.dexVenue ?? 'DEX'} external`.trim(),
        liquidityPoolUsd: payload.liquidityPoolUsd,
        estimatedFeeUsd: payload.estimatedFeeUsd,
        poolAddress: result.poolAddress,
      });
      setListingStage('completed');
      setLaunchModalVisible(false);
      showToast(
        payload.listingType === 'orbitx_protected'
          ? `${resultToken.symbol} ya cumple el flujo protegido de OrbitX`
          : `${resultToken.symbol} ya tiene pool real activo`,
        'success',
      );
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error.message : 'No pudimos completar el listado real.';
      setListingStage('failed');
      setListingError(normalizedError);

      if (decision.listingType === 'orbitx_protected') {
        const currentProtectedStage = String(protectedStage);

        if (currentProtectedStage === 'orbitx_checks' || currentProtectedStage === 'orbitx_validation') {
          updateTokenRecord(resultTokenId, {
            listingType: 'orbitx_protected',
            listingStatus: 'orbitx_listing_checks_failed',
          });
        }

        if (currentProtectedStage === 'orbitx_liquidity') {
          updateTokenRecord(resultTokenId, {
            listingType: 'orbitx_protected',
            listingStatus: 'orbitx_listing_pending_liquidity',
          });
        }

        if (currentProtectedStage === 'orbitx_lock') {
          updateTokenRecord(resultTokenId, {
            listingType: 'orbitx_protected',
            listingStatus: 'orbitx_listing_pending_lock',
          });
        }
      }

      showToast(
        normalizedError,
        'error',
      );
    }
  }

  function resetWizard() {
    setStep('wallet');
    setChain('base');
    setName('');
    setSymbol('');
    setDescription('');
    setSupply('1000000');
    setDecimals('18');
    setLogo(null);
    setImageSourceMode('upload');
    setAstraImagePrompt('');
    setAstraImageStatus('idle');
    setAstraImageError('');
    setGeneratedImages([]);
    setAstraAvailabilityState('checking');
    setAstraAvailabilityMessage('Verificando la disponibilidad de Astra + Gemini Nano Banana...');
    setWalletSource('orbitx');
    setEstimate(null);
    setEstimateMessage('');
    setDeployStatus('idle');
    setDeployError('');
    setListingStage('idle');
    setListingError('');
    setDeploymentResult(null);
    setLaunchSummary(null);
    setLaunchModalVisible(false);
    setResultTokenId(null);
    setPairKind('native');
    setTokenLiquidityAmount('100000');
    setDexLaunchLiquidity('2500');
    setDexLaunchNetwork('base');
    setLaunchIntent('orbitx');
  }

  function handleResultAction(action: 'orbitx' | 'dex' | 'save') {
    if (action === 'save') {
      showToast('Token guardado en Mis Tokens y Web3 Wallet.', 'success');
      return;
    }

    setLaunchIntent(action);
    setLaunchModalVisible(true);
  }

  function renderWalletStep() {
    return (
      <GlassCard>
        <SectionHeader title="Selecciona tu wallet" subtitle="OrbitX Wallet es la ruta principal." />

        <View style={styles.choiceList}>
          <Pressable
            onPress={() => setWalletSource('orbitx')}
            style={[
              styles.choiceCard,
              {
                backgroundColor: colors.fieldBackground,
                borderColor: walletSource === 'orbitx' ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={[styles.choiceTitle, { color: colors.text }]}>Wallet interna de OrbitX</Text>
            <Text style={[styles.choiceBody, { color: colors.textMuted }]}>
              {walletReady
                ? 'Tu OrbitX Wallet ya esta lista para firmar y continuar con el deploy real sin salir de la app.'
                : 'Crea tu billetera, guarda tu seed phrase y firma el deploy real sin salir de la app.'}
            </Text>
            <Text style={[styles.choiceHint, { color: walletReady ? colors.profit : colors.textSoft }]}>
              {walletReady
                ? `Lista - ${maskAddress(getOrbitxSourceAddress(chain, orbitxReceiveAddresses))}`
                : 'Crear wallet -> ver seed phrase -> confirmar'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setWalletSource('external')}
            style={[
              styles.choiceCard,
              {
                backgroundColor: colors.fieldBackground,
                borderColor: walletSource === 'external' ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={[styles.choiceTitle, { color: colors.text }]}>Wallet externa</Text>
            <Text style={[styles.choiceBody, { color: colors.textMuted }]}>
              Puedes conectarla como referencia, pero el deploy real dentro de este wizard se hace hoy con OrbitX Wallet.
            </Text>
            <Text style={[styles.choiceHint, { color: externalConnected ? colors.profit : colors.textSoft }]}>
              {externalConnected
                ? `${maskAddress(walletFuture.externalWallet.address)} - Solo visual por ahora`
                : 'Conectar wallet - Proximamente para deploy real'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.actionGrid}>
          <PrimaryButton
            label={walletReady ? 'Ver seed phrase' : 'Crear wallet OrbitX'}
            onPress={() => openWalletSetup(walletReady ? 'seed' : 'create')}
            style={styles.flexButton}
          />
          <PrimaryButton
            label="Conectar wallet"
            variant="secondary"
            onPress={() => setConnectorVisible(true)}
            style={styles.flexButton}
          />
        </View>
      </GlassCard>
    );
  }

  function renderNetworkStep() {
    return (
      <GlassCard>
        <SectionHeader title="Elige la red" subtitle="La creacion real empieza en EVM." />

        <SegmentedControl<LaunchChain>
          options={supportedCreationChains.map((network) => ({
            label: network.shortLabel,
            value: network.launchChain,
          }))}
          value={chain}
          onChange={setChain}
        />

        <View
          style={[
            styles.inlineCard,
            { backgroundColor: colors.fieldBackground, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.inlineTitle, { color: colors.text }]}>{chainConfig?.label ?? 'Red'}</Text>
          <Text style={[styles.inlineBody, { color: colors.textMuted }]}>
            {canCreateRealOnChain
              ? 'Despliegue real activo con firma desde tu wallet OrbitX.'
              : 'Esta red sigue visible, pero la creacion real queda en la siguiente fase.'}
          </Text>
          <Text style={[styles.inlineHint, { color: colors.textSoft }]}>
            Router: {chainConfig?.tradeRouter ?? 'OrbitX'}
          </Text>
        </View>

        <View style={styles.networkStatusList}>
          {ORBIT_CHAIN_CONFIG.filter((network) => network.key !== 'bitcoin').map((network) => (
            <View
              key={network.key}
              style={[
                styles.networkRow,
                { backgroundColor: colors.fieldBackground, borderColor: colors.border },
              ]}
            >
              <View style={styles.networkLeft}>
                <Text style={[styles.choiceTitle, { color: colors.text }]}>{network.label}</Text>
                <Text style={[styles.choiceBody, { color: colors.textMuted }]}>{network.helperText}</Text>
              </View>
              <Text
                style={[
                  styles.networkStatus,
                  {
                    color:
                      network.launchChain && supportsRealMemecoinCreation(network.launchChain)
                        ? colors.profit
                        : colors.textMuted,
                  },
                ]}
              >
                {network.launchChain && supportsRealMemecoinCreation(network.launchChain) ? 'Real' : 'Prox.'}
              </Text>
            </View>
          ))}
        </View>
      </GlassCard>
    );
  }

  function renderConfigStep() {
    return (
      <GlassCard>
        <SectionHeader title="Configura tu token" subtitle="Nombre, simbolo, imagen y supply." />

        <View style={styles.previewRow}>
          {logo ? (
            <Image source={{ uri: logo }} style={styles.previewImage} />
          ) : (
            <TokenAvatar label={previewSymbol} color={colors.primary} size={54} />
          )}
          <View style={styles.previewCopy}>
            <Text style={[styles.previewName, { color: colors.text }]}>{previewName}</Text>
            <Text style={[styles.previewMeta, { color: colors.textMuted }]}>
              {previewSymbol} · {getNetworkLabel(chain)}
            </Text>
          </View>
        </View>

        <OrbitInput label="Nombre" value={name} onChangeText={setName} placeholder="Orbit Peony" />
        <OrbitInput
          label="Simbolo"
          value={symbol}
          onChangeText={setSymbol}
          placeholder="PEONY"
          autoCapitalize="characters"
        />
        <OrbitInput
          label="Supply"
          value={supply}
          onChangeText={setSupply}
          placeholder="1000000"
          keyboardType="numeric"
          autoCapitalize="none"
        />
        <OrbitInput
          label="Decimales"
          value={decimals}
          onChangeText={setDecimals}
          placeholder="18"
          keyboardType="numeric"
          autoCapitalize="none"
        />
        <View
          style={[
            styles.inlineCard,
            { backgroundColor: colors.fieldBackground, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.inlineTitle, { color: colors.text }]}>Plantilla segura</Text>
          <Text style={[styles.inlineBody, { color: colors.textMuted }]}>
            La plantilla oficial y verificable de OrbitX usa 18 decimales. Si cambias este valor,
            el deploy protegido se bloquea.
          </Text>
        </View>
        <OrbitInput
          label="Descripcion"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe tu memecoin."
          multiline
        />

        <View
          style={[
            styles.inlineCard,
            { backgroundColor: colors.fieldBackground, borderColor: colors.border },
          ]}
        >
          <View style={styles.inlineRow}>
            <Text style={[styles.inlineTitle, { color: colors.text }]}>Imagen</Text>
            <Ionicons name="image-outline" size={16} color={colors.textMuted} />
          </View>
          <Text style={[styles.inlineBody, { color: colors.textMuted }]}>
            {logo
              ? 'Puedes cambiar la imagen actual o generar una nueva con Astra sin salir del wizard.'
              : 'Sube tu imagen manualmente o genera una con Astra para usarla como base del meme/token.'}
          </Text>

          <View style={styles.imageActionRow}>
            <Pressable
              onPress={() => {
                setImageSourceMode('upload');
                void handlePickLogo();
              }}
              style={[
                styles.imageActionButton,
                {
                  backgroundColor:
                    imageSourceMode === 'upload'
                      ? withOpacity(colors.primary, 0.16)
                      : withOpacity(colors.overlay, 0.18),
                  borderColor:
                    imageSourceMode === 'upload'
                      ? withOpacity(colors.primary, 0.3)
                      : colors.border,
                },
              ]}
            >
              <Ionicons name="cloud-upload-outline" size={16} color={colors.text} />
              <Text style={[styles.imageActionLabel, { color: colors.text }]}>Subir foto</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setImageSourceMode('astra');
                if (!astraImagePrompt.trim() && astraPromptSuggestions[0]) {
                  setAstraImagePrompt(astraPromptSuggestions[0].prompt);
                }
              }}
              style={[
                styles.imageActionButton,
                {
                  backgroundColor:
                    imageSourceMode === 'astra'
                      ? withOpacity(colors.primary, 0.16)
                      : withOpacity(colors.overlay, 0.18),
                  borderColor:
                    imageSourceMode === 'astra'
                      ? withOpacity(colors.primary, 0.3)
                      : colors.border,
                },
              ]}
            >
              <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
              <Text style={[styles.imageActionLabel, { color: colors.text }]}>Crear imagen con Astra</Text>
            </Pressable>
          </View>

          {imageSourceMode === 'astra' ? (
            <View style={styles.astraImageStudio}>
      <Text style={[styles.inlineTitle, { color: colors.text }]}>Astra + Gemini Nano Banana</Text>
                <Text style={[styles.inlineBody, { color: colors.textMuted }]}>
        Astra te ayuda a construir el prompt visual. La generacion solo se activa cuando Gemini Nano Banana esta realmente disponible en este entorno.
                </Text>

              <View style={styles.promptSuggestionWrap}>
                {astraPromptSuggestions.map((suggestion) => (
                  <Pressable
                    key={suggestion.id}
                    onPress={() => handleApplyAstraPrompt(suggestion.prompt)}
                    style={[
                      styles.promptSuggestionChip,
                      {
                        backgroundColor: withOpacity(colors.primary, 0.1),
                        borderColor: withOpacity(colors.primary, 0.24),
                      },
                    ]}
                  >
                    <Text style={[styles.promptSuggestionLabel, { color: colors.text }]}>
                      {suggestion.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <OrbitInput
                label="Prompt visual"
                value={astraImagePrompt}
                onChangeText={setAstraImagePrompt}
                placeholder="Describe la imagen que quieres generar con Astra."
                multiline
              />

                <PrimaryButton
                  label={
                    astraImageStatus === 'loading'
                      ? 'Generando imagen...'
                      : astraAvailabilityState === 'available'
                        ? 'Generar imagen con Astra'
                        : astraAvailabilityState === 'unavailable'
                          ? 'No disponible en este entorno'
                          : 'Intentar generar con Astra'
                  }
                  onPress={() => void handleGenerateAstraImage()}
                  disabled={
                    astraImageStatus === 'loading' || astraAvailabilityState === 'unavailable'
                  }
                />

                <Text
                  style={[
                    styles.generatorStatus,
                    {
                      color:
                        astraImageStatus === 'error'
                          ? colors.loss
                        : astraImageStatus === 'ready'
                          ? colors.profit
                          : astraAvailabilityState === 'unavailable'
                            ? colors.textMuted
                            : astraAvailabilityState === 'unknown'
                              ? colors.textMuted
                              : colors.textMuted,
                    },
                  ]}
                >
                  {astraImageStatus === 'loading'
                    ? 'Astra esta generando tu imagen...'
                    : astraImageStatus === 'ready'
                      ? 'Imagen lista. Puedes elegir una como base del token.'
                      : astraAvailabilityState === 'checking'
                        ? 'Verificando si Astra + Gemini Nano Banana esta disponible...'
                        : astraAvailabilityState === 'unknown'
                          ? 'No pudimos confirmarlo ahora mismo, pero puedes intentar generar igualmente.'
                        : astraImageStatus === 'error'
                          ? astraImageError || 'No pudimos generar la imagen ahora mismo.'
                          : astraAvailabilityState === 'available'
                            ? 'Puedes usar uno de los prompts sugeridos o escribir el tuyo.'
                            : astraAvailabilityMessage}
                </Text>

              {generatedImages.length ? (
                <View style={styles.generatedGrid}>
                  {generatedImages.map((image) => {
                    const selected = logo === image.imageUrl;
                    return (
                      <Pressable
                        key={image.id}
                        onPress={() => handleSelectGeneratedImage(image)}
                        style={[
                          styles.generatedCard,
                          {
                            backgroundColor: withOpacity(colors.overlay, 0.2),
                            borderColor: selected ? withOpacity(colors.primary, 0.4) : colors.border,
                          },
                        ]}
                      >
                        <Image source={{ uri: image.imageUrl }} style={styles.generatedImage} />
                        <Text numberOfLines={2} style={[styles.generatedPrompt, { color: colors.textMuted }]}>
                          {image.prompt}
                        </Text>
                        <Text style={[styles.generatedSelect, { color: selected ? colors.profit : colors.text }]}>
                          {selected ? 'Seleccionada' : 'Usar esta imagen'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </GlassCard>
    );
  }

  function renderCostsStep() {
    return (
      <GlassCard>
        <SectionHeader title="Coste real" subtitle="Estimacion antes de firmar." />

        {isEstimating ? (
          <Text style={[styles.mutedCopy, { color: colors.textMuted }]}>Calculando deploy real...</Text>
        ) : estimate ? (
          <View style={styles.summaryList}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Red</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{getNetworkLabel(chain)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Gas limite</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{estimate.gasLimit}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Supply</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{supply}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Decimales</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{decimals}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Coste estimado</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {estimate.nativeCostEstimate.toFixed(6)} {chain === 'bnb' ? 'BNB' : 'ETH'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Aprox. USD</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formatCurrency(estimate.usdCostEstimate)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Payer</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {maskAddress(estimate.deployerAddress)}
              </Text>
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.inlineCard,
              { backgroundColor: colors.fieldBackground, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.inlineBody, { color: colors.textMuted }]}>
              {estimateMessage || 'Todavia no tenemos una estimacion real para este deploy.'}
            </Text>
          </View>
        )}
      </GlassCard>
    );
  }

  function renderSignatureStep() {
    return (
      <GlassCard>
        <SectionHeader title="Firmar y crear" subtitle="Este paso despliega el token real." />

        <View style={styles.summaryList}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Wallet</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {walletSource === 'orbitx' ? 'OrbitX Wallet' : 'Wallet externa'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Direccion</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {sourceAddress ? maskAddress(sourceAddress) : 'Pendiente'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Token</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {previewName} ({previewSymbol})
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Supply</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{supply}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Decimales</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{decimals}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Red</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{getNetworkLabel(chain)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Estado</Text>
            <Text
              style={[
                styles.summaryValue,
                {
                  color:
                    deployStatus === 'confirmed'
                      ? colors.profit
                      : deployStatus === 'failed'
                        ? colors.loss
                        : colors.text,
                },
              ]}
            >
              {deployStatus === 'awaiting_signature'
                ? 'Esperando firma'
                : deployStatus === 'deploying'
                  ? 'Desplegando'
                  : deployStatus === 'confirmed'
                    ? 'Confirmado'
                    : deployStatus === 'failed'
                      ? 'Fallido'
                      : 'Listo para firmar'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Coste aprox.</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {estimate ? formatCurrency(estimate.usdCostEstimate) : 'Pendiente'}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.inlineCard,
            {
              backgroundColor: withOpacity(colors.loss, 0.08),
              borderColor: withOpacity(colors.loss, 0.18),
            },
          ]}
        >
          <Text style={[styles.inlineTitle, { color: colors.loss }]}>Importante</Text>
          <Text style={[styles.inlineBody, { color: colors.textSoft }]}>
            Este paso crea el contrato en blockchain. No es una simulacion.
          </Text>
        </View>

        {deployError ? (
          <View
            style={[
              styles.inlineCard,
              {
                backgroundColor: withOpacity(colors.loss, 0.08),
                borderColor: withOpacity(colors.loss, 0.18),
              },
            ]}
          >
            <Text style={[styles.inlineTitle, { color: colors.loss }]}>Error real</Text>
            <Text style={[styles.inlineBody, { color: colors.textSoft }]}>{deployError}</Text>
          </View>
        ) : null}
      </GlassCard>
    );
  }

  function renderResultStep() {
    const explorerContractUrl = deploymentResult
      ? buildExplorerAddressUrl(deploymentResult.network, deploymentResult.contractAddress)
      : null;
    const explorerTxUrl = deploymentResult
      ? buildExplorerTxUrl(deploymentResult.network, deploymentResult.transactionHash)
      : null;

    return (
      <GlassCard>
        <SectionHeader
          title="Tu token ya existe on-chain"
          subtitle="Direccion, red y siguiente fase dentro de OrbitX."
        />

        {deploymentResult ? (
          <View style={styles.summaryList}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Estado</Text>
              <Text style={[styles.summaryValue, { color: colors.profit }]}>On-chain confirmado</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Red</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {getNetworkLabel(deploymentResult.network)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Direccion</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {maskAddress(deploymentResult.contractAddress)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Tx hash</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {maskAddress(deploymentResult.transactionHash)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Deployer</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {maskAddress(deploymentResult.deployerAddress)}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={[styles.mutedCopy, { color: colors.textMuted }]}>
            El deploy todavia no se ha completado.
          </Text>
        )}

        {(explorerContractUrl || explorerTxUrl) ? (
          <View style={styles.resultActionsGrid}>
            {explorerContractUrl ? (
              <PrimaryButton
                label="Ver contrato"
                variant="secondary"
                onPress={() => void Linking.openURL(explorerContractUrl)}
                style={styles.resultButton}
              />
            ) : null}
            {explorerTxUrl ? (
              <PrimaryButton
                label="Ver tx"
                variant="ghost"
                onPress={() => void Linking.openURL(explorerTxUrl)}
                style={styles.resultButton}
              />
            ) : null}
          </View>
        ) : null}

        {launchSummary ? (
          <View
            style={[
              styles.inlineCard,
              { backgroundColor: colors.fieldBackground, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.inlineTitle, { color: colors.text }]}>Siguiente fase preparada</Text>
            <Text style={[styles.inlineBody, { color: colors.textMuted }]}>
              {launchSummary.label} · Liquidez {formatCurrency(launchSummary.liquidityPoolUsd)} · Fee{' '}
              {formatCurrency(launchSummary.estimatedFeeUsd)}
            </Text>
            <Text style={[styles.inlineHint, { color: colors.textSoft }]}>
              Pool: {launchSummary.poolAddress}
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.inlineCard,
              { backgroundColor: colors.fieldBackground, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.inlineTitle, { color: colors.text }]}>Siguiente paso</Text>
            <Text style={[styles.inlineBody, { color: colors.textMuted }]}>
              El contrato ya existe en blockchain. Ahora puedes preparar liquidez y decidir como quieres listarlo dentro de OrbitX.
            </Text>
          </View>
        )}

        {listingError ? (
          <View
            style={[
              styles.inlineCard,
              {
                backgroundColor: withOpacity(colors.loss, 0.08),
                borderColor: withOpacity(colors.loss, 0.18),
              },
            ]}
          >
            <Text style={[styles.inlineTitle, { color: colors.loss }]}>Listing blocked</Text>
            <Text style={[styles.inlineBody, { color: colors.textSoft }]}>{listingError}</Text>
          </View>
        ) : null}

        <View style={styles.resultActionsGrid}>
          <PrimaryButton
            label="Lanzar en OrbitX"
            onPress={() => handleResultAction('orbitx')}
            style={styles.resultButton}
          />
          <PrimaryButton
            label="Lanzar en DEX"
            variant="secondary"
            onPress={() => handleResultAction('dex')}
            style={styles.resultButton}
          />
          <PrimaryButton
            label="Guardar"
            variant="ghost"
            onPress={() => handleResultAction('save')}
            style={styles.resultButton}
          />
        </View>
      </GlassCard>
    );
  }

  function renderStepContent() {
    switch (step) {
      case 'wallet':
        return renderWalletStep();
      case 'network':
        return renderNetworkStep();
      case 'config':
        return renderConfigStep();
      case 'costs':
        return renderCostsStep();
      case 'signature':
        return renderSignatureStep();
      case 'result':
        return renderResultStep();
      default:
        return null;
    }
  }

  const primaryLabel =
    step === 'wallet'
      ? walletSource === 'external'
        ? 'Usar OrbitX Wallet'
        : walletReady
          ? 'Continuar'
          : 'Crear wallet y continuar'
      : step === 'network'
        ? 'Configurar token'
        : step === 'config'
          ? 'Revisar coste'
          : step === 'costs'
            ? 'Ir a firma'
            : step === 'signature'
              ? isDeploying
                ? 'Creando token...'
                : 'Firmar y crear'
              : resultToken
                ? 'Ver token'
                : 'Crear otro';

  function handlePrimaryPress() {
    if (step === 'signature') {
      void handleCreateToken();
      return;
    }

    if (step === 'result') {
      if (resultToken) {
        router.push(`/token/${resultToken.id}`);
        return;
      }

      resetWizard();
      return;
    }

    moveToNextStep();
  }

  return (
    <Screen
      scrollable
      contentContainerStyle={[styles.screenContent, standalone ? styles.screenStandalone : null]}
    >
      <PageHeader
        title="Crear Memecoin"
        subtitle="Deploy real primero en Ethereum, Base y BNB Chain."
        rightSlot={
          <View
            style={[
              styles.stepBadge,
              { backgroundColor: colors.fieldBackground, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.stepBadgeLabel, { color: colors.text }]}>
              {currentStepIndex + 1}/{steps.length}
            </Text>
          </View>
        }
      />

      <View style={styles.progressWrap}>
        {steps.map((item, index) => {
          const active = index <= currentStepIndex;

          return (
            <View
              key={item.key}
              style={[
                styles.progressChip,
                {
                  backgroundColor: active ? withOpacity(colors.primary, 0.12) : colors.fieldBackground,
                  borderColor: active ? withOpacity(colors.primary, 0.3) : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.progressChipLabel,
                  { color: active ? colors.text : colors.textMuted },
                ]}
              >
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>

      {createdTokens.length ? (
        <View
          style={[
            styles.createdStrip,
            { backgroundColor: colors.fieldBackground, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.createdStripTitle, { color: colors.text }]}>Mis Tokens</Text>
          <View style={styles.createdStripRow}>
            {createdTokens.map((token) => (
              <Pressable
                key={token.id}
                onPress={() => router.push(`/token/${token.id}`)}
                style={[
                  styles.createdChip,
                  { backgroundColor: colors.backgroundAlt, borderColor: colors.border },
                ]}
              >
                <TokenAvatar label={token.symbol} color={token.color} size={22} />
                <Text style={[styles.createdChipLabel, { color: colors.text }]}>{token.symbol}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {renderStepContent()}

      <View style={styles.footer}>
        {step !== 'wallet' ? (
          <PrimaryButton
            label="Atras"
            variant="ghost"
            onPress={() => setStep(steps[Math.max(currentStepIndex - 1, 0)]?.key ?? 'wallet')}
            style={styles.flexButton}
          />
        ) : null}

        <PrimaryButton label={primaryLabel} onPress={handlePrimaryPress} style={styles.flexButton} />
      </View>

      <WalletSetupFlow
        visible={walletSetupVisible}
        mode={walletSetupMode}
        onClose={() => setWalletSetupVisible(false)}
        onComplete={handleWalletReady}
      />

      <ExternalWalletConnectSheet
        visible={connectorVisible}
        currentProvider={walletFuture.externalWallet.provider}
        currentAddress={walletFuture.externalWallet.address}
        onClose={() => setConnectorVisible(false)}
        onSelect={handleConnectProvider}
      />

      <TokenLaunchModal
        visible={launchModalVisible}
        token={resultToken}
        defaultLiquidityUsd={2500}
        initialChoice={launchIntent}
        estimatedOnchainFeeUsd={liquidityFeeUsd}
        pairKind={pairKind}
        onPairKindChange={setPairKind}
        tokenAmountValue={tokenLiquidityAmount}
        onTokenAmountChange={setTokenLiquidityAmount}
        dexNetwork={dexLaunchNetwork}
        onDexNetworkChange={setDexLaunchNetwork}
        liquidityValue={dexLaunchLiquidity}
        onLiquidityChange={setDexLaunchLiquidity}
        onClose={() => setLaunchModalVisible(false)}
        onConfirm={handleConfirmLaunch}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    gap: 14,
    paddingBottom: 28,
  },
  screenStandalone: {
    paddingTop: 8,
  },
  stepBadge: {
    minWidth: 54,
    height: 34,
    borderRadius: RADII.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  stepBadgeLabel: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  progressWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  progressChip: {
    minHeight: 28,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressChipLabel: {
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  createdStrip: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 10,
    gap: 8,
  },
  createdStripTitle: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  createdStripRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  createdChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  createdChipLabel: {
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  choiceList: {
    gap: 8,
  },
  choiceCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  choiceTitle: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  choiceBody: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  choiceHint: {
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  flexButton: {
    flex: 1,
  },
  inlineCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  inlineTitle: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  inlineBody: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  inlineHint: {
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  networkStatusList: {
    gap: 8,
  },
  networkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 10,
  },
  networkLeft: {
    flex: 1,
    gap: 2,
  },
  networkStatus: {
    fontFamily: FONT.semibold,
    fontSize: 10,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewImage: {
    width: 54,
    height: 54,
    borderRadius: 16,
  },
  previewCopy: {
    flex: 1,
    gap: 2,
  },
  previewName: {
    fontFamily: FONT.bold,
    fontSize: 16,
  },
  previewMeta: {
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  imageActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  imageActionButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: RADII.lg,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imageActionLabel: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  astraImageStudio: {
    marginTop: 10,
    gap: 10,
  },
  promptSuggestionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  promptSuggestionChip: {
    minHeight: 30,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptSuggestionLabel: {
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  generatorStatus: {
    fontFamily: FONT.medium,
    fontSize: 11,
    lineHeight: 16,
  },
  generatedGrid: {
    gap: 10,
  },
  generatedCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 10,
    gap: 8,
  },
  generatedImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
  },
  generatedPrompt: {
    fontFamily: FONT.regular,
    fontSize: 10,
    lineHeight: 14,
  },
  generatedSelect: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  mutedCopy: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  summaryList: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  summaryLabel: {
    fontFamily: FONT.regular,
    fontSize: 11,
  },
  summaryValue: {
    flex: 1,
    textAlign: 'right',
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  resultActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  resultButton: {
    minWidth: '48%',
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
  },
});

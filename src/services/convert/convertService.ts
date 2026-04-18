import { dexConstants } from '../dex/dexConstants';
import { detectDeviceCountryCode, getRampConfig, isRampModeEnabled } from '../ramp/rampConfig';
import { getRampAvailability, getRampPrimaryProvider } from '../ramp/rampService';
import { getRampProviderLabel } from '../ramp/rampCopy';
import { getConvertCopy } from './convertCopy';
import type { MarketPair } from '../../types';
import type { ConvertAssetOption, ConvertQuote } from '../../types/convert';
import type { LanguageCode } from '../../../types';

const INTERNAL_PROVIDER_LABEL = 'OrbitX Convert';
const INTERNAL_SPREAD_PCT = Number((dexConstants.simulatedSlippage * 100).toFixed(2));
const INTERNAL_FEE_PCT = Number((dexConstants.feeRate * 100).toFixed(2));
const INTERNAL_MIN_USD = 5;

interface SpotBalanceLike {
  symbol: string;
  amount: number;
}

interface BuildConvertAssetsInput {
  markets: MarketPair[];
  spotBalances: SpotBalanceLike[];
  favoriteSymbols: string[];
  regionCode?: string;
}

interface ConvertServiceMessageSet {
  recommendedMinimum: (usdAmount: number) => string;
  marketMayMove: string;
  providerQuotePending: string;
  providerAvailability: string;
  providerFlowDisclaimer: string;
}

const CONVERT_SERVICE_MESSAGES: Record<LanguageCode, ConvertServiceMessageSet> = {
  en: {
    recommendedMinimum: (usdAmount) => `Recommended minimum: USD ${usdAmount.toFixed(2)}`,
    marketMayMove: 'The market can move while you confirm.',
    providerQuotePending: 'The exact quote will be confirmed by the external provider.',
    providerAvailability: 'Availability depends on provider KYC, region and payment method.',
    providerFlowDisclaimer:
      'OrbitX does not process fiat and will not mark this operation as completed until the provider confirms it.',
  },
  es: {
    recommendedMinimum: (usdAmount) => `Minimo recomendado: USD ${usdAmount.toFixed(2)}`,
    marketMayMove: 'El mercado puede moverse mientras confirmas.',
    providerQuotePending: 'La cotizacion exacta se confirmara con el proveedor externo.',
    providerAvailability: 'Disponible segun KYC, region y metodo del proveedor.',
    providerFlowDisclaimer:
      'OrbitX no procesa fiat ni marca esta operacion como completada hasta que el proveedor lo confirme.',
  },
  pt: {
    recommendedMinimum: (usdAmount) => `Minimo recomendado: USD ${usdAmount.toFixed(2)}`,
    marketMayMove: 'O mercado pode se mover enquanto voce confirma.',
    providerQuotePending: 'A cotacao exata sera confirmada pelo provedor externo.',
    providerAvailability: 'A disponibilidade depende de KYC, regiao e metodo do provedor.',
    providerFlowDisclaimer:
      'A OrbitX nao processa fiat nem marca esta operacao como concluida ate o provedor confirma-la.',
  },
  'zh-Hans': {
    recommendedMinimum: (usdAmount) => `建议最低金额：USD ${usdAmount.toFixed(2)}`,
    marketMayMove: '在你确认期间，市场价格可能会变化。',
    providerQuotePending: '最终报价将由外部提供商确认。',
    providerAvailability: '是否可用取决于提供商的 KYC、地区和支付方式。',
    providerFlowDisclaimer: 'OrbitX 不处理法币，只有在提供商确认后才会将此操作标记为完成。',
  },
  hi: {
    recommendedMinimum: (usdAmount) => `सुझाया गया न्यूनतम: USD ${usdAmount.toFixed(2)}`,
    marketMayMove: 'आपके पुष्टि करने तक बाज़ार बदल सकता है।',
    providerQuotePending: 'सटीक कोट बाहरी प्रदाता द्वारा पुष्टि किया जाएगा।',
    providerAvailability: 'उपलब्धता प्रदाता के KYC, क्षेत्र और भुगतान विधि पर निर्भर करती है।',
    providerFlowDisclaimer:
      'OrbitX fiat प्रोसेस नहीं करता और प्रदाता की पुष्टि से पहले इस ऑपरेशन को पूरा नहीं मानता।',
  },
  ru: {
    recommendedMinimum: (usdAmount) => `Рекомендуемый минимум: USD ${usdAmount.toFixed(2)}`,
    marketMayMove: 'Рынок может измениться, пока вы подтверждаете операцию.',
    providerQuotePending: 'Точная котировка будет подтверждена внешним провайдером.',
    providerAvailability: 'Доступность зависит от KYC, региона и способа оплаты у провайдера.',
    providerFlowDisclaimer:
      'OrbitX не обрабатывает fiat и не помечает операцию завершенной, пока провайдер не подтвердит ее.',
  },
  ar: {
    recommendedMinimum: (usdAmount) => `الحد الأدنى الموصى به: USD ${usdAmount.toFixed(2)}`,
    marketMayMove: 'قد يتحرك السوق أثناء تأكيدك للعملية.',
    providerQuotePending: 'سيتم تأكيد السعر النهائي من قبل المزود الخارجي.',
    providerAvailability: 'يعتمد التوفر على KYC والمنطقة وطريقة الدفع لدى المزود.',
    providerFlowDisclaimer:
      'لا تعالج OrbitX العملات الورقية ولا تعتبر العملية مكتملة حتى يؤكدها المزود.',
  },
  id: {
    recommendedMinimum: (usdAmount) => `Minimum yang disarankan: USD ${usdAmount.toFixed(2)}`,
    marketMayMove: 'Pasar bisa bergerak saat kamu mengonfirmasi.',
    providerQuotePending: 'Kutipan final akan dikonfirmasi oleh penyedia eksternal.',
    providerAvailability: 'Ketersediaan bergantung pada KYC, wilayah, dan metode pembayaran penyedia.',
    providerFlowDisclaimer:
      'OrbitX tidak memproses fiat dan tidak akan menandai operasi ini selesai sampai penyedia mengonfirmasinya.',
  },
};

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function getConvertServiceMessages(language: LanguageCode) {
  return CONVERT_SERVICE_MESSAGES[language] ?? CONVERT_SERVICE_MESSAGES.en;
}

function buildFiatAssets(regionCode?: string): ConvertAssetOption[] {
  const config = getRampConfig();
  const providerId = getRampPrimaryProvider();
  const providerLabel = getRampProviderLabel(providerId);
  const activeRegion = (regionCode ?? detectDeviceCountryCode()).toUpperCase();
  const regionAllowed =
    config.enabledCountries.length === 0 || config.enabledCountries.includes(activeRegion);
  const convertEnabled = isRampModeEnabled('convert');

  return config.enabledFiatCurrencies.map((fiatCode) => ({
    id: `fiat-${fiatCode.toLowerCase()}`,
    symbol: fiatCode.toUpperCase(),
    name: fiatCode.toUpperCase(),
    kind: 'fiat',
    balance: 0,
    providerLabel,
    availabilityLabel: regionAllowed && convertEnabled ? providerLabel : undefined,
    availableAsSource: false,
    availableAsDestination: regionAllowed && convertEnabled,
  }));
}

export function buildConvertAssetOptions({
  markets,
  spotBalances,
  favoriteSymbols,
  regionCode,
}: BuildConvertAssetsInput): ConvertAssetOption[] {
  const balanceMap = new Map(
    spotBalances.map((item) => [normalizeSymbol(item.symbol), item.amount]),
  );
  const seen = new Set<string>();

  const cryptoAssets = markets.reduce<ConvertAssetOption[]>((acc, pair) => {
      const symbol = normalizeSymbol(pair.baseSymbol);
      if (seen.has(symbol)) {
        return acc;
      }
      seen.add(symbol);

      acc.push({
        id: `crypto-${symbol.toLowerCase()}`,
        symbol,
        name: pair.coin.name,
        kind: 'crypto' as const,
        image: pair.image,
        networkLabel: pair.networkKey ?? 'spot',
        priceUsd: pair.price,
        balance: balanceMap.get(symbol) ?? 0,
        favorite: favoriteSymbols.includes(symbol),
        frequent: balanceMap.has(symbol),
        availableAsSource: (balanceMap.get(symbol) ?? 0) > 0,
        availableAsDestination: true,
      } satisfies ConvertAssetOption);

      return acc;
    }, []);

  const fiatAssets = buildFiatAssets(regionCode);
  return [...cryptoAssets, ...fiatAssets];
}

function getInternalPairRate(fromAsset: ConvertAssetOption, toAsset: ConvertAssetOption) {
  if (!fromAsset.priceUsd || !toAsset.priceUsd || toAsset.priceUsd <= 0) {
    return null;
  }

  return fromAsset.priceUsd / toAsset.priceUsd;
}

export function getDefaultConvertSelection(assets: ConvertAssetOption[]) {
  const source =
    assets.find((asset) => asset.kind === 'crypto' && asset.balance > 0 && asset.symbol === 'USDT') ??
    assets.find((asset) => asset.kind === 'crypto' && asset.balance > 0) ??
    assets.find((asset) => asset.kind === 'crypto') ??
    null;
  const target =
    assets.find((asset) => asset.kind === 'crypto' && asset.symbol === 'BTC') ??
    assets.find((asset) => asset.kind === 'crypto' && asset.symbol !== source?.symbol) ??
    null;

  return {
    sourceId: source?.id ?? null,
    targetId: target?.id ?? null,
  };
}

export async function getConvertQuote(
  fromAsset: ConvertAssetOption | null,
  toAsset: ConvertAssetOption | null,
  amount: number,
  language: LanguageCode,
  regionCode?: string,
): Promise<ConvertQuote> {
  const copy = getConvertCopy(language);
  const messages = getConvertServiceMessages(language);

  if (!fromAsset || !toAsset) {
    return {
      status: 'idle',
      executionKind: 'internal',
      fromAsset: fromAsset ?? ({
        id: 'empty',
        symbol: '--',
        name: '--',
        kind: 'crypto',
        balance: 0,
        availableAsSource: false,
        availableAsDestination: false,
      } satisfies ConvertAssetOption),
      toAsset: toAsset ?? ({
        id: 'empty',
        symbol: '--',
        name: '--',
        kind: 'crypto',
        balance: 0,
        availableAsSource: false,
        availableAsDestination: false,
      } satisfies ConvertAssetOption),
      fromAmount: amount,
      feePct: INTERNAL_FEE_PCT,
      spreadPct: INTERNAL_SPREAD_PCT,
      feeAmountUsd: 0,
      spreadAmountUsd: 0,
      providerLabel: INTERNAL_PROVIDER_LABEL,
      estimatedSeconds: 8,
      regionAllowed: true,
      canProceed: false,
    };
  }

  if (fromAsset.symbol === toAsset.symbol) {
    return {
      status: 'unavailable',
      executionKind: 'internal',
      fromAsset,
      toAsset,
      fromAmount: amount,
      feePct: INTERNAL_FEE_PCT,
      spreadPct: INTERNAL_SPREAD_PCT,
      feeAmountUsd: 0,
      spreadAmountUsd: 0,
      providerLabel: INTERNAL_PROVIDER_LABEL,
      estimatedSeconds: 8,
      regionAllowed: true,
      message: copy.sameAsset,
      canProceed: false,
    };
  }

  if (fromAsset.kind === 'fiat') {
    return {
      status: 'unavailable',
      executionKind: 'provider',
      fromAsset,
      toAsset,
      fromAmount: amount,
      feePct: 0,
      spreadPct: 0,
      feeAmountUsd: 0,
      spreadAmountUsd: 0,
      providerLabel: getRampProviderLabel(getRampPrimaryProvider()),
      estimatedSeconds: 0,
      regionAllowed: false,
      message: copy.unsupportedSourceFiat,
      canProceed: false,
    };
  }

  if (!amount || amount <= 0) {
    return {
      status: 'idle',
      executionKind: toAsset.kind === 'fiat' ? 'provider' : 'internal',
      fromAsset,
      toAsset,
      fromAmount: amount,
      feePct: INTERNAL_FEE_PCT,
      spreadPct: INTERNAL_SPREAD_PCT,
      feeAmountUsd: 0,
      spreadAmountUsd: 0,
      providerLabel:
        toAsset.kind === 'fiat'
          ? getRampProviderLabel(getRampPrimaryProvider())
          : INTERNAL_PROVIDER_LABEL,
      estimatedSeconds: toAsset.kind === 'fiat' ? 300 : 8,
      regionAllowed: true,
      canProceed: false,
    };
  }

  if (amount > fromAsset.balance) {
    return {
      status: 'error',
      executionKind: toAsset.kind === 'fiat' ? 'provider' : 'internal',
      fromAsset,
      toAsset,
      fromAmount: amount,
      feePct: INTERNAL_FEE_PCT,
      spreadPct: INTERNAL_SPREAD_PCT,
      feeAmountUsd: 0,
      spreadAmountUsd: 0,
      providerLabel:
        toAsset.kind === 'fiat'
          ? getRampProviderLabel(getRampPrimaryProvider())
          : INTERNAL_PROVIDER_LABEL,
      estimatedSeconds: toAsset.kind === 'fiat' ? 300 : 8,
      regionAllowed: true,
      message: copy.notEnoughBalance,
      canProceed: false,
    };
  }

  if (toAsset.kind === 'crypto') {
    const rate = getInternalPairRate(fromAsset, toAsset);
    if (!rate) {
      return {
        status: 'unavailable',
        executionKind: 'internal',
        fromAsset,
        toAsset,
        fromAmount: amount,
        feePct: INTERNAL_FEE_PCT,
        spreadPct: INTERNAL_SPREAD_PCT,
        feeAmountUsd: 0,
        spreadAmountUsd: 0,
        providerLabel: INTERNAL_PROVIDER_LABEL,
        estimatedSeconds: 8,
        regionAllowed: true,
        message: copy.noPairBody,
        canProceed: false,
      };
    }

    const grossUsd = amount * (fromAsset.priceUsd ?? 0);
    const grossTarget = amount * rate;
    const feeAmountUsd = Number(((grossUsd * INTERNAL_FEE_PCT) / 100).toFixed(4));
    const spreadAmountUsd = Number(((grossUsd * INTERNAL_SPREAD_PCT) / 100).toFixed(4));
    const feeInTarget = toAsset.priceUsd ? (feeAmountUsd + spreadAmountUsd) / toAsset.priceUsd : 0;
    const estimatedToAmount = Number(Math.max(grossTarget - feeInTarget, 0).toFixed(8));
    const warningLabel =
      grossUsd < INTERNAL_MIN_USD
        ? messages.recommendedMinimum(INTERNAL_MIN_USD)
        : Math.abs((fromAsset.priceUsd ?? 0) - (toAsset.priceUsd ?? 0)) > 20000
          ? messages.marketMayMove
          : undefined;

    return {
      status: 'ready',
      executionKind: 'internal',
      fromAsset,
      toAsset,
      fromAmount: amount,
      estimatedToAmount,
      estimatedRate: rate,
      feePct: INTERNAL_FEE_PCT,
      spreadPct: INTERNAL_SPREAD_PCT,
      feeAmountUsd,
      spreadAmountUsd,
      minimumSourceAmount: Number((INTERNAL_MIN_USD / Math.max(fromAsset.priceUsd ?? 1, 1)).toFixed(8)),
      providerLabel: INTERNAL_PROVIDER_LABEL,
      estimatedSeconds: 8,
      regionAllowed: true,
      warningLabel,
      disclaimer:
        language === 'es'
          ? 'El monto final puede variar ligeramente hasta confirmar.'
          : 'The final amount can vary slightly until you confirm.',
      canProceed: true,
    };
  }

  const providerId = getRampPrimaryProvider();
  const providerLabel = getRampProviderLabel(providerId);
  const config = getRampConfig();
  const grossUsd = amount * Math.max(fromAsset.priceUsd ?? 0, 0);
  const partnerFeeUsd = Number(((grossUsd * config.partnerFeePct) / 100).toFixed(2));
  const request = {
    mode: 'convert' as const,
    providerId,
    fiatCurrency: toAsset.symbol,
    cryptoCurrency: fromAsset.symbol,
    network: fromAsset.networkLabel ?? 'ethereum',
    fiatAmount: Number(grossUsd.toFixed(2)),
    walletAddress: undefined,
    countryCode: (regionCode ?? detectDeviceCountryCode()).toUpperCase(),
    paymentMethod: 'bank_transfer',
    language,
  };
  const availability = await getRampAvailability(request);

  const estimatedUsd =
    toAsset.symbol === 'USD' ? Number(Math.max(grossUsd - partnerFeeUsd, 0).toFixed(2)) : undefined;

  return {
    status: availability.available ? 'ready' : 'unavailable',
    executionKind: 'provider',
    fromAsset,
    toAsset,
    fromAmount: amount,
    estimatedToAmount: estimatedUsd,
    estimatedRate: fromAsset.priceUsd ?? undefined,
    feePct: config.partnerFeePct,
    spreadPct: 0,
    feeAmountUsd: partnerFeeUsd,
    spreadAmountUsd: 0,
    providerId,
    providerLabel,
    estimatedSeconds: 600,
    regionAllowed: availability.available,
    regionLabel: availability.reasonLabel,
    warningLabel: availability.available
      ? messages.providerAvailability
      : availability.reasonLabel,
    message: availability.available
      ? messages.providerQuotePending
      : availability.reasonLabel,
    disclaimer: messages.providerFlowDisclaimer,
    canProceed: availability.available,
    routeMode: 'convert',
  };
}

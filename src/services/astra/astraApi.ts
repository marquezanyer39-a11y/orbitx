import type {
  AstraAction,
  AstraActionAlias,
  AstraGuideId,
  AstraIntent,
  AstraMode,
  AstraResponse,
  AstraSupportContext,
} from '../../types/astra';
import type { AstraMemorySnapshot } from '../../types/astra';
import { pickLanguageText } from '../../../constants/i18n';
import { getAstraBackendBaseUrl, hasAstraBackend } from './astraRuntimeConfig';

type AstraBackendAction =
  | 'wallet_create'
  | 'wallet_open'
  | 'view_market'
  | 'go_trade'
  | 'create_memecoin'
  | 'open_profile'
  | 'find_user_id'
  | 'get_started'
  | 'diagnose_issue'
  | 'connect_exchange'
  | 'open_bot_futures'
  | 'open_social'
  | 'review_security'
  | 'buy_crypto'
  | 'sell_crypto';

type AstraBackendMood = 'normal' | 'warning' | 'critical';

interface BackendAstraResponsePayload {
  reply: string;
  actions: AstraBackendAction[];
  mood: AstraBackendMood;
}

interface BackendEnvelope<T> {
  success: boolean;
  data: T;
}

interface RequestAstraBrainResponseInput {
  question: string;
  context: AstraSupportContext;
  memory: AstraMemorySnapshot;
  channel?: 'text' | 'voice';
  snapshot: {
    userId: string;
    username: string;
    language: AstraSupportContext['language'];
    hasWallet: boolean;
    isVerified: boolean;
    hasFunds: boolean;
    portfolioValue: number;
  };
}

const DEFAULT_TIMEOUT_MS = 18_000;
const TRANSIENT_RETRY_DELAY_MS = 700;

function mapLanguage(language: AstraSupportContext['language']) {
  switch (language) {
    case 'es':
      return 'ES';
    case 'pt':
      return 'PT';
    case 'zh-Hans':
      return 'ZH';
    case 'hi':
      return 'HI';
    case 'ru':
      return 'RU';
    case 'ar':
      return 'AR';
    case 'id':
      return 'ID';
    default:
      return 'EN';
  }
}

function actionText(
  language: AstraSupportContext['language'],
  values: Partial<Record<AstraSupportContext['language'], string>>,
) {
  return pickLanguageText(language, values, 'en');
}

function mapScreen(surface: AstraSupportContext['surface']) {
  switch (surface) {
    case 'create_token':
      return 'create_token';
    case 'home':
    case 'wallet':
    case 'trade':
    case 'profile':
    case 'pool':
    case 'ramp':
    case 'market':
    case 'social':
    case 'security':
    case 'settings':
      return surface;
    case 'bot_futures':
      return 'bot_futures';
    case 'error':
      return 'general';
    default:
      return 'general';
  }
}

function getSelectedToken(context: AstraSupportContext) {
  if (!context.currentPairSymbol) {
    return null;
  }

  return context.currentPairSymbol.split('/')[0] ?? context.currentPairSymbol;
}

function createFrontendAction(
  id: string,
  label: string,
  kind: AstraAction['kind'],
  icon: string,
  extra: Partial<AstraAction> = {},
): AstraAction {
  return {
    id,
    label,
    kind,
    icon,
    tone: extra.tone ?? 'secondary',
    ...extra,
  };
}

function mapActionAliasToFrontendAction(
  action: AstraBackendAction,
  language: AstraSupportContext['language'],
): AstraAction | null {
  switch (action) {
    case 'wallet_create':
      return createFrontendAction(
        'astra-wallet-create',
        actionText(language, {
          en: 'Create wallet',
          es: 'Crear wallet',
          pt: 'Criar wallet',
          'zh-Hans': '\u521b\u5efa wallet',
          hi: 'Wallet \u092c\u0928\u093e\u090f\u0901',
          ru: '\u0421\u043e\u0437\u0434\u0430\u0442\u044c wallet',
          ar: '\u0625\u0646\u0634\u0627\u0621 wallet',
          id: 'Buat wallet',
        }),
        'open_screen',
        'wallet-outline',
        {
          tone: 'primary',
          targetScreen: 'wallet_create',
          guideId: 'create_wallet',
        },
      );
    case 'wallet_open':
      return createFrontendAction(
        'astra-wallet-open',
        actionText(language, {
          en: 'Open wallet',
          es: 'Abrir billetera',
          pt: 'Abrir carteira',
          'zh-Hans': '\u6253\u5f00\u94b1\u5305',
          hi: '\u0935\u0949\u0932\u0947\u091f \u0916\u094b\u0932\u0947\u0902',
          ru: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043a\u043e\u0448\u0435\u043b\u0435\u043a',
          ar: '\u0641\u062a\u062d \u0627\u0644\u0645\u062d\u0641\u0638\u0629',
          id: 'Buka wallet',
        }),
        'open_screen',
        'wallet-outline',
        {
          tone: 'primary',
          targetScreen: 'wallet',
        },
      );
    case 'view_market':
      return createFrontendAction(
        'astra-view-market',
        actionText(language, {
          en: 'View market',
          es: 'Ver mercado',
          pt: 'Ver mercado',
          'zh-Hans': '\u67e5\u770b\u5e02\u573a',
          hi: '\u092c\u093e\u091c\u093e\u0930 \u0926\u0947\u0916\u0947\u0902',
          ru: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0440\u044b\u043d\u043e\u043a',
          ar: '\u0639\u0631\u0636 \u0627\u0644\u0633\u0648\u0642',
          id: 'Lihat pasar',
        }),
        'open_screen',
        'stats-chart-outline',
        {
          targetScreen: 'markets',
        },
      );
    case 'go_trade':
      return createFrontendAction(
        'astra-go-trade',
        actionText(language, {
          en: 'Go to trade',
          es: 'Ir a operar',
          pt: 'Ir para trade',
          'zh-Hans': '\u53bb\u4ea4\u6613',
          hi: '\u091f\u094d\u0930\u0947\u0921 \u092a\u0930 \u091c\u093e\u090f\u0902',
          ru: '\u041f\u0435\u0440\u0435\u0439\u0442\u0438 \u043a \u0442\u043e\u0440\u0433\u043e\u0432\u043b\u0435',
          ar: '\u0627\u0630\u0647\u0628 \u0625\u0644\u0649 \u0627\u0644\u062a\u062f\u0627\u0648\u0644',
          id: 'Buka trade',
        }),
        'open_screen',
        'swap-horizontal-outline',
        {
          tone: 'primary',
          targetScreen: 'trade',
          guideId: 'spot_trade',
        },
      );
    case 'create_memecoin':
      return createFrontendAction(
        'astra-create-memecoin',
        actionText(language, { en: 'Create memecoin', es: 'Crear memecoin', pt: 'Criar memecoin', 'zh-Hans': '\u521b\u5efa memecoin', hi: 'Memecoin \u092c\u0928\u093e\u090f\u0901', ru: '\u0421\u043e\u0437\u0434\u0430\u0442\u044c memecoin', ar: '\u0625\u0646\u0634\u0627\u0621 memecoin', id: 'Buat memecoin' }),
        'open_screen',
        'rocket-outline',
        {
          tone: 'primary',
          targetScreen: 'create_token',
        },
      );
    case 'open_profile':
      return createFrontendAction(
        'astra-open-profile',
        actionText(language, { en: 'Open profile', es: 'Abrir perfil', pt: 'Abrir perfil', 'zh-Hans': '\u6253\u5f00\u4e2a\u4eba\u8d44\u6599', hi: '\u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932 \u0916\u094b\u0932\u0947\u0902', ru: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043f\u0440\u043e\u0444\u0438\u043b\u044c', ar: '\u0641\u062a\u062d \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062e\u0635\u064a', id: 'Buka profil' }),
        'open_screen',
        'person-outline',
        {
          targetScreen: 'profile',
        },
      );
    case 'find_user_id':
      return createFrontendAction(
        'astra-find-user-id',
        actionText(language, { en: 'Find my ID', es: 'Buscar mi ID', pt: 'Buscar meu ID', 'zh-Hans': '\u67e5\u627e\u6211\u7684 ID', hi: '\u092e\u0947\u0930\u093e ID \u0922\u0942\u0902\u0922\u0947\u0902', ru: '\u041d\u0430\u0439\u0442\u0438 \u043c\u043e\u0439 ID', ar: '\u0627\u0628\u062d\u062b \u0639\u0646 \u0645\u0639\u0631\u0641\u064a', id: 'Cari ID saya' }),
        'open_screen',
        'id-card-outline',
        {
          tone: 'primary',
          targetScreen: 'profile',
        },
      );
    case 'get_started':
      return createFrontendAction(
        'astra-get-started',
        actionText(language, { en: 'Get started', es: 'Empezar', pt: 'Comecar', 'zh-Hans': '\u5f00\u59cb', hi: '\u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902', ru: '\u041d\u0430\u0447\u0430\u0442\u044c', ar: '\u0627\u0628\u062f\u0623', id: 'Mulai' }),
        'resolve_with_astra',
        'sparkles-outline',
        {
          tone: 'primary',
        },
      );
    case 'diagnose_issue':
      return createFrontendAction(
        'astra-diagnose-issue',
        actionText(language, { en: 'Diagnose issue', es: 'Diagnosticar problema', pt: 'Diagnosticar problema', 'zh-Hans': '\u8bca\u65ad\u95ee\u9898', hi: '\u0938\u092e\u0938\u094d\u092f\u093e \u0915\u093e \u0928\u093f\u0926\u093e\u0928 \u0915\u0930\u0947\u0902', ru: '\u0414\u0438\u0430\u0433\u043d\u043e\u0441\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043f\u0440\u043e\u0431\u043b\u0435\u043c\u0443', ar: '\u0634\u062e\u0635 \u0627\u0644\u0645\u0634\u0643\u0644\u0629', id: 'Diagnosa masalah' }),
        'resolve_with_astra',
        'bug-outline',
        {
          tone: 'primary',
          guideId: 'resolve_error',
        },
      );
    case 'connect_exchange':
      return createFrontendAction(
        'astra-connect-exchange',
        actionText(language, { en: 'Connect exchange', es: 'Conectar exchange', pt: 'Conectar exchange', 'zh-Hans': '\u8fde\u63a5 exchange', hi: 'Exchange \u0915\u0928\u0947\u0915\u094d\u091f \u0915\u0930\u0947\u0902', ru: '\u041f\u043e\u0434\u043a\u043b\u044e\u0447\u0438\u0442\u044c exchange', ar: '\u0631\u0628\u0637 exchange', id: 'Hubungkan exchange' }),
        'open_screen',
        'link-outline',
        {
          tone: 'primary',
          targetScreen: 'bot_futures_connect_exchange',
        },
      );
    case 'open_bot_futures':
      return createFrontendAction(
        'astra-open-bot-futures',
        actionText(language, { en: 'Open Bot Futures', es: 'Abrir Bot Futures', pt: 'Abrir Bot Futures', 'zh-Hans': '\u6253\u5f00 Bot Futures', hi: 'Bot Futures \u0916\u094b\u0932\u0947\u0902', ru: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c Bot Futures', ar: '\u0641\u062a\u062d Bot Futures', id: 'Buka Bot Futures' }),
        'open_screen',
        'flash-outline',
        {
          targetScreen: 'bot_futures',
        },
      );
    case 'open_social':
      return createFrontendAction(
        'astra-open-social',
        actionText(language, { en: 'Open Social', es: 'Abrir Social', pt: 'Abrir Social', 'zh-Hans': '\u6253\u5f00 Social', hi: 'Social \u0916\u094b\u0932\u0947\u0902', ru: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c Social', ar: '\u0641\u062a\u062d Social', id: 'Buka Social' }),
        'open_screen',
        'people-outline',
        {
          targetScreen: 'social',
        },
      );
    case 'review_security':
      return createFrontendAction(
        'astra-review-security',
        actionText(language, { en: 'Review security', es: 'Revisar seguridad', pt: 'Revisar seguranca', 'zh-Hans': '\u68c0\u67e5\u5b89\u5168', hi: 'Security \u0930\u093f\u0935\u094d\u092f\u0942 \u0915\u0930\u0947\u0902', ru: '\u041f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c \u0431\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u043e\u0441\u0442\u044c', ar: '\u0631\u0627\u062c\u0639 \u0627\u0644\u0623\u0645\u0627\u0646', id: 'Tinjau keamanan' }),
        'open_screen',
        'shield-checkmark-outline',
        {
          tone: 'primary',
          targetScreen: 'security',
          guideId: 'activate_security',
        },
      );
    case 'buy_crypto':
      return createFrontendAction(
        'astra-buy-crypto',
        actionText(language, { en: 'Buy crypto', es: 'Comprar crypto', pt: 'Comprar crypto', 'zh-Hans': '\u8d2d\u4e70 crypto', hi: 'Crypto \u0916\u0930\u0940\u0926\u0947\u0902', ru: '\u041a\u0443\u043f\u0438\u0442\u044c crypto', ar: '\u0634\u0631\u0627\u0621 crypto', id: 'Beli crypto' }),
        'open_screen',
        'add-circle-outline',
        {
          tone: 'primary',
          targetScreen: 'ramp_buy',
          guideId: 'buy_crypto',
        },
      );
    case 'sell_crypto':
      return createFrontendAction(
        'astra-sell-crypto',
        actionText(language, { en: 'Sell crypto', es: 'Vender crypto', pt: 'Vender crypto', 'zh-Hans': '\u51fa\u552e crypto', hi: 'Crypto \u092c\u0947\u091a\u0947\u0902', ru: '\u041f\u0440\u043e\u0434\u0430\u0442\u044c crypto', ar: '\u0628\u064a\u0639 crypto', id: 'Jual crypto' }),
        'open_screen',
        'remove-circle-outline',
        {
          targetScreen: 'ramp_sell',
          guideId: 'sell_crypto',
        },
      );
    default:
      return null;
  }
}

function mapActionsToIntent(actions: AstraBackendAction[]): AstraIntent {
  if (actions.includes('diagnose_issue')) {
    return 'error_resolution';
  }

  if (actions.includes('review_security')) {
    return 'security';
  }

  if (
    actions.includes('wallet_create') ||
    actions.includes('go_trade') ||
    actions.includes('buy_crypto') ||
    actions.includes('sell_crypto') ||
    actions.includes('connect_exchange')
  ) {
    return 'direct_action';
  }

  if (actions.includes('get_started')) {
    return 'guided_help';
  }

  if (
    actions.includes('view_market') ||
    actions.includes('open_social') ||
    actions.includes('open_bot_futures')
  ) {
    return 'context';
  }

  return 'general';
}

function mapMoodToMode(
  mood: AstraBackendMood,
  actions: AstraBackendAction[],
): AstraMode {
  if (mood === 'critical') {
    return 'error';
  }

  if (actions.includes('get_started') || actions.includes('wallet_create')) {
    return 'guided';
  }

  if (mood === 'warning') {
    return 'context';
  }

  return 'quick';
}

function inferGuideId(actions: AstraAction[]): AstraGuideId | undefined {
  return actions.find((action) => action.guideId)?.guideId;
}

function deriveActionAliases(actions: AstraBackendAction[]): AstraActionAlias[] {
  return actions.filter(
    (action): action is AstraActionAlias =>
      action === 'create_memecoin' || action === 'view_market',
  );
}

async function postJson<TResponse>(
  path: string,
  body: Record<string, unknown>,
  headers?: Record<string, string>,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<TResponse> {
  const baseUrl = getAstraBackendBaseUrl();
  if (!baseUrl) {
    throw new Error('OrbitX backend is not configured.');
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      const payload = (await response.json().catch(() => null)) as
        | BackendEnvelope<TResponse>
        | { error?: { message?: string }; message?: string }
        | null;

      if (!response.ok) {
        const errorMessage =
          payload && 'error' in payload
            ? payload.error?.message ?? payload.message ?? 'Astra backend request failed.'
            : 'Astra backend request failed.';
        throw new Error(errorMessage);
      }

      if (!payload || typeof payload !== 'object' || !('data' in payload)) {
        throw new Error('Astra backend returned an invalid payload.');
      }

      return payload.data;
    } catch (error) {
      const isAbortError = error instanceof Error && error.name === 'AbortError';
      const isNetworkError = error instanceof TypeError;
      const canRetry = attempt === 0 && (isAbortError || isNetworkError);

      if (canRetry) {
        await new Promise<void>((resolve) => {
          setTimeout(resolve, TRANSIENT_RETRY_DELAY_MS);
        });
        continue;
      }

      if (isAbortError) {
        throw new Error('Astra backend request timed out.');
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error('Astra backend request failed.');
}

export function hasAstraBrainBackend() {
  return hasAstraBackend();
}

export async function requestAstraBrainResponse(
  input: RequestAstraBrainResponseInput,
): Promise<AstraResponse> {
  const userId = input.snapshot.userId.trim();
  if (!userId) {
    throw new Error('Astra could not identify the current user.');
  }

  const response = await postJson<BackendAstraResponsePayload>(
    '/api/astra/chat',
    {
      userId,
      screen: mapScreen(input.context.surface),
      language: mapLanguage(input.snapshot.language),
      channel: input.channel ?? 'text',
      username: input.snapshot.username,
      hasWallet: input.snapshot.hasWallet,
      isVerified: input.snapshot.isVerified,
      hasFunds: input.snapshot.hasFunds,
      portfolioValue: input.snapshot.portfolioValue,
      selectedToken: getSelectedToken(input.context),
      recentIntent: input.memory.lastIntent ?? undefined,
      lastRoute: input.context.path,
      errorTitle: input.context.errorTitle,
      errorBody: input.context.errorBody,
      twoFactorEnabled: input.context.twoFactorEnabled,
      activeSessionsCount: input.context.activeSessionsCount,
      autoLockMinutes: input.context.autoLockMinutes,
      message: input.question,
      context: {
        surface: input.context.surface,
        path: input.context.path,
        screenName: input.context.screenName,
        summary: input.context.summary,
        currentTask: input.context.currentTask,
        currentPairSymbol: input.context.currentPairSymbol,
        currentPriceLabel: input.context.currentPriceLabel,
        selectedEntity: input.context.selectedEntity,
        uiState: input.context.uiState,
        userState: input.context.userState,
        capabilities: input.context.capabilities,
        labels: input.context.labels,
        walletReady: input.context.walletReady,
        walletStatusLabel: input.context.walletStatusLabel,
        seedBackedUp: input.context.seedBackedUp,
        externalWalletConnected: input.context.externalWalletConnected,
        emailVerified: input.context.emailVerified,
        accountStatusLabel: input.context.accountStatusLabel,
        balanceLabel: input.context.balanceLabel,
        spotBalanceLabel: input.context.spotBalanceLabel,
        web3BalanceLabel: input.context.web3BalanceLabel,
        botEnabled: input.context.botEnabled,
        botRiskLabel: input.context.botRiskLabel,
        botTokenLabel: input.context.botTokenLabel,
        botStatusLabel: input.context.botStatusLabel,
        botAllocationLabel: input.context.botAllocationLabel,
        botDailyPnlLabel: input.context.botDailyPnlLabel,
        botMaxTradesLabel: input.context.botMaxTradesLabel,
        rampMode: input.context.rampMode,
        rampProviderLabel: input.context.rampProviderLabel,
        currentThemeLabel: input.context.currentThemeLabel,
        usageMode: input.context.usageMode,
        poolStatusLabel: input.context.poolStatusLabel,
        poolAmountLabel: input.context.poolAmountLabel,
        poolTargetLabel: input.context.poolTargetLabel,
        poolTimeRemainingLabel: input.context.poolTimeRemainingLabel,
        poolUserParticipationLabel: input.context.poolUserParticipationLabel,
        poolEstimatedPositionLabel: input.context.poolEstimatedPositionLabel,
      },
    },
    {
      'x-user-id': userId,
    },
  );

  const actions = response.actions
    .map((action) => mapActionAliasToFrontendAction(action, input.context.language))
    .filter((action): action is AstraAction => Boolean(action));

  return {
    mode: mapMoodToMode(response.mood, response.actions),
    intent: mapActionsToIntent(response.actions),
    title: 'Astra',
    body: response.reply,
    actions,
    actionAliases: deriveActionAliases(response.actions),
    guideId: inferGuideId(actions),
  };
}

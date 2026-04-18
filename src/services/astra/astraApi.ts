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

const DEFAULT_TIMEOUT_MS = 12_000;

function mapLanguage(language: AstraSupportContext['language']) {
  return language === 'es' ? 'ES' : 'EN';
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
      return surface;
    case 'bot_futures':
      return 'bot_futures';
    case 'settings':
      return 'general';
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
  const es = language === 'es';

  switch (action) {
    case 'wallet_create':
      return createFrontendAction(
        'astra-wallet-create',
        es ? 'Crear wallet' : 'Create wallet',
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
        es ? 'Abrir billetera' : 'Open wallet',
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
        es ? 'Ver mercado' : 'View market',
        'open_screen',
        'stats-chart-outline',
        {
          targetScreen: 'markets',
        },
      );
    case 'go_trade':
      return createFrontendAction(
        'astra-go-trade',
        es ? 'Ir a operar' : 'Go to trade',
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
        es ? 'Crear memecoin' : 'Create memecoin',
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
        es ? 'Abrir perfil' : 'Open profile',
        'open_screen',
        'person-outline',
        {
          targetScreen: 'profile',
        },
      );
    case 'find_user_id':
      return createFrontendAction(
        'astra-find-user-id',
        es ? 'Buscar mi ID' : 'Find my ID',
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
        es ? 'Empezar' : 'Get started',
        'resolve_with_astra',
        'sparkles-outline',
        {
          tone: 'primary',
        },
      );
    case 'diagnose_issue':
      return createFrontendAction(
        'astra-diagnose-issue',
        es ? 'Diagnosticar problema' : 'Diagnose issue',
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
        es ? 'Conectar exchange' : 'Connect exchange',
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
        es ? 'Abrir Bot Futures' : 'Open Bot Futures',
        'open_screen',
        'flash-outline',
        {
          targetScreen: 'bot_futures',
        },
      );
    case 'open_social':
      return createFrontendAction(
        'astra-open-social',
        es ? 'Abrir Social' : 'Open Social',
        'open_screen',
        'people-outline',
        {
          targetScreen: 'social',
        },
      );
    case 'review_security':
      return createFrontendAction(
        'astra-review-security',
        es ? 'Revisar seguridad' : 'Review security',
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
        es ? 'Comprar crypto' : 'Buy crypto',
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
        es ? 'Vender crypto' : 'Sell crypto',
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
  } finally {
    clearTimeout(timeoutId);
  }
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
        screenName: input.context.screenName,
        summary: input.context.summary,
        botEnabled: input.context.botEnabled,
        botRiskLabel: input.context.botRiskLabel,
        botTokenLabel: input.context.botTokenLabel,
        botStatusLabel: input.context.botStatusLabel,
        botAllocationLabel: input.context.botAllocationLabel,
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

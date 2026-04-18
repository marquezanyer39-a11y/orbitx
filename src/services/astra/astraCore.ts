import type {
  AstraAction,
  AstraLanguage,
  AstraMessage,
  AstraResponse,
  AstraSupportContext,
  AstraSurface,
} from '../../types/astra';

const SURFACE_LABELS: Record<'en' | 'es', Record<AstraSurface, string>> = {
  en: {
    home: 'Home',
    profile: 'Profile',
    wallet: 'Wallet',
    trade: 'Trade',
    pool: 'Monthly Pool',
    ramp: 'Ramp',
    error: 'Issue',
    general: 'OrbitX',
    market: 'Markets',
    social: 'Social',
    create_token: 'Create token',
    bot_futures: 'Bot Futures',
    security: 'Security',
    settings: 'Settings',
  },
  es: {
    home: 'Inicio',
    profile: 'Perfil',
    wallet: 'Billetera',
    trade: 'Operar',
    pool: 'Pool mensual',
    ramp: 'Ramp',
    error: 'Problema',
    general: 'OrbitX',
    market: 'Mercados',
    social: 'Social',
    create_token: 'Crear token',
    bot_futures: 'Bot Futures',
    security: 'Seguridad',
    settings: 'Ajustes',
  },
};

function isSpanish(language: AstraLanguage) {
  return language === 'es';
}

function t(language: AstraLanguage, spanishText: string, englishText: string) {
  return isSpanish(language) ? spanishText : englishText;
}

export function getLocalizedAstraSurfaceLabel(
  language: AstraLanguage,
  surface: AstraSurface,
) {
  return SURFACE_LABELS[isSpanish(language) ? 'es' : 'en'][surface];
}

export function createAstraMessage(
  role: AstraMessage['role'],
  text: string,
  response?: AstraResponse,
): AstraMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    role,
    text,
    createdAt: new Date().toISOString(),
    helpful: null,
    response,
  };
}

function createAction(
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

export function buildAstraBootstrapResponse(
  context: AstraSupportContext,
): AstraResponse {
  const language = context.language;
  const screenLabel =
    context.screenName ?? getLocalizedAstraSurfaceLabel(language, context.surface);

  const baseIntro = (() => {
    switch (context.surface) {
      case 'wallet':
        return context.walletReady
          ? t(
              language,
              'Estoy contigo en Billetera. Puedo ayudarte a revisar saldo, seguridad o el siguiente paso para mover fondos con claridad.',
              'I am with you in Wallet. I can help you review balances, security or the next step to move funds clearly.',
            )
          : t(
              language,
              'Estoy contigo en Billetera. El siguiente paso mas util es crear o importar tu wallet y luego revisar Seguridad.',
              'I am with you in Wallet. The most useful next step is to create or import your wallet and then review Security.',
            );
      case 'trade':
        return t(
          language,
          'Estoy en Operar contigo. Puedo ayudarte a interpretar el flujo Spot, abrir un par o movernos a Mercados.',
          'I am in Trade with you. I can help you understand the Spot flow, open a pair or move to Markets.',
        );
      case 'market':
        return t(
          language,
          'Estoy en Mercados contigo. Puedo ayudarte a ubicar el mejor siguiente paso entre contexto de mercado, pares y entrada a Spot.',
          'I am in Markets with you. I can help you choose the best next step between market context, pairs and Spot entry.',
        );
      case 'social':
        return t(
          language,
          'Estoy en Social contigo. Si quieres, te ayudo a entender el feed, tu perfil o como moverte entre contenido y mercado.',
          'I am in Social with you. If you want, I can help you understand the feed, your profile or how to move between content and market.',
        );
      case 'create_token':
        return t(
          language,
          'Estoy dentro de crear token. Puedo ayudarte con nombre, supply, imagen y con la opcion de crear imagen con Astra si quieres preparar un meme visual sin salir del flujo.',
          'I am inside the token creation flow. I can help you with name, supply, image and the Astra image option if you want to prepare a visual meme without leaving the flow.',
        );
      case 'bot_futures':
        return t(
          language,
          'Estoy dentro de Bot Futures. Puedo ayudarte con el command center, exchange, riesgo y el siguiente paso operativo sin inventar estados.',
          'I am inside Bot Futures. I can help you with the command center, exchange, risk and the next operational step without inventing states.',
        );
      case 'security':
        return t(
          language,
          'Estoy en Seguridad contigo. Puedo ayudarte a revisar protecciones, sesiones activas y el siguiente paso seguro dentro de OrbitX.',
          'I am in Security with you. I can help you review protections, active sessions and the next safe step inside OrbitX.',
        );
      default:
        return t(
          language,
          `Estoy en ${screenLabel} contigo. Dime que quieres hacer y te guio al siguiente paso real dentro de OrbitX.`,
          `I am in ${screenLabel} with you. Tell me what you want to do and I will guide you to the next real step inside OrbitX.`,
        );
    }
  })();

  const actions: AstraAction[] = [];

  if (!context.walletReady) {
    actions.push(
      createAction(
        'astra-bootstrap-wallet-create',
        t(language, 'Crear wallet', 'Create wallet'),
        'open_screen',
        'wallet-outline',
        { tone: 'primary', targetScreen: 'wallet_create' },
      ),
    );
  } else {
    actions.push(
      createAction(
        'astra-bootstrap-wallet-open',
        t(language, 'Abrir billetera', 'Open wallet'),
        'open_screen',
        'wallet-outline',
        { tone: 'primary', targetScreen: 'wallet' },
      ),
    );
  }

  actions.push(
    createAction(
      'astra-bootstrap-market',
      t(language, 'Ver mercado', 'View market'),
      'open_screen',
      'stats-chart-outline',
      { targetScreen: 'markets' },
    ),
  );

  if (context.surface !== 'trade') {
    actions.push(
      createAction(
        'astra-bootstrap-trade',
        t(language, 'Ir a operar', 'Go to trade'),
        'open_screen',
        'swap-horizontal-outline',
        { targetScreen: 'trade' },
      ),
    );
  }

  if (context.surface === 'social') {
    actions.push(
      createAction(
        'astra-bootstrap-profile',
        t(language, 'Abrir perfil', 'Open profile'),
        'open_screen',
        'person-outline',
        { targetScreen: 'profile' },
      ),
    );
  }

  if (context.surface === 'create_token') {
    actions.push(
      createAction(
        'astra-bootstrap-create-token-market',
        t(language, 'Ver mercado', 'View market'),
        'open_screen',
        'stats-chart-outline',
        { targetScreen: 'markets' },
      ),
    );
  }

  if (context.surface === 'bot_futures') {
    actions.push(
      createAction(
        'astra-bootstrap-bot-futures',
        t(language, 'Conectar exchange', 'Connect exchange'),
        'open_screen',
        'link-outline',
        { targetScreen: 'bot_futures_connect_exchange' as AstraAction['targetScreen'] },
      ),
    );
  }

  return {
    mode: 'context',
    intent: 'context',
    title: 'Astra',
    body: baseIntro,
    actions: actions.slice(0, 4),
  };
}

function buildAstraRetryAction(
  language: AstraLanguage,
  retryQuestion?: string,
): AstraAction | null {
  const normalizedQuestion = `${retryQuestion ?? ''}`.trim();
  if (!normalizedQuestion) {
    return null;
  }

  return createAction(
    'astra-retry-request',
    t(language, 'Reintentar', 'Retry'),
    'resolve_with_astra',
    'refresh-outline',
    {
      tone: 'primary',
      helper: normalizedQuestion,
    },
  );
}

export function buildAstraUnavailableResponse(options: {
  context: AstraSupportContext;
  channel?: 'text' | 'voice';
  reason?: string;
  retryQuestion?: string;
}): AstraResponse {
  const { context, channel = 'text', reason, retryQuestion } = options;
  const language = context.language;
  const safeReason = `${reason ?? ''}`.trim();
  const isConfigIssue =
    safeReason.includes('GEMINI_API_KEY') ||
    safeReason.toLowerCase().includes('not configured');
  const shortText = isConfigIssue
    ? t(
        language,
        'Astra no esta configurada por completo en este entorno.',
        'Astra is not fully configured in this environment.',
      )
    : t(
        language,
        'Astra no esta disponible ahora mismo. Intenta de nuevo en unos segundos.',
        'Astra is not available right now. Try again in a few seconds.',
      );
  const longText = isConfigIssue
    ? t(
        language,
        'Astra no esta configurada por completo en este entorno. Revisa la configuracion del backend y vuelve a intentarlo.',
        'Astra is not fully configured in this environment. Review the backend configuration and try again.',
      )
    : t(
        language,
        'Astra no esta disponible ahora mismo. Puedes reintentar en unos segundos o seguir usando el modulo actual mientras recuperamos la conexion.',
        'Astra is not available right now. You can retry in a few seconds or keep using the current module while the connection recovers.',
      );
  const retryAction = buildAstraRetryAction(language, retryQuestion);
  const safeActions = buildAstraBootstrapResponse(context).actions.slice(0, 2);

  return {
    mode: 'error',
    intent: 'error_resolution',
    title: 'Astra',
    body: channel === 'voice' ? shortText : longText,
    actions: retryAction ? [retryAction, ...safeActions] : safeActions,
  };
}

import {
  buildAstraMemorySummary,
  appendAstraMemoryTurn,
  updateAstraMemoryFacts,
} from './astra-memory.js';
import { buildAstraMasterPrompt, buildAstraUserPrompt } from './astra-prompt.js';
import { runAstraTools } from './astra-tools.js';
import { runAstraGuards } from './astra-guards.js';
import {
  AstraSystemError,
  buildStructuredResponse,
  createAstraResponseSchema,
} from './astra-schemas.js';
import { generateGeminiStructuredJson } from './gemini-client.js';

function normalizeInput(input) {
  return {
    userId: `${input.userId ?? input.username ?? 'guest'}`.trim() || 'guest',
    sessionId: `${input.sessionId ?? 'default'}`.trim() || 'default',
    message: `${input.message ?? ''}`.replace(/\s+/g, ' ').trim().slice(0, 900),
    screen: input.screen ?? 'general',
    language: input.language ?? 'ES',
    channel: input.channel === 'voice' ? 'voice' : 'text',
    username: input.username ?? 'Usuario',
    hasWallet: Boolean(input.hasWallet),
    isVerified: Boolean(input.isVerified),
    hasFunds: Boolean(input.hasFunds),
    portfolioValue: Number(input.portfolioValue ?? 0),
    selectedToken: input.selectedToken ?? null,
    recentIntent: input.recentIntent ?? null,
    lastRoute: input.lastRoute ?? 'unknown',
    errorTitle: input.errorTitle ?? null,
    errorBody: input.errorBody ?? null,
    twoFactorEnabled: input.twoFactorEnabled ?? null,
    activeSessionsCount: input.activeSessionsCount ?? null,
    autoLockMinutes: input.autoLockMinutes ?? null,
  };
}

function detectIntent(message) {
  const text = `${message ?? ''}`.toLowerCase();

  if (text.includes('hola') || text.includes('buenas') || text.includes('hello')) {
    return 'greeting';
  }

  if (text.includes('no se') || text.includes('perdido') || text.includes('lost')) {
    return 'lost';
  }

  if (text.includes('seguridad') || text.includes('security') || text.includes('2fa')) {
    return 'security';
  }

  if (text.includes('error') || text.includes('bug') || text.includes('crash') || text.includes('falla')) {
    return 'diagnostic';
  }

  if (/\b(user id|orbit id|mi id|my id|id)\b/.test(text)) {
    return 'user_id';
  }

  if (text.includes('deposit') || text.includes('deposito') || text.includes('retiro') || text.includes('withdraw')) {
    return 'wallet_ops';
  }

  if (text.includes('wallet') || text.includes('billetera')) {
    return 'wallet';
  }

  if (text.includes('meme') || text.includes('token')) {
    return 'memecoin';
  }

  if (text.includes('precio') || text.includes('mercado') || text.includes('price') || text.includes('market')) {
    return 'market';
  }

  if (text.includes('operar') || text.includes('trade')) {
    return 'trade';
  }

  if (text.includes('social') || text.includes('feed') || text.includes('post')) {
    return 'social';
  }

  if (text.includes('bot') || text.includes('futures') || text.includes('exchange')) {
    return 'bot_futures';
  }

  return 'general';
}

function isSpanish(language) {
  return `${language ?? ''}`.toUpperCase() === 'ES';
}

function t(language, spanishText, englishText) {
  return isSpanish(language) ? spanishText : englishText;
}

function withChannelTone(input, longText, shortText) {
  return input.channel === 'voice' ? shortText : longText;
}

function isConceptQuestion(text) {
  const normalized = `${text ?? ''}`
    .toLowerCase()
    .replace(/quã©|quÃ©/g, 'que')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?]/g, '')
    .trim();

  const definitionLead =
    normalized.startsWith('que ') ||
    normalized.startsWith('qu ') ||
    normalized.startsWith('what ') ||
    normalized.includes('explica') ||
    normalized.includes('explain') ||
    normalized.includes('define') ||
    normalized.includes('significa');

  return definitionLead;
}

function shouldPreferDeterministicResponse(input, intent) {
  const normalized = `${input.message ?? ''}`
    .toLowerCase()
    .replace(/quã©|quÃ©/g, 'que')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const operationalTerms =
    /crear|create|import|importar|deposit|depositar|retir|withdraw|abrir|open|conectar|connect|problema|error|falla|bug|comprar|buy|vender|sell|operar|trade now|mercado ahora|precio de/;

  if (isConceptQuestion(input.message) && ['wallet', 'trade', 'market'].includes(intent)) {
    return true;
  }

  if (intent === 'wallet' && /(wallet|billetera)/.test(normalized) && !operationalTerms.test(normalized)) {
    return true;
  }

  if (intent === 'trade' && /(trade|trading|spot)/.test(normalized) && !operationalTerms.test(normalized)) {
    return true;
  }

  if (intent === 'market' && /(mercado|markets|market)/.test(normalized) && !operationalTerms.test(normalized)) {
    return true;
  }

  return false;
}

function buildConceptExplanation(input, conceptKey) {
  const voice = input.channel === 'voice';

  if (conceptKey === 'wallet') {
    return withChannelTone(
      input,
      t(
        input.language,
        'Un wallet es una billetera digital que te permite guardar, recibir y enviar criptomonedas. En realidad no guarda las monedas "dentro", sino las claves que te dan acceso a tus fondos en la blockchain. Por ejemplo, si tienes BTC o USDT, los gestionas desde tu wallet. Algunas wallets son custodiales, donde una plataforma protege el acceso por ti, y otras son no custodiales, donde tú controlas tus claves. En OrbitX, la wallet es la base para depositar, retirar y moverte por el ecosistema con más contexto.',
        'A wallet is a digital wallet that lets you store, receive and send cryptocurrencies. It does not literally hold the coins inside it. What it holds are the keys that let you access your funds on the blockchain. For example, if you own BTC or USDT, you manage them from your wallet. Some wallets are custodial, where a platform helps protect access for you, and others are non-custodial, where you control the keys yourself. In OrbitX, the wallet is the base layer for deposits, withdrawals and moving through the ecosystem with context.',
      ),
      t(
        input.language,
        'Un wallet es tu billetera digital para guardar, recibir y mover crypto. En OrbitX es la base para usar deposito, retiro y trading.',
        'A wallet is your digital wallet for holding, receiving and moving crypto. In OrbitX it is the base for deposits, withdrawals and trading.',
      ),
    );
  }

  if (conceptKey === 'trade') {
    return withChannelTone(
      input,
      t(
        input.language,
        'Hacer trade significa comprar o vender un activo buscando aprovechar movimientos de precio. En Spot, por ejemplo, operas el activo real del par que elegiste. Lo importante es entender precio, cantidad y el tipo de orden antes de confirmar.',
        'Trading means buying or selling an asset to take advantage of price movement. In Spot, for example, you trade the real asset from the pair you selected. The key is understanding price, amount and order type before confirming.',
      ),
      t(
        input.language,
        'Trade es comprar o vender un activo buscando un movimiento de precio. En Spot operas el activo real del par.',
        'Trade means buying or selling an asset to capture a price move. In Spot you trade the real asset in the pair.',
      ),
    );
  }

  if (conceptKey === 'market') {
    return withChannelTone(
      input,
      t(
        input.language,
        'Markets es la vista donde comparas activos, tendencia, volumen y movimiento general del mercado. Te sirve para descubrir oportunidades y decidir a que par entrar antes de pasar al panel de trade.',
        'Markets is the view where you compare assets, trend, volume and overall market movement. It helps you discover opportunities and decide which pair to open before moving into the trade panel.',
      ),
      t(
        input.language,
        'Markets es donde comparas activos y ves tendencia, volumen y movimiento del mercado.',
        'Markets is where you compare assets and see trend, volume and market movement.',
      ),
    );
  }

  return null;
}

function buildDeterministicResponse(input, tools) {
  const intent = detectIntent(input.message);
  const normalizedMessage = `${input.message ?? ''}`.toLowerCase();
  const walletSummary = tools.walletSummary;
  const marketSnapshot = tools.marketSnapshot;
  const securityRisk = tools.securityRisk;
  const uiDiagnosis = tools.uiDiagnosis;
  const currentModule = tools.orbitxKnowledge.currentModule;
  const creativeImageGeneration = tools.orbitxKnowledge.creativeImageGeneration;

  if (intent === 'wallet' && isConceptQuestion(normalizedMessage)) {
    return buildStructuredResponse({
      reply: buildConceptExplanation(input, 'wallet'),
      actions: walletSummary.hasWallet
        ? ['wallet_open', 'review_security', 'buy_crypto']
        : ['wallet_create', 'wallet_open', 'review_security'],
      mood: 'normal',
    });
  }

  if (intent === 'trade' && isConceptQuestion(normalizedMessage)) {
    return buildStructuredResponse({
      reply: buildConceptExplanation(input, 'trade'),
      actions: ['go_trade', 'view_market', 'wallet_open'],
      mood: 'normal',
    });
  }

  if (intent === 'market' && isConceptQuestion(normalizedMessage)) {
    return buildStructuredResponse({
      reply: buildConceptExplanation(input, 'market'),
      actions: ['view_market', 'go_trade', 'wallet_open'],
      mood: 'normal',
    });
  }

  if (
    currentModule?.id === 'create_token' &&
    /imagen|logo|foto|image|art|cover/.test(normalizedMessage)
  ) {
    return buildStructuredResponse({
      reply: withChannelTone(
        input,
        t(
          input.language,
          `En crear token puedes seguir por dos rutas: subir tu imagen manualmente o usar "Crear imagen con Astra". ${creativeImageGeneration.stateLabel} Si quieres avanzar rapido, Astra puede proponerte prompts visuales y luego dejarte elegir la imagen resultante como base del token.`,
          `Inside create token you have two paths: upload your image manually or use "Create image with Astra". ${creativeImageGeneration.stateLabel} If you want to move faster, Astra can suggest visual prompts and then let you choose the resulting image as the token base.`,
        ),
        t(
          input.language,
          'En crear token puedes subir imagen o usar Crear imagen con Astra. Si quieres, te guio con el prompt visual.',
          'In create token you can upload an image or use Create image with Astra. If you want, I can guide the visual prompt.',
        ),
      ),
      actions: ['create_memecoin', 'wallet_open'],
      mood: creativeImageGeneration.status === 'external_dependency' ? 'normal' : 'warning',
    });
  }

  if (intent === 'greeting') {
    return buildStructuredResponse({
      reply: withChannelTone(
        input,
        t(
          input.language,
          `Hola ${input.username}. Puedo ayudarte con tu wallet, el mercado, Social o Bot Futures. Dime que quieres hacer y te marco el siguiente paso real dentro de OrbitX.`,
          `Hi ${input.username}. I can help you with your wallet, the market, Social or Bot Futures. Tell me what you want to do and I will guide you to the next real step inside OrbitX.`,
        ),
        t(
          input.language,
          `Hola ${input.username}. Quieres crear tu wallet, ver mercado o empezar a operar?`,
          `Hi ${input.username}. Do you want to create your wallet, view the market or start trading?`,
        ),
      ),
      actions: walletSummary.hasWallet ? ['view_market', 'go_trade', 'open_profile'] : ['wallet_create', 'view_market', 'get_started'],
      mood: 'normal',
    });
  }

  if (intent === 'lost') {
    if (!walletSummary.hasWallet) {
      return buildStructuredResponse({
        reply: withChannelTone(
          input,
          t(
            input.language,
            'Empieza creando tu wallet. Ese es el primer paso para usar OrbitX con sentido. Luego puedes depositar, explorar el mercado o empezar a operar.',
            'Start by creating your wallet. That is the first useful step inside OrbitX. After that, you can deposit, explore the market or start trading.',
          ),
          t(
            input.language,
            'Empieza por tu wallet. Luego te llevo al mercado o a operar.',
            'Start with your wallet. Then I can take you to the market or to trade.',
          ),
        ),
        actions: ['wallet_create', 'get_started', 'view_market'],
        mood: 'normal',
      });
    }

    return buildStructuredResponse({
      reply: withChannelTone(
        input,
        t(
          input.language,
          'Ya tienes base para avanzar. Lo mas util ahora es elegir entre abrir mercado, ir a Spot o revisar seguridad si quieres operar con mas confianza.',
          'You already have enough to move forward. The most useful step now is to choose between Markets, Spot or Security if you want to trade with more confidence.',
        ),
        t(
          input.language,
          'Ya puedes avanzar. Te recomiendo mercado, Spot o seguridad.',
          'You can move forward now. I recommend Markets, Spot or Security.',
        ),
      ),
      actions: ['view_market', 'go_trade', 'review_security'],
      mood: 'normal',
    });
  }

  if (intent === 'user_id') {
    return buildStructuredResponse({
      reply: withChannelTone(
        input,
        t(
          input.language,
          'Tu ID lo puedes encontrar desde Perfil dentro de OrbitX. Si quieres, te llevo ahi para que lo revises con calma.',
          'You can find your ID from Profile inside OrbitX. If you want, I can take you there now.',
        ),
        t(
          input.language,
          'Tu ID esta en Perfil. Si quieres, te llevo ahora.',
          'Your ID is in Profile. I can take you there now.',
        ),
      ),
      actions: ['find_user_id', 'open_profile'],
      mood: 'normal',
    });
  }

  if (intent === 'wallet' || intent === 'wallet_ops') {
    const walletMessage = !walletSummary.hasWallet
      ? t(
          input.language,
          'Todavia no tienes wallet creada en OrbitX. El siguiente paso real es abrir Billetera y crearla. Desde ahi tambien podras importar una si ya existe.',
          'You do not have a wallet created in OrbitX yet. The next real step is to open Wallet and create it. From there you can also import one if you already have it.',
        )
      : !walletSummary.hasFunds
        ? t(
            input.language,
            'Tu wallet ya existe, pero todavia no veo fondos disponibles. Si quieres operar, lo siguiente es depositar o comprar crypto dentro del flujo disponible.',
            'Your wallet already exists, but I do not see funds available yet. If you want to trade, the next step is to deposit or buy crypto in the available flow.',
          )
        : t(
            input.language,
            `Tu wallet ya esta lista. ${securityRisk.level !== 'low' ? `${securityRisk.summary} ` : ''}Puedo llevarte a Billetera, a Seguridad o al mercado segun lo que quieras hacer ahora.`,
            `Your wallet is already ready. ${securityRisk.level !== 'low' ? `${securityRisk.summary} ` : ''}I can take you to Wallet, Security or Markets depending on what you want to do next.`,
          );

    return buildStructuredResponse({
      reply: withChannelTone(
        input,
        walletMessage,
        walletSummary.hasWallet
          ? t(input.language, 'Tu wallet ya esta lista. Puedo abrir Billetera o Seguridad.', 'Your wallet is ready. I can open Wallet or Security.')
          : t(input.language, 'Primero crea tu wallet en Billetera.', 'First create your wallet in Wallet.'),
      ),
      actions: walletSummary.hasWallet
        ? walletSummary.hasFunds
          ? ['wallet_open', 'review_security', 'view_market']
          : ['wallet_open', 'buy_crypto', 'review_security']
        : ['wallet_create', 'wallet_open', 'review_security'],
      mood: securityRisk.level === 'high' ? 'warning' : 'normal',
    });
  }

  if (intent === 'memecoin') {
    return buildStructuredResponse({
      reply: withChannelTone(
        input,
        walletSummary.hasWallet
          ? t(
              input.language,
              `Puedes crear tu memecoin en minutos dentro de OrbitX. Primero conviene confirmar tu wallet y luego abrir el flujo de creacion de token. Dentro de ese flujo puedes subir tu imagen manualmente o usar "Crear imagen con Astra" para preparar el recurso visual.`,
              `You can create your memecoin in minutes inside OrbitX. It is best to confirm your wallet first and then open the token creation flow. Inside that flow you can upload your image manually or use "Create image with Astra" to prepare the visual asset.`,
            )
          : t(
              input.language,
              'Puedes crear tu memecoin en OrbitX, pero antes necesitas tu wallet lista. Te puedo llevar primero a crearla y luego al flujo de token.',
              'You can create your memecoin in OrbitX, but first you need your wallet ready. I can take you to create it first and then to the token flow.',
            ),
        t(
          input.language,
          'Puedes crear tu memecoin en minutos. Quieres que te guie?',
          'You can create your memecoin in minutes. Want me to guide you?',
        ),
      ),
      actions: walletSummary.hasWallet
        ? ['create_memecoin', 'view_market']
        : ['wallet_create', 'create_memecoin', 'view_market'],
      mood: 'normal',
    });
  }

  if (intent === 'market') {
    return buildStructuredResponse({
      reply: withChannelTone(
        input,
        marketSnapshot?.asset
          ? t(
              input.language,
              `${marketSnapshot.summary} ${marketSnapshot.recommendation} Si quieres, te llevo al mercado o directamente al flujo de trade.`,
              `${marketSnapshot.summary} ${marketSnapshot.recommendation} If you want, I can take you to Markets or straight into Trade.`,
            )
          : t(
              input.language,
              'Puedo ayudarte con contexto de mercado dentro de OrbitX. Si quieres revisar pares o pasar a Spot, te llevo al modulo correcto.',
              'I can help you with market context inside OrbitX. If you want to review pairs or move to Spot, I can take you to the right module.',
            ),
        marketSnapshot?.asset
          ? t(input.language, `No veo feed en tiempo real para ${marketSnapshot.asset}, pero te llevo al mercado.`, `I do not see a live feed for ${marketSnapshot.asset}, but I can take you to Markets.`)
          : t(input.language, 'Te llevo a Mercados o a Spot.', 'I can take you to Markets or Spot.'),
      ),
      actions: ['view_market', 'go_trade', 'wallet_open'],
      mood: marketSnapshot?.hasRealtimeFeed === false ? 'warning' : 'normal',
    });
  }

  if (intent === 'trade') {
    return buildStructuredResponse({
      reply: withChannelTone(
        input,
        !walletSummary.hasWallet
          ? t(
              input.language,
              'Para operar con orden en OrbitX, primero necesitas tu wallet. Despues podras depositar o comprar crypto y pasar a Spot con contexto.',
              'To trade properly in OrbitX, you need your wallet first. After that you can deposit or buy crypto and move into Spot with context.',
            )
          : !walletSummary.hasFunds
            ? t(
                input.language,
                'Ya puedes prepararte para operar, pero aun no veo fondos disponibles. El siguiente paso util es depositar o comprar crypto y luego pasar a Trade.',
                'You can already get ready to trade, but I still do not see funds available. The useful next step is to deposit or buy crypto and then move into Trade.',
              )
            : t(
                input.language,
                'Ya tienes base para operar. Lo mejor ahora es revisar mercado, elegir el par y abrir Spot con contexto.',
                'You already have the right base to trade. The best move now is to review the market, choose the pair and open Spot with context.',
              ),
        !walletSummary.hasWallet
          ? t(input.language, 'Primero crea tu wallet y luego te llevo a operar.', 'First create your wallet and then I will take you to trade.')
          : t(input.language, 'Puedo llevarte a Spot ahora.', 'I can take you to Spot now.'),
      ),
      actions: !walletSummary.hasWallet
        ? ['wallet_create', 'view_market', 'get_started']
        : !walletSummary.hasFunds
          ? ['buy_crypto', 'wallet_open', 'view_market']
          : ['go_trade', 'view_market', 'review_security'],
      mood: 'normal',
    });
  }

  if (intent === 'social') {
    return buildStructuredResponse({
      reply: withChannelTone(
        input,
        t(
          input.language,
          'Social es el espacio para explorar actividad, perfiles y contenido dentro de OrbitX. Si quieres, te llevo al feed o a tu perfil.',
          'Social is the place to explore activity, profiles and content inside OrbitX. If you want, I can take you to the feed or to your profile.',
        ),
        t(
          input.language,
          'Te llevo a Social o a tu perfil.',
          'I can take you to Social or your profile.',
        ),
      ),
      actions: ['open_social', 'open_profile', 'view_market'],
      mood: 'normal',
    });
  }

  if (intent === 'bot_futures') {
    return buildStructuredResponse({
      reply: withChannelTone(
        input,
        t(
          input.language,
          `Ahora mismo estoy tomando como contexto el modulo ${currentModule.title}. Si quieres avanzar en Bot Futures, puedo llevarte al command center o al flujo de conexion de exchange segun tu estado actual.`,
          `I am using ${currentModule.title} as the current context. If you want to move inside Bot Futures, I can take you to the command center or to exchange connection depending on your current state.`,
        ),
        t(
          input.language,
          'Puedo llevarte a Bot Futures o a conectar exchange.',
          'I can take you to Bot Futures or to exchange connection.',
        ),
      ),
      actions: ['open_bot_futures', 'connect_exchange', 'review_security'],
      mood: 'normal',
    });
  }

  if (intent === 'security') {
    return buildStructuredResponse({
      reply: withChannelTone(
        input,
        t(
          input.language,
          `${securityRisk.summary} Si quieres, te llevo a Seguridad para revisar 2FA, sesiones activas y auto-bloqueo sin tocar nada sensible desde el chat.`,
          `${securityRisk.summary} If you want, I can take you to Security so you can review 2FA, active sessions and auto-lock without touching anything sensitive from chat.`,
        ),
        t(
          input.language,
          'Puedo llevarte a Seguridad para revisarlo ahora.',
          'I can take you to Security to review that now.',
        ),
      ),
      actions: ['review_security', 'wallet_open', 'open_profile'],
      mood: securityRisk.level === 'high' ? 'critical' : 'warning',
    });
  }

  if (intent === 'diagnostic') {
    return buildStructuredResponse({
      reply: withChannelTone(
        input,
        uiDiagnosis?.issueDetected
          ? t(
              input.language,
              `${uiDiagnosis.summary} Voy a orientarte con el siguiente paso seguro para aislar el problema dentro de OrbitX.`,
              `${uiDiagnosis.summary} I will guide you through the next safe step to isolate the problem inside OrbitX.`,
            )
          : t(
              input.language,
              'Puedo ayudarte a diagnosticarlo. Dime que pantalla estabas usando y que paso justo antes del fallo, y te guio sin hacer suposiciones falsas.',
              'I can help you diagnose it. Tell me which screen you were using and what happened right before the failure, and I will guide you without making false assumptions.',
            ),
        t(
          input.language,
          'Vamos a diagnosticarlo paso a paso.',
          'Let us diagnose it step by step.',
        ),
      ),
      actions: ['diagnose_issue', currentModule.id === 'security' ? 'review_security' : 'get_started'],
      mood: 'warning',
    });
  }

  return buildStructuredResponse({
    reply: withChannelTone(
      input,
      t(
        input.language,
        `Ahora mismo estoy tomando como contexto ${currentModule.title}. Puedo ayudarte a moverte dentro de OrbitX de forma clara y segura si me dices si quieres wallet, mercado, trade, Social o Bot Futures.`,
        `Right now I am using ${currentModule.title} as context. I can help you move through OrbitX clearly and safely if you tell me whether you want wallet, markets, trade, Social or Bot Futures.`,
      ),
      t(
        input.language,
        'Puedo ayudarte con wallet, mercado, trade, Social o Bot Futures.',
        'I can help you with wallet, markets, trade, Social or Bot Futures.',
      ),
    ),
    actions: ['get_started', 'view_market', 'wallet_open'],
    mood: 'normal',
  });
}

export async function orchestrateAstraChat({ config, input }) {
  const safeInput = normalizeInput(input);
  const intent = detectIntent(safeInput.message);

  if (!safeInput.message) {
    throw new AstraSystemError('Astra necesita un mensaje para responder.', {
      code: 'ASTRA_INPUT_REQUIRED',
      status: 400,
      retryable: false,
      exposeMessage: true,
    });
  }

  const identity = {
    userId: safeInput.userId,
    sessionId: safeInput.sessionId,
  };

  appendAstraMemoryTurn(identity, {
    role: 'user',
    text: safeInput.message,
    intent,
  });

  const guardResult = runAstraGuards(safeInput);
  if (guardResult.blocked && guardResult.response) {
    appendAstraMemoryTurn(identity, {
      role: 'assistant',
      text: guardResult.response.reply,
      intent,
    });
    updateAstraMemoryFacts(identity, {
      lastIntent: intent,
      lastToolNames: ['guards'],
      walletCreated: safeInput.hasWallet,
      identityVerified: safeInput.isVerified,
    });
    return guardResult.response;
  }

  const memory = buildAstraMemorySummary(identity);
  const tools = runAstraTools(safeInput);
  const fallbackResponse = buildDeterministicResponse(safeInput, tools);

  if (shouldPreferDeterministicResponse(safeInput, intent)) {
    appendAstraMemoryTurn(identity, {
      role: 'assistant',
      text: fallbackResponse.reply,
      intent,
    });
    updateAstraMemoryFacts(identity, {
      lastIntent: intent,
      lastToolNames: tools.toolsUsed,
      walletCreated: safeInput.hasWallet,
      identityVerified: safeInput.isVerified,
    });
    console.info('[OrbitX][AstraCore] deterministic response preferred', {
      intent,
      screen: safeInput.screen,
      channel: safeInput.channel,
    });
    return fallbackResponse;
  }

  try {
    console.info('[OrbitX][AstraCore] model request', {
      model: config.model,
      channel: safeInput.channel,
      screen: safeInput.screen,
      intent,
    });
    const payload = await generateGeminiStructuredJson(config, {
      systemInstruction: buildAstraMasterPrompt(),
      userPrompt: buildAstraUserPrompt({
        input: {
          ...safeInput,
          recentIntent: safeInput.recentIntent ?? intent,
        },
        memory,
        tools,
      }),
      responseSchema: createAstraResponseSchema(),
    });

    const normalized = buildStructuredResponse(payload);
    appendAstraMemoryTurn(identity, {
      role: 'assistant',
      text: normalized.reply,
      intent,
    });
    updateAstraMemoryFacts(identity, {
      lastIntent: intent,
      lastToolNames: tools.toolsUsed,
      walletCreated: safeInput.hasWallet,
      identityVerified: safeInput.isVerified,
    });
    console.info('[OrbitX][AstraCore] model response ready', {
      intent,
      mood: normalized.mood,
      actions: normalized.actions,
    });
    return normalized;
  } catch (error) {
    if (
      error instanceof AstraSystemError &&
      error.code === 'ASTRA_BRAIN_NOT_CONFIGURED'
    ) {
      throw error;
    }

    appendAstraMemoryTurn(identity, {
      role: 'assistant',
      text: fallbackResponse.reply,
      intent,
    });
    updateAstraMemoryFacts(identity, {
      lastIntent: intent,
      lastToolNames: tools.toolsUsed,
      walletCreated: safeInput.hasWallet,
      identityVerified: safeInput.isVerified,
    });
    console.warn('[OrbitX][AstraCore] fallback response used', {
      intent,
      screen: safeInput.screen,
      reason: error instanceof Error ? error.message : 'UNKNOWN',
    });

    return fallbackResponse;
  }
}

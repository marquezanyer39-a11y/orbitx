import {
  buildAstraMemorySummary,
  appendAstraMemoryTurn,
  updateAstraMemoryFacts,
} from './astra-memory.js';
import { buildAstraMasterPrompt, buildAstraUserPrompt } from './astra-prompt.js';
import { runAstraTools } from './astra-tools.js';
import {
  isSensitiveCredentialEducationQuestion,
  runAstraGuards,
} from './astra-guards.js';
import {
  AstraSystemError,
  buildStructuredResponse,
  createAstraResponseSchema,
} from './astra-schemas.js';
import { generateGeminiStructuredJson } from './gemini-client.js';

function normalizeOptionalText(value, maxLength = 240) {
  const text = `${value ?? ''}`.replace(/\s+/g, ' ').trim();
  return text ? text.slice(0, maxLength) : null;
}

function normalizeContextMap(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value;
}

function normalizeInput(input) {
  return {
    userId: `${input.userId ?? input.username ?? 'guest'}`.trim() || 'guest',
    sessionId: `${input.sessionId ?? 'default'}`.trim() || 'default',
    message: `${input.message ?? ''}`.replace(/\s+/g, ' ').trim().slice(0, 900),
    screen: input.screen ?? 'general',
    surface: input.surface ?? input.screen ?? 'general',
    path: input.path ?? input.lastRoute ?? 'unknown',
    screenName: normalizeOptionalText(input.screenName, 160),
    summary: normalizeOptionalText(input.summary, 800),
    currentTask: normalizeOptionalText(input.currentTask, 240),
    language: input.language ?? 'ES',
    channel: input.channel === 'voice' ? 'voice' : 'text',
    username: input.username ?? 'Usuario',
    hasWallet: Boolean(input.hasWallet),
    isVerified: Boolean(input.isVerified),
    hasFunds: Boolean(input.hasFunds),
    portfolioValue: Number(input.portfolioValue ?? 0),
    selectedToken: input.selectedToken ?? null,
    currentPairSymbol: normalizeOptionalText(input.currentPairSymbol, 80),
    currentPriceLabel: normalizeOptionalText(input.currentPriceLabel, 80),
    selectedEntity: normalizeContextMap(input.selectedEntity),
    uiState: normalizeContextMap(input.uiState),
    userState: normalizeContextMap(input.userState),
    capabilities: normalizeContextMap(input.capabilities),
    labels: normalizeContextMap(input.labels),
    recentIntent: input.recentIntent ?? null,
    lastRoute: input.lastRoute ?? 'unknown',
    errorTitle: input.errorTitle ?? null,
    errorBody: input.errorBody ?? null,
    twoFactorEnabled: input.twoFactorEnabled ?? null,
    activeSessionsCount: input.activeSessionsCount ?? null,
    autoLockMinutes: input.autoLockMinutes ?? null,
    walletReady:
      input.walletReady == null ? Boolean(input.hasWallet) : Boolean(input.walletReady),
    walletStatusLabel: normalizeOptionalText(input.walletStatusLabel, 120),
    seedBackedUp:
      input.seedBackedUp == null ? null : Boolean(input.seedBackedUp),
    externalWalletConnected:
      input.externalWalletConnected == null
        ? null
        : Boolean(input.externalWalletConnected),
    emailVerified:
      input.emailVerified == null ? Boolean(input.isVerified) : Boolean(input.emailVerified),
    accountStatusLabel: normalizeOptionalText(input.accountStatusLabel, 120),
    balanceLabel: normalizeOptionalText(input.balanceLabel, 120),
    spotBalanceLabel: normalizeOptionalText(input.spotBalanceLabel, 120),
    web3BalanceLabel: normalizeOptionalText(input.web3BalanceLabel, 120),
    botEnabled:
      input.botEnabled == null ? null : Boolean(input.botEnabled),
    botRiskLabel: normalizeOptionalText(input.botRiskLabel, 80),
    botTokenLabel: normalizeOptionalText(input.botTokenLabel, 80),
    botAllocationLabel: normalizeOptionalText(input.botAllocationLabel, 120),
    botDailyPnlLabel: normalizeOptionalText(input.botDailyPnlLabel, 120),
    botStatusLabel: normalizeOptionalText(input.botStatusLabel, 80),
    botMaxTradesLabel: normalizeOptionalText(input.botMaxTradesLabel, 80),
    rampMode: normalizeOptionalText(input.rampMode, 120),
    rampProviderLabel: normalizeOptionalText(input.rampProviderLabel, 120),
    usageMode: normalizeOptionalText(input.usageMode, 80),
    currentThemeLabel: normalizeOptionalText(input.currentThemeLabel, 120),
    poolStatusLabel: normalizeOptionalText(input.poolStatusLabel, 120),
    poolAmountLabel: normalizeOptionalText(input.poolAmountLabel, 120),
    poolTargetLabel: normalizeOptionalText(input.poolTargetLabel, 120),
    poolTimeRemainingLabel: normalizeOptionalText(input.poolTimeRemainingLabel, 120),
    poolUserParticipationLabel: normalizeOptionalText(
      input.poolUserParticipationLabel,
      120,
    ),
    poolEstimatedPositionLabel: normalizeOptionalText(
      input.poolEstimatedPositionLabel,
      120,
    ),
  };
}

function detectIntent(message, input = {}) {
  const text = normalizeSemanticText(message);
  const screenIntent = getScreenIntent(input.screen);

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

  if (
    text.includes('convert') ||
    text.includes('conversion') ||
    text.includes('provider') ||
    text.includes('proveedor') ||
    text.includes('quote') ||
    text.includes('cotizacion') ||
    text.includes('ramp')
  ) {
    return 'ramp';
  }

  if (text.includes('meme') || text.includes('token')) {
    return 'memecoin';
  }

  if (text.includes('social') || text.includes('feed') || text.includes('post')) {
    return 'social';
  }

  if (text.includes('bot') || text.includes('futures') || text.includes('exchange')) {
    return 'bot_futures';
  }

  if (screenIntent) {
    return screenIntent;
  }

  if (
    text.includes('precio') ||
    text.includes('mercado') ||
    text.includes('price') ||
    text.includes('market')
  ) {
    return 'market';
  }

  if (text.includes('operar') || text.includes('trade')) {
    return 'trade';
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

function normalizeSemanticText(value) {
  return `${value ?? ''}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,;:()[\]"'`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchesAny(value, patterns) {
  return patterns.some((pattern) => pattern.test(value));
}

function getScreenIntent(screen) {
  switch (screen) {
    case 'create_token':
      return 'memecoin';
    case 'wallet':
      return 'wallet';
    case 'trade':
      return 'trade';
    case 'market':
      return 'market';
    case 'social':
      return 'social';
    case 'bot_futures':
      return 'bot_futures';
    case 'security':
      return 'security';
    case 'ramp':
      return 'ramp';
    default:
      return null;
  }
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

  return isAstraDefinitionQuestion(text);
}

function isAstraDefinitionQuestion(text) {
  const normalized = normalizeSemanticText(text);

  return matchesAny(normalized, [
    /^(que es|what is)\b/,
    /\bexplica\b/,
    /\bexplain\b/,
    /\bdefine\b/,
    /\bsignifica\b/,
    /\bcomo funciona\b/,
    /\bhow does\b/,
    /\bpara que sirve\b/,
  ]);
}

function isScreenGuidanceQuestion(text) {
  const normalized = normalizeSemanticText(text);

  return matchesAny(normalized, [
    /\bque hago aqui\b/,
    /\bque puedo hacer aqui\b/,
    /\bque estoy viendo\b/,
    /\bdonde estoy\b/,
    /\bcomo sigo aqui\b/,
    /\bwhat do i do here\b/,
    /\bwhat am i looking at\b/,
    /\bwhere am i\b/,
    /\bhow do i continue here\b/,
  ]);
}

function isTradeStateQuestion(input) {
  if (input.screen !== 'trade') {
    return false;
  }

  const normalized = normalizeSemanticText(input.message);

  return matchesAny(normalized, [
    /\bque precio\b/,
    /\bprecio tiene\b/,
    /\bprice\b/,
    /\bpar actual\b/,
    /\bpair\b/,
    /\ben vivo\b/,
    /\blive\b/,
    /\bfeed\b/,
    /\bgrafico\b/,
    /\bchart\b/,
    /\blibro de ordenes\b/,
    /\border book\b/,
  ]);
}

function isWalletStateQuestion(input) {
  if (input.screen !== 'wallet') {
    return false;
  }

  const normalized = normalizeSemanticText(input.message);

  return matchesAny(normalized, [
    /\bwallet\b/,
    /\bbilletera\b/,
    /\bmi wallet\b/,
    /\bmi billetera\b/,
    /\bred\b/,
    /\bnetwork\b/,
    /\bpestana\b/,
    /\btab\b/,
    /\bsaldo\b/,
    /\bbalance\b/,
    /\bfondos\b/,
    /\bdireccion\b/,
    /\baddress\b/,
  ]);
}

function isRampStateQuestion(input) {
  if (input.screen !== 'ramp') {
    return false;
  }

  const normalized = normalizeSemanticText(input.message);

  return matchesAny(normalized, [
    /\bprovider\b/,
    /\bproveedor\b/,
    /\bquote\b/,
    /\bcotizacion\b/,
    /\bconversion\b/,
    /\bconvert\b/,
    /\bestado\b/,
    /\bstate\b/,
    /\bflujo\b/,
    /\brate\b/,
  ]);
}

function isCreateTokenStateQuestion(input) {
  if (input.screen !== 'create_token') {
    return false;
  }

  const normalized = normalizeSemanticText(input.message);

  return matchesAny(normalized, [
    /\bpaso\b/,
    /\bstep\b/,
    /\bstage\b/,
    /\bwizard\b/,
    /\bdraft\b/,
    /\bborrador\b/,
    /\bimagen\b/,
    /\bimage mode\b/,
    /\bmodo de imagen\b/,
    /\btoken\b/,
  ]);
}

function shouldPreferDeterministicResponse(input, intent) {
  if (intent === 'user_id') {
    return true;
  }

  if (isSensitiveCredentialEducationQuestion(input.message)) {
    return true;
  }

  if (isScreenGuidanceQuestion(input.message) && getScreenIntent(input.screen)) {
    return true;
  }

  if (
    isTradeStateQuestion(input) ||
    isWalletStateQuestion(input) ||
    isRampStateQuestion(input) ||
    isCreateTokenStateQuestion(input)
  ) {
    return true;
  }

  if (
    isAstraDefinitionQuestion(input.message) &&
    ['wallet', 'trade', 'market', 'security'].includes(intent)
  ) {
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

function getSensitiveConceptLabel(message, language) {
  const normalized = normalizeSemanticText(message);

  if (normalized.includes('private key') || normalized.includes('clave privada')) {
    return t(language, 'una clave privada', 'a private key');
  }

  if (normalized.includes('recovery phrase') || normalized.includes('frase de recuperacion')) {
    return t(language, 'una recovery phrase', 'a recovery phrase');
  }

  return t(language, 'una seed phrase', 'a seed phrase');
}

function buildSensitiveEducationResponse(input) {
  const conceptLabel = getSensitiveConceptLabel(input.message, input.language);

  return buildStructuredResponse({
    reply: withChannelTone(
      input,
      t(
        input.language,
        `${conceptLabel} es la credencial maestra que da acceso a una wallet. No guarda monedas por si sola: sirve para regenerar las claves que controlan tus fondos en la blockchain. En la practica, quien la tenga puede recuperar la wallet completa, por eso debes guardarla offline, nunca compartirla y no escribirla en chats ni capturas.`,
        `${conceptLabel} is the master credential that gives access to a wallet. It does not store coins by itself: it is used to regenerate the keys that control your funds on the blockchain. In practice, whoever has it can recover the full wallet, so you should store it offline, never share it and never paste it into chats or screenshots.`,
      ),
      t(
        input.language,
        `${conceptLabel} es la credencial maestra de tu wallet. Sirve para recuperar acceso a los fondos, por eso debe guardarse offline y nunca compartirse.`,
        `${conceptLabel} is your wallet's master credential. It is used to recover access to funds, so it should be kept offline and never shared.`,
      ),
    ),
    actions: ['review_security', 'wallet_open'],
    mood: 'warning',
  });
}

function buildTradeContextResponse(input, tools) {
  const marketSnapshot = tools.marketSnapshot;
  const pair = marketSnapshot?.pair ?? input.currentPairSymbol ?? null;
  const priceLabel = marketSnapshot?.currentPriceLabel ?? input.currentPriceLabel ?? null;
  const feedState = marketSnapshot?.hasRealtimeFeed
    ? marketSnapshot.feedSource
      ? t(input.language, `con feed live desde ${marketSnapshot.feedSource}`, `with live feed from ${marketSnapshot.feedSource}`)
      : t(input.language, 'con feed live', 'with a live feed')
    : t(input.language, 'sin un feed live confirmado', 'without a confirmed live feed');
  const summary = input.summary ? `${input.summary} ` : '';

  const longReply = pair
    ? t(
        input.language,
        `${summary}Ahora mismo estas viendo ${pair}${priceLabel ? ` en ${priceLabel}` : ''} ${feedState}. ${input.currentTask ? `La tarea actual es ${input.currentTask}. ` : ''}Desde esta pantalla puedes revisar grafico, libro de ordenes y preparar una compra o venta con mas contexto.`,
        `${summary}Right now you are viewing ${pair}${priceLabel ? ` at ${priceLabel}` : ''} ${feedState}. ${input.currentTask ? `The current task is ${input.currentTask}. ` : ''}From this screen you can review the chart, order book and prepare a buy or sell with more context.`,
      )
    : t(
        input.language,
        `${summary}En Trade todavia no veo un par activo confirmado. Desde aqui puedes elegir un par, revisar su precio y preparar una operacion Spot.`,
        `${summary}In Trade I do not see a confirmed active pair yet. From here you can choose a pair, review its price and prepare a Spot trade.`,
      );

  const shortReply = pair
    ? t(
        input.language,
        `${pair}${priceLabel ? ` va en ${priceLabel}` : ''} ${marketSnapshot?.hasRealtimeFeed ? 'y el feed esta live.' : 'y no veo feed live confirmado.'}`,
        `${pair}${priceLabel ? ` is at ${priceLabel}` : ''} ${marketSnapshot?.hasRealtimeFeed ? 'and the feed is live.' : 'and I do not see a confirmed live feed.'}`,
      )
    : t(
        input.language,
        'No veo un par activo todavia. Desde Trade puedes elegir uno y revisar precio, grafico y ordenes.',
        'I do not see an active pair yet. In Trade you can choose one and review price, chart and orders.',
      );

  return buildStructuredResponse({
    reply: withChannelTone(input, longReply, shortReply),
    actions: ['go_trade', 'view_market', 'wallet_open'],
    mood: marketSnapshot?.hasRealtimeFeed === false && !priceLabel ? 'warning' : 'normal',
  });
}

function buildWalletContextResponse(input, tools) {
  const walletSummary = tools.walletSummary;
  const networkLabel = walletSummary.networkLabel
    ? `${walletSummary.networkLabel}`.toUpperCase()
    : null;
  const activeTab = walletSummary.activeTab;
  const totalBalanceLabel = walletSummary.totalBalanceLabel ?? walletSummary.balanceLabel;
  const splitBalance = [walletSummary.spotBalanceLabel, walletSummary.web3BalanceLabel]
    .filter(Boolean)
    .join(' / ');

  const longReply = !walletSummary.hasWallet
    ? t(
        input.language,
        'Todavia no veo una wallet activa en OrbitX. Desde esta pantalla el siguiente paso real es crearla o importar una existente antes de operar.',
        'I do not see an active wallet in OrbitX yet. From this screen the next real step is to create one or import an existing wallet before trading.',
      )
    : t(
        input.language,
        `En tu wallet${networkLabel ? ` estas sobre ${networkLabel}` : ''}${activeTab ? ` y con la pestana ${activeTab} abierta` : ''}. ${totalBalanceLabel ? `El balance total visible es ${totalBalanceLabel}. ` : ''}${splitBalance ? `El desglose reportado es ${splitBalance}. ` : ''}${tools.securityRisk.level !== 'low' ? `${tools.securityRisk.summary} ` : ''}Desde aqui puedes revisar fondos, cambiar de red o seguir con deposito, retiro o seguridad.`,
        `In your wallet${networkLabel ? ` you are on ${networkLabel}` : ''}${activeTab ? ` with the ${activeTab} tab open` : ''}. ${totalBalanceLabel ? `The visible total balance is ${totalBalanceLabel}. ` : ''}${splitBalance ? `The reported breakdown is ${splitBalance}. ` : ''}${tools.securityRisk.level !== 'low' ? `${tools.securityRisk.summary} ` : ''}From here you can review funds, switch networks or continue with deposit, withdrawal or security.`,
      );

  const shortReply = walletSummary.hasWallet
    ? t(
        input.language,
        `${networkLabel ? `${networkLabel}, ` : ''}${activeTab ? `${activeTab}, ` : ''}${totalBalanceLabel ? `balance ${totalBalanceLabel}.` : 'wallet lista.'}`,
        `${networkLabel ? `${networkLabel}, ` : ''}${activeTab ? `${activeTab}, ` : ''}${totalBalanceLabel ? `balance ${totalBalanceLabel}.` : 'wallet ready.'}`,
      )
    : t(
        input.language,
        'Aun no veo una wallet activa. Puedo llevarte a crearla o importarla.',
        'I do not see an active wallet yet. I can take you to create or import it.',
      );

  return buildStructuredResponse({
    reply: withChannelTone(input, longReply, shortReply),
    actions: walletSummary.hasWallet
      ? walletSummary.hasFunds
        ? ['wallet_open', 'review_security', 'view_market']
        : ['wallet_open', 'buy_crypto', 'review_security']
      : ['wallet_create', 'wallet_open', 'review_security'],
    mood: tools.securityRisk.level === 'high' ? 'warning' : 'normal',
  });
}

function buildRampContextResponse(input, tools) {
  const rampState = tools.rampState;
  const provider = rampState?.provider ?? null;
  const status = rampState?.status ?? null;
  const pair = rampState?.pair ?? input.currentPairSymbol ?? null;
  const amountLabel = rampState?.amountLabel ?? input.labels?.amountLabel ?? null;
  const summary = input.summary ? `${input.summary} ` : '';

  const longReply = t(
    input.language,
    `${summary}${provider ? `El proveedor actual es ${provider}. ` : 'No veo un proveedor confirmado todavia. '}${pair ? `La conversion abierta va sobre ${pair}. ` : ''}${amountLabel ? `El monto o quote visible es ${amountLabel}. ` : ''}${status ? `El flujo esta en estado ${status}. ` : ''}Desde aqui puedes revisar cotizacion, proveedor y balance antes de confirmar.`,
    `${summary}${provider ? `The current provider is ${provider}. ` : 'I do not see a confirmed provider yet. '}${pair ? `The open conversion is on ${pair}. ` : ''}${amountLabel ? `The visible amount or quote is ${amountLabel}. ` : ''}${status ? `The flow is currently ${status}. ` : ''}From here you can review the quote, provider and balance before confirming.`,
  );

  const shortReply = t(
    input.language,
    `${provider ? `Proveedor ${provider}. ` : ''}${status ? `Estado ${status}. ` : ''}${pair ? `${pair}.` : 'Puedo revisar tu conversion actual.'}`,
    `${provider ? `Provider ${provider}. ` : ''}${status ? `Status ${status}. ` : ''}${pair ? `${pair}.` : 'I can review your current conversion.'}`,
  );

  return buildStructuredResponse({
    reply: withChannelTone(input, longReply, shortReply),
    actions: ['buy_crypto', 'sell_crypto', 'wallet_open'],
    mood: status === 'error' || status === 'unavailable' ? 'warning' : 'normal',
  });
}

function buildCreateTokenContextResponse(input, tools) {
  const createTokenState = tools.createTokenState;
  const draftName = createTokenState?.selectedEntity?.name ?? null;
  const draftSymbol = createTokenState?.selectedEntity?.symbol ?? null;

  const longReply = t(
    input.language,
    `${createTokenState?.stage ? `Estas en el paso ${createTokenState.stage}. ` : 'No veo un paso confirmado del wizard. '}${draftName || draftSymbol ? `El draft actual es ${draftName ?? ''}${draftSymbol ? ` (${draftSymbol})` : ''}. ` : ''}${createTokenState?.imageMode ? `El modo de imagen es ${createTokenState.imageMode}. ` : ''}${createTokenState?.imageStatus ? `El estado visual reportado es ${createTokenState.imageStatus}. ` : ''}${createTokenState?.availability ? `La disponibilidad de Astra para imagen figura como ${createTokenState.availability}. ` : ''}${createTokenState?.nextStep ? `El siguiente paso util es ${createTokenState.nextStep}.` : ''}`,
    `${createTokenState?.stage ? `You are on the ${createTokenState.stage} step. ` : 'I do not see a confirmed wizard step yet. '}${draftName || draftSymbol ? `The current draft is ${draftName ?? ''}${draftSymbol ? ` (${draftSymbol})` : ''}. ` : ''}${createTokenState?.imageMode ? `The image mode is ${createTokenState.imageMode}. ` : ''}${createTokenState?.imageStatus ? `The visual status is ${createTokenState.imageStatus}. ` : ''}${createTokenState?.availability ? `Astra image availability is ${createTokenState.availability}. ` : ''}${createTokenState?.nextStep ? `The next useful step is ${createTokenState.nextStep}.` : ''}`,
  );

  const shortReply = t(
    input.language,
    `${createTokenState?.stage ? `Paso ${createTokenState.stage}. ` : ''}${createTokenState?.imageMode ? `Imagen ${createTokenState.imageMode}. ` : ''}${draftSymbol ? `${draftSymbol}.` : ''}`,
    `${createTokenState?.stage ? `Step ${createTokenState.stage}. ` : ''}${createTokenState?.imageMode ? `Image ${createTokenState.imageMode}. ` : ''}${draftSymbol ? `${draftSymbol}.` : ''}`,
  );

  return buildStructuredResponse({
    reply: withChannelTone(input, longReply, shortReply),
    actions: ['create_memecoin', 'wallet_open', 'view_market'],
    mood:
      createTokenState?.availability === 'unavailable' ||
      createTokenState?.availability === 'error'
        ? 'warning'
        : 'normal',
  });
}

function buildScreenGuidanceResponse(input, tools) {
  if (input.screen === 'trade') {
    return buildTradeContextResponse(input, tools);
  }

  if (input.screen === 'wallet') {
    return buildWalletContextResponse(input, tools);
  }

  if (input.screen === 'ramp') {
    return buildRampContextResponse(input, tools);
  }

  if (input.screen === 'create_token') {
    return buildCreateTokenContextResponse(input, tools);
  }

  if (input.screen === 'security') {
    return buildStructuredResponse({
      reply: withChannelTone(
        input,
        t(
          input.language,
          `Estas en Seguridad${input.currentTask ? ` dentro de ${input.currentTask}` : ''}. Aqui puedes revisar 2FA, sesiones activas y auto-bloqueo con calma, sin tocar secretos desde el chat.`,
          `You are in Security${input.currentTask ? ` inside ${input.currentTask}` : ''}. Here you can review 2FA, active sessions and auto-lock without touching secrets from chat.`,
        ),
        t(
          input.language,
          'Estas en Seguridad. Aqui revisas 2FA, sesiones y auto-bloqueo.',
          'You are in Security. Here you review 2FA, sessions and auto-lock.',
        ),
      ),
      actions: ['review_security', 'wallet_open', 'open_profile'],
      mood: tools.securityRisk.level === 'high' ? 'warning' : 'normal',
    });
  }

  return null;
}

function buildDeterministicResponse(input, tools) {
  const intent = detectIntent(input.message, input);
  const normalizedMessage = normalizeSemanticText(input.message);
  const walletSummary = tools.walletSummary;
  const marketSnapshot = tools.marketSnapshot;
  const createTokenState = tools.createTokenState;
  const rampState = tools.rampState;
  const securityRisk = tools.securityRisk;
  const uiDiagnosis = tools.uiDiagnosis;
  const currentModule = tools.orbitxKnowledge.currentModule;
  const creativeImageGeneration = tools.orbitxKnowledge.creativeImageGeneration;

  if (isScreenGuidanceQuestion(input.message)) {
    const screenGuidanceResponse = buildScreenGuidanceResponse(input, tools);
    if (screenGuidanceResponse) {
      return screenGuidanceResponse;
    }
  }

  if (isSensitiveCredentialEducationQuestion(input.message)) {
    return buildSensitiveEducationResponse(input);
  }

  if (intent === 'wallet' && isAstraDefinitionQuestion(normalizedMessage)) {
    return buildStructuredResponse({
      reply: buildConceptExplanation(input, 'wallet'),
      actions: walletSummary.hasWallet
        ? ['wallet_open', 'review_security', 'buy_crypto']
        : ['wallet_create', 'wallet_open', 'review_security'],
      mood: 'normal',
    });
  }

  if (intent === 'trade' && isAstraDefinitionQuestion(normalizedMessage)) {
    return buildStructuredResponse({
      reply: buildConceptExplanation(input, 'trade'),
      actions: ['go_trade', 'view_market', 'wallet_open'],
      mood: 'normal',
    });
  }

  if (intent === 'market' && isAstraDefinitionQuestion(normalizedMessage)) {
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
          `En crear token puedes seguir por dos rutas: subir tu imagen manualmente o usar "Crear imagen con Astra". ${createTokenState?.summary ?? ''} ${creativeImageGeneration.stateLabel} Si quieres avanzar rapido, Astra puede proponerte prompts visuales y luego dejarte elegir la imagen resultante como base del token.`,
          `Inside create token you have two paths: upload your image manually or use "Create image with Astra". ${createTokenState?.summary ?? ''} ${creativeImageGeneration.stateLabel} If you want to move faster, Astra can suggest visual prompts and then let you choose the resulting image as the token base.`,
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
    return buildWalletContextResponse(input, tools);
  }

  if (intent === 'memecoin') {
    if (input.screen === 'create_token' || createTokenState) {
      return buildCreateTokenContextResponse(input, tools);
    }

    return buildStructuredResponse({
      reply: withChannelTone(
        input,
        walletSummary.hasWallet
          ? t(
              input.language,
              `Puedes crear tu memecoin en minutos dentro de OrbitX. Primero conviene confirmar tu wallet y luego abrir el flujo de creacion de token. ${createTokenState?.summary ?? 'Dentro de ese flujo puedes subir tu imagen manualmente o usar "Crear imagen con Astra" para preparar el recurso visual.'}`,
              `You can create your memecoin in minutes inside OrbitX. It is best to confirm your wallet first and then open the token creation flow. ${createTokenState?.summary ?? 'Inside that flow you can upload your image manually or use "Create image with Astra" to prepare the visual asset.'}`,
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
          ? marketSnapshot?.hasRealtimeFeed
            ? t(
                input.language,
                `Tengo contexto live para ${marketSnapshot.asset}${marketSnapshot.currentPriceLabel ? ` en ${marketSnapshot.currentPriceLabel}` : ''}. Si quieres, te llevo a Trade o a Markets.`,
                `I have live context for ${marketSnapshot.asset}${marketSnapshot.currentPriceLabel ? ` at ${marketSnapshot.currentPriceLabel}` : ''}. If you want, I can take you to Trade or Markets.`,
              )
            : t(
                input.language,
                `No tengo un feed confirmado en vivo para ${marketSnapshot.asset}, pero si contexto suficiente para llevarte al mercado.`,
                `I do not have a confirmed live feed for ${marketSnapshot.asset}, but I do have enough context to take you to Markets.`,
              )
          : t(input.language, 'Te llevo a Mercados o a Spot.', 'I can take you to Markets or Spot.'),
      ),
      actions: ['view_market', 'go_trade', 'wallet_open'],
      mood: marketSnapshot?.hasRealtimeFeed === false ? 'warning' : 'normal',
    });
  }

  if (intent === 'trade') {
    return buildTradeContextResponse(input, tools);
  }

  if (intent === 'ramp') {
    return buildRampContextResponse(input, tools);
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
    if (input.screen === 'security' && isScreenGuidanceQuestion(input.message)) {
      const screenGuidanceResponse = buildScreenGuidanceResponse(input, tools);
      if (screenGuidanceResponse) {
        return screenGuidanceResponse;
      }
    }

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
        `Ahora mismo estoy tomando como contexto ${currentModule.title}${input.currentTask ? ` en ${input.currentTask}` : ''}${rampState?.summary ? `. ${rampState.summary}` : ''}. Puedo ayudarte a moverte dentro de OrbitX de forma clara y segura si me dices si quieres wallet, mercado, trade, Social o Bot Futures.`,
        `Right now I am using ${currentModule.title}${input.currentTask ? ` in ${input.currentTask}` : ''}${rampState?.summary ? `. ${rampState.summary}` : ''}. I can help you move through OrbitX clearly and safely if you tell me whether you want wallet, markets, trade, Social or Bot Futures.`,
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
  const intent = detectIntent(safeInput.message, safeInput);

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
      lastScreen: safeInput.screen,
      lastTask: safeInput.currentTask,
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
      lastScreen: safeInput.screen,
      lastTask: safeInput.currentTask,
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
      lastScreen: safeInput.screen,
      lastTask: safeInput.currentTask,
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
      lastScreen: safeInput.screen,
      lastTask: safeInput.currentTask,
    });
    console.warn('[OrbitX][AstraCore] fallback response used', {
      intent,
      screen: safeInput.screen,
      reason: error instanceof Error ? error.message : 'UNKNOWN',
    });

    return fallbackResponse;
  }
}

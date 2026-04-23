import {
  createNanobananaConfig,
  describeNanobananaAvailability,
} from './nanobanana-client.js';

const STATUS_LEGEND = {
  available: 'Disponible para el usuario dentro de OrbitX.',
  visual_demo: 'Visible en la interfaz, pero no necesariamente conectado a ejecucion real.',
  in_development: 'En desarrollo; puede verse parcialmente o estar preparado para la siguiente fase.',
  future: 'Planeado para una fase futura; no debe prometerse como activo hoy.',
  external_dependency: 'Depende de conexion externa o proveedor adicional.',
};

function getNanobananaAvailability() {
  return describeNanobananaAvailability(createNanobananaConfig(process.env));
}

const PRODUCT_IDENTITY = {
  name: 'OrbitX',
  role: 'crypto super app',
  summary:
    'OrbitX integra wallet, compra y venta, trading spot, mercados, social, herramientas inteligentes, Bot Futures y flujos creativos en una experiencia premium guiada por Astra.',
  astraRole:
    'Astra es la asistente inteligente oficial de OrbitX. Guia, explica, resuelve dudas, interpreta errores y orienta al usuario segun la pantalla actual.',
  rules: [
    'No inventar funciones ni estados del sistema.',
    'No afirmar ejecuciones que no se confirmaron.',
    'Diferenciar entre disponible, visual/demo, en desarrollo y futuro.',
    'Guiar al usuario hacia el siguiente paso real dentro de OrbitX.',
  ],
};

const MODULES = {
  general: {
    id: 'general',
    title: 'OrbitX',
    focus: 'Orientacion general entre wallet, mercado, trade, social, seguridad y Bot Futures.',
    whatUserSees: [
      'Entradas principales al ecosistema OrbitX',
      'Resumen general y accesos rapidos',
      'Ayuda transversal entre modulos',
    ],
    helpTopics: ['empezar', 'entender modulos', 'elegir siguiente accion'],
    capabilities: [
      { key: 'app_navigation', status: 'available' },
      { key: 'guided_help', status: 'available' },
      { key: 'cross_module_context', status: 'available' },
    ],
    availableActions: ['wallet_create', 'view_market', 'go_trade', 'get_started'],
  },
  home: {
    id: 'home',
    title: 'Home',
    focus: 'Centro principal con resumen visual, accesos rapidos, mercado y widgets inteligentes.',
    whatUserSees: [
      'Resumen general del ecosistema',
      'Accesos rapidos a wallet, trade, social y bot',
      'Cards o widgets dinamicos, alertas y oportunidades',
    ],
    helpTopics: ['que muestra inicio', 'para que sirve cada bloque', 'donde empezar'],
    capabilities: [
      { key: 'dynamic_widgets', status: 'available' },
      { key: 'smart_shortcuts', status: 'available' },
      { key: 'promotions_and_alerts', status: 'visual_demo' },
    ],
    availableActions: ['wallet_open', 'view_market', 'go_trade'],
  },
  wallet: {
    id: 'wallet',
    title: 'Wallet',
    focus: 'Espacio para ver balances, depositar, retirar, revisar historial y gestionar activos.',
    whatUserSees: [
      'Balance total y balances por token',
      'Direcciones de recepcion y movimientos',
      'Resumen visual del portafolio y estado de transacciones',
    ],
    helpTopics: ['crear wallet', 'importar wallet', 'depositar', 'retirar', 'transaccion retrasada'],
    capabilities: [
      { key: 'wallet_create', status: 'available' },
      { key: 'wallet_import', status: 'available' },
      { key: 'deposit_flow', status: 'available' },
      { key: 'withdraw_flow', status: 'available' },
      { key: 'transaction_status', status: 'available' },
    ],
    availableActions: ['wallet_create', 'wallet_open', 'buy_crypto', 'review_security'],
  },
  trade: {
    id: 'trade',
    title: 'Trade / Spot',
    focus: 'Modulo spot para revisar grafico, precio, libro de ordenes y ejecutar compra o venta.',
    whatUserSees: [
      'Grafico y precio actual',
      'Libro de ordenes y datos del par',
      'Compra, venta, historial y ordenes abiertas',
    ],
    helpTopics: ['como comprar', 'como vender', 'orden no ejecutada', 'diferencia entre precio y cantidad'],
    capabilities: [
      { key: 'spot_trade', status: 'available' },
      { key: 'chart', status: 'available' },
      { key: 'order_book', status: 'available' },
      { key: 'advanced_orders', status: 'visual_demo' },
    ],
    availableActions: ['go_trade', 'view_market', 'wallet_open'],
  },
  market: {
    id: 'market',
    title: 'Markets',
    focus: 'Descubrimiento de activos, comportamiento del mercado, tendencia y acceso rapido a pares.',
    whatUserSees: [
      'Listado de criptomonedas',
      'Top gainers, losers y volumen',
      'Busqueda, filtros y acceso a trade o fichas',
    ],
    helpTopics: ['como leer mercados', 'como buscar un activo', 'como ir a trade desde markets'],
    capabilities: [
      { key: 'asset_listing', status: 'available' },
      { key: 'filters_and_search', status: 'available' },
      { key: 'market_snapshot', status: 'visual_demo' },
    ],
    availableActions: ['view_market', 'go_trade', 'wallet_open'],
  },
  social: {
    id: 'social',
    title: 'Social',
    focus: 'Espacio comunitario para publicaciones, creadores, contenido cripto y descubrimiento.',
    whatUserSees: [
      'Feed de publicaciones y contenido corto',
      'Creadores verificados, interacciones y comunidad',
      'Contenido relacionado a cripto, gifts y experiencias en vivo si aplica',
    ],
    helpTopics: ['como funciona social', 'contenido verificado', 'como interactuar', 'como publicar'],
    capabilities: [
      { key: 'post_creation', status: 'available' },
      { key: 'creator_profiles', status: 'available' },
      { key: 'gifts', status: 'available' },
      { key: 'live_experiences', status: 'visual_demo' },
    ],
    availableActions: ['open_social', 'open_profile', 'view_market'],
  },
  create_token: {
    id: 'create_token',
    title: 'Crear token',
    focus: 'Wizard para configurar, firmar y lanzar un token o memecoin dentro del flujo OrbitX.',
    whatUserSees: [
      'Seleccion de wallet y red',
      'Configuracion del token: nombre, simbolo, supply, decimales e imagen',
      'Estimacion de costes, firma y resultado de lanzamiento',
    ],
    helpTopics: [
      'como crear un token',
      'como elegir wallet o red',
      'como subir una imagen',
      'como usar Crear imagen con Astra',
    ],
    capabilities: [
      { key: 'token_creation_wizard', status: 'available' },
      { key: 'real_evm_launch', status: 'available' },
      { key: 'protected_listing', status: 'in_development' },
      {
        key: 'astra_image_generation',
        status: getNanobananaAvailability().available ? 'external_dependency' : 'in_development',
      },
    ],
    availableActions: ['create_memecoin', 'wallet_open', 'view_market'],
  },
  bot_futures: {
    id: 'bot_futures',
    title: 'Bot Futures',
    focus: 'Modulo avanzado para command center, exchange, riesgo, señales y supervisión operativa.',
    whatUserSees: [
      'Overview y command center',
      'Conexion de exchange, modo, estrategia y risk manager',
      'Posiciones, rendimiento, historial y panel tactico de Astra',
    ],
    helpTopics: ['que hace bot futures', 'riesgos', 'que es informativo', 'que ejecuta realmente'],
    capabilities: [
      { key: 'command_center', status: 'available' },
      { key: 'multi_exchange_onboarding', status: 'available' },
      { key: 'execution_real', status: 'visual_demo' },
      { key: 'signals_and_logs', status: 'visual_demo' },
    ],
    availableActions: ['open_bot_futures', 'connect_exchange', 'review_security'],
  },
  security: {
    id: 'security',
    title: 'Seguridad',
    focus: 'Protecciones de cuenta, 2FA, sesiones, bloqueo y controles delicados.',
    whatUserSees: [
      'Ajustes de seguridad de la cuenta',
      '2FA, sesiones activas y bloqueo automatico',
      'Controles de proteccion y revisiones',
    ],
    helpTopics: ['activar 2fa', 'revisar sesiones', 'bloqueo automatico', 'riesgos de seguridad'],
    capabilities: [
      { key: 'security_center', status: 'available' },
      { key: 'session_review', status: 'available' },
      { key: 'advanced_security_controls', status: 'in_development' },
    ],
    availableActions: ['review_security', 'open_profile', 'wallet_open'],
  },
  settings: {
    id: 'settings',
    title: 'Configuracion',
    focus: 'Preferencias del usuario, idioma, apariencia, notificaciones y ajustes tecnicos.',
    whatUserSees: [
      'Idioma y apariencia',
      'Notificaciones y preferencias',
      'Ajustes tecnicos o cuentas conectadas segun modulo',
    ],
    helpTopics: ['cambiar idioma', 'ajustar experiencia', 'revisar preferencias'],
    capabilities: [
      { key: 'language_settings', status: 'available' },
      { key: 'appearance_settings', status: 'available' },
      { key: 'notification_settings', status: 'available' },
    ],
    availableActions: ['open_profile', 'review_security', 'get_started'],
  },
  ramp: {
    id: 'ramp',
    title: 'Ramp',
    focus: 'Compra, venta, conversion y pagos segun los modos activos configurados.',
    whatUserSees: [
      'Resumen de proveedor y flujo activo',
      'Compra, venta, convert o pay si estan habilitados',
      'Estados de resumen y validacion',
    ],
    helpTopics: ['comprar crypto', 'vender crypto', 'convertir activos', 'pagar'],
    capabilities: [
      { key: 'buy', status: 'available' },
      { key: 'sell', status: 'available' },
      { key: 'convert', status: 'available' },
      { key: 'pay', status: 'available' },
    ],
    availableActions: ['buy_crypto', 'sell_crypto', 'wallet_open'],
  },
  profile: {
    id: 'profile',
    title: 'Perfil',
    focus: 'Datos del usuario, Orbit ID, accesos a preferencias y rutas personales.',
    whatUserSees: ['Orbit ID', 'Preferencias', 'Accesos a seguridad, idioma y ajustes personales'],
    helpTopics: ['donde esta mi id', 'abrir perfil', 'cambiar ajustes'],
    capabilities: [
      { key: 'orbit_id', status: 'available' },
      { key: 'profile_settings', status: 'available' },
    ],
    availableActions: ['find_user_id', 'open_profile', 'review_security'],
  },
  pool: {
    id: 'pool',
    title: 'Monthly Pool',
    focus: 'Participacion en pool/rewards mensual dentro del ecosistema OrbitX.',
    whatUserSees: ['Estado del pool', 'participacion', 'tiempo restante y posicion estimada'],
    helpTopics: ['como participar', 'estado del pool', 'tiempo restante'],
    capabilities: [
      { key: 'pool_view', status: 'available' },
      { key: 'pool_participation', status: 'available' },
    ],
    availableActions: ['wallet_open', 'get_started', 'view_market'],
  },
};

const FLOWS = {
  start_orbitx: {
    id: 'start_orbitx',
    summary: 'Entrar, entender Home y elegir el primer modulo util.',
    steps: ['Abrir Home', 'Revisar accesos rapidos', 'Crear wallet o ver mercado'],
  },
  wallet_setup: {
    id: 'wallet_setup',
    summary: 'Crear o importar wallet, revisar seguridad y preparar fondos.',
    steps: ['Abrir Wallet', 'Crear o importar', 'Revisar Seguridad', 'Depositar o comprar crypto'],
  },
  trade_spot: {
    id: 'trade_spot',
    summary: 'Elegir par, revisar contexto y ejecutar compra o venta spot.',
    steps: ['Abrir Markets o Spot', 'Elegir par', 'Definir precio/cantidad', 'Confirmar orden'],
  },
  social_exploration: {
    id: 'social_exploration',
    summary: 'Explorar feed, perfiles, contenido verificado e interacciones.',
    steps: ['Entrar a Social', 'Revisar feed', 'Abrir perfil o contenido', 'Interactuar o publicar'],
  },
  bot_futures_setup: {
    id: 'bot_futures_setup',
    summary: 'Conectar exchange, elegir modo y preparar estrategia/riesgo.',
    steps: ['Conectar exchange', 'Elegir modo', 'Configurar estrategia', 'Revisar risk manager'],
  },
  create_memecoin: {
    id: 'create_memecoin',
    summary: 'Crear un token/memecoin, definir imagen y preparar el lanzamiento.',
    steps: ['Elegir wallet', 'Elegir red', 'Configurar token', 'Subir imagen o usar Astra', 'Firmar y lanzar'],
  },
};

const COMMON_ISSUES = {
  wallet_funds_missing: {
    issue: 'No veo mis fondos',
    guidance: 'Revisa red, direccion usada y estado de la transaccion antes de asumir una perdida.',
  },
  deposit_pending: {
    issue: 'Mi deposito no aparece',
    guidance: 'Confirma red, hash y tiempo de confirmacion. Un deposito puede tardar por validaciones o red.',
  },
  withdraw_blocked: {
    issue: 'No puedo retirar',
    guidance: 'Revisa direccion, red, saldo disponible y si existe algun control o validacion pendiente.',
  },
  trade_not_filled: {
    issue: 'La orden no entra',
    guidance: 'Verifica tipo de orden, precio, cantidad y si el mercado alcanzo ese nivel.',
  },
  screen_confusion: {
    issue: 'No entiendo esta pantalla',
    guidance: 'Astra debe explicar que bloque ve el usuario y cual es la siguiente accion util dentro del modulo actual.',
  },
  module_load_error: {
    issue: 'No carga el modulo',
    guidance: 'Pedir revisar red, repetir la accion con seguridad y aislar si el problema es de pantalla o de servicio.',
  },
  chart_delay: {
    issue: 'El grafico no se actualiza',
    guidance: 'No inventar feed en tiempo real si no esta conectado; redirigir a Markets o explicar el estado real.',
  },
  bot_unresponsive: {
    issue: 'El bot no responde',
    guidance: 'Diferenciar entre vista informativa, flujo visual y ejecucion real antes de prometer accion.',
  },
  voice_audio_issue: {
    issue: 'El audio no funciona en Astra voz',
    guidance: 'Revisar permisos, salida de audio, red y estado actual de voz antes de sugerir reintento.',
  },
  strange_chat_reply: {
    issue: 'El chat respondio raro',
    guidance: 'Astra debe pedir el modulo y la accion que intentaba hacer el usuario si falta contexto.',
  },
};

function pickModule(screen) {
  if (!screen) return MODULES.general;
  return MODULES[screen] ?? MODULES.general;
}

function pickRelevantFlows(moduleId) {
  switch (moduleId) {
    case 'wallet':
      return [FLOWS.wallet_setup, FLOWS.trade_spot];
    case 'trade':
    case 'market':
      return [FLOWS.trade_spot, FLOWS.wallet_setup];
    case 'social':
      return [FLOWS.social_exploration, FLOWS.create_memecoin];
    case 'create_token':
      return [FLOWS.create_memecoin, FLOWS.wallet_setup];
    case 'bot_futures':
      return [FLOWS.bot_futures_setup];
    default:
      return [FLOWS.start_orbitx, FLOWS.wallet_setup];
  }
}

function pickRelevantIssues(moduleId, message) {
  const normalized = `${message ?? ''}`.toLowerCase();
  const issues = [];

  if (moduleId === 'wallet') {
    issues.push(COMMON_ISSUES.wallet_funds_missing, COMMON_ISSUES.deposit_pending, COMMON_ISSUES.withdraw_blocked);
  }

  if (moduleId === 'trade' || moduleId === 'market') {
    issues.push(COMMON_ISSUES.trade_not_filled, COMMON_ISSUES.chart_delay);
  }

  if (moduleId === 'bot_futures') {
    issues.push(COMMON_ISSUES.bot_unresponsive, COMMON_ISSUES.module_load_error);
  }

  if (moduleId === 'create_token' || normalized.includes('imagen') || normalized.includes('logo')) {
    issues.push(COMMON_ISSUES.screen_confusion);
  }

  if (normalized.includes('audio') || normalized.includes('voz')) {
    issues.push(COMMON_ISSUES.voice_audio_issue);
  }

  if (normalized.includes('raro') || normalized.includes('weird')) {
    issues.push(COMMON_ISSUES.strange_chat_reply);
  }

  return issues.length ? issues : [COMMON_ISSUES.screen_confusion];
}

function buildModulesCatalog() {
  return Object.values(MODULES).map((module) => ({
    id: module.id,
    title: module.title,
    focus: module.focus,
    capabilities: module.capabilities,
  }));
}

function buildRuntimeContext(input, currentModule) {
  return {
    screenName: input.screenName ?? null,
    summary: input.summary ?? null,
    currentTask: input.currentTask ?? null,
    selectedEntity: input.selectedEntity ?? null,
    uiState: input.uiState ?? null,
    userState: input.userState ?? null,
    labels: input.labels ?? null,
    capabilities: input.capabilities ?? null,
    rampState:
      input.rampMode || input.rampProviderLabel
        ? {
            mode: input.rampMode ?? null,
            provider: input.rampProviderLabel ?? null,
          }
        : null,
    botState:
      input.botEnabled == null && !input.botStatusLabel && !input.botTokenLabel
        ? null
        : {
            enabled: input.botEnabled ?? null,
            statusLabel: input.botStatusLabel ?? null,
            tokenLabel: input.botTokenLabel ?? null,
            riskLabel: input.botRiskLabel ?? null,
            allocationLabel: input.botAllocationLabel ?? null,
          },
    currentModuleLabel: currentModule.title,
  };
}

export function getOrbitxKnowledge(input) {
  const currentModule = pickModule(input.screen);
  const nanobananaAvailability = getNanobananaAvailability();
  const nanobananaReady = nanobananaAvailability.available;

  return {
    product: PRODUCT_IDENTITY,
    statusLegend: STATUS_LEGEND,
    currentModule,
    runtimeContext: buildRuntimeContext(input, currentModule),
    modulesCatalog: buildModulesCatalog(),
    relevantFlows: pickRelevantFlows(currentModule.id),
    commonIssues: pickRelevantIssues(currentModule.id, input.message),
    creativeImageGeneration: {
      title: 'Crear imagen con Astra',
      summary:
        'Dentro del flujo de crear token existe una opcion adicional junto a subir imagen para generar imagen con Astra.',
      providerLabel: nanobananaAvailability.providerLabel,
      status: nanobananaReady ? 'external_dependency' : 'in_development',
      stateLabel: nanobananaReady
        ? `La arquitectura esta lista y depende del proveedor visual configurado (${nanobananaAvailability.model}).`
        : nanobananaAvailability.message,
      supportedBehaviors: [
        'Sugerir prompts visuales automaticamente',
        'Ayudar a refinar el prompt antes de generar',
        'Mostrar estados de loading, error y resultado',
        'Permitir elegir una imagen generada como base del token o meme',
      ],
      limitations: [
        'No debe afirmar que ya genero una imagen si la solicitud sigue en curso.',
        'Si el proveedor no esta configurado, debe decirlo con claridad y sin fingir resultado.',
      ],
    },
  };
}

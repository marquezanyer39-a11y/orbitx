import { formatCurrencyByLanguage } from '../../../constants/i18n';
import type { LanguageCode } from '../../../types';
import type { RampMode, RampProviderId } from '../../types/ramp';

type RampCopyLanguage = LanguageCode;

interface RampCopy {
  sectionTitle: string;
  sectionSubtitle: string;
  modeLabel: (mode: RampMode) => string;
  modeBody: (mode: RampMode) => string;
  summaryTitle: string;
  summarySubtitle: string;
  providerRecommended: string;
  providerPendingQuote: string;
  providerUnavailable: string;
  continueLabel: string;
  startFlowLabel: string;
  openingProvider: string;
  redirecting: string;
  kyc: string;
  processing: string;
  completed: string;
  failed: string;
  cancelled: string;
  resultTitle: (status: 'completed' | 'failed' | 'cancelled') => string;
  resultBody: (status: 'completed' | 'failed' | 'cancelled', provider: string) => string;
  askAstra: string;
  partnerFee: string;
  providerFee: string;
  providerFeePending: string;
  totalEstimated: string;
  amount: string;
  network: string;
  provider: string;
  country: string;
  method: string;
  revenueHint: string;
  configMissingTitle: string;
  configMissingBody: (provider: string) => string;
  statusLabel: string;
  flowComplete: string;
  flowCancel: string;
  flowRetry: string;
  activeCountryDisabled: string;
  unsupportedMode: string;
  backToWallet: string;
  liveProviderNotice: (provider: string) => string;
  pendingQuoteHint: string;
  providerDepends: string;
  continueDisabled: string;
  buyLabel: string;
  sellLabel: string;
  convertLabel: string;
  payLabel: string;
}

const RAMP_COPY: Record<RampCopyLanguage, RampCopy> = {
  en: {
    sectionTitle: 'On-ramp / off-ramp',
    sectionSubtitle: 'Buy, sell and convert crypto with an external regulated provider.',
    modeLabel: (mode) =>
      mode === 'buy'
        ? 'Buy'
        : mode === 'sell'
          ? 'Sell'
          : mode === 'convert'
            ? 'Convert'
            : 'Pay',
    modeBody: (mode) =>
      mode === 'buy'
        ? 'Move from fiat into crypto with KYC handled by the provider.'
        : mode === 'sell'
          ? 'Exit from crypto into fiat with the provider handling compliance and payout.'
          : mode === 'convert'
            ? 'Convert crypto into fiat through the provider off-ramp flow.'
            : 'Pay with crypto only when the provider enables that product.',
    summaryTitle: 'Review before continuing',
    summarySubtitle: 'OrbitX shows context, fees and provider status before redirecting you.',
    providerRecommended: 'Recommended provider',
    providerPendingQuote: 'Live quote pending provider configuration',
    providerUnavailable: 'Provider unavailable',
    continueLabel: 'Continue',
    startFlowLabel: 'Open provider',
    openingProvider: 'Starting provider flow',
    redirecting: 'Redirecting to provider',
    kyc: 'Provider KYC in progress',
    processing: 'Provider is processing the order',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
    resultTitle: (status) =>
      status === 'completed' ? 'Order completed' : status === 'cancelled' ? 'Flow cancelled' : 'Order failed',
    resultBody: (status, provider) =>
      status === 'completed'
        ? `${provider} confirmed the order and sent the final result back to OrbitX.`
        : status === 'cancelled'
          ? `The ${provider} flow was cancelled before completion.`
          : `${provider} returned a failure or incomplete result. Review the details before retrying.`,
    askAstra: 'Ask Astra',
    partnerFee: 'OrbitX partner fee',
    providerFee: 'Provider fees',
    providerFeePending: 'Will be confirmed by the provider',
    totalEstimated: 'Estimated total',
    amount: 'Amount',
    network: 'Network',
    provider: 'Provider',
    country: 'Country',
    method: 'Payment method',
    revenueHint: 'Estimated revenue share',
    configMissingTitle: 'Provider setup pending',
    configMissingBody: (provider) =>
      `${provider} still needs the quote or widget-session endpoint configured before OrbitX can launch the live flow.`,
    statusLabel: 'Status',
    flowComplete: 'Completed',
    flowCancel: 'Cancel flow',
    flowRetry: 'Retry',
    activeCountryDisabled: 'This country is not enabled in the current OrbitX configuration.',
    unsupportedMode: 'This mode is not enabled yet for the selected provider.',
    backToWallet: 'Back to wallet',
    liveProviderNotice: (provider) =>
      `KYC, AML, fiat processing and execution are handled directly by ${provider}. OrbitX only orchestrates the experience.`,
    pendingQuoteHint: 'OrbitX will show exact provider fees as soon as the provider quote endpoint is configured.',
    providerDepends: 'The financial flow depends on the external provider.',
    continueDisabled: 'Complete provider setup to unlock the live flow.',
    buyLabel: 'Buy',
    sellLabel: 'Sell',
    convertLabel: 'Convert',
    payLabel: 'Pay',
  },
  es: {
    sectionTitle: 'On-ramp / off-ramp',
    sectionSubtitle: 'Compra, vende y convierte crypto con un proveedor externo regulado.',
    modeLabel: (mode) =>
      mode === 'buy'
        ? 'Comprar'
        : mode === 'sell'
          ? 'Vender'
          : mode === 'convert'
            ? 'Convertir'
            : 'Pagar',
    modeBody: (mode) =>
      mode === 'buy'
        ? 'Pasa de fiat a crypto con KYC gestionado por el proveedor.'
        : mode === 'sell'
          ? 'Pasa de crypto a fiat con cumplimiento y payout gestionados por el proveedor.'
          : mode === 'convert'
            ? 'Convierte crypto a fiat usando el flujo off-ramp del proveedor.'
            : 'Paga con crypto solo cuando el proveedor tenga ese producto habilitado.',
    summaryTitle: 'Revisa antes de continuar',
    summarySubtitle: 'OrbitX te muestra contexto, comisiones y estado del proveedor antes de redirigirte.',
    providerRecommended: 'Proveedor recomendado',
    providerPendingQuote: 'Cotizacion real pendiente de configuracion del proveedor',
    providerUnavailable: 'Proveedor no disponible',
    continueLabel: 'Continuar',
    startFlowLabel: 'Abrir proveedor',
    openingProvider: 'Iniciando flujo del proveedor',
    redirecting: 'Redirigiendo al proveedor',
    kyc: 'Verificacion KYC del proveedor',
    processing: 'El proveedor esta procesando la orden',
    completed: 'Completado',
    failed: 'Fallido',
    cancelled: 'Cancelado',
    resultTitle: (status) =>
      status === 'completed' ? 'Orden completada' : status === 'cancelled' ? 'Flujo cancelado' : 'Orden fallida',
    resultBody: (status, provider) =>
      status === 'completed'
        ? `${provider} confirmo la orden y devolvio el resultado final a OrbitX.`
        : status === 'cancelled'
          ? `El flujo de ${provider} se cancelo antes de completarse.`
          : `${provider} devolvio un resultado fallido o incompleto. Revisa los detalles antes de reintentar.`,
    askAstra: 'Preguntar a Astra',
    partnerFee: 'Partner fee OrbitX',
    providerFee: 'Comisiones del proveedor',
    providerFeePending: 'Se confirmara dentro del proveedor',
    totalEstimated: 'Total estimado',
    amount: 'Monto',
    network: 'Red',
    provider: 'Proveedor',
    country: 'Pais',
    method: 'Metodo de pago',
    revenueHint: 'Revenue share estimado',
    configMissingTitle: 'Configuracion del proveedor pendiente',
    configMissingBody: (provider) =>
      `${provider} aun necesita el endpoint de cotizacion o de sesion del widget antes de que OrbitX pueda lanzar el flujo real.`,
    statusLabel: 'Estado',
    flowComplete: 'Completado',
    flowCancel: 'Cancelar flujo',
    flowRetry: 'Reintentar',
    activeCountryDisabled: 'Este pais no esta habilitado en la configuracion actual de OrbitX.',
    unsupportedMode: 'Este modo todavia no esta habilitado para el proveedor seleccionado.',
    backToWallet: 'Volver a billetera',
    liveProviderNotice: (provider) =>
      `KYC, AML, procesamiento fiat y ejecucion financiera dependen directamente de ${provider}. OrbitX solo orquesta la experiencia.`,
    pendingQuoteHint: 'OrbitX mostrara comisiones exactas en cuanto el endpoint de cotizacion del proveedor quede configurado.',
    providerDepends: 'El flujo financiero depende del proveedor externo.',
    continueDisabled: 'Completa la configuracion del proveedor para desbloquear el flujo real.',
    buyLabel: 'Comprar',
    sellLabel: 'Vender',
    convertLabel: 'Convertir',
    payLabel: 'Pagar',
  },
  pt: {
    sectionTitle: 'On-ramp / off-ramp',
    sectionSubtitle: 'Compre, venda e converta cripto com um provedor externo regulado.',
    modeLabel: (mode) => (mode === 'buy' ? 'Comprar' : mode === 'sell' ? 'Vender' : mode === 'convert' ? 'Converter' : 'Pagar'),
    modeBody: (mode) =>
      mode === 'buy'
        ? 'Passe de fiat para cripto com KYC gerido pelo provedor.'
        : mode === 'sell'
          ? 'Passe de cripto para fiat com compliance e payout geridos pelo provedor.'
          : mode === 'convert'
            ? 'Converta cripto em fiat usando o fluxo off-ramp do provedor.'
            : 'Pague com cripto somente quando o provedor habilitar esse produto.',
    summaryTitle: 'Revise antes de continuar',
    summarySubtitle: 'A OrbitX mostra contexto, taxas e status do provedor antes do redirecionamento.',
    providerRecommended: 'Provedor recomendado',
    providerPendingQuote: 'Cotacao real pendente de configuracao do provedor',
    providerUnavailable: 'Provedor indisponivel',
    continueLabel: 'Continuar',
    startFlowLabel: 'Abrir provedor',
    openingProvider: 'Iniciando fluxo do provedor',
    redirecting: 'Redirecionando para o provedor',
    kyc: 'Verificacao KYC do provedor',
    processing: 'O provedor esta processando a ordem',
    completed: 'Concluido',
    failed: 'Falhou',
    cancelled: 'Cancelado',
    resultTitle: (status) => (status === 'completed' ? 'Ordem concluida' : status === 'cancelled' ? 'Fluxo cancelado' : 'Ordem falhou'),
    resultBody: (status, provider) =>
      status === 'completed'
        ? `${provider} confirmou a ordem e devolveu o resultado final para a OrbitX.`
        : status === 'cancelled'
          ? `O fluxo de ${provider} foi cancelado antes da conclusao.`
          : `${provider} devolveu um resultado com falha ou incompleto. Revise os detalhes antes de tentar novamente.`,
    askAstra: 'Perguntar para Astra',
    partnerFee: 'Partner fee OrbitX',
    providerFee: 'Taxas do provedor',
    providerFeePending: 'Sera confirmado dentro do provedor',
    totalEstimated: 'Total estimado',
    amount: 'Valor',
    network: 'Rede',
    provider: 'Provedor',
    country: 'Pais',
    method: 'Metodo de pagamento',
    revenueHint: 'Revenue share estimado',
    configMissingTitle: 'Configuracao do provedor pendente',
    configMissingBody: (provider) => `${provider} ainda precisa do endpoint de cotacao ou de sessao do widget antes que a OrbitX possa iniciar o fluxo real.`,
    statusLabel: 'Status',
    flowComplete: 'Concluido',
    flowCancel: 'Cancelar fluxo',
    flowRetry: 'Tentar novamente',
    activeCountryDisabled: 'Este pais nao esta habilitado na configuracao atual da OrbitX.',
    unsupportedMode: 'Este modo ainda nao esta habilitado para o provedor selecionado.',
    backToWallet: 'Voltar para carteira',
    liveProviderNotice: (provider) => `KYC, AML, processamento fiat e execucao financeira dependem diretamente da ${provider}. A OrbitX so orquestra a experiencia.`,
    pendingQuoteHint: 'A OrbitX exibira taxas exatas assim que o endpoint de cotacao do provedor estiver configurado.',
    providerDepends: 'O fluxo financeiro depende do provedor externo.',
    continueDisabled: 'Conclua a configuracao do provedor para liberar o fluxo real.',
    buyLabel: 'Comprar',
    sellLabel: 'Vender',
    convertLabel: 'Converter',
    payLabel: 'Pagar',
  },
  'zh-Hans': {
    sectionTitle: '法币入口 / 出口',
    sectionSubtitle: '通过受监管的外部服务商直接买卖和转换加密资产。',
    modeLabel: (mode) => (mode === 'buy' ? '买入' : mode === 'sell' ? '卖出' : mode === 'convert' ? '兑换' : '支付'),
    modeBody: (mode) =>
      mode === 'buy'
        ? '由服务商完成 KYC 后，将法币转换为加密资产。'
        : mode === 'sell'
          ? '由服务商负责合规与出金，将加密资产转换为法币。'
          : mode === 'convert'
            ? '通过服务商的 off-ramp 流程把加密资产转换为法币。'
            : '仅当服务商支持时，才可使用加密资产支付。',
    summaryTitle: '继续前请确认',
    summarySubtitle: 'OrbitX 会先展示上下文、费用和服务商状态，再进行跳转。',
    providerRecommended: '推荐服务商',
    providerPendingQuote: '实时报价等待服务商配置完成',
    providerUnavailable: '服务商不可用',
    continueLabel: '继续',
    startFlowLabel: '打开服务商',
    openingProvider: '正在启动服务商流程',
    redirecting: '正在跳转到服务商',
    kyc: '服务商 KYC 验证中',
    processing: '服务商正在处理订单',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消',
    resultTitle: (status) => (status === 'completed' ? '订单已完成' : status === 'cancelled' ? '流程已取消' : '订单失败'),
    resultBody: (status, provider) =>
      status === 'completed'
        ? `${provider} 已确认订单，并将最终结果返回给 OrbitX。`
        : status === 'cancelled'
          ? `${provider} 流程在完成前已被取消。`
          : `${provider} 返回了失败或不完整的结果。请先查看详情再重试。`,
    askAstra: '询问 Astra',
    partnerFee: 'OrbitX 合作费',
    providerFee: '服务商费用',
    providerFeePending: '将在服务商页面确认',
    totalEstimated: '预计总额',
    amount: '金额',
    network: '网络',
    provider: '服务商',
    country: '国家/地区',
    method: '支付方式',
    revenueHint: '预计分成',
    configMissingTitle: '服务商配置未完成',
    configMissingBody: (provider) => `${provider} 仍需要配置报价或 widget 会话端点，OrbitX 才能发起真实流程。`,
    statusLabel: '状态',
    flowComplete: '已完成',
    flowCancel: '取消流程',
    flowRetry: '重试',
    activeCountryDisabled: '当前 OrbitX 配置尚未启用该国家/地区。',
    unsupportedMode: '所选服务商暂未启用此模式。',
    backToWallet: '返回钱包',
    liveProviderNotice: (provider) => `KYC、AML、法币处理和金融执行均由 ${provider} 直接负责，OrbitX 仅负责前端编排。`,
    pendingQuoteHint: '一旦服务商报价端点配置完成，OrbitX 就会显示准确费用。',
    providerDepends: '金融流程由外部服务商负责。',
    continueDisabled: '请先完成服务商配置，再开启真实流程。',
    buyLabel: '买入',
    sellLabel: '卖出',
    convertLabel: '兑换',
    payLabel: '支付',
  },
  hi: {
    sectionTitle: 'ऑन-रैंप / ऑफ-रैंप',
    sectionSubtitle: 'एक नियामित बाहरी प्रदाता के साथ सीधे क्रिप्टो खरीदें, बेचें और कन्वर्ट करें।',
    modeLabel: (mode) => (mode === 'buy' ? 'खरीदें' : mode === 'sell' ? 'बेचें' : mode === 'convert' ? 'कन्वर्ट' : 'भुगतान'),
    modeBody: (mode) =>
      mode === 'buy'
        ? 'प्रदाता द्वारा KYC संभालने के बाद fiat से crypto में जाएं।'
        : mode === 'sell'
          ? 'प्रदाता compliance और payout संभालते हुए crypto से fiat में जाएं।'
          : mode === 'convert'
            ? 'प्रदाता के off-ramp फ्लो से crypto को fiat में बदलें।'
            : 'केवल तब भुगतान करें जब प्रदाता यह उत्पाद सक्रिय करे।',
    summaryTitle: 'आगे बढ़ने से पहले समीक्षा करें',
    summarySubtitle: 'OrbitX रीडायरेक्ट से पहले संदर्भ, शुल्क और प्रदाता की स्थिति दिखाता है।',
    providerRecommended: 'सुझाया गया प्रदाता',
    providerPendingQuote: 'लाइव कोट प्रदाता कॉन्फ़िगरेशन की प्रतीक्षा में है',
    providerUnavailable: 'प्रदाता उपलब्ध नहीं है',
    continueLabel: 'जारी रखें',
    startFlowLabel: 'प्रदाता खोलें',
    openingProvider: 'प्रदाता फ्लो शुरू हो रहा है',
    redirecting: 'प्रदाता की ओर रीडायरेक्ट किया जा रहा है',
    kyc: 'प्रदाता KYC चल रहा है',
    processing: 'प्रदाता ऑर्डर प्रोसेस कर रहा है',
    completed: 'पूरा हुआ',
    failed: 'विफल',
    cancelled: 'रद्द',
    resultTitle: (status) => (status === 'completed' ? 'ऑर्डर पूरा हुआ' : status === 'cancelled' ? 'फ्लो रद्द हुआ' : 'ऑर्डर विफल हुआ'),
    resultBody: (status, provider) =>
      status === 'completed'
        ? `${provider} ने ऑर्डर की पुष्टि की और अंतिम परिणाम OrbitX को लौटाया।`
        : status === 'cancelled'
          ? `${provider} फ्लो पूरा होने से पहले रद्द कर दिया गया।`
          : `${provider} ने विफल या अधूरा परिणाम लौटाया। दोबारा कोशिश से पहले विवरण देखें।`,
    askAstra: 'Astra से पूछें',
    partnerFee: 'OrbitX पार्टनर शुल्क',
    providerFee: 'प्रदाता शुल्क',
    providerFeePending: 'प्रदाता के भीतर पुष्टि होगी',
    totalEstimated: 'अनुमानित कुल',
    amount: 'राशि',
    network: 'नेटवर्क',
    provider: 'प्रदाता',
    country: 'देश',
    method: 'भुगतान विधि',
    revenueHint: 'अनुमानित रेवेन्यू शेयर',
    configMissingTitle: 'प्रदाता सेटअप लंबित है',
    configMissingBody: (provider) => `${provider} को अभी quote या widget-session endpoint की आवश्यकता है, तभी OrbitX लाइव फ्लो शुरू कर सकता है।`,
    statusLabel: 'स्थिति',
    flowComplete: 'पूरा हुआ',
    flowCancel: 'फ्लो रद्द करें',
    flowRetry: 'फिर कोशिश करें',
    activeCountryDisabled: 'यह देश OrbitX की वर्तमान कॉन्फ़िगरेशन में सक्षम नहीं है।',
    unsupportedMode: 'यह मोड चुने हुए प्रदाता के लिए अभी सक्षम नहीं है।',
    backToWallet: 'वॉलेट पर वापस जाएं',
    liveProviderNotice: (provider) => `KYC, AML, fiat प्रोसेसिंग और वित्तीय निष्पादन सीधे ${provider} संभालता है। OrbitX केवल अनुभव को व्यवस्थित करता है।`,
    pendingQuoteHint: 'जैसे ही प्रदाता quote endpoint कॉन्फ़िगर होगा, OrbitX सटीक शुल्क दिखाएगा।',
    providerDepends: 'वित्तीय फ्लो बाहरी प्रदाता पर निर्भर करता है।',
    continueDisabled: 'लाइव फ्लो खोलने के लिए पहले प्रदाता सेटअप पूरा करें।',
    buyLabel: 'खरीदें',
    sellLabel: 'बेचें',
    convertLabel: 'कन्वर्ट',
    payLabel: 'भुगतान',
  },
  ru: {
    sectionTitle: 'On-ramp / off-ramp',
    sectionSubtitle: 'Покупайте, продавайте и конвертируйте крипту через внешнего регулируемого провайдера.',
    modeLabel: (mode) => (mode === 'buy' ? 'Купить' : mode === 'sell' ? 'Продать' : mode === 'convert' ? 'Конвертировать' : 'Оплатить'),
    modeBody: (mode) =>
      mode === 'buy'
        ? 'Переход из fiat в crypto с KYC на стороне провайдера.'
        : mode === 'sell'
          ? 'Переход из crypto в fiat с исполнением и комплаенсом на стороне провайдера.'
          : mode === 'convert'
            ? 'Конвертация crypto в fiat через off-ramp провайдера.'
            : 'Оплата криптой доступна только если провайдер поддерживает этот продукт.',
    summaryTitle: 'Проверьте перед продолжением',
    summarySubtitle: 'OrbitX сначала показывает контекст, комиссии и статус провайдера.',
    providerRecommended: 'Рекомендуемый провайдер',
    providerPendingQuote: 'Реальная котировка ждёт настройки провайдера',
    providerUnavailable: 'Провайдер недоступен',
    continueLabel: 'Продолжить',
    startFlowLabel: 'Открыть провайдера',
    openingProvider: 'Запускаем поток провайдера',
    redirecting: 'Переход к провайдеру',
    kyc: 'KYC провайдера',
    processing: 'Провайдер обрабатывает ордер',
    completed: 'Завершено',
    failed: 'Не удалось',
    cancelled: 'Отменено',
    resultTitle: (status) => (status === 'completed' ? 'Ордер завершен' : status === 'cancelled' ? 'Поток отменен' : 'Ордер завершился ошибкой'),
    resultBody: (status, provider) =>
      status === 'completed'
        ? `${provider} подтвердил ордер и вернул результат в OrbitX.`
        : status === 'cancelled'
          ? `Поток ${provider} был отменен до завершения.`
          : `${provider} вернул ошибку или неполный результат. Проверьте детали перед повтором.`,
    askAstra: 'Спросить Astra',
    partnerFee: 'Партнерская комиссия OrbitX',
    providerFee: 'Комиссии провайдера',
    providerFeePending: 'Будет подтверждено у провайдера',
    totalEstimated: 'Оценочный итог',
    amount: 'Сумма',
    network: 'Сеть',
    provider: 'Провайдер',
    country: 'Страна',
    method: 'Способ оплаты',
    revenueHint: 'Оценочный revenue share',
    configMissingTitle: 'Настройка провайдера не завершена',
    configMissingBody: (provider) => `${provider} всё ещё требует настроить quote или widget-session endpoint, прежде чем OrbitX сможет запустить реальный поток.`,
    statusLabel: 'Статус',
    flowComplete: 'Завершено',
    flowCancel: 'Отменить поток',
    flowRetry: 'Повторить',
    activeCountryDisabled: 'Эта страна не включена в текущей конфигурации OrbitX.',
    unsupportedMode: 'Этот режим пока не включен для выбранного провайдера.',
    backToWallet: 'Назад в кошелек',
    liveProviderNotice: (provider) => `KYC, AML, fiat-процессинг и финансовое исполнение выполняет ${provider}. OrbitX выступает только как фронтенд-оркестратор.`,
    pendingQuoteHint: 'Когда quote endpoint провайдера будет настроен, OrbitX покажет точные комиссии.',
    providerDepends: 'Финансовый поток зависит от внешнего провайдера.',
    continueDisabled: 'Завершите настройку провайдера, чтобы открыть реальный поток.',
    buyLabel: 'Купить',
    sellLabel: 'Продать',
    convertLabel: 'Конвертировать',
    payLabel: 'Оплатить',
  },
  ar: {
    sectionTitle: 'الدخول / الخروج النقدي',
    sectionSubtitle: 'اشترِ وبِع وحوّل العملات الرقمية عبر مزود خارجي منظم.',
    modeLabel: (mode) => (mode === 'buy' ? 'شراء' : mode === 'sell' ? 'بيع' : mode === 'convert' ? 'تحويل' : 'دفع'),
    modeBody: (mode) =>
      mode === 'buy'
        ? 'الانتقال من العملات الورقية إلى العملات الرقمية مع KYC من المزود.'
        : mode === 'sell'
          ? 'الانتقال من العملات الرقمية إلى العملات الورقية مع الامتثال والصرف عبر المزود.'
          : mode === 'convert'
            ? 'تحويل العملات الرقمية إلى عملات ورقية عبر تدفق off-ramp من المزود.'
            : 'الدفع بالعملات الرقمية متاح فقط إذا فعّل المزود هذا المنتج.',
    summaryTitle: 'راجع قبل المتابعة',
    summarySubtitle: 'يعرض OrbitX السياق والرسوم وحالة المزود قبل التحويل.',
    providerRecommended: 'المزود الموصى به',
    providerPendingQuote: 'السعر الفعلي بانتظار إعداد المزود',
    providerUnavailable: 'المزود غير متاح',
    continueLabel: 'متابعة',
    startFlowLabel: 'فتح المزود',
    openingProvider: 'جارٍ بدء تدفق المزود',
    redirecting: 'جارٍ التحويل إلى المزود',
    kyc: 'التحقق KYC لدى المزود',
    processing: 'المزود يعالج الطلب',
    completed: 'مكتمل',
    failed: 'فشل',
    cancelled: 'ملغي',
    resultTitle: (status) => (status === 'completed' ? 'اكتمل الطلب' : status === 'cancelled' ? 'تم إلغاء التدفق' : 'فشل الطلب'),
    resultBody: (status, provider) =>
      status === 'completed'
        ? `أكد ${provider} الطلب وأعاد النتيجة النهائية إلى OrbitX.`
        : status === 'cancelled'
          ? `تم إلغاء تدفق ${provider} قبل الاكتمال.`
          : `أعاد ${provider} نتيجة فاشلة أو غير مكتملة. راجع التفاصيل قبل إعادة المحاولة.`,
    askAstra: 'اسأل Astra',
    partnerFee: 'رسوم شريك OrbitX',
    providerFee: 'رسوم المزود',
    providerFeePending: 'سيتم تأكيدها داخل المزود',
    totalEstimated: 'الإجمالي التقديري',
    amount: 'المبلغ',
    network: 'الشبكة',
    provider: 'المزود',
    country: 'البلد',
    method: 'طريقة الدفع',
    revenueHint: 'حصة الإيراد التقديرية',
    configMissingTitle: 'إعداد المزود غير مكتمل',
    configMissingBody: (provider) => `لا يزال ${provider} بحاجة إلى endpoint للتسعير أو جلسة widget قبل أن يتمكن OrbitX من إطلاق التدفق الحقيقي.`,
    statusLabel: 'الحالة',
    flowComplete: 'مكتمل',
    flowCancel: 'إلغاء التدفق',
    flowRetry: 'إعادة المحاولة',
    activeCountryDisabled: 'هذا البلد غير مفعّل في إعداد OrbitX الحالي.',
    unsupportedMode: 'هذا الوضع غير مفعّل بعد للمزود المحدد.',
    backToWallet: 'العودة إلى المحفظة',
    liveProviderNotice: (provider) => `يقوم ${provider} مباشرةً بإدارة KYC وAML ومعالجة العملات الورقية والتنفيذ المالي. OrbitX ينسق التجربة فقط.`,
    pendingQuoteHint: 'سيعرض OrbitX الرسوم الدقيقة بمجرد إعداد endpoint التسعير الخاص بالمزود.',
    providerDepends: 'يعتمد التدفق المالي على المزود الخارجي.',
    continueDisabled: 'أكمل إعداد المزود لفتح التدفق الحقيقي.',
    buyLabel: 'شراء',
    sellLabel: 'بيع',
    convertLabel: 'تحويل',
    payLabel: 'دفع',
  },
  id: {
    sectionTitle: 'On-ramp / off-ramp',
    sectionSubtitle: 'Beli, jual, dan konversi kripto dengan penyedia eksternal yang teregulasi.',
    modeLabel: (mode) => (mode === 'buy' ? 'Beli' : mode === 'sell' ? 'Jual' : mode === 'convert' ? 'Konversi' : 'Bayar'),
    modeBody: (mode) =>
      mode === 'buy'
        ? 'Masuk dari fiat ke kripto dengan KYC yang ditangani penyedia.'
        : mode === 'sell'
          ? 'Keluar dari kripto ke fiat dengan kepatuhan dan payout yang ditangani penyedia.'
          : mode === 'convert'
            ? 'Konversi kripto ke fiat melalui alur off-ramp penyedia.'
            : 'Bayar dengan kripto hanya bila penyedia mengaktifkan produk tersebut.',
    summaryTitle: 'Tinjau sebelum lanjut',
    summarySubtitle: 'OrbitX menampilkan konteks, biaya, dan status penyedia sebelum pengalihan.',
    providerRecommended: 'Penyedia yang direkomendasikan',
    providerPendingQuote: 'Kutipan live menunggu konfigurasi penyedia',
    providerUnavailable: 'Penyedia tidak tersedia',
    continueLabel: 'Lanjutkan',
    startFlowLabel: 'Buka penyedia',
    openingProvider: 'Memulai alur penyedia',
    redirecting: 'Mengalihkan ke penyedia',
    kyc: 'KYC penyedia sedang berjalan',
    processing: 'Penyedia sedang memproses order',
    completed: 'Selesai',
    failed: 'Gagal',
    cancelled: 'Dibatalkan',
    resultTitle: (status) => (status === 'completed' ? 'Order selesai' : status === 'cancelled' ? 'Alur dibatalkan' : 'Order gagal'),
    resultBody: (status, provider) =>
      status === 'completed'
        ? `${provider} mengonfirmasi order dan mengembalikan hasil akhir ke OrbitX.`
        : status === 'cancelled'
          ? `Alur ${provider} dibatalkan sebelum selesai.`
          : `${provider} mengembalikan hasil gagal atau tidak lengkap. Tinjau detailnya sebelum mencoba lagi.`,
    askAstra: 'Tanya Astra',
    partnerFee: 'Partner fee OrbitX',
    providerFee: 'Biaya penyedia',
    providerFeePending: 'Akan dikonfirmasi di dalam penyedia',
    totalEstimated: 'Total estimasi',
    amount: 'Jumlah',
    network: 'Jaringan',
    provider: 'Penyedia',
    country: 'Negara',
    method: 'Metode pembayaran',
    revenueHint: 'Estimasi revenue share',
    configMissingTitle: 'Pengaturan penyedia belum selesai',
    configMissingBody: (provider) => `${provider} masih membutuhkan endpoint quote atau widget-session sebelum OrbitX bisa menjalankan alur live.`,
    statusLabel: 'Status',
    flowComplete: 'Selesai',
    flowCancel: 'Batalkan alur',
    flowRetry: 'Coba lagi',
    activeCountryDisabled: 'Negara ini belum diaktifkan pada konfigurasi OrbitX saat ini.',
    unsupportedMode: 'Mode ini belum diaktifkan untuk penyedia yang dipilih.',
    backToWallet: 'Kembali ke wallet',
    liveProviderNotice: (provider) => `KYC, AML, pemrosesan fiat, dan eksekusi keuangan ditangani langsung oleh ${provider}. OrbitX hanya mengorkestrasi pengalaman.`,
    pendingQuoteHint: 'OrbitX akan menampilkan biaya akurat begitu endpoint quote penyedia dikonfigurasi.',
    providerDepends: 'Alur keuangan bergantung pada penyedia eksternal.',
    continueDisabled: 'Selesaikan pengaturan penyedia untuk membuka alur live.',
    buyLabel: 'Beli',
    sellLabel: 'Jual',
    convertLabel: 'Konversi',
    payLabel: 'Bayar',
  },
};

export function getRampCopy(language: LanguageCode) {
  return RAMP_COPY[language] ?? RAMP_COPY.en;
}

export function formatRampMoney(language: LanguageCode, value?: number, currency = 'USD') {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '--';
  }

  return formatCurrencyByLanguage(language, value, currency);
}

export function getRampProviderLabel(providerId: RampProviderId) {
  return providerId === 'moonpay' ? 'MoonPay' : 'Transak';
}

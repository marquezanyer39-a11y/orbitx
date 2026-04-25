import { pickLanguageText } from '../../../constants/i18n';
import type { LanguageCode } from '../../../types';
import type { AstraVoiceState } from '../../types/astraVoice';

interface AstraVoiceCopy {
  title: string;
  subtitle: string;
  resting: string;
  listening: string;
  thinking: string;
  processing: string;
  responding: string;
  playing: string;
  connecting: string;
  reconnecting: string;
  requestingPermission: string;
  idle: string;
  error: string;
  transcriptLabel: string;
  responseLabel: string;
  youLabel: string;
  permissionBody: string;
  permissionAction: string;
  retry: string;
  stop: string;
  close: string;
  start: string;
  speakAgain: string;
  mute: string;
  unmute: string;
  textMode: string;
  voiceMode: string;
  unavailableInExpoGo: string;
  waitingPrompt: string;
  emptyResponse: string;
  silencePaused: string;
  voicePanelTitle: string;
  voiceSelected: string;
  voiceSelect: string;
  voicePreview: string;
  premiumVoiceActive: string;
  temporaryLocalVoice: string;
  premiumVoiceFallback: string;
}

function voiceText(
  language: LanguageCode,
  values: Partial<Record<LanguageCode, string>>,
  fallbackLanguage: LanguageCode = 'en',
) {
  return pickLanguageText(language, values, fallbackLanguage);
}

export function getAstraVoiceCopy(language: LanguageCode): AstraVoiceCopy {
  return {
    title: 'Astra',
    subtitle: voiceText(language, {
      en: 'OrbitX intelligence',
      es: 'Inteligencia OrbitX',
      pt: 'Inteligencia OrbitX',
      'zh-Hans': '\u667a\u80fd OrbitX',
      hi: 'OrbitX \u092c\u0941\u0926\u094d\u0927\u093f\u092e\u0924\u094d\u0924\u093e',
      ru: '\u0418\u043d\u0442\u0435\u043b\u043b\u0435\u043a\u0442 OrbitX',
      ar: '\u0630\u0643\u0627\u0621 OrbitX',
      id: 'Kecerdasan OrbitX',
    }),
    resting: voiceText(language, {
      en: 'At rest',
      es: 'En reposo',
      pt: 'Em repouso',
      'zh-Hans': '\u5f85\u547d',
      hi: '\u0935\u093f\u0936\u094d\u0930\u093e\u092e \u092e\u0947\u0902',
      ru: '\u0412 \u043e\u0436\u0438\u0434\u0430\u043d\u0438\u0438',
      ar: '\u0641\u064a \u0648\u0636\u0639 \u0627\u0644\u0627\u0646\u062a\u0638\u0627\u0631',
      id: 'Siaga',
    }),
    listening: voiceText(language, {
      en: 'I am listening',
      es: 'Te escucho',
      pt: 'Estou ouvindo',
      'zh-Hans': '\u6211\u5728\u8046\u542c',
      hi: '\u092e\u0948\u0902 \u0938\u0941\u0928 \u0930\u0939\u0940 \u0939\u0942\u0901',
      ru: '\u042f \u0441\u043b\u0443\u0448\u0430\u044e',
      ar: '\u0623\u0646\u0627 \u0623\u0633\u062a\u0645\u0639',
      id: 'Saya sedang mendengarkan',
    }),
    thinking: voiceText(language, {
      en: 'I am thinking',
      es: 'Estoy pensando',
      pt: 'Estou pensando',
      'zh-Hans': '\u6211\u5728\u601d\u8003',
      hi: '\u092e\u0948\u0902 \u0938\u094b\u091a \u0930\u0939\u0940 \u0939\u0942\u0901',
      ru: '\u042f \u0434\u0443\u043c\u0430\u044e',
      ar: '\u0623\u0646\u0627 \u0623\u0641\u0643\u0631',
      id: 'Saya sedang berpikir',
    }),
    processing: voiceText(language, {
      en: 'I am thinking',
      es: 'Estoy pensando',
      pt: 'Estou pensando',
      'zh-Hans': '\u6211\u5728\u601d\u8003',
      hi: '\u092e\u0948\u0902 \u0938\u094b\u091a \u0930\u0939\u0940 \u0939\u0942\u0901',
      ru: '\u042f \u0434\u0443\u043c\u0430\u044e',
      ar: '\u0623\u0646\u0627 \u0623\u0641\u0643\u0631',
      id: 'Saya sedang berpikir',
    }),
    responding: voiceText(language, {
      en: 'I am thinking',
      es: 'Estoy pensando',
      pt: 'Estou pensando',
      'zh-Hans': '\u6211\u5728\u601d\u8003',
      hi: '\u092e\u0948\u0902 \u0938\u094b\u091a \u0930\u0939\u0940 \u0939\u0942\u0901',
      ru: '\u042f \u0434\u0443\u043c\u0430\u044e',
      ar: '\u0623\u0646\u0627 \u0623\u0641\u0643\u0631',
      id: 'Saya sedang berpikir',
    }),
    playing: voiceText(language, {
      en: 'Speaking...',
      es: 'Hablando...',
      pt: 'Falando...',
      'zh-Hans': '\u6b63\u5728\u8bf4\u8bdd...',
      hi: '\u092c\u094b\u0932 \u0930\u0939\u0940 \u0939\u0942\u0901...',
      ru: '\u0413\u043e\u0432\u043e\u0440\u044e...',
      ar: '\u0623\u062a\u062d\u062f\u062b...',
      id: 'Sedang berbicara...',
    }),
    connecting: voiceText(language, {
      en: 'Connecting...',
      es: 'Conectando...',
      pt: 'Conectando...',
      'zh-Hans': '\u6b63\u5728\u8fde\u63a5...',
      hi: '\u0915\u0928\u0947\u0915\u094d\u091f \u0915\u0930 \u0930\u0939\u0940 \u0939\u0942\u0901...',
      ru: '\u041f\u043e\u0434\u043a\u043b\u044e\u0447\u0430\u044e\u0441\u044c...',
      ar: '\u062c\u0627\u0631\u064d \u0627\u0644\u0627\u062a\u0635\u0627\u0644...',
      id: 'Menghubungkan...',
    }),
    reconnecting: voiceText(language, {
      en: 'Reconnecting...',
      es: 'Reconectando...',
      pt: 'Reconectando...',
      'zh-Hans': '\u6b63\u5728\u91cd\u65b0\u8fde\u63a5...',
      hi: '\u0926\u094b\u092c\u093e\u0930\u093e \u0915\u0928\u0947\u0915\u094d\u091f \u0915\u0930 \u0930\u0939\u0940 \u0939\u0942\u0901...',
      ru: '\u041f\u043e\u0432\u0442\u043e\u0440\u043d\u043e \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0430\u044e\u0441\u044c...',
      ar: '\u062c\u0627\u0631\u064d \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0627\u062a\u0635\u0627\u0644...',
      id: 'Menghubungkan ulang...',
    }),
    requestingPermission: voiceText(language, {
      en: 'Requesting permission...',
      es: 'Solicitando permiso...',
      pt: 'Solicitando permiss\u00e3o...',
      'zh-Hans': '\u6b63\u5728\u8bf7\u6c42\u6743\u9650...',
      hi: '\u0905\u0928\u0941\u092e\u0924\u093f \u092e\u093e\u0902\u0917 \u0930\u0939\u0940 \u0939\u0942\u0901...',
      ru: '\u0417\u0430\u043f\u0440\u0430\u0448\u0438\u0432\u0430\u044e \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043d\u0438\u0435...',
      ar: '\u062c\u0627\u0631\u064d \u0637\u0644\u0628 \u0627\u0644\u0625\u0630\u0646...',
      id: 'Meminta izin...',
    }),
    idle: voiceText(language, {
      en: 'I am ready when you are.',
      es: 'Estoy lista cuando quieras.',
      pt: 'Estou pronta quando voc\u00ea quiser.',
      'zh-Hans': '\u6211\u51c6\u5907\u597d\u4e86\uff0c\u968f\u65f6\u53ef\u4ee5\u5f00\u59cb\u3002',
      hi: '\u092e\u0948\u0902 \u0924\u0948\u092f\u093e\u0930 \u0939\u0942\u0901\uff0c \u091c\u092c \u0924\u0941\u092e \u091a\u093e\u0939\u094b\u0964',
      ru: '\u042f \u0433\u043e\u0442\u043e\u0432\u0430, \u043a\u043e\u0433\u0434\u0430 \u0431\u0443\u0434\u0435\u0448\u044c \u0433\u043e\u0442\u043e\u0432.',
      ar: '\u0623\u0646\u0627 \u062c\u0627\u0647\u0632\u0629 \u0639\u0646\u062f\u0645\u0627 \u062a\u0643\u0648\u0646 \u062c\u0627\u0647\u0632\u064b\u0627.',
      id: 'Saya siap kapan pun kamu siap.',
    }),
    error: voiceText(language, {
      en: 'We could not complete voice mode.',
      es: 'No pudimos completar el modo voz.',
      pt: 'N\u00e3o conseguimos concluir o modo de voz.',
      'zh-Hans': '\u6211\u4eec\u65e0\u6cd5\u5b8c\u6210\u8bed\u97f3\u6a21\u5f0f\u3002',
      hi: '\u0939\u092e \u0935\u0949\u0907\u0938 \u092e\u094b\u0921 \u092a\u0942\u0930\u093e \u0928\u0939\u0940\u0902 \u0915\u0930 \u0938\u0915\u0947\u0964',
      ru: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044c \u0433\u043e\u043b\u043e\u0441\u043e\u0432\u043e\u0439 \u0440\u0435\u0436\u0438\u043c.',
      ar: '\u0644\u0645 \u0646\u062a\u0645\u0643\u0646 \u0645\u0646 \u0625\u0643\u0645\u0627\u0644 \u0648\u0636\u0639 \u0627\u0644\u0635\u0648\u062a.',
      id: 'Kami tidak dapat menyelesaikan mode suara.',
    }),
    transcriptLabel: voiceText(language, {
      en: 'You said',
      es: 'T\u00fa dijiste',
      pt: 'Voc\u00ea disse',
      'zh-Hans': '\u4f60\u8bf4',
      hi: '\u0924\u0941\u092e\u0928\u0947 \u0915\u0939\u093e',
      ru: '\u0422\u044b \u0441\u043a\u0430\u0437\u0430\u043b',
      ar: '\u0623\u0646\u062a \u0642\u0644\u062a',
      id: 'Kamu berkata',
    }),
    responseLabel: voiceText(language, {
      en: 'Astra replied',
      es: 'Astra respondi\u00f3',
      pt: 'Astra respondeu',
      'zh-Hans': 'Astra \u56de\u590d',
      hi: 'Astra \u0928\u0947 \u091c\u0935\u093e\u092c \u0926\u093f\u092f\u093e',
      ru: 'Astra \u043e\u0442\u0432\u0435\u0442\u0438\u043b\u0430',
      ar: '\u0631\u062f\u062a Astra',
      id: 'Astra menjawab',
    }),
    youLabel: voiceText(language, {
      en: 'You',
      es: 'T\u00fa',
      pt: 'Voc\u00ea',
      'zh-Hans': '\u4f60',
      hi: '\u0924\u0941\u092e',
      ru: '\u0422\u044b',
      ar: '\u0623\u0646\u062a',
      id: 'Kamu',
    }),
    permissionBody: voiceText(language, {
      en: 'Astra needs microphone access to hear you. You can enable it and try again.',
      es: 'Astra necesita acceso al micr\u00f3fono para escucharte. Puedes habilitarlo e intentarlo de nuevo.',
      pt: 'A Astra precisa de acesso ao microfone para ouvir voc\u00ea. Voc\u00ea pode habilitar e tentar novamente.',
      'zh-Hans': 'Astra \u9700\u8981\u9ea6\u514b\u98ce\u6743\u9650\u624d\u80fd\u542c\u5230\u4f60\u3002\u4f60\u53ef\u4ee5\u542f\u7528\u540e\u518d\u8bd5\u4e00\u6b21\u3002',
      hi: 'Astra \u0915\u094b \u0924\u0941\u092e\u094d\u0939\u0947\u0902 \u0938\u0941\u0928\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u092e\u093e\u0907\u0915\u094d\u0930\u094b\u092b\u094b\u0928 \u090f\u0915\u094d\u0938\u0947\u0938 \u091a\u093e\u0939\u093f\u090f\u0964 \u0907\u0938\u0947 \u091a\u093e\u0932\u0942 \u0915\u0930\u0915\u0947 \u092b\u093f\u0930 \u0938\u0947 \u0915\u094b\u0936\u093f\u0936 \u0915\u0930 \u0938\u0915\u0924\u0947 \u0939\u094b\u0964',
      ru: 'Astra \u043d\u0443\u0436\u0435\u043d \u0434\u043e\u0441\u0442\u0443\u043f \u043a \u043c\u0438\u043a\u0440\u043e\u0444\u043e\u043d\u0443, \u0447\u0442\u043e\u0431\u044b \u0441\u043b\u044b\u0448\u0430\u0442\u044c \u0442\u0435\u0431\u044f. \u0422\u044b \u043c\u043e\u0436\u0435\u0448\u044c \u0432\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u0435\u0433\u043e \u0438 \u043f\u043e\u043f\u0440\u043e\u0431\u043e\u0432\u0430\u0442\u044c \u0441\u043d\u043e\u0432\u0430.',
      ar: '\u062a\u062d\u062a\u0627\u062c Astra \u0625\u0644\u0649 \u0625\u0630\u0646 \u0627\u0644\u0645\u064a\u0643\u0631\u0648\u0641\u0648\u0646 \u0644\u062a\u0633\u0645\u0639\u0643. \u064a\u0645\u0643\u0646\u0643 \u062a\u0641\u0639\u064a\u0644\u0647 \u0648\u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.',
      id: 'Astra memerlukan akses mikrofon untuk mendengarmu. Kamu bisa mengaktifkannya lalu mencoba lagi.',
    }),
    permissionAction: voiceText(language, {
      en: 'Enable microphone',
      es: 'Habilitar micr\u00f3fono',
      pt: 'Ativar microfone',
      'zh-Hans': '\u542f\u7528\u9ea6\u514b\u98ce',
      hi: '\u092e\u093e\u0907\u0915\u094d\u0930\u094b\u092b\u094b\u0928 \u091a\u093e\u0932\u0942 \u0915\u0930\u0947\u0902',
      ru: '\u0412\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u043c\u0438\u043a\u0440\u043e\u0444\u043e\u043d',
      ar: '\u062a\u0641\u0639\u064a\u0644 \u0627\u0644\u0645\u064a\u0643\u0631\u0648\u0641\u0648\u0646',
      id: 'Aktifkan mikrofon',
    }),
    retry: voiceText(language, {
      en: 'Try again',
      es: 'Intentar otra vez',
      pt: 'Tentar novamente',
      'zh-Hans': '\u518d\u8bd5\u4e00\u6b21',
      hi: '\u092b\u093f\u0930 \u0938\u0947 \u0915\u094b\u0936\u093f\u0936 \u0915\u0930\u0947\u0902',
      ru: '\u041f\u043e\u043f\u0440\u043e\u0431\u043e\u0432\u0430\u0442\u044c \u0441\u043d\u043e\u0432\u0430',
      ar: '\u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649',
      id: 'Coba lagi',
    }),
    stop: voiceText(language, {
      en: 'Stop',
      es: 'Detener',
      pt: 'Parar',
      'zh-Hans': '\u505c\u6b62',
      hi: '\u0930\u094b\u0915\u0947\u0902',
      ru: '\u041e\u0441\u0442\u0430\u043d\u043e\u0432\u0438\u0442\u044c',
      ar: '\u0625\u064a\u0642\u0627\u0641',
      id: 'Hentikan',
    }),
    close: voiceText(language, {
      en: 'Close',
      es: 'Cerrar',
      pt: 'Fechar',
      'zh-Hans': '\u5173\u95ed',
      hi: '\u092c\u0902\u0926 \u0915\u0930\u0947\u0902',
      ru: '\u0417\u0430\u043a\u0440\u044b\u0442\u044c',
      ar: '\u0625\u063a\u0644\u0627\u0642',
      id: 'Tutup',
    }),
    start: voiceText(language, {
      en: 'Talk to Astra',
      es: 'Hablar con Astra',
      pt: 'Falar com a Astra',
      'zh-Hans': '\u4e0e Astra \u5bf9\u8bdd',
      hi: 'Astra \u0938\u0947 \u092c\u093e\u0924 \u0915\u0930\u0947\u0902',
      ru: '\u041f\u043e\u0433\u043e\u0432\u043e\u0440\u0438\u0442\u044c \u0441 Astra',
      ar: '\u062a\u062d\u062f\u062b \u0645\u0639 Astra',
      id: 'Berbicara dengan Astra',
    }),
    speakAgain: voiceText(language, {
      en: 'Play again',
      es: 'Reproducir de nuevo',
      pt: 'Reproduzir novamente',
      'zh-Hans': '\u518d\u64ad\u653e\u4e00\u6b21',
      hi: '\u092b\u093f\u0930 \u0938\u0947 \u091a\u0932\u093e\u090f\u0901',
      ru: '\u0412\u043e\u0441\u043f\u0440\u043e\u0438\u0437\u0432\u0435\u0441\u0442\u0438 \u0441\u043d\u043e\u0432\u0430',
      ar: '\u062a\u0634\u063a\u064a\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649',
      id: 'Putar lagi',
    }),
    mute: voiceText(language, {
      en: 'Mute voice',
      es: 'Silenciar voz',
      pt: 'Silenciar voz',
      'zh-Hans': '\u9759\u97f3',
      hi: '\u0906\u0935\u093e\u091c\u093c \u092e\u094d\u092f\u0942\u091f \u0915\u0930\u0947\u0902',
      ru: '\u0412\u044b\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u0437\u0432\u0443\u043a',
      ar: '\u0643\u062a\u0645 \u0627\u0644\u0635\u0648\u062a',
      id: 'Bisukan suara',
    }),
    unmute: voiceText(language, {
      en: 'Enable voice',
      es: 'Activar voz',
      pt: 'Ativar voz',
      'zh-Hans': '\u5f00\u542f\u8bed\u97f3',
      hi: '\u0906\u0935\u093e\u091c\u093c \u091a\u093e\u0932\u0942 \u0915\u0930\u0947\u0902',
      ru: '\u0412\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u0437\u0432\u0443\u043a',
      ar: '\u062a\u0641\u0639\u064a\u0644 \u0627\u0644\u0635\u0648\u062a',
      id: 'Aktifkan suara',
    }),
    textMode: voiceText(language, {
      en: 'Text only',
      es: 'Solo texto',
      pt: 'Somente texto',
      'zh-Hans': '\u4ec5\u6587\u672c',
      hi: '\u0915\u0947\u0935\u0932 \u091f\u0947\u0915\u094d\u0938\u094d\u091f',
      ru: '\u0422\u043e\u043b\u044c\u043a\u043e \u0442\u0435\u043a\u0441\u0442',
      ar: '\u0646\u0635 \u0641\u0642\u0637',
      id: 'Hanya teks',
    }),
    voiceMode: voiceText(language, {
      en: 'Voice replies',
      es: 'Respuesta por voz',
      pt: 'Respostas por voz',
      'zh-Hans': '\u8bed\u97f3\u56de\u590d',
      hi: '\u0906\u0935\u093e\u091c\u093c \u0915\u0947 \u0938\u093e\u0925 \u091c\u0935\u093e\u092c',
      ru: '\u0413\u043e\u043b\u043e\u0441\u043e\u0432\u044b\u0435 \u043e\u0442\u0432\u0435\u0442\u044b',
      ar: '\u0631\u062f\u0648\u062f \u0635\u0648\u062a\u064a\u0629',
      id: 'Balasan suara',
    }),
    unavailableInExpoGo: voiceText(language, {
      en: 'Astra Voice needs a development build to use live speech recognition.',
      es: 'Astra Voice necesita una development build para usar reconocimiento de voz en vivo.',
      pt: 'Astra Voice precisa de uma development build para usar reconhecimento de voz em tempo real.',
      'zh-Hans': 'Astra Voice \u9700\u8981 development build \u624d\u80fd\u4f7f\u7528\u5b9e\u65f6\u8bed\u97f3\u8bc6\u522b\u3002',
      hi: 'Astra Voice \u0915\u094b \u0932\u093e\u0907\u0935 \u0938\u094d\u092a\u0940\u091a \u0930\u093f\u0915\u0917\u094d\u0928\u093f\u0936\u0928 \u0915\u0947 \u0932\u093f\u090f development build \u091a\u093e\u0939\u093f\u090f\u0964',
      ru: 'Astra Voice \u0442\u0440\u0435\u0431\u0443\u0435\u0442 development build \u0434\u043b\u044f \u0440\u0430\u0431\u043e\u0442\u044b \u0441 \u0440\u0430\u0441\u043f\u043e\u0437\u043d\u0430\u0432\u0430\u043d\u0438\u0435\u043c \u0440\u0435\u0447\u0438 \u0432 \u0440\u0435\u0430\u043b\u044c\u043d\u043e\u043c \u0432\u0440\u0435\u043c\u0435\u043d\u0438.',
      ar: '\u062a\u062d\u062a\u0627\u062c Astra Voice \u0625\u0644\u0649 development build \u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0627\u0644\u062a\u0639\u0631\u0641 \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0639\u0644\u0649 \u0627\u0644\u0643\u0644\u0627\u0645.',
      id: 'Astra Voice memerlukan development build untuk memakai pengenalan suara langsung.',
    }),
    waitingPrompt: voiceText(language, {
      en: 'Speak naturally. I will keep the conversation flowing.',
      es: 'Habla con naturalidad. Mantendr\u00e9 la conversaci\u00f3n en curso.',
      pt: 'Fale naturalmente. Vou manter a conversa fluindo.',
      'zh-Hans': '\u81ea\u7136\u5730\u8bf4\u8bdd\u5427\uff0c\u6211\u4f1a\u8ba9\u5bf9\u8bdd\u7ee7\u7eed\u3002',
      hi: '\u0938\u094d\u0935\u093e\u092d\u093e\u0935\u093f\u0915 \u0924\u0930\u0940\u0915\u0947 \u0938\u0947 \u092c\u094b\u0932\u094b\u0964 \u092e\u0948\u0902 \u092c\u093e\u0924\u091a\u0940\u0924 \u091c\u093e\u0930\u0940 \u0930\u0916\u0942\u0901\u0917\u0940\u0964',
      ru: '\u0413\u043e\u0432\u043e\u0440\u0438 \u0435\u0441\u0442\u0435\u0441\u0442\u0432\u0435\u043d\u043d\u043e. \u042f \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u0443 \u0440\u0430\u0437\u0433\u043e\u0432\u043e\u0440.',
      ar: '\u062a\u062d\u062f\u062b \u0628\u0637\u0628\u064a\u0639\u0629. \u0633\u0623\u062d\u0627\u0641\u0638 \u0639\u0644\u0649 \u0627\u0633\u062a\u0645\u0631\u0627\u0631 \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0629.',
      id: 'Bicaralah dengan natural. Saya akan menjaga percakapan tetap mengalir.',
    }),
    emptyResponse: voiceText(language, {
      en: 'Astra did not return a clear answer. Try speaking again.',
      es: 'Astra no devolvi\u00f3 una respuesta clara. Intenta hablar otra vez.',
      pt: 'A Astra n\u00e3o devolveu uma resposta clara. Tente falar novamente.',
      'zh-Hans': 'Astra \u6ca1\u6709\u7ed9\u51fa\u6e05\u6670\u7684\u56de\u7b54\uff0c\u8bf7\u518d\u8bf4\u4e00\u6b21\u3002',
      hi: 'Astra \u0928\u0947 \u0938\u094d\u092a\u0937\u094d\u091f \u091c\u0935\u093e\u092c \u0928\u0939\u0940\u0902 \u0926\u093f\u092f\u093e\u0964 \u0915\u0943\u092a\u092f\u093e \u092b\u093f\u0930 \u0938\u0947 \u092c\u094b\u0932\u0947\u0902\u0964',
      ru: 'Astra \u043d\u0435 \u0434\u0430\u043b\u0430 \u0447\u0451\u0442\u043a\u043e\u0433\u043e \u043e\u0442\u0432\u0435\u0442\u0430. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439 \u0441\u043a\u0430\u0437\u0430\u0442\u044c \u0435\u0449\u0451 \u0440\u0430\u0437.',
      ar: '\u0644\u0645 \u062a\u064f\u0639\u062f Astra \u0625\u062c\u0627\u0628\u0629 \u0648\u0627\u0636\u062d\u0629. \u062d\u0627\u0648\u0644 \u0627\u0644\u062a\u062d\u062f\u062b \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.',
      id: 'Astra tidak memberikan jawaban yang jelas. Coba bicara lagi.',
    }),
    silencePaused: voiceText(language, {
      en: 'Paused due to silence. Tap the pulse to continue.',
      es: 'Pausada por silencio. Toca el pulso para continuar.',
      pt: 'Pausada por sil\u00eancio. Toque no pulso para continuar.',
      'zh-Hans': '\u56e0\u9759\u97f3\u5df2\u6682\u505c\uff0c\u70b9\u6309\u8109\u51b2\u5373\u53ef\u7ee7\u7eed\u3002',
      hi: '\u0916\u093e\u092e\u094b\u0936\u0940 \u0915\u0947 \u0915\u093e\u0930\u0923 \u0930\u094b\u0915\u093e \u0917\u092f\u093e\u0964 \u091c\u093e\u0930\u0940 \u0930\u0916\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u092a\u0932\u094d\u0938 \u091f\u0948\u092a \u0915\u0930\u0947\u0902\u0964',
      ru: '\u041f\u0430\u0443\u0437\u0430 \u0438\u0437-\u0437\u0430 \u0442\u0438\u0448\u0438\u043d\u044b. \u041d\u0430\u0436\u043c\u0438 \u043d\u0430 \u0438\u043c\u043f\u0443\u043b\u044c\u0441, \u0447\u0442\u043e\u0431\u044b \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c.',
      ar: '\u062a\u0645 \u0627\u0644\u0625\u064a\u0642\u0627\u0641 \u0628\u0633\u0628\u0628 \u0627\u0644\u0635\u0645\u062a. \u0627\u0644\u0645\u0633 \u0627\u0644\u0646\u0628\u0636 \u0644\u0644\u0645\u062a\u0627\u0628\u0639\u0629.',
      id: 'Dijeda karena hening. Ketuk pulse untuk melanjutkan.',
    }),
    voicePanelTitle: voiceText(language, {
      en: 'Astra voices',
      es: 'Voces de Astra',
      pt: 'Vozes da Astra',
      'zh-Hans': 'Astra \u8bed\u97f3',
      hi: 'Astra \u0915\u0940 \u0906\u0935\u093e\u091c\u093c\u0947\u0902',
      ru: '\u0413\u043e\u043b\u043e\u0441\u0430 Astra',
      ar: '\u0623\u0635\u0648\u0627\u062a Astra',
      id: 'Suara Astra',
    }),
    voiceSelected: voiceText(language, {
      en: 'Active',
      es: 'Activa',
      pt: 'Ativa',
      'zh-Hans': '\u5df2\u542f\u7528',
      hi: '\u0938\u0915\u094d\u0930\u093f\u092f',
      ru: '\u0410\u043a\u0442\u0438\u0432\u043d\u0430',
      ar: '\u0645\u0641\u0639\u0644\u0629',
      id: 'Aktif',
    }),
    voiceSelect: voiceText(language, {
      en: 'Select',
      es: 'Seleccionar',
      pt: 'Selecionar',
      'zh-Hans': '\u9009\u62e9',
      hi: '\u091a\u0941\u0928\u0947\u0902',
      ru: '\u0412\u044b\u0431\u0440\u0430\u0442\u044c',
      ar: '\u0627\u062e\u062a\u064a\u0627\u0631',
      id: 'Pilih',
    }),
    voicePreview: voiceText(language, {
      en: 'Preview',
      es: 'Probar',
      pt: 'Ouvir',
      'zh-Hans': '\u8bd5\u542c',
      hi: '\u0938\u0941\u0928\u0947\u0902',
      ru: '\u041f\u0440\u043e\u0441\u043b\u0443\u0448\u0430\u0442\u044c',
      ar: '\u0645\u0639\u0627\u064a\u0646\u0629',
      id: 'Pratinjau',
    }),
    premiumVoiceActive: voiceText(language, {
      en: 'Premium voice active',
      es: 'Voz premium activa',
      pt: 'Voz premium ativa',
      'zh-Hans': '\u9ad8\u7ea7\u8bed\u97f3\u5df2\u542f\u7528',
      hi: '\u092a\u094d\u0930\u0940\u092e\u093f\u092f\u092e \u0906\u0935\u093e\u091c\u093c \u0938\u0915\u094d\u0930\u093f\u092f',
      ru: '\u041f\u0440\u0435\u043c\u0438\u0443\u043c-\u0433\u043e\u043b\u043e\u0441 \u0430\u043a\u0442\u0438\u0432\u0435\u043d',
      ar: '\u0627\u0644\u0635\u0648\u062a \u0627\u0644\u0645\u0645\u064a\u0632 \u0645\u0641\u0639\u0644',
      id: 'Suara premium aktif',
    }),
    temporaryLocalVoice: voiceText(language, {
      en: 'Temporary local voice',
      es: 'Voz local temporal',
      pt: 'Voz local tempor\u00e1ria',
      'zh-Hans': '\u4e34\u65f6\u672c\u5730\u8bed\u97f3',
      hi: '\u0905\u0938\u094d\u0925\u093e\u092f\u0940 \u0932\u094b\u0915\u0932 \u0906\u0935\u093e\u091c\u093c',
      ru: '\u0412\u0440\u0435\u043c\u0435\u043d\u043d\u044b\u0439 \u043b\u043e\u043a\u0430\u043b\u044c\u043d\u044b\u0439 \u0433\u043e\u043b\u043e\u0441',
      ar: '\u0635\u0648\u062a \u0645\u062d\u0644\u064a \u0645\u0624\u0642\u062a',
      id: 'Suara lokal sementara',
    }),
    premiumVoiceFallback: voiceText(language, {
      en: 'Premium voice is unavailable right now. Astra will use a temporary local voice.',
      es: 'La voz premium no est\u00e1 disponible ahora. Astra usar\u00e1 una voz local temporal.',
      pt: 'A voz premium n\u00e3o est\u00e1 dispon\u00edvel agora. A Astra usar\u00e1 uma voz local tempor\u00e1ria.',
      'zh-Hans': '\u9ad8\u7ea7\u8bed\u97f3\u6682\u65f6\u4e0d\u53ef\u7528\uff0cAstra \u5c06\u4f7f\u7528\u4e34\u65f6\u672c\u5730\u8bed\u97f3\u3002',
      hi: '\u092a\u094d\u0930\u0940\u092e\u093f\u092f\u092e \u0906\u0935\u093e\u091c\u093c \u0905\u092d\u0940 \u0909\u092a\u0932\u092c\u094d\u0927 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 Astra \u0905\u0938\u094d\u0925\u093e\u092f\u0940 \u0932\u094b\u0915\u0932 \u0906\u0935\u093e\u091c\u093c \u0907\u0938\u094d\u0924\u0947\u092e\u093e\u0932 \u0915\u0930\u0947\u0917\u0940\u0964',
      ru: '\u041f\u0440\u0435\u043c\u0438\u0443\u043c-\u0433\u043e\u043b\u043e\u0441 \u0441\u0435\u0439\u0447\u0430\u0441 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d. Astra \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u0442 \u0432\u0440\u0435\u043c\u0435\u043d\u043d\u044b\u0439 \u043b\u043e\u043a\u0430\u043b\u044c\u043d\u044b\u0439 \u0433\u043e\u043b\u043e\u0441.',
      ar: '\u0627\u0644\u0635\u0648\u062a \u0627\u0644\u0645\u0645\u064a\u0632 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d \u0627\u0644\u0622\u0646. \u0633\u062a\u0633\u062a\u062e\u062f\u0645 Astra \u0635\u0648\u062a\u064b\u0627 \u0645\u062d\u0644\u064a\u064b\u0627 \u0645\u0624\u0642\u062a\u064b\u0627.',
      id: 'Suara premium sedang tidak tersedia. Astra akan memakai suara lokal sementara.',
    }),
  };
}

export function getAstraVoiceStateLabel(language: LanguageCode, state: AstraVoiceState) {
  const copy = getAstraVoiceCopy(language);

  switch (state) {
    case 'paused':
      return copy.silencePaused;
    case 'requesting_permission':
      return copy.requestingPermission;
    case 'connecting':
      return copy.connecting;
    case 'listening':
      return copy.listening;
    case 'transcribing':
      return copy.thinking;
    case 'processing':
      return copy.processing;
    case 'responding':
      return copy.responding;
    case 'speaking':
      return copy.playing;
    case 'reconnecting':
      return copy.reconnecting;
    case 'error':
      return copy.error;
    default:
      return copy.resting;
  }
}

export function getAstraVoicePreviewText(language: LanguageCode, presetLabel: string) {
  return voiceText(language, {
    en: `Hi, I am Astra. This is the ${presetLabel} voice inside OrbitX.`,
    es: `Hola, soy Astra. Esta es la voz ${presetLabel} dentro de OrbitX.`,
    pt: `Oi, eu sou a Astra. Esta \u00e9 a voz ${presetLabel} dentro da OrbitX.`,
    'zh-Hans': `\u4f60\u597d\uff0c\u6211\u662f Astra\u3002\u8fd9\u662f OrbitX \u91cc\u7684 ${presetLabel} \u58f0\u97f3\u3002`,
    hi: `\u0928\u092e\u0938\u094d\u0924\u0947, \u092e\u0948\u0902 Astra \u0939\u0942\u0901\u0964 \u092f\u0939 OrbitX \u0915\u0947 \u0905\u0902\u0926\u0930 ${presetLabel} \u0906\u0935\u093e\u091c\u093c \u0939\u0948\u0964`,
    ru: `\u041f\u0440\u0438\u0432\u0435\u0442, \u044f Astra. \u042d\u0442\u043e \u0433\u043e\u043b\u043e\u0441 ${presetLabel} \u0432 OrbitX.`,
    ar: `\u0645\u0631\u062d\u0628\u064b\u0627\u060c \u0623\u0646\u0627 Astra. \u0647\u0630\u0627 \u0647\u0648 \u0635\u0648\u062a ${presetLabel} \u062f\u0627\u062e\u0644 OrbitX.`,
    id: `Halo, saya Astra. Ini adalah suara ${presetLabel} di dalam OrbitX.`,
  });
}

export function getAstraVoiceRuntimeStatus(
  language: LanguageCode,
  options: {
    provider: string;
    hasPremiumError: boolean;
  },
) {
  const copy = getAstraVoiceCopy(language);
  if (options.hasPremiumError) {
    return copy.premiumVoiceFallback;
  }

  return options.provider === 'elevenlabs'
    ? copy.premiumVoiceActive
    : copy.temporaryLocalVoice;
}

export function getFriendlyVoiceConnectionError(language: LanguageCode, message: string) {
  if (message.trim()) {
    return message.trim();
  }

  return voiceText(language, {
    en: 'We could not connect to Astra. Try again.',
    es: 'No pudimos conectar con Astra. Intenta otra vez.',
    pt: 'N\u00e3o conseguimos conectar com a Astra. Tente novamente.',
    'zh-Hans': '\u6211\u4eec\u65e0\u6cd5\u8fde\u63a5 Astra\uff0c\u8bf7\u518d\u8bd5\u4e00\u6b21\u3002',
    hi: '\u0939\u092e Astra \u0938\u0947 \u0915\u0928\u0947\u0915\u094d\u091f \u0928\u0939\u0940\u0902 \u0915\u0930 \u0938\u0915\u0947\u0964 \u0915\u0943\u092a\u092f\u093e \u092b\u093f\u0930 \u0938\u0947 \u0915\u094b\u0936\u093f\u0936 \u0915\u0930\u0947\u0902\u0964',
    ru: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0438\u0442\u044c\u0441\u044f \u043a Astra. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439 \u0435\u0449\u0451 \u0440\u0430\u0437.',
    ar: '\u0644\u0645 \u0646\u062a\u0645\u0643\u0646 \u0645\u0646 \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u0640 Astra. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.',
    id: 'Kami tidak dapat terhubung ke Astra. Coba lagi.',
  });
}

export function getStaleVoiceBuildMessage(language: LanguageCode) {
  return voiceText(language, {
    en: 'Your installed app does not include the current voice module. Reinstall the OrbitX development build.',
    es: 'Tu app instalada no incluye el m\u00f3dulo de voz actual. Reinstala la development build de OrbitX.',
    pt: 'O app instalado n\u00e3o inclui o m\u00f3dulo de voz atual. Reinstale a development build da OrbitX.',
    'zh-Hans': '\u4f60\u5b89\u88c5\u7684 app \u4e0d\u5305\u542b\u5f53\u524d\u7684\u8bed\u97f3\u6a21\u5757\uff0c\u8bf7\u91cd\u65b0\u5b89\u88c5 OrbitX development build\u3002',
    hi: '\u0924\u0941\u092e\u094d\u0939\u093e\u0930\u0947 \u0907\u0902\u0938\u094d\u091f\u0949\u0932 \u0915\u093f\u090f \u0917\u090f app \u092e\u0947\u0902 \u0935\u0930\u094d\u0924\u092e\u093e\u0928 voice module \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 OrbitX development build \u0915\u094b \u092b\u093f\u0930 \u0938\u0947 \u0907\u0902\u0938\u094d\u091f\u0949\u0932 \u0915\u0930\u0947\u0902\u0964',
    ru: '\u0412 \u0443\u0441\u0442\u0430\u043d\u043e\u0432\u043b\u0435\u043d\u043d\u043e\u043c \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0438 \u043d\u0435\u0442 \u0442\u0435\u043a\u0443\u0449\u0435\u0433\u043e \u0433\u043e\u043b\u043e\u0441\u043e\u0432\u043e\u0433\u043e \u043c\u043e\u0434\u0443\u043b\u044f. \u041f\u0435\u0440\u0435\u0443\u0441\u0442\u0430\u043d\u043e\u0432\u0438 OrbitX development build.',
    ar: '\u0627\u0644\u062a\u0637\u0628\u064a\u0642 \u0627\u0644\u0645\u062b\u0628\u062a \u0644\u062f\u064a\u0643 \u0644\u0627 \u064a\u062a\u0636\u0645\u0646 \u0648\u062d\u062f\u0629 \u0627\u0644\u0635\u0648\u062a \u0627\u0644\u062d\u0627\u0644\u064a\u0629. \u0623\u0639\u062f \u062a\u062b\u0628\u064a\u062a OrbitX development build.',
    id: 'Aplikasi yang terpasang belum menyertakan modul suara terbaru. Pasang ulang development build OrbitX.',
  });
}

export function getMissingRecognitionServiceMessage(language: LanguageCode) {
  return voiceText(language, {
    en: 'We could not find a speech recognition service on your Android device. Install or enable Google Speech Services and try again.',
    es: 'No encontramos un servicio de reconocimiento de voz disponible en tu Android. Instala o activa Google Speech Services y vuelve a intentarlo.',
    pt: 'N\u00e3o encontramos um servi\u00e7o de reconhecimento de voz dispon\u00edvel no seu Android. Instale ou ative o Google Speech Services e tente novamente.',
    'zh-Hans': '\u6211\u4eec\u6ca1\u6709\u5728\u4f60\u7684 Android \u8bbe\u5907\u4e0a\u627e\u5230\u53ef\u7528\u7684\u8bed\u97f3\u8bc6\u522b\u670d\u52a1\u3002\u8bf7\u5b89\u88c5\u6216\u542f\u7528 Google Speech Services \u540e\u518d\u8bd5\u3002',
    hi: '\u0939\u092e\u0947\u0902 \u0924\u0941\u092e\u094d\u0939\u093e\u0930\u0947 Android \u0921\u093f\u0935\u093e\u0907\u0938 \u092a\u0930 speech recognition service \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u0940\u0964 Google Speech Services \u0907\u0902\u0938\u094d\u091f\u0949\u0932 \u092f\u093e \u090f\u0915\u094d\u091f\u093f\u0935 \u0915\u0930\u0915\u0947 \u092b\u093f\u0930 \u0915\u094b\u0936\u093f\u0936 \u0915\u0930\u0947\u0902\u0964',
    ru: '\u041d\u0430 \u0442\u0432\u043e\u0451\u043c Android-\u0443\u0441\u0442\u0440\u043e\u0439\u0441\u0442\u0432\u0435 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d \u0441\u0435\u0440\u0432\u0438\u0441 \u0440\u0430\u0441\u043f\u043e\u0437\u043d\u0430\u0432\u0430\u043d\u0438\u044f \u0440\u0435\u0447\u0438. \u0423\u0441\u0442\u0430\u043d\u043e\u0432\u0438 \u0438\u043b\u0438 \u0432\u043a\u043b\u044e\u0447\u0438 Google Speech Services \u0438 \u043f\u043e\u043f\u0440\u043e\u0431\u0443\u0439 \u0441\u043d\u043e\u0432\u0430.',
    ar: '\u0644\u0645 \u0646\u0639\u062b\u0631 \u0639\u0644\u0649 \u062e\u062f\u0645\u0629 \u062a\u0639\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0643\u0644\u0627\u0645 \u0645\u062a\u0627\u062d\u0629 \u0639\u0644\u0649 \u062c\u0647\u0627\u0632 Android \u0627\u0644\u062e\u0627\u0635 \u0628\u0643. \u062b\u0628\u0651\u062a \u0623\u0648 \u0641\u0639\u0651\u0644 Google Speech Services \u062b\u0645 \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.',
    id: 'Kami tidak menemukan layanan pengenalan suara di perangkat Android kamu. Pasang atau aktifkan Google Speech Services lalu coba lagi.',
  });
}

export function getRecognitionUnavailableMessage(language: LanguageCode) {
  return voiceText(language, {
    en: 'Speech recognition is not available on this device. Check that Google Speech Services is enabled.',
    es: 'El reconocimiento de voz no est\u00e1 disponible en este dispositivo. Revisa que Google Speech Services est\u00e9 activo.',
    pt: 'O reconhecimento de voz n\u00e3o est\u00e1 dispon\u00edvel neste dispositivo. Verifique se o Google Speech Services est\u00e1 ativo.',
    'zh-Hans': '\u8fd9\u53f0\u8bbe\u5907\u4e0a\u6ca1\u6709\u53ef\u7528\u7684\u8bed\u97f3\u8bc6\u522b\uff0c\u8bf7\u68c0\u67e5 Google Speech Services \u662f\u5426\u5df2\u542f\u7528\u3002',
    hi: '\u0907\u0938 \u0921\u093f\u0935\u093e\u0907\u0938 \u092a\u0930 voice recognition \u0909\u092a\u0932\u092c\u094d\u0927 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 \u0926\u0947\u0916\u0947\u0902 \u0915\u093f Google Speech Services \u090f\u0915\u094d\u091f\u093f\u0935 \u0939\u0948\u0964',
    ru: '\u0420\u0430\u0441\u043f\u043e\u0437\u043d\u0430\u0432\u0430\u043d\u0438\u0435 \u0440\u0435\u0447\u0438 \u043d\u0430 \u044d\u0442\u043e\u043c \u0443\u0441\u0442\u0440\u043e\u0439\u0441\u0442\u0432\u0435 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e. \u041f\u0440\u043e\u0432\u0435\u0440\u044c, \u0432\u043a\u043b\u044e\u0447\u0435\u043d \u043b\u0438 Google Speech Services.',
    ar: '\u0627\u0644\u062a\u0639\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0643\u0644\u0627\u0645 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u062c\u0647\u0627\u0632. \u062a\u0623\u0643\u062f \u0645\u0646 \u062a\u0641\u0639\u064a\u0644 Google Speech Services.',
    id: 'Pengenalan suara tidak tersedia di perangkat ini. Pastikan Google Speech Services aktif.',
  });
}

export function getVoicePlaybackErrorMessage(language: LanguageCode) {
  return voiceText(language, {
    en: 'We could not play Astra voice.',
    es: 'No pudimos reproducir la voz de Astra.',
    pt: 'N\u00e3o conseguimos reproduzir a voz da Astra.',
    'zh-Hans': '\u6211\u4eec\u65e0\u6cd5\u64ad\u653e Astra \u7684\u8bed\u97f3\u3002',
    hi: '\u0939\u092e Astra \u0915\u0940 \u0906\u0935\u093e\u091c\u093c \u091a\u0932\u093e \u0928\u0939\u0940\u0902 \u0938\u0915\u0947\u0964',
    ru: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0432\u043e\u0441\u043f\u0440\u043e\u0438\u0437\u0432\u0435\u0441\u0442\u0438 \u0433\u043e\u043b\u043e\u0441 Astra.',
    ar: '\u0644\u0645 \u0646\u062a\u0645\u0643\u0646 \u0645\u0646 \u062a\u0634\u063a\u064a\u0644 \u0635\u0648\u062a Astra.',
    id: 'Kami tidak dapat memutar suara Astra.',
  });
}

export function getPremiumVoiceStillUnavailableMessage(language: LanguageCode) {
  return voiceText(language, {
    en: 'Astra premium voice is still unavailable right now.',
    es: 'La voz premium de Astra sigue no disponible en este momento.',
    pt: 'A voz premium da Astra ainda n\u00e3o est\u00e1 dispon\u00edvel neste momento.',
    'zh-Hans': 'Astra \u7684\u9ad8\u7ea7\u8bed\u97f3\u76ee\u524d\u4ecd\u4e0d\u53ef\u7528\u3002',
    hi: 'Astra \u0915\u0940 \u092a\u094d\u0930\u0940\u092e\u093f\u092f\u092e \u0906\u0935\u093e\u091c\u093c \u0905\u092d\u0940 \u092d\u0940 \u0909\u092a\u0932\u092c\u094d\u0927 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964',
    ru: '\u041f\u0440\u0435\u043c\u0438\u0443\u043c-\u0433\u043e\u043b\u043e\u0441 Astra \u0432\u0441\u0451 \u0435\u0449\u0451 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d.',
    ar: '\u0635\u0648\u062a Astra \u0627\u0644\u0645\u0645\u064a\u0632 \u0645\u0627 \u0632\u0627\u0644 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d \u062d\u0627\u0644\u064a\u064b\u0627.',
    id: 'Suara premium Astra masih belum tersedia saat ini.',
  });
}

export function getPremiumVoiceUnavailableMessage(language: LanguageCode) {
  return voiceText(language, {
    en: 'Astra premium voice is not available right now. Try again in a few seconds.',
    es: 'La voz premium de Astra no est\u00e1 disponible en este momento. Intenta de nuevo en unos segundos.',
    pt: 'A voz premium da Astra n\u00e3o est\u00e1 dispon\u00edvel agora. Tente novamente em alguns segundos.',
    'zh-Hans': 'Astra \u7684\u9ad8\u7ea7\u8bed\u97f3\u76ee\u524d\u4e0d\u53ef\u7528\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5\u3002',
    hi: 'Astra \u0915\u0940 \u092a\u094d\u0930\u0940\u092e\u093f\u092f\u092e \u0906\u0935\u093e\u091c\u093c \u0905\u092d\u0940 \u0909\u092a\u0932\u092c\u094d\u0927 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 \u0915\u0941\u091b \u0938\u0947\u0915\u0902\u0921 \u092c\u093e\u0926 \u092b\u093f\u0930 \u0915\u094b\u0936\u093f\u0936 \u0915\u0930\u0947\u0902\u0964',
    ru: '\u041f\u0440\u0435\u043c\u0438\u0443\u043c-\u0433\u043e\u043b\u043e\u0441 Astra \u0441\u0435\u0439\u0447\u0430\u0441 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439 \u0441\u043d\u043e\u0432\u0430 \u0447\u0435\u0440\u0435\u0437 \u043f\u0430\u0440\u0443 \u0441\u0435\u043a\u0443\u043d\u0434.',
    ar: '\u0635\u0648\u062a Astra \u0627\u0644\u0645\u0645\u064a\u0632 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d \u062d\u0627\u0644\u064a\u064b\u0627. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649 \u0628\u0639\u062f \u0628\u0636\u0639 \u062b\u0648\u0627\u0646\u064d.',
    id: 'Suara premium Astra sedang tidak tersedia. Coba lagi dalam beberapa detik.',
  });
}

export function getPremiumVoiceNotConfiguredMessage(language: LanguageCode) {
  return voiceText(language, {
    en: 'Astra premium voice is not configured for this build.',
    es: 'La voz premium de Astra no est\u00e1 configurada para esta build.',
    pt: 'A voz premium da Astra n\u00e3o est\u00e1 configurada para esta build.',
    'zh-Hans': 'Astra \u7684\u9ad8\u7ea7\u8bed\u97f3\u6ca1\u6709\u4e3a\u6b64 build \u914d\u7f6e\u3002',
    hi: 'Astra \u0915\u0940 \u092a\u094d\u0930\u0940\u092e\u093f\u092f\u092e \u0906\u0935\u093e\u091c\u093c \u0907\u0938 build \u0915\u0947 \u0932\u093f\u090f configure \u0928\u0939\u0940\u0902 \u0939\u0948\u0964',
    ru: '\u041f\u0440\u0435\u043c\u0438\u0443\u043c-\u0433\u043e\u043b\u043e\u0441 Astra \u043d\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d \u0432 \u044d\u0442\u043e\u0439 build.',
    ar: '\u0635\u0648\u062a Astra \u0627\u0644\u0645\u0645\u064a\u0632 \u063a\u064a\u0631 \u0645\u064f\u0639\u062f \u0644\u0647\u0630\u0647 build.',
    id: 'Suara premium Astra belum dikonfigurasi untuk build ini.',
  });
}

export function getMicrophoneBusyMessage(language: LanguageCode) {
  return voiceText(language, {
    en: 'Astra is already using the microphone. Wait a moment and try again.',
    es: 'Astra ya est\u00e1 usando el micr\u00f3fono. Espera un momento e intenta otra vez.',
    pt: 'A Astra j\u00e1 est\u00e1 usando o microfone. Aguarde um instante e tente novamente.',
    'zh-Hans': 'Astra \u5df2\u7ecf\u5728\u4f7f\u7528\u9ea6\u514b\u98ce\uff0c\u8bf7\u7a0d\u7b49\u540e\u518d\u8bd5\u3002',
    hi: 'Astra \u092a\u0939\u0932\u0947 \u0938\u0947 microphone \u0907\u0938\u094d\u0924\u0947\u092e\u093e\u0932 \u0915\u0930 \u0930\u0939\u0940 \u0939\u0948\u0964 \u0925\u094b\u095c\u093e \u0907\u0902\u0924\u091c\u093e\u0930 \u0915\u0930\u0947\u0902 \u0914\u0930 \u092b\u093f\u0930 \u0915\u094b\u0936\u093f\u0936 \u0915\u0930\u0947\u0902\u0964',
    ru: 'Astra \u0443\u0436\u0435 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u0442 \u043c\u0438\u043a\u0440\u043e\u0444\u043e\u043d. \u041f\u043e\u0434\u043e\u0436\u0434\u0438 \u043d\u0435\u043c\u043d\u043e\u0433\u043e \u0438 \u043f\u043e\u043f\u0440\u043e\u0431\u0443\u0439 \u0441\u043d\u043e\u0432\u0430.',
    ar: '\u062a\u0633\u062a\u062e\u062f\u0645 Astra \u0627\u0644\u0645\u064a\u0643\u0631\u0648\u0641\u0648\u0646 \u0628\u0627\u0644\u0641\u0639\u0644. \u0627\u0646\u062a\u0638\u0631 \u0642\u0644\u064a\u0644\u064b\u0627 \u062b\u0645 \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.',
    id: 'Astra sedang memakai mikrofon. Tunggu sebentar lalu coba lagi.',
  });
}

export function getVoiceConnectionLostMessage(language: LanguageCode) {
  return voiceText(language, {
    en: 'The voice connection was lost. Try again.',
    es: 'Se perdi\u00f3 la conexi\u00f3n de voz. Intenta otra vez.',
    pt: 'A conex\u00e3o de voz foi perdida. Tente novamente.',
    'zh-Hans': '\u8bed\u97f3\u8fde\u63a5\u5df2\u65ad\u5f00\uff0c\u8bf7\u518d\u8bd5\u4e00\u6b21\u3002',
    hi: 'Voice connection \u091f\u0942\u091f \u0917\u092f\u093e\u0964 \u0915\u0943\u092a\u092f\u093e \u092b\u093f\u0930 \u0938\u0947 \u0915\u094b\u0936\u093f\u0936 \u0915\u0930\u0947\u0902\u0964',
    ru: '\u0413\u043e\u043b\u043e\u0441\u043e\u0432\u043e\u0435 \u0441\u043e\u0435\u0434\u0438\u043d\u0435\u043d\u0438\u0435 \u043f\u043e\u0442\u0435\u0440\u044f\u043d\u043e. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439 \u0441\u043d\u043e\u0432\u0430.',
    ar: '\u0641\u064f\u0642\u062f \u0627\u062a\u0635\u0627\u0644 \u0627\u0644\u0635\u0648\u062a. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.',
    id: 'Koneksi suara terputus. Coba lagi.',
  });
}

export function getVoiceInputDisabledMessage(language: LanguageCode) {
  return voiceText(language, {
    en: 'Voice input is disabled. Enable it to talk to Astra.',
    es: 'La entrada por voz est\u00e1 desactivada. Act\u00edvala para hablar con Astra.',
    pt: 'A entrada por voz est\u00e1 desativada. Ative para falar com a Astra.',
    'zh-Hans': '\u8bed\u97f3\u8f93\u5165\u5df2\u5173\u95ed\uff0c\u8bf7\u5148\u542f\u7528\u540e\u518d\u4e0e Astra \u5bf9\u8bdd\u3002',
    hi: 'Voice input \u092c\u0902\u0926 \u0939\u0948\u0964 Astra \u0938\u0947 \u092c\u093e\u0924 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0907\u0938\u0947 \u091a\u093e\u0932\u0942 \u0915\u0930\u0947\u0902\u0964',
    ru: '\u0413\u043e\u043b\u043e\u0441\u043e\u0432\u043e\u0439 \u0432\u0432\u043e\u0434 \u043e\u0442\u043a\u043b\u044e\u0447\u0451\u043d. \u0412\u043a\u043b\u044e\u0447\u0438 \u0435\u0433\u043e, \u0447\u0442\u043e\u0431\u044b \u043f\u043e\u0433\u043e\u0432\u043e\u0440\u0438\u0442\u044c \u0441 Astra.',
    ar: '\u0625\u062f\u062e\u0627\u0644 \u0627\u0644\u0635\u0648\u062a \u0645\u0639\u0637\u0644. \u0641\u0639\u0651\u0644\u0647 \u0644\u0644\u062a\u062d\u062f\u062b \u0645\u0639 Astra.',
    id: 'Input suara dinonaktifkan. Aktifkan untuk berbicara dengan Astra.',
  });
}

import { pickLanguageText } from '../../../constants/i18n';
import type { LanguageCode } from '../../../types';
import type { AstraAction } from '../../types/astra';
import type { AstraVoiceActionPayload } from '../../types/astraVoice';

function translateLabel(language: LanguageCode, values: Partial<Record<LanguageCode, string>>) {
  return pickLanguageText(language, values, 'en');
}

export function mapVoiceActionToAstraAction(
  voiceAction: AstraVoiceActionPayload,
  language: LanguageCode,
): AstraAction | null {
  if (voiceAction.type === 'navigate') {
    switch (voiceAction.target) {
      case 'home':
      case 'wallet':
      case 'trade':
      case 'profile':
      case 'markets':
      case 'social':
      case 'monthly_rewards_pool':
      case 'ramp_buy':
      case 'ramp_sell':
      case 'ramp_convert':
      case 'ramp_pay':
      case 'language':
      case 'security':
      case 'wallet_create':
      case 'wallet_import':
        return {
          id: `voice-nav-${voiceAction.target}`,
          label: translateLabel(language, {
            en: 'Open',
            es: 'Abrir',
            pt: 'Abrir',
            'zh-Hans': '\u6253\u5f00',
            hi: '\u0916\u094b\u0932\u0947\u0902',
            ru: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c',
            ar: '\u0641\u062a\u062d',
            id: 'Buka',
          }),
          icon: 'arrow-forward-outline',
          tone: 'primary',
          kind: 'open_screen',
          targetScreen: voiceAction.target,
        };
      default:
        return null;
    }
  }

  if (voiceAction.type === 'open_chart') {
    return {
      id: `voice-chart-${voiceAction.value ?? 'current'}`,
      label: translateLabel(language, {
        en: 'Open chart',
        es: 'Abrir gr\u00e1fico',
        pt: 'Abrir gr\u00e1fico',
        'zh-Hans': '\u6253\u5f00\u56fe\u8868',
        hi: '\u091a\u093e\u0930\u094d\u091f \u0916\u094b\u0932\u0947\u0902',
        ru: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0433\u0440\u0430\u0444\u0438\u043a',
        ar: '\u0641\u062a\u062d \u0627\u0644\u0645\u062e\u0637\u0637',
        id: 'Buka grafik',
      }),
      icon: 'stats-chart-outline',
      tone: 'primary',
      kind: 'open_chart',
      chartSymbol: voiceAction.value ?? undefined,
    };
  }

  if (voiceAction.type === 'change_language') {
    if (
      voiceAction.value !== 'en' &&
      voiceAction.value !== 'es' &&
      voiceAction.value !== 'pt' &&
      voiceAction.value !== 'zh-Hans' &&
      voiceAction.value !== 'hi' &&
      voiceAction.value !== 'ru' &&
      voiceAction.value !== 'ar' &&
      voiceAction.value !== 'id'
    ) {
      return null;
    }

    return {
      id: `voice-language-${voiceAction.value}`,
      label: translateLabel(language, {
        en: 'Change language',
        es: 'Cambiar idioma',
        pt: 'Mudar idioma',
        'zh-Hans': '\u5207\u6362\u8bed\u8a00',
        hi: '\u092d\u093e\u0937\u093e \u092c\u0926\u0932\u0947\u0902',
        ru: '\u0421\u043c\u0435\u043d\u0438\u0442\u044c \u044f\u0437\u044b\u043a',
        ar: '\u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u0644\u063a\u0629',
        id: 'Ganti bahasa',
      }),
      icon: 'language-outline',
      tone: 'primary',
      kind: 'change_language',
      language: voiceAction.value,
    };
  }

  if (voiceAction.type === 'open_settings') {
    return {
      id: 'voice-open-settings',
      label: translateLabel(language, {
        en: 'Open security',
        es: 'Abrir seguridad',
        pt: 'Abrir seguran\u00e7a',
        'zh-Hans': '\u6253\u5f00\u5b89\u5168',
        hi: '\u0938\u0941\u0930\u0915\u094d\u0937\u093e \u0916\u094b\u0932\u0947\u0902',
        ru: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0431\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u043e\u0441\u0442\u044c',
        ar: '\u0641\u062a\u062d \u0627\u0644\u0623\u0645\u0627\u0646',
        id: 'Buka keamanan',
      }),
      icon: 'shield-checkmark-outline',
      tone: 'secondary',
      kind: 'go_security_settings',
    };
  }

  return null;
}

export function mapAstraActionToVoicePayload(
  action: AstraAction,
): AstraVoiceActionPayload | null {
  if (action.kind === 'open_screen' && action.targetScreen) {
    return {
      type: 'navigate',
      target: action.targetScreen,
    };
  }

  if (action.kind === 'open_chart') {
    return {
      type: 'open_chart',
      value: action.chartSymbol,
    };
  }

  if (action.kind === 'change_language' && action.language) {
    return {
      type: 'change_language',
      value: action.language,
    };
  }

  if (action.kind === 'go_security_settings') {
    return {
      type: 'open_settings',
    };
  }

  return null;
}

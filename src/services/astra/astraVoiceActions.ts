import type { LanguageCode } from '../../../types';
import type { AstraAction } from '../../types/astra';
import type { AstraVoiceActionPayload } from '../../types/astraVoice';

function translateLabel(
  language: LanguageCode,
  englishLabel: string,
  spanishLabel: string,
) {
  return language === 'es' ? spanishLabel : englishLabel;
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
          label: translateLabel(language, 'Open', 'Abrir'),
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
      label: translateLabel(language, 'Open chart', 'Abrir gráfico'),
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
      label: translateLabel(language, 'Change language', 'Cambiar idioma'),
      icon: 'language-outline',
      tone: 'primary',
      kind: 'change_language',
      language: voiceAction.value,
    };
  }

  if (voiceAction.type === 'open_settings') {
    return {
      id: 'voice-open-settings',
      label: translateLabel(language, 'Open security', 'Abrir seguridad'),
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

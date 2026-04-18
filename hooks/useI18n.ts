import { languageOptions, translate } from '../constants/i18n';
import { useOrbitStore } from '../store/useOrbitStore';
import type { LanguageCode } from '../types';

export function useI18n() {
  const language = useOrbitStore((state) => state.settings.language);
  const setLanguage = useOrbitStore((state) => state.setLanguage);

  return {
    language,
    setLanguage,
    options: languageOptions,
    t: (path: string, params?: Record<string, string | number>) =>
      translate(language, path, params),
  };
}

export function getRiskLabel(language: LanguageCode, risk: string) {
  if (risk === 'conservative') {
    return translate(language, 'bot.conservative');
  }

  if (risk === 'aggressive') {
    return translate(language, 'bot.aggressive');
  }

  return translate(language, 'bot.balanced');
}

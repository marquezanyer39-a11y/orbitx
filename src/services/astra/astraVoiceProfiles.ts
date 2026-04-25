import { VoiceQuality, type Voice } from 'expo-speech';

import type { LanguageCode } from '../../../types';
import { pickLanguageText } from '../../../constants/i18n';
import type {
  AstraResolvedVoicePreset,
  AstraVoicePresetDefinition,
  AstraVoicePresetId,
} from '../../types/astraVoice';

export const DEFAULT_ASTRA_VOICE_PRESET_ID: AstraVoicePresetId = 'astra_nova';

const BASE_PRESETS: AstraVoicePresetDefinition[] = [
  {
    id: 'astra_core',
    label: 'Maria',
    description: '',
    tone: 'core',
    gender: 'feminine',
    pitch: 1.02,
    rate: 0.96,
  },
  {
    id: 'astra_edge',
    label: 'Rosany',
    description: '',
    tone: 'edge',
    gender: 'feminine',
    pitch: 0.98,
    rate: 1.02,
  },
  {
    id: 'astra_nova',
    label: 'Rosmeri',
    description: '',
    tone: 'nova',
    gender: 'feminine',
    pitch: 1.08,
    rate: 0.98,
  },
  {
    id: 'astra_pulse',
    label: 'Delicia',
    description: '',
    tone: 'pulse',
    gender: 'feminine',
    pitch: 1.14,
    rate: 1.05,
  },
];

function getPresetDescription(language: LanguageCode, presetId: AstraVoicePresetId) {
  switch (presetId) {
    case 'astra_core':
      return pickLanguageText(language, {
        en: 'Professional, clear and secure',
        es: 'Profesional, clara y segura',
        pt: 'Profissional, clara e segura',
        'zh-Hans': '\u4e13\u4e1a\uff0c\u6e05\u6670\uff0c\u7a33\u5b9a',
        hi: '\u092a\u0947\u0936\u0947\u0935\u0930, \u0938\u094d\u092a\u0937\u094d\u091f \u0914\u0930 \u0938\u0941\u0930\u0915\u094d\u0937\u093f\u0924',
        ru: '\u041f\u0440\u043e\u0444\u0435\u0441\u0441\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u0430\u044f, \u044f\u0441\u043d\u0430\u044f \u0438 \u043d\u0430\u0434\u0451\u0436\u043d\u0430\u044f',
        ar: '\u0627\u062d\u062a\u0631\u0627\u0641\u064a\u0629 \u0648\u0648\u0627\u0636\u062d\u0629 \u0648\u0645\u0648\u062b\u0648\u0642\u0629',
        id: 'Profesional, jelas, dan aman',
      });
    case 'astra_edge':
      return pickLanguageText(language, {
        en: 'Modern, confident and direct',
        es: 'Moderna, firme y dinamica',
        pt: 'Moderna, firme e dinamica',
        'zh-Hans': '\u73b0\u4ee3\uff0c\u575a\u5b9a\uff0c\u76f4\u63a5',
        hi: '\u0906\u0927\u0941\u0928\u093f\u0915, \u0926\u0943\u0922\u093c \u0914\u0930 \u0938\u0940\u0927\u0940',
        ru: '\u0421\u043e\u0432\u0440\u0435\u043c\u0435\u043d\u043d\u0430\u044f, \u0443\u0432\u0435\u0440\u0435\u043d\u043d\u0430\u044f \u0438 \u0447\u0451\u0442\u043a\u0430\u044f',
        ar: '\u0639\u0635\u0631\u064a\u0629 \u0648\u0648\u0627\u062b\u0642\u0629 \u0648\u0645\u0628\u0627\u0634\u0631\u0629',
        id: 'Modern, tegas, dan langsung',
      });
    case 'astra_nova':
      return pickLanguageText(language, {
        en: 'Warm, elegant and reliable',
        es: 'Calida, elegante y confiable',
        pt: 'Calida, elegante e confiavel',
        'zh-Hans': '\u6e29\u6696\uff0c\u4f18\u96c5\uff0c\u53ef\u9760',
        hi: '\u0938\u0941\u0915\u0942\u0928\u092d\u0930\u0940, \u0938\u0941\u0930\u0941\u091a\u093f\u092a\u0942\u0930\u094d\u0923 \u0914\u0930 \u092d\u0930\u094b\u0938\u0947\u092e\u0902\u0926',
        ru: '\u0422\u0451\u043f\u043b\u0430\u044f, \u044d\u043b\u0435\u0433\u0430\u043d\u0442\u043d\u0430\u044f \u0438 \u043d\u0430\u0434\u0451\u0436\u043d\u0430\u044f',
        ar: '\u062f\u0627\u0641\u0626\u0629 \u0648\u0623\u0646\u064a\u0642\u0629 \u0648\u0645\u0648\u062b\u0648\u0642\u0629',
        id: 'Hangat, elegan, dan tepercaya',
      });
    case 'astra_pulse':
      return pickLanguageText(language, {
        en: 'Soft, empathetic and close',
        es: 'Suave, empatica y cercana',
        pt: 'Suave, empatica e proxima',
        'zh-Hans': '\u67d4\u548c\uff0c\u5171\u60c5\uff0c\u4eb2\u5207',
        hi: '\u092e\u0943\u0926\u0941, \u0938\u0939\u093e\u0928\u0941\u092d\u0942\u0924\u093f\u092a\u0942\u0930\u094d\u0923 \u0914\u0930 \u0915\u0930\u0940\u092c',
        ru: '\u041c\u044f\u0433\u043a\u0430\u044f, \u044d\u043c\u043f\u0430\u0442\u0438\u0447\u043d\u0430\u044f \u0438 \u0431\u043b\u0438\u0437\u043a\u0430\u044f',
        ar: '\u0646\u0627\u0639\u0645\u0629 \u0648\u0645\u062a\u0639\u0627\u0637\u0641\u0629 \u0648\u0642\u0631\u064a\u0628\u0629',
        id: 'Lembut, empatik, dan dekat',
      });
    default:
      return '';
  }
}

const FEMALE_HINTS = [
  'female',
  'fem',
  'samantha',
  'monica',
  'paulina',
  'karen',
  'ava',
  'sofia',
  'camila',
  'bella',
  'sarah',
  'alice',
  'matilda',
  'jessica',
  'lily',
  'google us english female',
];

const PREMIUM_HINTS = ['enhanced', 'premium', 'natural', 'neural', 'eloquence'];
const HUMAN_HINTS = ['wavenet', 'neural2', 'natural', 'premium', 'studio', 'enhanced'];
const SPANISH_LATAM_HINTS = ['es-mx', 'es-us', 'es-419', 'latam', 'latino', 'mexico', 'spanish us'];
const CASTILIAN_HINTS = ['es-es', 'spanish spain', 'castilian'];
const LOW_QUALITY_HINTS = ['compact', 'basic', 'embedded', 'offline'];

function normalize(value: string | null | undefined) {
  return (value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function scoreVoice(voice: Voice, preset: AstraVoicePresetDefinition, language: LanguageCode) {
  const voiceName = normalize(voice.name);
  const voiceIdentifier = normalize(voice.identifier);
  const voiceLanguage = normalize(voice.language);
  const requestedLanguage = normalize(language);
  const requestedPrimaryLanguage = requestedLanguage.split('-')[0];
  const voiceMeta = `${voiceName} ${voiceIdentifier} ${voiceLanguage}`;
  let score = 0;

  if (requestedPrimaryLanguage && voiceLanguage.startsWith(requestedPrimaryLanguage)) {
    score += 10;
  } else if (voiceLanguage.startsWith('es') || voiceLanguage.startsWith('en')) {
    score += 2;
  }

  if (requestedPrimaryLanguage === 'es' && SPANISH_LATAM_HINTS.some((hint) => voiceMeta.includes(hint))) {
    score += 8;
  }

  if (requestedPrimaryLanguage === 'es' && CASTILIAN_HINTS.some((hint) => voiceMeta.includes(hint))) {
    score += 4;
  }

  if (FEMALE_HINTS.some((hint) => voiceMeta.includes(hint))) {
    score += 5;
  }

  if (PREMIUM_HINTS.some((hint) => voiceMeta.includes(hint))) {
    score += 2;
  }

  if (HUMAN_HINTS.some((hint) => voiceMeta.includes(hint))) {
    score += 4;
  }

  if (voice.quality === VoiceQuality.Enhanced) {
    score += 5;
  }

  if (LOW_QUALITY_HINTS.some((hint) => voiceMeta.includes(hint))) {
    score -= 3;
  }

  if (preset.id === 'astra_core' && /alice|bella|sarah|matilda|jessica|female/.test(voiceMeta)) {
    score += 2;
  }

  if (preset.id === 'astra_edge' && /matilda|jessica|sarah|female|sofia/.test(voiceMeta)) {
    score += 2;
  }

  if (preset.id === 'astra_nova' && /bella|lily|monica|paulina|female|samantha|sofia/.test(voiceMeta)) {
    score += 2;
  }

  if (preset.id === 'astra_pulse' && /sarah|jessica|karen|ava|camila|female/.test(voiceMeta)) {
    score += 2;
  }

  return score;
}

function chooseVoice(
  preset: AstraVoicePresetDefinition,
  voices: Voice[],
  language: LanguageCode,
  usedIdentifiers: Set<string>,
) {
  const ranked = voices
    .map((voice) => ({
      voice,
      score: scoreVoice(voice, preset, language),
    }))
    .sort((a, b) => b.score - a.score);

  const uniqueMatch = ranked.find(
    ({ voice, score }) => score > 0 && !usedIdentifiers.has(voice.identifier),
  )?.voice;

  if (uniqueMatch) {
    usedIdentifiers.add(uniqueMatch.identifier);
    return uniqueMatch;
  }

  const fallbackMatch = ranked.find(({ voice }) => !usedIdentifiers.has(voice.identifier))?.voice;
  if (fallbackMatch) {
    usedIdentifiers.add(fallbackMatch.identifier);
    return fallbackMatch;
  }

  return null;
}

export function buildAstraVoicePresetCatalog(
  voices: Voice[],
  language: LanguageCode,
): AstraResolvedVoicePreset[] {
  const usedIdentifiers = new Set<string>();

  return BASE_PRESETS.map((preset) => {
    const matched = chooseVoice(preset, voices, language, usedIdentifiers);

    return {
      ...preset,
      description: getPresetDescription(language, preset.id),
      voiceIdentifier: matched?.identifier ?? null,
      language: matched?.language ?? null,
      matchedVoiceName: matched?.name ?? null,
    };
  });
}

export function getAstraVoicePresetLabel(
  presetId: AstraVoicePresetId,
  presets?: AstraResolvedVoicePreset[],
) {
  return (
    presets?.find((item) => item.id === presetId)?.label ??
    BASE_PRESETS.find((item) => item.id === presetId)?.label ??
    'Astra Core'
  );
}

export function getDefaultAstraVoicePresets(): AstraResolvedVoicePreset[] {
  return BASE_PRESETS.map((preset) => ({
    ...preset,
    description: getPresetDescription('en', preset.id),
    voiceIdentifier: null,
    language: null,
    matchedVoiceName: null,
  }));
}

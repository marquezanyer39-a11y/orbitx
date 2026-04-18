import { VoiceQuality, type Voice } from 'expo-speech';

import type { LanguageCode } from '../../../types';
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
    description: 'Profesional, clara y segura',
    tone: 'core',
    gender: 'feminine',
    pitch: 1.02,
    rate: 0.96,
  },
  {
    id: 'astra_edge',
    label: 'Rosany',
    description: 'Moderna, firme y dinamica',
    tone: 'edge',
    gender: 'feminine',
    pitch: 0.98,
    rate: 1.02,
  },
  {
    id: 'astra_nova',
    label: 'Rosmeri',
    description: 'Calida, elegante y confiable',
    tone: 'nova',
    gender: 'feminine',
    pitch: 1.08,
    rate: 0.98,
  },
  {
    id: 'astra_pulse',
    label: 'Delicia',
    description: 'Suave, empatica y cercana',
    tone: 'pulse',
    gender: 'feminine',
    pitch: 1.14,
    rate: 1.05,
  },
];

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
  const voiceMeta = `${voiceName} ${voiceIdentifier} ${voiceLanguage}`;
  let score = 0;

  if (language === 'es' && voiceLanguage.startsWith('es')) {
    score += 10;
  } else if (language === 'en' && voiceLanguage.startsWith('en')) {
    score += 10;
  } else if (voiceLanguage.startsWith('es') || voiceLanguage.startsWith('en')) {
    score += 2;
  }

  if (language === 'es' && SPANISH_LATAM_HINTS.some((hint) => voiceMeta.includes(hint))) {
    score += 8;
  }

  if (language === 'es' && CASTILIAN_HINTS.some((hint) => voiceMeta.includes(hint))) {
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
    voiceIdentifier: null,
    language: null,
    matchedVoiceName: null,
  }));
}

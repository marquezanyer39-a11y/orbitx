import type {
  OrbitAccentPreset,
  OrbitMotionPreset,
  OrbitTextPreset,
} from '../../types';
import { getLanguageMetadata, languageOptions, translate } from '../../constants/i18n';
import { useOrbitStore } from '../../store/useOrbitStore';

const ACCENT_LABELS: Record<OrbitAccentPreset, string> = {
  violet: 'profile.accentViolet',
  cyan: 'profile.accentCyan',
  lime: 'profile.accentLime',
  sunset: 'profile.accentSunset',
  rose: 'profile.accentRose',
};

const PRIVACY_LABELS = {
  strict: {
    en: 'Strict',
    es: 'Estricto',
    pt: 'Estrito',
    'zh-Hans': '严格',
    hi: 'कड़ा',
    ru: 'Строгий',
    ar: 'صارم',
    id: 'Ketat',
  },
  standard: {
    en: 'Standard',
    es: 'Estándar',
    pt: 'Padrão',
    'zh-Hans': '标准',
    hi: 'मानक',
    ru: 'Стандартный',
    ar: 'قياسي',
    id: 'Standar',
  },
} as const;

export const PROFILE_THEME_PRESETS: ReadonlyArray<{
  label: string;
  accent: OrbitAccentPreset;
  text: OrbitTextPreset;
  motion: OrbitMotionPreset;
  colors: [string, string];
}> = [
  { label: 'Nebula', accent: 'violet', text: 'default', motion: 'bull', colors: ['#7B3FE4', '#A96EFF'] },
  { label: 'Aurora', accent: 'cyan', text: 'ice', motion: 'bull', colors: ['#00E5FF', '#6EFFF4'] },
  { label: 'Volt', accent: 'lime', text: 'neon', motion: 'bull', colors: ['#8CFF4D', '#D5FF77'] },
  { label: 'Ember', accent: 'sunset', text: 'gold', motion: 'bull', colors: ['#FF8A3D', '#FFBE62'] },
];

export const MOTION_THEME_PRESETS: ReadonlyArray<{
  label: string;
  motion: OrbitMotionPreset;
  description: string;
  colors: [string, string];
}> = [
  {
    label: 'Toro OrbitX',
    motion: 'bull',
    description: 'Video cyber bull premium visible solo en Home y Perfil',
    colors: ['#7B3FE4', '#16F0A0'],
  },
  {
    label: 'Oso OrbitX',
    motion: 'bear',
    description: 'Video cyber bear premium para el lado bajista del mercado',
    colors: ['#7B3FE4', '#FF3D57'],
  },
  {
    label: 'Batalla OrbitX',
    motion: 'battle',
    description: 'Choque epico entre toro y oso con energia de mercado',
    colors: ['#16F0A0', '#FF3D57'],
  },
];

function cycleValue<T>(values: readonly T[], current: T) {
  const index = values.indexOf(current);
  if (index === -1 || index === values.length - 1) {
    return values[0];
  }

  return values[index + 1];
}

export function useUserPreferences() {
  const settings = useOrbitStore((state) => state.settings);
  const setAppearanceMode = useOrbitStore((state) => state.setAppearanceMode);
  const setOrbitAccentPreset = useOrbitStore((state) => state.setOrbitAccentPreset);
  const setLanguage = useOrbitStore((state) => state.setLanguage);
  const setUsageMode = useOrbitStore((state) => state.setUsageMode);
  const setUiDensity = useOrbitStore((state) => state.setUiDensity);
  const setAppLayoutMode = useOrbitStore((state) => state.setAppLayoutMode);
  const applyOrbitThemePreset = useOrbitStore((state) => state.applyOrbitThemePreset);
  const toggleOrbitMotion = useOrbitStore((state) => state.toggleOrbitMotion);
  const setOrbitMotionPreset = useOrbitStore((state) => state.setOrbitMotionPreset);

  return {
    settings,
    labels: {
      appearance: translate(settings.language, `theme.${settings.appearanceMode}`),
      accent: translate(settings.language, ACCENT_LABELS[settings.orbitAccentPreset]),
      language: getLanguageMetadata(settings.language).nativeLabel,
      usageMode: translate(
        settings.language,
        settings.usageMode === 'pro' ? 'settings.usagePro' : 'settings.usageBasic',
      ),
      density: translate(
        settings.language,
        settings.uiDensity === 'comfortable'
          ? 'settings.densityComfortable'
          : 'settings.densityCompact',
      ),
      layout: translate(
        settings.language,
        settings.appLayoutMode === 'reordered'
          ? 'settings.layoutReordered'
          : 'settings.layoutDefault',
      ),
      motion: translate(
        settings.language,
        settings.orbitMotionEnabled ? 'settings.motionActive' : 'settings.motionPaused',
      ),
      notifications: settings.notificationsEnabled
        ? translate(settings.language, 'common.on')
        : translate(settings.language, 'common.off'),
      privacy:
        PRIVACY_LABELS[settings.privacyMode][settings.language] ??
        PRIVACY_LABELS[settings.privacyMode].en,
    },
    themePresets: PROFILE_THEME_PRESETS,
    motionThemePresets: MOTION_THEME_PRESETS,
    cycleAppearance: () =>
      setAppearanceMode(
        settings.appearanceMode === 'orbit'
          ? 'day'
          : settings.appearanceMode === 'day'
            ? 'night'
            : 'orbit',
      ),
    cycleAccent: () =>
      setOrbitAccentPreset(
        cycleValue(['violet', 'cyan', 'lime', 'sunset', 'rose'] as const, settings.orbitAccentPreset),
      ),
    cycleLanguage: () =>
      setLanguage(cycleValue(languageOptions.map((option) => option.value), settings.language)),
    toggleUsageMode: () => setUsageMode(settings.usageMode === 'pro' ? 'basic' : 'pro'),
    toggleDensity: () =>
      setUiDensity(settings.uiDensity === 'comfortable' ? 'compact' : 'comfortable'),
    toggleLayoutMode: () =>
      setAppLayoutMode(settings.appLayoutMode === 'default' ? 'reordered' : 'default'),
    toggleMotion: () => toggleOrbitMotion(),
    setMotionPreset: (preset: OrbitMotionPreset) => setOrbitMotionPreset(preset),
    applyOrbitThemePreset,
  };
}

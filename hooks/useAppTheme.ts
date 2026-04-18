import { getOrbitCustomizedTheme, THEMES } from '../constants/theme';
import { useOrbitStore } from '../store/useOrbitStore';

export function useAppTheme() {
  const mode = useOrbitStore((state) => state.settings.appearanceMode);
  const orbitAccentPreset = useOrbitStore((state) => state.settings.orbitAccentPreset);
  const orbitTextPreset = useOrbitStore((state) => state.settings.orbitTextPreset);
  const orbitMotionEnabled = useOrbitStore((state) => state.settings.orbitMotionEnabled);
  const orbitMotionPreset = useOrbitStore((state) => state.settings.orbitMotionPreset);
  const colors =
    mode === 'orbit'
      ? getOrbitCustomizedTheme(orbitAccentPreset, orbitTextPreset)
      : THEMES[mode] ?? THEMES.orbit;

  return {
    mode,
    colors,
    orbitMotionEnabled,
    orbitMotionPreset,
    isDark: mode !== 'day',
  };
}

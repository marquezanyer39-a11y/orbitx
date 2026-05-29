import { FONT, ORBITX_COLORS, RADII, SPACING, withOpacity } from '../../../../constants/theme';

import type { AstraUiTone } from '../types/astraUi.types';

export const astraUiTheme = {
  colors: {
    background: ORBITX_COLORS.background,
    surface: ORBITX_COLORS.surface,
    surfaceElevated: ORBITX_COLORS.surfaceElevated,
    border: ORBITX_COLORS.border,
    borderStrong: ORBITX_COLORS.borderStrong,
    text: ORBITX_COLORS.textPrimary,
    textMuted: ORBITX_COLORS.textSecondary,
    accent: ORBITX_COLORS.green,
    accentSoft: withOpacity(ORBITX_COLORS.green, 0.14),
    purple: ORBITX_COLORS.purple,
    warning: ORBITX_COLORS.warning,
    warningSoft: withOpacity(ORBITX_COLORS.warning, 0.16),
    danger: ORBITX_COLORS.red,
    dangerSoft: withOpacity(ORBITX_COLORS.red, 0.14),
    overlay: 'rgba(5,5,8,0.76)',
    white: '#FFFFFF',
  },
  spacing: SPACING,
  radii: RADII,
  fonts: FONT,
  shadow: {
    accent: {
      shadowColor: ORBITX_COLORS.green,
      shadowOpacity: 0.22,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    },
  },
} as const;

export function getAstraUiToneColors(tone: AstraUiTone = 'neutral') {
  if (tone === 'success') {
    return {
      borderColor: withOpacity(astraUiTheme.colors.accent, 0.24),
      backgroundColor: astraUiTheme.colors.accentSoft,
      iconColor: astraUiTheme.colors.accent,
    };
  }

  if (tone === 'warning') {
    return {
      borderColor: withOpacity(astraUiTheme.colors.warning, 0.24),
      backgroundColor: astraUiTheme.colors.warningSoft,
      iconColor: astraUiTheme.colors.warning,
    };
  }

  if (tone === 'critical') {
    return {
      borderColor: withOpacity(astraUiTheme.colors.danger, 0.24),
      backgroundColor: astraUiTheme.colors.dangerSoft,
      iconColor: astraUiTheme.colors.danger,
    };
  }

  return {
    borderColor: withOpacity(astraUiTheme.colors.purple, 0.24),
    backgroundColor: withOpacity(astraUiTheme.colors.purple, 0.12),
    iconColor: astraUiTheme.colors.purple,
  };
}

import { useMemo } from 'react';

import { socialMockGateway } from '../services/mocks/socialMockGateway';
import { SOCIAL_ROUTES } from '../navigation/socialRoutes';
import { SOCIAL_COLORS, SOCIAL_GRADIENTS, SOCIAL_LAYOUT, SOCIAL_RADIUS, SOCIAL_SPACING, SOCIAL_TYPOGRAPHY } from '../theme/socialTheme';

export function useSocialArchitecture() {
  return useMemo(
    () => ({
      theme: {
        colors: SOCIAL_COLORS,
        gradients: SOCIAL_GRADIENTS,
        spacing: SOCIAL_SPACING,
        radius: SOCIAL_RADIUS,
        typography: SOCIAL_TYPOGRAPHY,
        layout: SOCIAL_LAYOUT,
      },
      routes: SOCIAL_ROUTES,
      gateway: socialMockGateway,
    }),
    [],
  );
}

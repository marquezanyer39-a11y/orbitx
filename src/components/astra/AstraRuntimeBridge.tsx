import { usePathname } from 'expo-router';
import { useEffect } from 'react';

import { useOrbitStore } from '../../../store/useOrbitStore';
import { buildAstraContext } from '../../services/astra/astraContext';
import { useAstraStore } from '../../store/astraStore';

export function AstraRuntimeBridge() {
  const pathname = usePathname();
  const rememberContext = useAstraStore((state) => state.rememberContext);
  const language = useOrbitStore((state) => state.settings.language);

  useEffect(() => {
    rememberContext(
      buildAstraContext(
        {},
        {
          pathname,
          language,
          previousContext: useAstraStore.getState().context,
        },
      ),
    );
  }, [language, pathname, rememberContext]);

  return null;
}

import { router, usePathname } from 'expo-router';

import { useOrbitStore } from '../../store/useOrbitStore';
import { buildAstraContext } from '../services/astra/astraContext';
import { useAstraStore } from '../store/astraStore';
import type { AstraSupportContext } from '../types/astra';

type OpenAstraPayload = Partial<AstraSupportContext> & {
  path?: string;
  screenName?: string;
};

export function useAstra() {
  const pathname = usePathname();
  const language = useOrbitStore((state) => state.settings.language);
  const ask = useAstraStore((state) => state.ask);
  const rememberContext = useAstraStore((state) => state.rememberContext);

  function buildContext(payload: OpenAstraPayload): AstraSupportContext {
    return buildAstraContext(payload, {
      pathname,
      language,
      previousContext: useAstraStore.getState().context,
    });
  }

  return {
    language,
    openAstra: (payload: OpenAstraPayload) => {
      const nextContext = buildContext(payload);

      rememberContext(nextContext);
      useAstraStore.setState({
        context: nextContext,
        isOpen: false,
        isExpanded: false,
        activeRequestId: null,
        isTyping: false,
      });
      router.push('/astra');
    },
    openAstraWithQuestion: async (payload: OpenAstraPayload, question: string) => {
      const trimmed = question.trim();
      const nextContext = buildContext(payload);
      rememberContext(nextContext);
      useAstraStore.setState({
        context: nextContext,
        isOpen: false,
        isExpanded: false,
        activeRequestId: null,
        isTyping: false,
      });
      router.push('/astra');
      if (!trimmed) {
        return null;
      }

      return ask(trimmed);
    },
  };
}

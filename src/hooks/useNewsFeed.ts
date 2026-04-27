import { useHomeNews } from '../../hooks/useHomeNews';
import type { OrbitNewsCategory } from '../../services/news/types';

const CATEGORY_LABELS: Record<OrbitNewsCategory, string> = {
  crypto: 'Cripto',
  economy: 'Mercados',
  technology: 'Tecnologia',
  politics: 'Politica',
};

export function useNewsFeed(category: OrbitNewsCategory) {
  const state = useHomeNews(category, 1);
  const featuredItem = state.items[0] ?? null;

  return {
    ...state,
    featuredItem,
    categories: [
      { key: 'crypto' as const, label: CATEGORY_LABELS.crypto },
      { key: 'economy' as const, label: CATEGORY_LABELS.economy },
      { key: 'technology' as const, label: CATEGORY_LABELS.technology },
      { key: 'politics' as const, label: CATEGORY_LABELS.politics },
    ],
  };
}

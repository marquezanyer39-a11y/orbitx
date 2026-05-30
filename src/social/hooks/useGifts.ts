import { useCallback, useEffect, useState } from 'react';

import type { SocialGiftOption } from '../../types/social';
import * as giftsService from '../services/giftsService';

export function useGifts() {
  const [loading, setLoading] = useState(false);
  const [gifts, setGifts] = useState<SocialGiftOption[]>([]);
  const [selectedGift, setSelectedGift] = useState<SocialGiftOption | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const nextGifts = await giftsService.getAvailableGifts();
      if (!cancelled) {
        setGifts(nextGifts);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const sendGift = useCallback(async (streamOrPostId: string, gift: SocialGiftOption) => {
    setLoading(true);
    try {
      return await giftsService.sendGift(streamOrPostId, gift);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    gifts,
    selectedGift,
    setSelectedGift,
    sendGift,
  };
}

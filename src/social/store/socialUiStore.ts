import { create } from 'zustand';

import type { SocialOverlayKey } from '../types';

interface SocialUiState {
  activeOverlay: SocialOverlayKey;
  activeEntityId: string | null;
  setOverlay: (overlay: SocialOverlayKey, entityId?: string | null) => void;
  closeOverlay: () => void;
}

export const useSocialUiStore = create<SocialUiState>((set) => ({
  activeOverlay: null,
  activeEntityId: null,
  setOverlay: (overlay, entityId = null) =>
    set({
      activeOverlay: overlay,
      activeEntityId: entityId,
    }),
  closeOverlay: () =>
    set({
      activeOverlay: null,
      activeEntityId: null,
    }),
}));

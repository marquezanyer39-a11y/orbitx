import { create } from 'zustand';

import type { CreatorSupporter } from '../types';

interface CreatorStoreState {
  activeProfileId: string | null;
  followingMap: Record<string, boolean>;
  supporters: CreatorSupporter[];
  setActiveProfileId: (profileId: string | null) => void;
  setFollowingState: (creatorId: string, following: boolean) => void;
  setSupporters: (supporters: CreatorSupporter[]) => void;
}

export const useCreatorStore = create<CreatorStoreState>((set) => ({
  activeProfileId: null,
  followingMap: {},
  supporters: [],
  setActiveProfileId: (profileId) => set({ activeProfileId: profileId }),
  setFollowingState: (creatorId, following) =>
    set((state) => ({
      followingMap: {
        ...state.followingMap,
        [creatorId]: following,
      },
    })),
  setSupporters: (supporters) => set({ supporters }),
}));

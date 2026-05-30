import { create } from 'zustand';
import { Ionicons } from '@expo/vector-icons';

import type { GiftTransaction, LiveStream } from '../types';

export interface LiveFloatingReaction {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  right: number;
  bottom: number;
  size: number;
}

export interface LiveRoomMessage {
  id: string;
  author: string;
  handle: string;
  body: string;
  isPinned?: boolean;
}

interface LiveStoreState {
  activeStream: LiveStream | null;
  messages: LiveRoomMessage[];
  viewers: number;
  reactions: LiveFloatingReaction[];
  giftQueue: GiftTransaction[];
  setActiveStream: (stream: LiveStream | null) => void;
  setMessages: (messages: LiveRoomMessage[]) => void;
  pushMessage: (message: LiveRoomMessage) => void;
  setViewers: (viewers: number) => void;
  pushReaction: (reaction: LiveFloatingReaction) => void;
  removeReaction: (reactionId: string) => void;
  enqueueGift: (gift: GiftTransaction) => void;
  clearGiftQueue: () => void;
  reset: () => void;
}

export const useLiveStore = create<LiveStoreState>((set) => ({
  activeStream: null,
  messages: [],
  viewers: 0,
  reactions: [],
  giftQueue: [],
  setActiveStream: (stream) => set({ activeStream: stream }),
  setMessages: (messages) => set({ messages }),
  pushMessage: (message) => set((state) => ({ messages: [...state.messages.slice(-20), message] })),
  setViewers: (viewers) => set({ viewers }),
  pushReaction: (reaction) => set((state) => ({ reactions: [...state.reactions, reaction] })),
  removeReaction: (reactionId) =>
    set((state) => ({ reactions: state.reactions.filter((reaction) => reaction.id !== reactionId) })),
  enqueueGift: (gift) => set((state) => ({ giftQueue: [gift, ...state.giftQueue].slice(0, 6) })),
  clearGiftQueue: () => set({ giftQueue: [] }),
  reset: () =>
    set({
      activeStream: null,
      messages: [],
      viewers: 0,
      reactions: [],
      giftQueue: [],
    }),
}));

import { Ionicons } from '@expo/vector-icons';
import type { Stream, StreamMessage } from './domain';

export type LiveStream = Stream;
export type LiveMessage = StreamMessage;

export interface LiveReactionTemplate {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

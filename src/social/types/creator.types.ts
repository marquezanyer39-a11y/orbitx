import type { CreatorProfile } from './domain';

export type SocialCreatorProfile = CreatorProfile;

export interface CreatorStat {
  label: string;
  value: string;
}

export interface CreatorSupporter {
  id: string;
  name: string;
  avatarUri?: string | null;
  valueLabel: string;
  badge?: string;
}

export interface CreatorContentItem {
  id: string;
  kind: 'live' | 'signal' | 'clip';
  title: string;
  subtitle?: string;
  imageUri?: string;
  body?: string;
  badge?: string;
  metric?: string;
  accentValue?: string;
}

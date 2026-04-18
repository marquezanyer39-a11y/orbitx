import type { SocialComposerDraft } from '../../types/social';

const BLOCKED_PATTERNS = [
  /\bxxx\b/i,
  /\bporno\b/i,
  /\bporn\b/i,
  /\badult\b/i,
  /\bnsfw\b/i,
  /\bonlyfans\b/i,
  /\bcontenido sexual\b/i,
  /\bdesnudo(s)?\b/i,
];

export interface SocialModerationResult {
  allowed: boolean;
  reason?: string;
}

export function moderateSocialDraft(draft: SocialComposerDraft): SocialModerationResult {
  const joined = [draft.description, draft.hashtags.join(' '), draft.tokenSymbol ?? '']
    .join(' ')
    .trim();

  const matched = BLOCKED_PATTERNS.find((pattern) => pattern.test(joined));
  if (!matched) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason:
      'Este contenido no cumple las reglas de OrbitX Social. Evita referencias sexuales, adultas o NSFW.',
  };
}

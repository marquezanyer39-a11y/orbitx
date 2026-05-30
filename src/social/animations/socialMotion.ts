export const SOCIAL_MOTION = {
  fast: 160,
  standard: 220,
  slow: 320,
  springBounciness: 6,
  springTension: 60,
  feedSnapThreshold: 0.72,
  bottomSheetDismissDistance: 150,
  floatingReactionDuration: 2400,
} as const;

export const SOCIAL_EASING = {
  enter: 'easeOut',
  exit: 'easeIn',
  emphasis: 'spring',
} as const;

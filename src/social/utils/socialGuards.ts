import type { CreatorProfile } from '../types';

export function canComment() {
  return true;
}

export function canSendGift(balanceUsd = 0, priceUsd = 0) {
  return balanceUsd >= priceUsd;
}

export function canStartLive() {
  return true;
}

export function canShareToX(connected = false) {
  return connected;
}

export function requiresXConnection() {
  return true;
}

export function isCreatorVerified(profile: Pick<CreatorProfile, 'verified'> | null | undefined) {
  return Boolean(profile?.verified);
}

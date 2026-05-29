export const ASTRA_NOTIFICATION_DEFAULT_DAILY_CAP = 8;

export function isExpired(expiresAt: string, now: number = Date.now()): boolean {
  return expiresAt <= new Date(now).toISOString();
}

export function getTodayKey(now: number = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10);
}

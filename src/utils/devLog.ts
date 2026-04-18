export function devWarn(message: string, ...args: unknown[]) {
  if (!__DEV__) {
    return;
  }

  console.warn(message, ...args);
}

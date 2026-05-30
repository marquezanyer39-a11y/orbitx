export async function createMockDelay(duration = 180) {
  await new Promise((resolve) => setTimeout(resolve, duration));
}

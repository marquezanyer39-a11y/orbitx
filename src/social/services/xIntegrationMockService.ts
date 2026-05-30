import { SOCIAL_X_IMPORTS_MOCK } from '../mocks/astraInsights.mock';
import { createMockDelay } from '../utils/createMockDelay';

let isConnected = false;

export async function getConnectionStatus() {
  await createMockDelay();
  return isConnected ? 'connected' : 'not_connected';
}

export async function connectXMock() {
  await createMockDelay(240);
  isConnected = true;
  return { connected: true };
}

export async function disconnectXMock() {
  await createMockDelay(180);
  isConnected = false;
  return { connected: false };
}

export async function importPostsMock() {
  await createMockDelay(220);
  return SOCIAL_X_IMPORTS_MOCK;
}

export async function shareToXMock() {
  await createMockDelay(180);
  return {
    success: isConnected,
  };
}

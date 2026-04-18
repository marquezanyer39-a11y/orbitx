import type {
  AstraVoiceContextPayload,
  AstraVoiceSession,
} from '../../types/astraVoice';
import { getAstraBackendBaseUrl, hasAstraBackend } from './astraRuntimeConfig';

const DEFAULT_TIMEOUT_MS = 18_000;

function isJsonResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  return contentType.toLowerCase().includes('application/json');
}

async function readErrorMessage(response: Response) {
  if (isJsonResponse(response)) {
    const data = (await response.json().catch(() => null)) as
      | { error?: { message?: string }; message?: string }
      | null;
    return data?.error?.message ?? data?.message ?? 'Voice request failed.';
  }

  return response.text().catch(() => 'Voice request failed.');
}

async function postJson<TResponse>(
  path: string,
  body: Record<string, unknown>,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<TResponse> {
  const baseUrl = getAstraBackendBaseUrl();
  if (!baseUrl) {
    throw new Error('Astra Voice backend is not configured.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    return (await response.json()) as TResponse;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function createAstraVoiceSession(context: AstraVoiceContextPayload) {
  return postJson<AstraVoiceSession>('/api/astra/realtime-session', { context });
}

export function hasAstraVoiceBackend() {
  return hasAstraBackend();
}

import type { AstraLanguage } from '../../types/astra';
import { getAstraBackendBaseUrl } from './astraRuntimeConfig';

export interface AstraImagePromptSuggestion {
  id: string;
  label: string;
  prompt: string;
}

export interface AstraGeneratedImage {
  id: string;
  imageUrl: string;
  prompt: string;
  width?: number | null;
  height?: number | null;
}

export interface AstraImageAvailability {
  state: 'available' | 'unavailable' | 'unknown';
  providerLabel: string;
  message: string;
}

interface AstraImageGenerationInput {
  prompt: string;
  language: AstraLanguage;
  tokenName?: string;
  tokenSymbol?: string;
  description?: string;
}

interface AstraImageEnvelope {
  success: boolean;
  data?: {
    state: 'ready';
    providerLabel: string;
    images: AstraGeneratedImage[];
    prompt: string;
  };
  error?: {
    message?: string;
  };
}

interface AstraHealthEnvelope {
  nanobananaConfigured?: boolean;
  nanobanana?: {
    available?: boolean;
    providerLabel?: string;
    message?: string;
    model?: string;
    endpoint?: string;
  };
}

function safeText(value: string | undefined, fallback: string) {
  const cleaned = `${value ?? ''}`.trim();
  return cleaned || fallback;
}

export function buildAstraImagePromptSuggestions(input: {
  language: AstraLanguage;
  tokenName?: string;
  tokenSymbol?: string;
  description?: string;
}): AstraImagePromptSuggestion[] {
  const es = input.language === 'es';
  const tokenName = safeText(input.tokenName, es ? 'tu memecoin' : 'your memecoin');
  const tokenSymbol = safeText(input.tokenSymbol, 'MEME').toUpperCase();
  const concept = safeText(
    input.description,
    es
      ? 'energia viral, look premium crypto, composicion clara'
      : 'viral energy, premium crypto look, clean composition',
  );

  return [
    {
      id: 'astra-visual-mascot',
      label: es ? 'Mascota viral' : 'Viral mascot',
      prompt: es
        ? `Ilustracion premium para ${tokenName} (${tokenSymbol}), mascota expresiva con estilo meme crypto, fondo oscuro elegante, brillo verde sutil, iconografia clara, composicion cuadrada, ${concept}.`
        : `Premium illustration for ${tokenName} (${tokenSymbol}), expressive mascot with crypto meme style, elegant dark background, subtle green glow, clear iconography, square composition, ${concept}.`,
    },
    {
      id: 'astra-visual-logo',
      label: es ? 'Logo token' : 'Token logo',
      prompt: es
        ? `Logo limpio y potente para ${tokenName} (${tokenSymbol}), estilo crypto premium, simbolo central memorable, contraste alto, fondo oscuro, formato 1:1, ${concept}.`
        : `Clean and powerful logo for ${tokenName} (${tokenSymbol}), premium crypto style, memorable central symbol, high contrast, dark background, 1:1 format, ${concept}.`,
    },
    {
      id: 'astra-visual-sticker',
      label: es ? 'Sticker meme' : 'Meme sticker',
      prompt: es
        ? `Sticker visual para ${tokenName} (${tokenSymbol}), estilo meme moderno, trazos definidos, personalidad fuerte, look de super app crypto, imagen cuadrada lista para branding, ${concept}.`
        : `Visual sticker for ${tokenName} (${tokenSymbol}), modern meme style, defined outlines, strong personality, crypto super app look, square branding-ready image, ${concept}.`,
    },
  ];
}

export async function generateAstraImage(input: AstraImageGenerationInput) {
  const baseUrl = getAstraBackendBaseUrl();
  if (!baseUrl) {
    throw new Error(
      input.language === 'es'
        ? 'El backend de Astra no esta configurado para generar imagen.'
        : 'Astra backend is not configured for image generation.',
    );
  }

  const response = await fetch(`${baseUrl}/api/astra/generate-image`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: input.prompt,
      context: {
        language: input.language,
        tokenName: input.tokenName,
        tokenSymbol: input.tokenSymbol,
        description: input.description,
      },
    }),
  });

  const payload = (await response.json().catch(() => null)) as AstraImageEnvelope | null;
  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(
      payload?.error?.message ??
        (input.language === 'es'
          ? 'No pudimos generar la imagen con Astra.'
          : 'We could not generate the image with Astra.'),
    );
  }

  return payload.data;
}

export async function getAstraImageAvailability(
  language: AstraLanguage,
): Promise<AstraImageAvailability> {
  const baseUrl = getAstraBackendBaseUrl();
  const providerLabel = 'Astra + Gemini Nano Banana';

  if (!baseUrl) {
    return {
      state: 'unavailable',
      providerLabel,
      message:
        language === 'es'
          ? 'El backend de Astra no esta configurado para generacion visual.'
          : 'Astra backend is not configured for visual generation.',
    };
  }

  try {
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    const payload = (await response.json().catch(() => null)) as AstraHealthEnvelope | null;
    if (!response.ok || !payload) {
      return {
        state: 'unknown',
        providerLabel,
        message:
          language === 'es'
            ? 'No pudimos verificar ahora mismo si la generacion visual esta disponible.'
            : 'We could not verify visual generation availability right now.',
      };
    }

    const runtimeState =
      payload.nanobanana?.available === true || payload.nanobananaConfigured === true;
    const runtimeLabel = payload.nanobanana?.providerLabel || providerLabel;
    const runtimeMessage = payload.nanobanana?.message;

    if (runtimeState) {
      return {
        state: 'available',
        providerLabel: runtimeLabel,
        message:
          runtimeMessage ||
          (language === 'es'
            ? 'La generacion visual esta disponible en este entorno.'
            : 'Visual generation is available in this environment.'),
      };
    }

    return {
      state: 'unavailable',
      providerLabel: runtimeLabel,
      message:
        runtimeMessage ||
        (language === 'es'
          ? 'La generacion visual con Astra todavia no esta conectada en este entorno.'
          : 'Astra visual generation is not connected in this environment yet.'),
    };
  } catch {
    return {
      state: 'unknown',
      providerLabel,
      message:
        language === 'es'
          ? 'No pudimos verificar la disponibilidad de Astra + Gemini Nano Banana.'
          : 'We could not verify Astra + Gemini Nano Banana availability.',
    };
  }
}

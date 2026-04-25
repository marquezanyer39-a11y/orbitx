import { pickLanguageText } from '../../../constants/i18n';
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

const HEALTH_TIMEOUT_MS = 15_000;
const GENERATION_TIMEOUT_MS = 45_000;

function safeText(value: string | undefined, fallback: string) {
  const cleaned = `${value ?? ''}`.trim();
  return cleaned || fallback;
}

function imageText(language: AstraLanguage, values: Partial<Record<AstraLanguage, string>>) {
  return pickLanguageText(language, values, 'en');
}

async function fetchJsonWithTimeout<TPayload>(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<{ ok: boolean; payload: TPayload | null }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });
    const payload = (await response.json().catch(() => null)) as TPayload | null;

    return {
      ok: response.ok,
      payload,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export function buildAstraImagePromptSuggestions(input: {
  language: AstraLanguage;
  tokenName?: string;
  tokenSymbol?: string;
  description?: string;
}): AstraImagePromptSuggestion[] {
  const tokenName = safeText(
    input.tokenName,
    imageText(input.language, {
      en: 'your memecoin',
      es: 'tu memecoin',
      pt: 'sua memecoin',
      'zh-Hans': '\u4f60\u7684 memecoin',
      hi: '\u0924\u0941\u092e\u094d\u0939\u093e\u0930\u093e memecoin',
      ru: '\u0442\u0432\u043e\u0439 memecoin',
      ar: 'memecoin \u0627\u0644\u062e\u0627\u0635 \u0628\u0643',
      id: 'memecoin kamu',
    }),
  );
  const tokenSymbol = safeText(input.tokenSymbol, 'MEME').toUpperCase();
  const concept = safeText(
    input.description,
    imageText(input.language, {
      en: 'viral energy, premium crypto look, clean composition',
      es: 'energia viral, look premium crypto, composicion clara',
      pt: 'energia viral, visual crypto premium, composicao limpa',
      'zh-Hans': '\u75c5\u6bd2\u5f0f\u80fd\u91cf\uff0c\u9ad8\u7ea7 crypto \u98ce\u683c\uff0c\u6784\u56fe\u5e72\u51c0',
      hi: '\u0935\u093e\u092f\u0930\u0932 \u090f\u0928\u0930\u094d\u091c\u0940, premium crypto look, clean composition',
      ru: '\u0432\u0438\u0440\u0430\u043b\u044c\u043d\u0430\u044f \u044d\u043d\u0435\u0440\u0433\u0438\u044f, premium crypto style, \u0447\u0438\u0441\u0442\u0430\u044f \u043a\u043e\u043c\u043f\u043e\u0437\u0438\u0446\u0438\u044f',
      ar: '\u0637\u0627\u0642\u0629 \u0641\u064a\u0631\u0648\u0633\u064a\u0629\u060c \u0645\u0638\u0647\u0631 crypto \u0628\u0631\u064a\u0645\u064a\u0648\u0645\u060c \u062a\u0643\u0648\u064a\u0646 \u0646\u0638\u064a\u0641',
      id: 'energi viral, tampilan crypto premium, komposisi bersih',
    }),
  );

  return [
    {
      id: 'astra-visual-mascot',
      label: imageText(input.language, {
        en: 'Viral mascot',
        es: 'Mascota viral',
        pt: 'Mascote viral',
        'zh-Hans': '\u75c5\u6bd2\u5f0f\u5409\u7965\u7269',
        hi: '\u0935\u093e\u092f\u0930\u0932 mascot',
        ru: '\u0412\u0438\u0440\u0430\u043b\u044c\u043d\u044b\u0439 \u043c\u0430\u0441\u043a\u043e\u0442',
        ar: '\u062a\u0639\u0648\u064a\u0630\u0629 \u0641\u064a\u0631\u0627\u0644\u064a\u0629',
        id: 'Maskot viral',
      }),
      prompt: imageText(input.language, {
        en: `Premium illustration for ${tokenName} (${tokenSymbol}), expressive mascot with crypto meme style, elegant dark background, subtle green glow, clear iconography, square composition, ${concept}.`,
        es: `Ilustracion premium para ${tokenName} (${tokenSymbol}), mascota expresiva con estilo meme crypto, fondo oscuro elegante, brillo verde sutil, iconografia clara, composicion cuadrada, ${concept}.`,
        pt: `Ilustracao premium para ${tokenName} (${tokenSymbol}), mascote expressivo em estilo meme crypto, fundo escuro elegante, brilho verde sutil, iconografia clara, composicao quadrada, ${concept}.`,
      }),
    },
    {
      id: 'astra-visual-logo',
      label: imageText(input.language, {
        en: 'Token logo',
        es: 'Logo token',
        pt: 'Logo do token',
        'zh-Hans': 'Token Logo',
        hi: 'Token logo',
        ru: '\u041b\u043e\u0433\u043e token',
        ar: '\u0634\u0639\u0627\u0631 token',
        id: 'Logo token',
      }),
      prompt: imageText(input.language, {
        en: `Clean and powerful logo for ${tokenName} (${tokenSymbol}), premium crypto style, memorable central symbol, high contrast, dark background, 1:1 format, ${concept}.`,
        es: `Logo limpio y potente para ${tokenName} (${tokenSymbol}), estilo crypto premium, simbolo central memorable, contraste alto, fondo oscuro, formato 1:1, ${concept}.`,
        pt: `Logo limpo e marcante para ${tokenName} (${tokenSymbol}), estilo crypto premium, simbolo central memoravel, alto contraste, fundo escuro, formato 1:1, ${concept}.`,
      }),
    },
    {
      id: 'astra-visual-sticker',
      label: imageText(input.language, {
        en: 'Meme sticker',
        es: 'Sticker meme',
        pt: 'Sticker meme',
        'zh-Hans': 'Meme Sticker',
        hi: 'Meme sticker',
        ru: 'Meme sticker',
        ar: 'Meme sticker',
        id: 'Sticker meme',
      }),
      prompt: imageText(input.language, {
        en: `Visual sticker for ${tokenName} (${tokenSymbol}), modern meme style, defined outlines, strong personality, crypto super app look, square branding-ready image, ${concept}.`,
        es: `Sticker visual para ${tokenName} (${tokenSymbol}), estilo meme moderno, trazos definidos, personalidad fuerte, look de super app crypto, imagen cuadrada lista para branding, ${concept}.`,
        pt: `Sticker visual para ${tokenName} (${tokenSymbol}), estilo meme moderno, tracos definidos, personalidade forte, look de super app crypto, imagem quadrada pronta para branding, ${concept}.`,
      }),
    },
  ];
}

export async function generateAstraImage(input: AstraImageGenerationInput) {
  const baseUrl = getAstraBackendBaseUrl();
  if (!baseUrl) {
    throw new Error(
      imageText(input.language, {
        en: 'Astra backend is not configured for image generation.',
        es: 'El backend de Astra no esta configurado para generar imagen.',
        pt: 'O backend da Astra nao esta configurado para gerar imagem.',
        'zh-Hans': 'Astra \u540e\u7aef\u672a\u914d\u7f6e\u56fe\u50cf\u751f\u6210\u3002',
        hi: 'Image generation ke liye Astra backend configure nahin hai.',
        ru: '\u0411\u044d\u043a\u0435\u043d\u0434 Astra \u043d\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d \u0434\u043b\u044f \u0433\u0435\u043d\u0435\u0440\u0430\u0446\u0438\u0438 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0439.',
        ar: '\u0627\u0644\u062e\u0644\u0641\u064a\u0629 Astra \u063a\u064a\u0631 \u0645\u0643\u0648\u0646\u0629 \u0644\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0635\u0648\u0631.',
        id: 'Backend Astra belum dikonfigurasi untuk membuat gambar.',
      }),
    );
  }

  try {
    const { ok, payload } = await fetchJsonWithTimeout<AstraImageEnvelope>(
      `${baseUrl}/api/astra/generate-image`,
      {
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
      },
      GENERATION_TIMEOUT_MS,
    );

    if (!ok || !payload?.success || !payload.data) {
      throw new Error(
        payload?.error?.message ??
          imageText(input.language, {
            en: 'We could not generate the image with Astra.',
            es: 'No pudimos generar la imagen con Astra.',
            pt: 'Nao foi possivel gerar a imagem com Astra.',
            'zh-Hans': '\u6211\u4eec\u65e0\u6cd5\u4f7f\u7528 Astra \u751f\u6210\u56fe\u50cf\u3002',
            hi: 'Hum Astra ke saath image generate nahin kar pudimos.',
            ru: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0437\u0434\u0430\u0442\u044c \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435 \u0447\u0435\u0440\u0435\u0437 Astra.',
            ar: '\u062a\u0639\u0630\u0631 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0635\u0648\u0631\u0629 \u0628\u0627\u0633\u062a\u062e\u062f\u0627\u0645 Astra.',
            id: 'Kami tidak bisa membuat gambar dengan Astra.',
          }),
      );
    }

    return payload.data;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        imageText(input.language, {
          en: 'Astra took too long to generate the image. Please try again in a few seconds.',
          es: 'Astra tardo demasiado en generar la imagen. Intenta de nuevo en unos segundos.',
          pt: 'A Astra demorou demais para gerar a imagem. Tente novamente em alguns segundos.',
          'zh-Hans': 'Astra \u751f\u6210\u56fe\u50cf\u8017\u65f6\u8fc7\u957f\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5\u3002',
          hi: 'Astra ne image generate karne mein bahut der li. Kuch segundos mein phir se koshish karo.',
          ru: 'Astra \u0441\u043b\u0438\u0448\u043a\u043e\u043c \u0434\u043e\u043b\u0433\u043e \u0441\u043e\u0437\u0434\u0430\u0432\u0430\u043b\u0430 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439 \u0441\u043d\u043e\u0432\u0430 \u0447\u0435\u0440\u0435\u0437 \u043f\u0430\u0440\u0443 \u0441\u0435\u043a\u0443\u043d\u0434.',
          ar: '\u0627\u0633\u062a\u063a\u0631\u0642 Astra \u0648\u0642\u062a\u0627\u064b \u0637\u0648\u064a\u0644\u0627\u064b \u0644\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0635\u0648\u0631\u0629. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649 \u0628\u0639\u062f \u0628\u0636\u0639 \u062b\u0648\u0627\u0646.',
          id: 'Astra terlalu lama membuat gambar. Coba lagi dalam beberapa detik.',
        }),
      );
    }

    throw error;
  }
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
        imageText(language, {
          en: 'Astra backend is not configured for visual generation.',
          es: 'El backend de Astra no esta configurado para generacion visual.',
          pt: 'O backend da Astra nao esta configurado para geracao visual.',
          'zh-Hans': 'Astra \u540e\u7aef\u672a\u914d\u7f6e\u89c6\u89c9\u751f\u6210\u3002',
          hi: 'Visual generation ke liye Astra backend configure nahin hai.',
          ru: '\u0411\u044d\u043a\u0435\u043d\u0434 Astra \u043d\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d \u0434\u043b\u044f \u0432\u0438\u0437\u0443\u0430\u043b\u044c\u043d\u043e\u0439 \u0433\u0435\u043d\u0435\u0440\u0430\u0446\u0438\u0438.',
          ar: '\u0627\u0644\u062e\u0644\u0641\u064a\u0629 Astra \u063a\u064a\u0631 \u0645\u0643\u0648\u0646\u0629 \u0644\u0644\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0631\u0626\u064a.',
          id: 'Backend Astra belum dikonfigurasi untuk generasi visual.',
        }),
    };
  }

  try {
    const { ok, payload } = await fetchJsonWithTimeout<AstraHealthEnvelope>(
      `${baseUrl}/health`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
      HEALTH_TIMEOUT_MS,
    );

    if (!ok || !payload) {
      return {
        state: 'unknown',
        providerLabel,
        message:
          imageText(language, {
            en: 'We could not verify visual generation availability right now.',
            es: 'No pudimos verificar ahora mismo si la generacion visual esta disponible.',
            pt: 'Nao foi possivel verificar agora se a geracao visual esta disponivel.',
            'zh-Hans': '\u6211\u4eec\u73b0\u5728\u65e0\u6cd5\u786e\u8ba4\u89c6\u89c9\u751f\u6210\u662f\u5426\u53ef\u7528\u3002',
            hi: 'Hum abhi visual generation availability verify nahin kar pudimos.',
            ru: '\u0421\u0435\u0439\u0447\u0430\u0441 \u043d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e\u0441\u0442\u044c \u0433\u0435\u043d\u0435\u0440\u0430\u0446\u0438\u0438.',
            ar: '\u062a\u0639\u0630\u0631 \u0627\u0644\u062a\u062d\u0642\u0642 \u0627\u0644\u0622\u0646 \u0645\u0646 \u062a\u0648\u0641\u0631 \u0627\u0644\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0631\u0626\u064a.',
            id: 'Kami belum bisa memverifikasi ketersediaan generasi visual sekarang.',
          }),
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
          imageText(language, {
            en: 'Visual generation is available in this environment.',
            es: 'La generacion visual esta disponible en este entorno.',
            pt: 'A geracao visual esta disponivel neste ambiente.',
            'zh-Hans': '\u89c6\u89c9\u751f\u6210\u5728\u6b64\u73af\u5883\u4e2d\u53ef\u7528\u3002',
            hi: 'Visual generation is environment mein available hai.',
            ru: '\u0412\u0438\u0437\u0443\u0430\u043b\u044c\u043d\u0430\u044f \u0433\u0435\u043d\u0435\u0440\u0430\u0446\u0438\u044f \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430 \u0432 \u044d\u0442\u043e\u043c \u043e\u043a\u0440\u0443\u0436\u0435\u043d\u0438\u0438.',
            ar: '\u0627\u0644\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0631\u0626\u064a \u0645\u062a\u0627\u062d \u0641\u064a \u0647\u0630\u0627 \u0627\u0644\u0628\u064a\u0626\u0629.',
            id: 'Generasi visual tersedia di environment ini.',
          }),
      };
    }

    return {
      state: 'unavailable',
      providerLabel: runtimeLabel,
      message:
        runtimeMessage ||
        imageText(language, {
          en: 'Astra visual generation is not connected in this environment yet.',
          es: 'La generacion visual con Astra todavia no esta conectada en este entorno.',
          pt: 'A geracao visual da Astra ainda nao esta conectada neste ambiente.',
          'zh-Hans': 'Astra \u89c6\u89c9\u751f\u6210\u5728\u8fd9\u4e2a\u73af\u5883\u4e2d\u8fd8\u6ca1\u6709\u8fde\u63a5\u3002',
          hi: 'Astra visual generation abhi is environment mein connected nahin hai.',
          ru: '\u0412\u0438\u0437\u0443\u0430\u043b\u044c\u043d\u0430\u044f \u0433\u0435\u043d\u0435\u0440\u0430\u0446\u0438\u044f Astra \u0432 \u044d\u0442\u043e\u043c \u043e\u043a\u0440\u0443\u0436\u0435\u043d\u0438\u0438 \u0435\u0449\u0451 \u043d\u0435 \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0435\u043d\u0430.',
          ar: '\u0625\u0646\u0634\u0627\u0621 Astra \u0627\u0644\u0645\u0631\u0626\u064a \u0644\u0645 \u064a\u062a\u0635\u0644 \u0628\u0639\u062f \u0641\u064a \u0647\u0630\u0627 \u0627\u0644\u0628\u064a\u0626\u0629.',
          id: 'Generasi visual Astra belum terhubung di environment ini.',
        }),
    };
  } catch {
    return {
      state: 'unknown',
      providerLabel,
      message:
        imageText(language, {
          en: 'We could not verify Astra + Gemini Nano Banana availability.',
          es: 'No pudimos verificar la disponibilidad de Astra + Gemini Nano Banana. Puedes intentar generar igualmente.',
          pt: 'Nao foi possivel verificar a disponibilidade de Astra + Gemini Nano Banana.',
          'zh-Hans': '\u6211\u4eec\u65e0\u6cd5\u786e\u8ba4 Astra + Gemini Nano Banana \u7684\u53ef\u7528\u6027\u3002',
          hi: 'Hum Astra + Gemini Nano Banana availability verify nahin kar pudimos.',
          ru: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e\u0441\u0442\u044c Astra + Gemini Nano Banana.',
          ar: '\u062a\u0639\u0630\u0631 \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u062a\u0648\u0641\u0631 Astra + Gemini Nano Banana.',
          id: 'Kami belum bisa memverifikasi ketersediaan Astra + Gemini Nano Banana.',
        }),
    };
  }
}

import { GoogleGenAI } from '@google/genai';

import { AstraSystemError } from './astra-schemas.js';

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function classifyGeminiError(error) {
  const rawMessage =
    error instanceof Error ? error.message : 'No pudimos conectar con Gemini.';
  const normalized = rawMessage.toLowerCase();

  if (
    normalized.includes('resource_exhausted') ||
    normalized.includes('quota') ||
    normalized.includes('429')
  ) {
    return new AstraSystemError(
      'Gemini no tiene cuota disponible ahora mismo. Intenta nuevamente en unos minutos o revisa tu plan.',
      {
        code: 'ASTRA_BRAIN_UPSTREAM_QUOTA',
        status: 503,
        retryable: true,
        exposeMessage: true,
      },
    );
  }

  if (
    normalized.includes('unavailable') ||
    normalized.includes('overloaded') ||
    normalized.includes('503')
  ) {
    return new AstraSystemError(
      'Gemini esta ocupado ahora mismo. Intenta nuevamente en unos minutos.',
      {
        code: 'ASTRA_BRAIN_UPSTREAM_UNAVAILABLE',
        status: 503,
        retryable: true,
        exposeMessage: true,
      },
    );
  }

  return new AstraSystemError(
    'No pudimos conectar con Gemini en este momento.',
    {
      code: 'ASTRA_BRAIN_UPSTREAM_FAILED',
      status: 502,
      retryable: true,
      exposeMessage: true,
    },
  );
}

export async function generateGeminiStructuredJson(config, payload) {
  if (!`${process.env.GEMINI_API_KEY ?? ''}`.trim()) {
    throw new AstraSystemError(
      'Falta GEMINI_API_KEY para el cerebro conversacional de Astra.',
      {
        code: 'ASTRA_BRAIN_NOT_CONFIGURED',
        status: 500,
        retryable: false,
        exposeMessage: true,
      },
    );
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new AstraSystemError('Astra tardo demasiado en responder.', {
          code: 'ASTRA_BRAIN_TIMEOUT',
          status: 504,
          retryable: true,
          exposeMessage: true,
        }),
      );
    }, config.timeoutMs);
  });

  const request = async () => {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        console.info('[OrbitX][AstraCore] Gemini request', {
          model: config.model,
          attempt: attempt + 1,
        });
        return await ai.models.generateContent({
          model: config.model,
          contents: payload.userPrompt,
          config: {
            systemInstruction: payload.systemInstruction,
            temperature: 0.35,
            responseMimeType: 'application/json',
            responseSchema: payload.responseSchema,
          },
        });
      } catch (error) {
        const classified = classifyGeminiError(error);
        console.warn('[OrbitX][AstraCore] Gemini request failed', {
          model: config.model,
          attempt: attempt + 1,
          code: classified.code,
          retryable: classified.retryable,
        });
        if (classified.code !== 'ASTRA_BRAIN_UPSTREAM_UNAVAILABLE' || attempt === 1) {
          throw classified;
        }

        await wait(900);
      }
    }

    throw new AstraSystemError('Gemini esta ocupado ahora mismo. Intenta nuevamente en unos minutos.', {
      code: 'ASTRA_BRAIN_UPSTREAM_UNAVAILABLE',
      status: 503,
      retryable: true,
      exposeMessage: true,
    });
  };

  try {
    const response = await Promise.race([request(), timeout]);
    const raw = `${response?.text ?? ''}`.trim();
    if (!raw) {
      throw new AstraSystemError('Gemini no devolvio texto utilizable para Astra.', {
        code: 'ASTRA_BRAIN_EMPTY_RESPONSE',
        status: 502,
        retryable: true,
      });
    }

    return JSON.parse(raw);
  } catch (error) {
    if (error instanceof AstraSystemError) {
      throw error;
    }

    if (error instanceof SyntaxError) {
      throw new AstraSystemError('La respuesta estructurada de Astra llego invalida.', {
        code: 'ASTRA_BRAIN_INVALID_JSON',
        status: 502,
        retryable: true,
      });
    }

    throw classifyGeminiError(error);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

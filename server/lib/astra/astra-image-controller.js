import { AstraSystemError } from './astra-schemas.js';
import {
  createNanobananaConfig,
  describeNanobananaAvailability,
  generateNanobananaImages,
} from './nanobanana-client.js';

function sanitizeText(value, maxLength) {
  return `${value ?? ''}`.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

export function createAstraImageController() {
  return async function astraImageController(request, response) {
    try {
      const config = createNanobananaConfig(process.env);
      const availability = describeNanobananaAvailability(config);
      const prompt = sanitizeText(request.body?.prompt, 800);
      const context = {
        language: sanitizeText(request.body?.context?.language, 8) || 'es',
        tokenName: sanitizeText(request.body?.context?.tokenName, 80),
        tokenSymbol: sanitizeText(request.body?.context?.tokenSymbol, 24),
        description: sanitizeText(request.body?.context?.description, 240),
      };
      const referenceImage = request.body?.referenceImage
        ? {
            mimeType: sanitizeText(request.body?.referenceImage?.mimeType, 32),
            data: sanitizeText(request.body?.referenceImage?.data, 12_000_000),
          }
        : null;

      if (!prompt) {
        response.status(400).json({
          success: false,
          error: { message: 'Necesitamos un prompt para generar la imagen.' },
        });
        return;
      }

      const result = await generateNanobananaImages({
        config,
        prompt,
        context,
        referenceImage,
      });

      response.json({
        success: true,
        data: {
          state: 'ready',
          providerLabel: availability.providerLabel,
          model: result.model,
          endpoint: result.endpoint,
          images: result.images,
          prompt: result.prompt,
        },
      });
    } catch (error) {
      if (error instanceof AstraSystemError) {
        response.status(error.status).json({
          success: false,
          error: {
            message: error.exposeMessage
              ? error.message
              : 'No pudimos completar la generacion visual ahora mismo.',
          },
        });
        return;
      }

      response.status(500).json({
        success: false,
        error: {
          message: 'No pudimos completar la generacion visual ahora mismo.',
        },
      });
    }
  };
}

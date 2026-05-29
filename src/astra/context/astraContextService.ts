import { astraConfigService } from '../config/astraFlags';
import type { AstraContext } from '../types/context.types';
import { buildCurrentAstraContext } from './astraContextSelectors';

class AstraContextService {
  private currentContext: AstraContext | null = null;
  private listeners: Set<(context: AstraContext) => void> = new Set();
  private readonly sessionId: string;

  constructor() {
    this.sessionId = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Captura el estado completo del universo del usuario en menos de 100ms.
   * Dispara notificaciones a los listeners.
   */
  captureScreen(screenName: string): AstraContext | null {
    if (!astraConfigService.getFlag('ASTRA_CONTEXT_ENABLED')) {
      return null;
    }

    const start = performance.now();
    const newContext = buildCurrentAstraContext(screenName, this.sessionId);
    this.currentContext = newContext;

    // Notificar listeners registrados sin acoplar el servicio a una fase posterior.
    this.listeners.forEach((listener) => listener(newContext));

    const duration = performance.now() - start;
    if (duration > 100) {
      console.warn(`[ASTRA] Context capture took ${duration.toFixed(2)}ms, threshold is 100ms.`);
    }

    return newContext;
  }

  getCurrentContext(): AstraContext | null {
    return this.currentContext;
  }

  subscribe(listener: (context: AstraContext) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const astraContextService = new AstraContextService();

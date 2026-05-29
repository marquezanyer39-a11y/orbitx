import { useEffect, useState } from 'react';
import { astraContextService } from './astraContextService';
import type { AstraContext } from '../types/context.types';

/**
 * Hook tipado para acceder al contexto de ASTRA desde componentes React.
 * Se suscribe a cambios en el astraContextService sin forzar re-renders
 * innecesarios en todo el árbol de React.
 */
export function useAstraContext() {
  const [context, setContext] = useState<AstraContext | null>(
    astraContextService.getCurrentContext()
  );

  useEffect(() => {
    // Al montar, verificamos si ya existe
    const initialContext = astraContextService.getCurrentContext();
    if (initialContext) {
      setContext(initialContext);
    }

    const unsubscribe = astraContextService.subscribe((newContext) => {
      setContext(newContext);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return context;
}

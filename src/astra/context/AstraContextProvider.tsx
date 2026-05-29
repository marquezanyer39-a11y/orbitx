import { ReactNode, createContext } from 'react';

import type { AstraContext } from '../types/context.types';
import { useAstraContext } from './useAstraContext';

export const AstraReactContext = createContext<AstraContext | null>(null);

interface Props {
  children: ReactNode;
}

/**
 * Provider opcional para ASTRA v2.
 *
 * Por que no se uso obligatoriamente en Fase 1:
 * El estado completo de ASTRA (AstraContextService) vive fuera del arbol de React,
 * y `useAstraContext` ya permite consumirlo globalmente con re-renders eficientes
 * suscribiendose directamente al servicio singleton, similar a Zustand.
 *
 * Este Provider queda disponible para pruebas unitarias o para forzar el render de
 * sub-arboles especificos cuando se apruebe una integracion React controlada.
 * Es totalmente seguro importarlo en _layout.tsx en el futuro.
 */
export function AstraContextProvider({ children }: Props) {
  const context = useAstraContext();

  return (
    <AstraReactContext.Provider value={context}>
      {children}
    </AstraReactContext.Provider>
  );
}

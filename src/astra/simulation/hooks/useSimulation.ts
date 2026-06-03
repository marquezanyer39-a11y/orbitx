import { useState, useCallback, useRef } from 'react';
import { SimulationEngine } from '../core/SimulationEngine';
import type { SimulationResult } from '../types/simulation.types';
import type { MarketContext } from '../scenarios/ScenarioBuilder';

export interface UseSimulationState {
  result: SimulationResult | null;
  isLoading: boolean;
  error: string | null;
}

export interface UseSimulationReturn extends UseSimulationState {
  simulate: (query: string) => Promise<void>;
  reset: () => void;
  history: SimulationResult[];
}

export function useSimulation(marketContext?: MarketContext): UseSimulationReturn {
  const [state, setState] = useState<UseSimulationState>({
    result: null,
    isLoading: false,
    error: null,
  });
  const [history, setHistory] = useState<SimulationResult[]>([]);

  const engineRef = useRef<SimulationEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new SimulationEngine({ market: marketContext });
  }

  const simulate = useCallback(async (query: string): Promise<void> => {
    if (!query.trim()) return;

    setState({ result: null, isLoading: true, error: null });

    try {
      const result = await new Promise<SimulationResult>((resolve, reject) => {
        setTimeout(() => {
          try {
            resolve(engineRef.current!.run(query));
          } catch (err) {
            reject(err);
          }
        }, 0);
      });

      setState({ result, isLoading: false, error: null });
      setHistory((prev) => [result, ...prev].slice(0, 20));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido en simulacion educativa';
      setState({ result: null, isLoading: false, error: message });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ result: null, isLoading: false, error: null });
  }, []);

  return { ...state, simulate, reset, history };
}

import { useState, useCallback } from 'react';
import { useSimulation } from './useSimulation';
import { ScenarioParser } from '../core/ScenarioParser';
import type { SimulationIntent, SimulationResult } from '../types/simulation.types';

export type MessageType = 'user' | 'astra_text' | 'astra_simulation';

export interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  simulationResult?: SimulationResult;
  timestamp: number;
}

const SIMULATION_INTENTS: Set<SimulationIntent> = new Set([
  'btc_crash',
  'sol_exposure',
  'memecoin_launch',
  'portfolio_stress',
  'exchange_growth',
  'qvex_growth',
  'qvex_operational_stress',
  'macro_pressure',
  'social_sentiment_shift',
  'operational_risk',
  'liquidity_stress',
]);

function createLocalMessageId(prefix = 'msg'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function useAstraChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { simulate, isLoading, result, error } = useSimulation();

  const sendMessage = useCallback(
    async (text: string): Promise<void> => {
      const userMsg: ChatMessage = {
        id: createLocalMessageId('user'),
        type: 'user',
        content: text,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);

      const parsed = ScenarioParser.parse(text);
      const isSimulation = SIMULATION_INTENTS.has(parsed.intent);

      if (isSimulation) {
        const loadingMsg: ChatMessage = {
          id: createLocalMessageId('astra'),
          type: 'astra_text',
          content: 'Analizando escenario educativo local. No usa datos en tiempo real.',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, loadingMsg]);
        await simulate(text);
      } else {
        const replyMsg: ChatMessage = {
          id: createLocalMessageId('astra'),
          type: 'astra_text',
          content:
            'Puedo crear simulaciones educativas, por ejemplo: "Que pasa si BTC cae 30%?" ' +
            'El resultado no es prediccion ni asesoria financiera.',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, replyMsg]);
      }
    },
    [simulate],
  );

  const appendSimulationResult = useCallback((res: SimulationResult) => {
    const simMsg: ChatMessage = {
      id: createLocalMessageId('simulation'),
      type: 'astra_simulation',
      content: res.summary,
      simulationResult: res,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, simMsg]);
  }, []);

  return {
    messages,
    sendMessage,
    appendSimulationResult,
    isLoading,
    latestResult: result,
    error,
  };
}

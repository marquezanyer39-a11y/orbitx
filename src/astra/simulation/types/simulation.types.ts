export type SimulationIntent =
  | 'btc_crash'
  | 'sol_exposure'
  | 'memecoin_launch'
  | 'portfolio_stress'
  | 'exchange_growth'
  | 'generic';

export type ScenarioLabel = 'optimist' | 'base' | 'stress';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type SimulationPressureLabel =
  | 'bullish_pressure'
  | 'bearish_pressure'
  | 'neutral_pressure'
  | 'risk_alert';

export type EducationalAction =
  | 'evaluate_exposure'
  | 'review_scenarios'
  | 'consider_risks'
  | 'manual_review'
  | 'monitor_context_only';

export interface ParsedQuery {
  raw: string;
  intent: SimulationIntent;
  asset?: string;
  amount?: number;
  percentage?: number;
  timeframe?: string;
  simulatedCurrentBtcPrice?: number;
}

export type CausalNodeType = 'trigger' | 'first_order' | 'second_order' | 'outcome';

export interface CausalNode {
  id: string;
  label: string;
  type: CausalNodeType;
  weight: number;
  sentiment: number;
}

export interface CausalEdge {
  from: string;
  to: string;
  weight: number;
  label?: string;
}

export interface CausalGraph {
  nodes: CausalNode[];
  edges: CausalEdge[];
}

export type AgentRole = 'bull' | 'bear' | 'neutral' | 'risk' | 'market';

export interface AgentMemory {
  sessionHistory: string[];
  beliefs: Record<string, number>;
  lastPressure: SimulationPressureLabel | null;
}

export interface AgentOutput {
  role: AgentRole;
  opinion: string;
  simulatedPriceReference?: number;
  confidence: number;
  pressureLabel: SimulationPressureLabel;
  keyArgument: string;
}

export interface AgentSnapshot {
  role: AgentRole;
  name: string;
  bias: number;
  memory: AgentMemory;
  output: AgentOutput;
}

export interface RiskItem {
  level: RiskLevel;
  description: string;
  mitigation: string;
}

export interface Scenario {
  label: ScenarioLabel;
  probability: number;
  priceChange: number;
  simulatedPriceReference?: number;
  timeframe: string;
  narrative: string;
  keyRisks: string[];
  triggers: string[];
  technicalLevels?: {
    support?: number;
    resistance?: number;
  };
}

export interface ScenarioTriple {
  optimist: Scenario;
  base: Scenario;
  stress: Scenario;
}

export interface SimulationDisclaimer {
  title: string;
  body: string;
  bullets: string[];
}

export interface SimulationResult {
  id: string;
  query: ParsedQuery;
  agents: AgentSnapshot[];
  causalGraph: CausalGraph;
  scenarios: ScenarioTriple;
  summary: string;
  risks: RiskItem[];
  educationalNotes: string[];
  analysisPoints: string[];
  considerations: string[];
  disclaimer: SimulationDisclaimer;
  contextLabel: string;
  createdAt: number;
  engineVersion: string;
}

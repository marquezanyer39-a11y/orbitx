import type { ParsedQuery, SimulationIntent } from '../types/simulation.types';

const INTENT_PATTERNS: Array<{ intent: SimulationIntent; patterns: RegExp[] }> = [
  {
    intent: 'btc_crash',
    patterns: [
      /btc.*(cae|baja|crash|caida|correccion|dump)/i,
      /(cae|baja|crash).*(btc|bitcoin)/i,
      /bitcoin.*(baja|crash|cae)/i,
    ],
  },
  {
    intent: 'sol_exposure',
    patterns: [
      /invierto?.*(sol|solana)/i,
      /(sol|solana).*(exposicion|inversion|invierto)/i,
      /pongo.*(sol|solana)/i,
    ],
  },
  {
    intent: 'memecoin_launch',
    patterns: [
      /lanzo?.*(memecoin|meme coin|token|coin)/i,
      /(memecoin|meme coin).*(lanzo?|creo?|lanzar)/i,
      /creo? un?.*(token|coin|memecoin)/i,
    ],
  },
  {
    intent: 'portfolio_stress',
    patterns: [
      /portafolio.*(cae|crash|baja|corre)/i,
      /(mercado|crypto|cripto).*(cae|crash|baja)/i,
      /mi.*(cartera|portafolio).*(crash|cae)/i,
    ],
  },
  {
    intent: 'qvex_growth',
    patterns: [
      /qvex.*(crece|crecimiento|expansion|expansión|adopcion|adopción|usuarios|millon)/i,
      /(crece|escala|expande|acelera).*(qvex)/i,
      /qvex.*(llega|alcanza).*(usuarios|millon)/i,
    ],
  },
  {
    intent: 'qvex_operational_stress',
    patterns: [
      /qvex.*(tension|tensión|riesgo|cuello de botella|capacidad|operativa)/i,
      /(operacion|operación|incertidumbre|continuidad).*(qvex)/i,
      /qvex.*(demora|saturacion|saturación|presion operativa|presión operativa)/i,
      /(crecimiento acelerado).*(problemas operativos|tension operativa|presion operativa)/i,
    ],
  },
  {
    intent: 'exchange_growth',
    patterns: [
      /(qvex|exchange|plataforma).*(millon|usuarios|crece)/i,
      /(llega|llegamos|alcanzamos).*(usuarios|millon)/i,
      /(\d+\s*(mil|millon)\s*usuarios)/i,
      /(exchange|plataforma).*(expansion|expansión|adopcion|adopción|crecimiento)/i,
    ],
  },
  {
    intent: 'macro_pressure',
    patterns: [
      /(inflacion|inflación).*(alta|persistente)/i,
      /(tasas|tipos).*(altas|elevadas|suben|subida)/i,
      /(dolar|dólar).*(fuerte|presiona|presion|aprecia)/i,
      /(aversion|aversión).*(al riesgo)/i,
      /(mercado global|contexto global).*(riesgo|presion|presión)/i,
    ],
  },
  {
    intent: 'social_sentiment_shift',
    patterns: [
      /(fomo|sentimiento social|narrativa viral|menciones).*(cripto|qvex|mercado)?/i,
      /(viral|social).*(volatilidad|impulsa|presiona|afecta)/i,
      /(sentimiento).*(negativo|positivo|social)/i,
    ],
  },
  {
    intent: 'liquidity_stress',
    patterns: [
      /(caida|caída).*(liquidez)/i,
      /(liquidez).*(cae|baja|escasea|estres|estrés)/i,
      /(mercado).*(sin liquidez|liquidez baja)/i,
    ],
  },
  {
    intent: 'operational_risk',
    patterns: [
      /(riesgo operativo|incertidumbre operativa|deterioro de confianza)/i,
      /(operativo|operacion|operación).*(riesgo|incertidumbre|deterioro)/i,
      /(continuidad|confianza).*(operativa|operacional|operacion|operación)/i,
    ],
  },
];

const ASSET_MAP: Record<string, string> = {
  bitcoin: 'BTC',
  btc: 'BTC',
  ethereum: 'ETH',
  eth: 'ETH',
  solana: 'SOL',
  sol: 'SOL',
  bnb: 'BNB',
  polygon: 'MATIC',
  matic: 'MATIC',
};

function extractAsset(query: string): string | undefined {
  const lower = query.toLowerCase();
  for (const [key, symbol] of Object.entries(ASSET_MAP)) {
    if (lower.includes(key)) return symbol;
  }
  return undefined;
}

function extractAmount(query: string): number | undefined {
  const patterns = [
    /\$\s*([\d,]+(?:\.\d+)?)\s*k?\b/i,
    /([\d,]+(?:\.\d+)?)\s*(?:dolares?|dollars?|usd)/i,
    /([\d]+)\s*k\b/i,
  ];
  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match) {
      let value = Number.parseFloat(match[1].replace(',', ''));
      if (pattern === patterns[2]) value *= 1000;
      return value;
    }
  }
  return undefined;
}

function extractPercentage(query: string): number | undefined {
  const match = query.match(/(\d+(?:\.\d+)?)\s*%/);
  return match ? Number.parseFloat(match[1]) : undefined;
}

function extractTimeframe(query: string): string | undefined {
  const lower = query.toLowerCase();
  if (/hoy|esta semana|corto plazo/.test(lower)) return 'corto plazo';
  if (/3 meses|tres meses|trimestre/.test(lower)) return '3 meses';
  if (/6 meses|seis meses/.test(lower)) return '6 meses';
  if (/1 ano|un ano|anio|ano/.test(lower)) return '1 ano';
  if (/largo plazo|varios anos/.test(lower)) return 'largo plazo';
  return undefined;
}

export class ScenarioParser {
  static parse(query: string): ParsedQuery {
    return {
      raw: query,
      intent: ScenarioParser.detectIntent(query),
      asset: extractAsset(query),
      amount: extractAmount(query),
      percentage: extractPercentage(query),
      timeframe: extractTimeframe(query),
    };
  }

  private static detectIntent(query: string): SimulationIntent {
    for (const { intent, patterns } of INTENT_PATTERNS) {
      if (patterns.some((pattern) => pattern.test(query))) return intent;
    }
    return 'generic';
  }
}

import { describe, expect, it } from 'vitest';

import { ASTRA_DEMO_INSIGHTS, ASTRA_DEMO_VERSION } from '../../constants/astraDemoMock';

interface FsModuleLike {
  existsSync?: (path: string) => boolean;
  readFileSync?: (path: string, encoding: string) => string;
}

declare const require: (moduleName: string) => FsModuleLike;

const fs = require('fs');
const rootDir = process.cwd();
const routePath = `${rootDir}/app/demo/astra.tsx`;

function readRouteSource() {
  if (!fs.existsSync?.(routePath) || !fs.readFileSync) {
    return '';
  }

  return fs.readFileSync(routePath, 'utf8');
}

describe('AstraDemoScreen - FASE 8A', () => {
  it('declara la pantalla demo principal', () => {
    const source = readRouteSource();

    expect(source).toContain('export default function AstraDemoScreen()');
  });

  it('muestra la marca ASTRA AI y el panel demo', () => {
    const source = readRouteSource();

    expect(source).toContain("ASTRA_DEMO_HEADER_TITLE = 'ASTRA AI'");
    expect(source).toContain("ASTRA_DEMO_SCREEN_TITLE = 'Panel Demo ASTRA'");
    expect(ASTRA_DEMO_VERSION).toBe('8A-mock');
  });

  it('expone los 4 insights mock', () => {
    expect(ASTRA_DEMO_INSIGHTS).toHaveLength(4);
    expect(ASTRA_DEMO_INSIGHTS.map((insight) => insight.title)).toEqual([
      'BTC rompe resistencia',
      'ETH/BTC ratio en minimos',
      'Liquidez del mercado baja',
      'DCA simulado: +23.4%',
    ]);
  });

  it('incluye orb visual e insights en el archivo de la pantalla', () => {
    const source = readRouteSource();

    expect(source).toContain('testID="astra-demo-orb"');
    expect(source).toContain('ASTRA_DEMO_INSIGHTS.map((insight) =>');
  });

  it('CTA apunta a /dev/astra-simulation', () => {
    const source = readRouteSource();

    expect(source).toContain("ASTRA_DEMO_CTA_ROUTE = '/dev/astra-simulation'");
    expect(source).toContain('router.push(ASTRA_DEMO_CTA_ROUTE)');
  });
});

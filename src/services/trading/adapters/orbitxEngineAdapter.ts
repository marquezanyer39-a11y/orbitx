import { NotConfiguredTradingAdapter } from './notConfiguredAdapter';

// FUTURE PROVIDER - este adapter sera reemplazado por el matching engine propio de QVEX.
export class OrbitxEngineAdapter extends NotConfiguredTradingAdapter {
  constructor() {
    super('orbitx', 'not_configured');
  }
}

export const orbitxEngineAdapter = new OrbitxEngineAdapter();

import type { TradingProviderId } from '../types/trading';

export const FEATURE_STATUS = {
  localAccount: {
    isDemoMode: true,
    dataSourceLabel: 'Modo demo',
    notice:
      'Cuenta Local aún no tiene proveedor bancario conectado. No deposites fondos reales en estos datos.',
  },
  trade: {
    mode: 'demo' as const,
    provider: 'mock' as TradingProviderId,
    isRealTradingEnabled: false,
    showDemoLabels: true,
    requiresBackend: true,
    allowOrderPlacement: false,
    allowFutures: false,
    allowInternalTransfers: false,
    isDemoMode: true,
    dataSourceLabel: 'Modo demo',
    notice:
      'Las órdenes se registran como simulación local. No se envían al mercado ni modifican saldos reales.',
  },
  createToken: {
    isDemoMode: false,
    dataSourceLabel: 'Deploy real EVM',
    notice:
      'Ethereum, BNB Chain, Polygon y Base pueden desplegar con wallet externa. Liquidez, airdrop y publicación siguen como configuración previa.',
  },
  web3: {
    dappsHubEnabled: true,
    sendEnabled: false,
    externalSendEnabled: false,
    localSendEnabled: false,
    approvalsEnabled: false,
    tokenDeployEnabled: false,
    swapEnabled: false,
    swapProvider: 'disabled' as const,
    realExecutionEnabled: false,
    showDemoActivity: false,
    allowReadOnlyBalances: true,
    allowWalletConnect: true,
    showSwapComingSoon: true,
    dappsWarningEnabled: true,
    web3ActionsCompactMode: true,
    dataSourceLabel: 'Wallet externa',
    notice:
      'DApps externas se abren solo desde catálogo verificado. Swap real sigue deshabilitado hasta integrar proveedor seguro.',
  },
  swap: {
    isEnabled: false,
    provider: 'disabled' as const,
    showComingSoon: true,
    dataSourceLabel: 'Próximamente',
    notice:
      'Swap real está deshabilitado. No hay cotización ni ejecución hasta integrar un proveedor seguro.',
  },
  dapps: {
    isEnabled: true,
    warningEnabled: true,
    catalogMode: 'whitelisted' as const,
    dataSourceLabel: 'Catálogo verificado',
    notice:
      'DApps Hub usa una lista permitida y muestra advertencia antes de abrir sitios externos.',
  },
  ledger: {
    isDemoMode: true,
    isProductionReady: false,
    dataSourceLabel: 'Mock controlado',
    notice:
      'Ledger interno frontend sigue aislado y no alimenta Home ni Wallet real.',
  },
  pool: {
    isDemoMode: true,
    usesMockLedger: true,
    dataSourceLabel: 'Mock controlado',
    notice:
      'Pool mensual es visual/controlado. No mueve dinero real ni saldos de Home.',
  },
  social: {
    isDemoMode: true,
    usesMockLedger: true,
    dataSourceLabel: 'Mock controlado',
    notice:
      'Social Gifts y rewards siguen sobre mocks controlados. No representan dinero real.',
  },
  broker: {
    okxConnected: false,
    sandboxReady: false,
    realTradingEnabled: false,
    dataSourceLabel: 'Backend pendiente',
    notice:
      'OKX/Broker sigue preparado como backend seguro, sin conexión real ni trading activo.',
  },
  profileMetrics: {
    dataSourceLabel: 'Calculado localmente',
    notice:
      'Las métricas se calculan con actividad local disponible y no representan rendimiento auditado.',
  },
  marketFallback: {
    dataSourceLabel: 'Fallback de mercado',
    notice:
      'Se muestran precios de respaldo cuando no hay datos live disponibles.',
  },
} as const;

export type FeatureStatusKey = keyof typeof FEATURE_STATUS;

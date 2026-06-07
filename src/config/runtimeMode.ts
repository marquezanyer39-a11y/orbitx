export const QVEX_STABLE_APK_MODE = true;

export const ASTRA_DEMO_GLOBAL_ENABLED = true;
export const SAFE_MODE_BLOCK_MESSAGE = 'Esta accion esta desactivada en el modo seguro de QVEX.';
export const SAFE_MODE_READONLY_MESSAGE = 'Modo seguro - vista de lectura, sin operaciones reales.';
export const SENSITIVE_ROUTE_BLOCK_MESSAGE = 'Esta acción está bloqueada en la demo segura de QVEX.';

export const QVEX_RUNTIME_MODE = {
  stableApk: true,
  forceLanding: true,
  enableAstraSimulationAccess: true,
  safeDemoNavigation: true,
  allowSensitiveRoutesInStableMode: false,
  disableReown: true,
  disableWalletConnect: true,
  disableWeb3Runtime: true,
  disableNativeBiometrics: true,
  disableSecureWalletRestore: true,
  disableRealBackendWrites: true,
  disableRealTrading: true,
  disableRealTokenDeploy: true,
};

export function isSensitiveRoutesBlockedInStableMode() {
  return (
    QVEX_STABLE_APK_MODE &&
    QVEX_RUNTIME_MODE.safeDemoNavigation &&
    !QVEX_RUNTIME_MODE.allowSensitiveRoutesInStableMode
  );
}

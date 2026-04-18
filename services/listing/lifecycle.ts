import type { MarketToken, TokenLifecycleStatus } from '../../types';

export function getEffectiveTokenLifecycleStatus(token: MarketToken): TokenLifecycleStatus {
  if (token.liquidityLock?.status === 'expired') {
    return token.listingStatus === 'orbitx_listed' ? 'lock_expired' : token.listingStatus ?? 'created';
  }

  if (
    token.listingStatus === 'orbitx_listed' &&
    token.liquidityLock?.status !== 'locked'
  ) {
    return 'high_risk';
  }

  return token.listingStatus ?? 'created';
}

export function getTokenBadges(token: MarketToken) {
  const status = getEffectiveTokenLifecycleStatus(token);
  const badges: string[] = [];

  if (token.listingType === 'orbitx_protected' && status === 'orbitx_listed') {
    badges.push('Listado protegido');
  }

  if (token.contractSafety?.status === 'passed') {
    badges.push('Checks aprobados');
  }

  if (token.liquidityLock?.status === 'locked') {
    badges.push('Liquidez bloqueada');
  }

  if (token.liquidityLock?.lockEnd) {
    const diffMs = new Date(token.liquidityLock.lockEnd).getTime() - Date.now();
    const diffDays = Math.max(Math.ceil(diffMs / (24 * 60 * 60 * 1000)), 0);
    badges.push(`Desbloquea en ${diffDays} dias`);
  }

  if (status === 'lock_expired') {
    badges.push('Bloqueo vencido');
  }

  if (status === 'high_risk') {
    badges.push('Riesgo alto');
  }

  if (token.listingType === 'external') {
    badges.push('Solo listado externo');
  }

  if (token.contractSafety?.status === 'failed') {
    badges.push('No verificado / Restringido');
  }

  return badges;
}

export function getLifecycleStatusLabel(status: TokenLifecycleStatus) {
  if (status === 'created') return 'Creado';
  if (status === 'ready_to_list') return 'Listo para listar';
  if (status === 'external_listing_selected') return 'Listado externo seleccionado';
  if (status === 'orbitx_listing_pending_checks') return 'Pendiente de checks OrbitX';
  if (status === 'orbitx_listing_checks_failed') return 'Checks OrbitX fallidos';
  if (status === 'orbitx_listing_pending_liquidity') return 'Pendiente de liquidez';
  if (status === 'orbitx_listing_pending_lock') return 'Pendiente de bloqueo';
  if (status === 'orbitx_listed') return 'Listado en OrbitX';
  if (status === 'lock_expired') return 'Bloqueo vencido';
  if (status === 'high_risk') return 'Riesgo alto';
  return 'Creado';
}

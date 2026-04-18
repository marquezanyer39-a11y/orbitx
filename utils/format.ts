function normalizeNumber(value: number | null | undefined, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

const ORBITX_LOCALE = 'es-PE';

export function formatCurrency(value: number | null | undefined, maximumFractionDigits = 2) {
  const safeValue = normalizeNumber(value);
  return new Intl.NumberFormat(ORBITX_LOCALE, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits,
  }).format(safeValue);
}

export function formatCompactCurrency(value: number | null | undefined) {
  const safeValue = normalizeNumber(value);
  return new Intl.NumberFormat(ORBITX_LOCALE, {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(safeValue);
}

export function formatPercent(value: number | null | undefined, digits = 2) {
  const safeValue = normalizeNumber(value);
  const prefix = safeValue >= 0 ? '+' : '';
  return `${prefix}${safeValue.toFixed(digits)}%`;
}

export function formatTokenPrice(value: number | null | undefined) {
  const safeValue = normalizeNumber(value);

  if (safeValue >= 1_000) {
    return formatCurrency(safeValue, 0);
  }

  if (safeValue >= 1) {
    return formatCurrency(safeValue, 2);
  }

  if (safeValue >= 0.01) {
    return formatCurrency(safeValue, 4);
  }

  return `$${safeValue.toFixed(6)}`;
}

export function formatUnits(value: number | null | undefined, digits = 4) {
  const safeValue = normalizeNumber(value);

  if (safeValue >= 1_000_000) {
    return new Intl.NumberFormat(ORBITX_LOCALE, {
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(safeValue);
  }

  return new Intl.NumberFormat(ORBITX_LOCALE, {
    maximumFractionDigits: digits,
  }).format(safeValue);
}

export function formatTimeAgo(dateIso: string) {
  const difference = Date.now() - new Date(dateIso).getTime();
  const minutes = Math.max(1, Math.round(difference / 60_000));

  if (minutes < 60) {
    return `hace ${minutes} min`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `hace ${hours} h`;
  }

  const days = Math.round(hours / 24);
  return `hace ${days} d`;
}

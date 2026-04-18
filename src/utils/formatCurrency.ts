export function formatCurrency(value: number, compact = false) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'USD',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 2 : value >= 100 ? 2 : 4,
  }).format(Number.isFinite(value) ? value : 0);
}

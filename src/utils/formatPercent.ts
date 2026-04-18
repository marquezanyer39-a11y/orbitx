export function formatPercent(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const formatted = new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(safeValue));

  return `${safeValue >= 0 ? '+' : '-'}${formatted}%`;
}

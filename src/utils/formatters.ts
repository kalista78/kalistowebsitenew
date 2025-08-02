/**
 * Format a number to Turkish currency format with abbreviations
 * @param value The number to format
 * @param abbreviate Whether to abbreviate large numbers (e.g., 1M, 1B)
 */
export function formatTRY(value: number, abbreviate: boolean = true): string {
  if (value === 0) return '₺0';

  // For abbreviation
  if (abbreviate) {
    if (value >= 1_000_000_000) {
      return `₺${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (value >= 1_000_000) {
      return `₺${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `₺${(value / 1_000).toFixed(1)}K`;
    }
  }

  // Regular formatting
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a percentage value
 * @param value The percentage value
 */
export function formatPercentage(value: number): string {
  const formatted = new Intl.NumberFormat('tr-TR', {
    style: 'decimal',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);

  return `${value >= 0 ? '+' : ''}${formatted}%`;
}

/**
 * Format a time duration
 * @param hours Number of hours
 */
export function formatDuration(hours: number): string {
  if (hours < 24) {
    return `${hours}s`;
  }
  const days = Math.floor(hours / 24);
  return `${days}g`;
}

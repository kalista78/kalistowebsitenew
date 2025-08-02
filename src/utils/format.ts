export function formatPrice(price: number): string {
  if (price === 0) return '₺0,00';
  
  // If price is very small (less than 0.01)
  if (price < 0.01) {
    // Count leading zeros after decimal point
    const leadingZeros = Math.abs(Math.floor(Math.log10(price))) - 1;
    // Show 3 significant digits after the zeros
    const significantDigits = 3;
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: 'TRY',
      minimumFractionDigits: leadingZeros + significantDigits,
      maximumFractionDigits: leadingZeros + significantDigits
    }).format(price);
  }
  
  // For normal numbers, use standard formatting with 2 decimal places
  return new Intl.NumberFormat('tr-TR', { 
    style: 'currency', 
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(price);
}

export function formatLargeNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 1,
      minimumFractionDigits: 1
    }).format(value / 1_000_000_000) + ' Mr';
  } else if (value >= 1_000_000) {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 1,
      minimumFractionDigits: 1
    }).format(value / 1_000_000) + ' Mn';
  } else {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(value);
  }
} 
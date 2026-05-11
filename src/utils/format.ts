/**
 * Formats a number with thousand separators.
 * Example: 1250000 -> "1,250,000"
 */
export const formatPrice = (value: number | string): string => {
  if (!value && value !== 0) return '';
  const num = typeof value === 'string' ? parseInt(value.replace(/,/g, '')) : value;
  if (isNaN(num)) return '';
  return num.toLocaleString();
};

/**
 * Strips non-numeric characters from a string.
 * Used for sanitizing price inputs.
 */
export const sanitizeNumeric = (value: string): string => {
  return value.replace(/[^0-9]/g, '');
};

/**
 * Calculates a standard service fee (5%)
 */
export const calculateServiceFee = (price: number): number => {
  return Math.floor(price * 0.05);
};

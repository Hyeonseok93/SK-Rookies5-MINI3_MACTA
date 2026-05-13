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

/**
 * Parses a date string from the backend.
 */
export const parseDate = (dateStr: string | Date | null | undefined): Date => {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  
  return new Date(dateStr);
};

/**
 * Formats a date string to a localized date (e.g., "2023. 10. 27.")
 */
export const formatDate = (dateStr: string | Date | null | undefined): string => {
  return parseDate(dateStr).toLocaleDateString();
};

/**
 * Formats a date string to a localized time (e.g., "오후 7:00:00")
 */
export const formatTime = (dateStr: string | Date | null | undefined): string => {
  return parseDate(dateStr).toLocaleTimeString();
};

/**
 * Formats a date string to a full localized string (e.g., "2023. 10. 27. 오후 7:00:00")
 */
export const formatDateTime = (dateStr: string | Date | null | undefined): string => {
  return parseDate(dateStr).toLocaleString();
};

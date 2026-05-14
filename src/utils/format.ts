import { useTimeStore } from '../store/useTimeStore';

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
 * Returns the current time synchronized with the server.
 * Use this instead of new Date() for any time-sensitive logic.
 */
export const getServerNow = (): Date => {
  const { serverOffset } = useTimeStore.getState();
  return new Date(Date.now() + serverOffset);
};

/**
 * Parses a date string from the backend.
 * ISO 8601 strings with 'Z' are correctly handled by the native Date constructor.
 */
export const parseDate = (dateStr: string | Date | null | undefined): Date => {
  if (!dateStr) return getServerNow();
  if (dateStr instanceof Date) return dateStr;
  
  // If the string is already ISO 8601 (contains T and Z/offset), the Date constructor handles it correctly.
  // Otherwise, we treat it as UTC for consistency if no info is provided.
  let str = dateStr;
  if (typeof str === 'string' && !str.includes('Z') && !str.includes('+')) {
    const separator = str.includes(' ') ? ' ' : 'T';
    if (!str.includes(separator)) {
      str = `${str}${separator}00:00:00`;
    }
    // Backend is now configured to send 'Z' (UTC), but as a fallback:
    str = `${str}Z`;
  }
  
  return new Date(str);
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

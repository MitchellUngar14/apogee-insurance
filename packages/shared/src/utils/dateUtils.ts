// Date utility functions shared across all services

/**
 * Formats a date consistently for display (YYYY-MM-DD)
 * Uses UTC components to avoid local timezone offset issues
 */
export const formatDateForDisplay = (dateInput: string | Date): string => {
  const date = new Date(dateInput);
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats a date for datetime-local input fields
 */
export const formatDateForInput = (dateInput: string | Date): string => {
  const date = new Date(dateInput);
  return date.toISOString().slice(0, 16);
};

/**
 * Generates a unique policy number
 * Format: POL-YYYYMMDD-XXXXX
 */
export const generatePolicyNumber = (): string => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `POL-${dateStr}-${random}`;
};

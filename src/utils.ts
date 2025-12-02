import { format } from 'date-fns';
import { randomUUID } from 'crypto';

/**
 * Generate a unique ID for a note
 */
export function generateId(): string {
  return randomUUID();
}

/**
 * Get current timestamp in ISO 8601 format
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Format a timestamp for display
 * @param isoString ISO 8601 timestamp
 * @returns Formatted date string (e.g., "Dec 02, 2024 14:30")
 */
export function formatTimestamp(isoString: string): string {
  try {
    return format(new Date(isoString), 'MMM dd, yyyy HH:mm');
  } catch (error) {
    return isoString; // Fallback to original if parsing fails
  }
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Parse comma-separated tags
 */
export function parseTags(tagsString: string | undefined): string[] {
  if (!tagsString) return [];
  return tagsString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
}

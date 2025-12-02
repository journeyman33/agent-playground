import { describe, it, expect } from 'vitest';
import { generateId, getCurrentTimestamp, formatTimestamp, truncate, parseTags } from '../src/utils.js';

describe('Utils', () => {
  describe('generateId', () => {
    it('should generate a valid UUID', () => {
      const id = generateId();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('getCurrentTimestamp', () => {
    it('should return ISO 8601 timestamp', () => {
      const timestamp = getCurrentTimestamp();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('formatTimestamp', () => {
    it('should format ISO timestamp correctly', () => {
      const timestamp = '2024-12-02T14:30:00.000Z';
      const formatted = formatTimestamp(timestamp);
      expect(formatted).toContain('Dec');
      expect(formatted).toContain('2024');
    });

    it('should return original string if parsing fails', () => {
      const invalid = 'invalid-date';
      expect(formatTimestamp(invalid)).toBe(invalid);
    });
  });

  describe('truncate', () => {
    it('should truncate long text with ellipsis', () => {
      const text = 'This is a very long text that needs truncation';
      const result = truncate(text, 20);
      expect(result).toBe('This is a very lo...');
      expect(result.length).toBe(20);
    });

    it('should not truncate short text', () => {
      const text = 'Short';
      expect(truncate(text, 20)).toBe('Short');
    });
  });

  describe('parseTags', () => {
    it('should parse comma-separated tags', () => {
      expect(parseTags('tag1,tag2,tag3')).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should trim whitespace', () => {
      expect(parseTags(' tag1 , tag2 , tag3 ')).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should filter empty tags', () => {
      expect(parseTags('tag1,,tag2')).toEqual(['tag1', 'tag2']);
    });

    it('should return empty array for undefined', () => {
      expect(parseTags(undefined)).toEqual([]);
    });
  });
});

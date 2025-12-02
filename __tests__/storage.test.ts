import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlink } from 'fs/promises';
import { NoteStorage } from '../src/storage.js';
import type { Note } from '../src/types.js';

const TEST_FILE = './test-notes.json';

describe('NoteStorage', () => {
  let storage: NoteStorage;

  beforeEach(() => {
    storage = new NoteStorage({ filePath: TEST_FILE });
  });

  afterEach(async () => {
    try {
      await unlink(TEST_FILE);
    } catch {
      // File might not exist
    }
  });

  describe('initialize', () => {
    it('should create file if it does not exist', async () => {
      await storage.initialize();
      const data = await storage.load();
      expect(data).toEqual({ notes: [] });
    });
  });

  describe('save and load', () => {
    it('should save and load notes', async () => {
      const testData = {
        notes: [
          {
            id: '1',
            title: 'Test',
            body: 'Body',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: []
          }
        ]
      };

      await storage.save(testData);
      const loaded = await storage.load();
      expect(loaded).toEqual(testData);
    });
  });

  describe('addNote', () => {
    it('should add a note', async () => {
      const note: Note = {
        id: '1',
        title: 'Test',
        body: 'Body',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: []
      };

      await storage.addNote(note);
      const notes = await storage.getAllNotes();
      expect(notes).toHaveLength(1);
      expect(notes[0]).toEqual(note);
    });
  });

  describe('deleteNote', () => {
    it('should delete a note by ID', async () => {
      const note: Note = {
        id: '1',
        title: 'Test',
        body: 'Body',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: []
      };

      await storage.addNote(note);
      const deleted = await storage.deleteNote('1');
      expect(deleted).toBe(true);

      const notes = await storage.getAllNotes();
      expect(notes).toHaveLength(0);
    });

    it('should return false if note not found', async () => {
      const deleted = await storage.deleteNote('nonexistent');
      expect(deleted).toBe(false);
    });
  });

  describe('updateNote', () => {
    it('should update a note', async () => {
      const note: Note = {
        id: '1',
        title: 'Test',
        body: 'Body',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: []
      };

      await storage.addNote(note);

      const updated: Note = { ...note, title: 'Updated' };
      const success = await storage.updateNote('1', updated);
      expect(success).toBe(true);

      const notes = await storage.getAllNotes();
      expect(notes[0].title).toBe('Updated');
    });
  });
});

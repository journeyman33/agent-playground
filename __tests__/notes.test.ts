import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlink } from 'fs/promises';
import { NoteStorage } from '../src/storage.js';
import { NoteManager } from '../src/notes.js';

const TEST_FILE = './test-notes-manager.json';

describe('NoteManager', () => {
  let storage: NoteStorage;
  let manager: NoteManager;

  beforeEach(() => {
    storage = new NoteStorage({ filePath: TEST_FILE });
    manager = new NoteManager(storage);
  });

  afterEach(async () => {
    try {
      await unlink(TEST_FILE);
    } catch {
      // Ignore
    }
  });

  describe('createNote', () => {
    it('should create a note with generated ID and timestamps', async () => {
      const note = await manager.createNote({
        title: 'Test Note',
        body: 'Test Body',
        tags: ['test']
      });

      expect(note.id).toBeDefined();
      expect(note.title).toBe('Test Note');
      expect(note.body).toBe('Test Body');
      expect(note.tags).toEqual(['test']);
      expect(note.createdAt).toBeDefined();
      expect(note.updatedAt).toBeDefined();
    });
  });

  describe('listNotes', () => {
    it('should return notes sorted by most recent first', async () => {
      await manager.createNote({ title: 'First', body: 'Body 1' });
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      await manager.createNote({ title: 'Second', body: 'Body 2' });

      const notes = await manager.listNotes();
      expect(notes).toHaveLength(2);
      expect(notes[0].title).toBe('Second');
      expect(notes[1].title).toBe('First');
    });
  });

  describe('getNote', () => {
    it('should retrieve a note by ID', async () => {
      const created = await manager.createNote({ title: 'Test', body: 'Body' });
      const retrieved = await manager.getNote(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
    });

    it('should return null if note not found', async () => {
      const result = await manager.getNote('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('searchNotes', () => {
    it('should search notes by title', async () => {
      await manager.createNote({ title: 'JavaScript Tips', body: 'Content' });
      await manager.createNote({ title: 'Python Guide', body: 'Content' });

      const results = await manager.searchNotes('JavaScript');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('JavaScript Tips');
    });

    it('should search notes by body', async () => {
      await manager.createNote({ title: 'Note 1', body: 'TypeScript is great' });
      await manager.createNote({ title: 'Note 2', body: 'Python is awesome' });

      const results = await manager.searchNotes('TypeScript');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Note 1');
    });

    it('should be case insensitive', async () => {
      await manager.createNote({ title: 'JavaScript', body: 'Content' });
      const results = await manager.searchNotes('javascript');
      expect(results).toHaveLength(1);
    });
  });

  describe('deleteNote', () => {
    it('should delete a note', async () => {
      const note = await manager.createNote({ title: 'Test', body: 'Body' });
      const success = await manager.deleteNote(note.id);

      expect(success).toBe(true);
      const retrieved = await manager.getNote(note.id);
      expect(retrieved).toBeNull();
    });

    it('should return false if note not found', async () => {
      const success = await manager.deleteNote('nonexistent');
      expect(success).toBe(false);
    });
  });
});

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

  describe('updateNote', () => {
    it('should update note title', async () => {
      const note = await manager.createNote({ title: 'Original', body: 'Body' });
      const updated = await manager.updateNote(note.id, { title: 'Updated Title' });

      expect(updated).toBeDefined();
      expect(updated?.title).toBe('Updated Title');
      expect(updated?.body).toBe('Body');
      expect(updated?.updatedAt).not.toBe(note.updatedAt);
    });

    it('should update note body', async () => {
      const note = await manager.createNote({ title: 'Title', body: 'Original' });
      const updated = await manager.updateNote(note.id, { body: 'Updated Body' });

      expect(updated).toBeDefined();
      expect(updated?.body).toBe('Updated Body');
      expect(updated?.title).toBe('Title');
    });

    it('should update note tags', async () => {
      const note = await manager.createNote({ title: 'Title', body: 'Body', tags: ['old'] });
      const updated = await manager.updateNote(note.id, { tags: ['new', 'tags'] });

      expect(updated).toBeDefined();
      expect(updated?.tags).toEqual(['new', 'tags']);
    });

    it('should update multiple fields at once', async () => {
      const note = await manager.createNote({ title: 'Original', body: 'Original Body' });
      const updated = await manager.updateNote(note.id, {
        title: 'New Title',
        body: 'New Body',
        tags: ['updated']
      });

      expect(updated).toBeDefined();
      expect(updated?.title).toBe('New Title');
      expect(updated?.body).toBe('New Body');
      expect(updated?.tags).toEqual(['updated']);
    });

    it('should return null if note not found', async () => {
      const result = await manager.updateNote('nonexistent', { title: 'New' });
      expect(result).toBeNull();
    });

    it('should preserve unchanged fields', async () => {
      const note = await manager.createNote({
        title: 'Title',
        body: 'Body',
        tags: ['tag1', 'tag2']
      });
      const updated = await manager.updateNote(note.id, { title: 'New Title' });

      expect(updated?.body).toBe('Body');
      expect(updated?.tags).toEqual(['tag1', 'tag2']);
    });
  });

  describe('filterNotesByTags', () => {
    beforeEach(async () => {
      await manager.createNote({ title: 'Note 1', body: 'Body', tags: ['javascript', 'tutorial'] });
      await manager.createNote({ title: 'Note 2', body: 'Body', tags: ['javascript', 'advanced'] });
      await manager.createNote({ title: 'Note 3', body: 'Body', tags: ['python', 'tutorial'] });
      await manager.createNote({ title: 'Note 4', body: 'Body', tags: [] });
    });

    it('should filter notes by single tag', async () => {
      const results = await manager.filterNotesByTags(['javascript']);
      expect(results).toHaveLength(2);
      expect(results.every(n => n.tags.includes('javascript'))).toBe(true);
    });

    it('should filter notes by multiple tags (AND logic)', async () => {
      const results = await manager.filterNotesByTags(['javascript', 'tutorial']);
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Note 1');
    });

    it('should return all notes when no tags specified', async () => {
      const results = await manager.filterNotesByTags([]);
      expect(results).toHaveLength(4);
    });

    it('should return empty array when no notes match', async () => {
      const results = await manager.filterNotesByTags(['nonexistent']);
      expect(results).toHaveLength(0);
    });

    it('should return notes sorted by most recent first', async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      await manager.createNote({ title: 'Newest', body: 'Body', tags: ['javascript'] });

      const results = await manager.filterNotesByTags(['javascript']);
      expect(results[0].title).toBe('Newest');
    });
  });

  describe('getAllTags', () => {
    it('should return all unique tags sorted alphabetically', async () => {
      await manager.createNote({ title: 'Note 1', body: 'Body', tags: ['zebra', 'apple'] });
      await manager.createNote({ title: 'Note 2', body: 'Body', tags: ['banana', 'apple'] });
      await manager.createNote({ title: 'Note 3', body: 'Body', tags: ['cherry'] });

      const tags = await manager.getAllTags();
      expect(tags).toEqual(['apple', 'banana', 'cherry', 'zebra']);
    });

    it('should return empty array when no notes have tags', async () => {
      await manager.createNote({ title: 'Note 1', body: 'Body', tags: [] });
      const tags = await manager.getAllTags();
      expect(tags).toEqual([]);
    });

    it('should not include duplicate tags', async () => {
      await manager.createNote({ title: 'Note 1', body: 'Body', tags: ['duplicate', 'unique1'] });
      await manager.createNote({ title: 'Note 2', body: 'Body', tags: ['duplicate', 'unique2'] });

      const tags = await manager.getAllTags();
      expect(tags).toEqual(['duplicate', 'unique1', 'unique2']);
      expect(tags.filter(t => t === 'duplicate')).toHaveLength(1);
    });
  });
});

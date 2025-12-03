import type { Note, CreateNoteOptions, UpdateNoteOptions } from './types.js';
import { NoteStorage } from './storage.js';
import { generateId, getCurrentTimestamp } from './utils.js';

/**
 * Note management service
 */
export class NoteManager {
  constructor(private storage: NoteStorage) {}

  /**
   * Create a new note
   */
  async createNote(options: CreateNoteOptions): Promise<Note> {
    const now = getCurrentTimestamp();
    const note: Note = {
      id: generateId(),
      title: options.title,
      body: options.body,
      createdAt: now,
      updatedAt: now,
      tags: options.tags || []
    };

    await this.storage.addNote(note);
    return note;
  }

  /**
   * Get all notes, sorted by most recent first
   */
  async listNotes(): Promise<Note[]> {
    const notes = await this.storage.getAllNotes();
    return notes.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Get a single note by ID
   */
  async getNote(id: string): Promise<Note | null> {
    const notes = await this.storage.getAllNotes();
    return notes.find(n => n.id === id) || null;
  }

  /**
   * Search notes by query (searches title and body)
   */
  async searchNotes(query: string): Promise<Note[]> {
    const notes = await this.storage.getAllNotes();
    const lowerQuery = query.toLowerCase();

    return notes
      .filter(note =>
        note.title.toLowerCase().includes(lowerQuery) ||
        note.body.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  /**
   * Update an existing note
   */
  async updateNote(id: string, updates: UpdateNoteOptions): Promise<Note | null> {
    const note = await this.getNote(id);
    if (!note) return null;

    const updatedNote: Note = {
      ...note,
      ...updates,
      updatedAt: getCurrentTimestamp()
    };

    const success = await this.storage.updateNote(id, updatedNote);
    return success ? updatedNote : null;
  }

  /**
   * Delete a note by ID
   */
  async deleteNote(id: string): Promise<boolean> {
    return await this.storage.deleteNote(id);
  }

  /**
   * Filter notes by tags
   * @param tags Array of tags to filter by (returns notes that have ALL specified tags)
   */
  async filterNotesByTags(tags: string[]): Promise<Note[]> {
    const notes = await this.storage.getAllNotes();
    if (tags.length === 0) return notes;

    return notes
      .filter(note =>
        tags.every(tag => note.tags.includes(tag))
      )
      .sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  /**
   * Get all unique tags from all notes
   */
  async getAllTags(): Promise<string[]> {
    const notes = await this.storage.getAllNotes();
    const tagSet = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }
}

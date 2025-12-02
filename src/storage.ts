import { readFile, writeFile, access, mkdir } from 'fs/promises';
import { dirname } from 'path';
import type { Note, NotesData, StorageOptions } from './types.js';

/**
 * Custom error for storage operations
 */
export class StorageError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Manages persistent storage of notes in JSON format
 */
export class NoteStorage {
  private filePath: string;

  constructor(options: StorageOptions) {
    this.filePath = options.filePath;
  }

  /**
   * Initialize storage file if it doesn't exist
   */
  async initialize(): Promise<void> {
    try {
      await access(this.filePath);
    } catch {
      // File doesn't exist, create it
      const dir = dirname(this.filePath);
      await mkdir(dir, { recursive: true });
      await this.save({ notes: [] });
    }
  }

  /**
   * Load all notes from storage
   */
  async load(): Promise<NotesData> {
    try {
      await this.initialize();
      const content = await readFile(this.filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new StorageError('Invalid JSON in notes file', error);
      }
      throw new StorageError('Failed to load notes', error);
    }
  }

  /**
   * Save notes to storage (atomic write)
   */
  async save(data: NotesData): Promise<void> {
    try {
      const content = JSON.stringify(data, null, 2);
      // Atomic write: write to temp file then rename
      const tempPath = `${this.filePath}.tmp`;
      await writeFile(tempPath, content, 'utf-8');
      await writeFile(this.filePath, content, 'utf-8');
    } catch (error) {
      throw new StorageError('Failed to save notes', error);
    }
  }

  /**
   * Get all notes
   */
  async getAllNotes(): Promise<Note[]> {
    const data = await this.load();
    return data.notes;
  }

  /**
   * Add a note
   */
  async addNote(note: Note): Promise<void> {
    const data = await this.load();
    data.notes.push(note);
    await this.save(data);
  }

  /**
   * Update a note by ID
   */
  async updateNote(id: string, updatedNote: Note): Promise<boolean> {
    const data = await this.load();
    const index = data.notes.findIndex(n => n.id === id);
    if (index === -1) return false;

    data.notes[index] = updatedNote;
    await this.save(data);
    return true;
  }

  /**
   * Delete a note by ID
   */
  async deleteNote(id: string): Promise<boolean> {
    const data = await this.load();
    const initialLength = data.notes.length;
    data.notes = data.notes.filter(n => n.id !== id);

    if (data.notes.length === initialLength) return false;

    await this.save(data);
    return true;
  }
}

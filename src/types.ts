/**
 * Represents a single note in the system
 */
export interface Note {
  /** Unique identifier (UUID v4) */
  id: string;

  /** Note title */
  title: string;

  /** Note body/content */
  body: string;

  /** ISO 8601 timestamp of creation */
  createdAt: string;

  /** ISO 8601 timestamp of last update */
  updatedAt: string;

  /** Optional tags for categorization */
  tags: string[];
}

/**
 * Options for creating a new note
 */
export interface CreateNoteOptions {
  title: string;
  body: string;
  tags?: string[];
}

/**
 * Options for updating an existing note
 */
export interface UpdateNoteOptions {
  title?: string;
  body?: string;
  tags?: string[];
}

/**
 * Storage configuration options
 */
export interface StorageOptions {
  /** Path to the notes JSON file */
  filePath: string;
}

/**
 * Container for all notes
 */
export interface NotesData {
  notes: Note[];
}

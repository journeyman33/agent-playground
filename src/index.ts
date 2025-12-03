#!/usr/bin/env node

import { Command } from 'commander';
import { join } from 'path';
import { homedir } from 'os';
import { NoteStorage } from './storage.js';
import { NoteManager } from './notes.js';
import { displayNoteList, displayNote, displaySuccess, displayError, displayInfo } from './display.js';
import { parseTags } from './utils.js';

// Default storage location: ~/.notes/notes.json
const DEFAULT_NOTES_PATH = join(homedir(), '.notes', 'notes.json');

// Initialize storage and manager
const storage = new NoteStorage({ filePath: DEFAULT_NOTES_PATH });
const noteManager = new NoteManager(storage);

// Create CLI program
const program = new Command();

program
  .name('notes')
  .description('A simple CLI note-taking application')
  .version('1.0.0');

// Add command
program
  .command('add')
  .description('Create a new note')
  .requiredOption('-t, --title <title>', 'Note title')
  .option('-b, --body <body>', 'Note body', '')
  .option('--tags <tags>', 'Comma-separated tags')
  .action(async (options) => {
    try {
      const note = await noteManager.createNote({
        title: options.title,
        body: options.body,
        tags: parseTags(options.tags)
      });
      displaySuccess(`Note created with ID: ${note.id}`);
    } catch (error) {
      displayError(error instanceof Error ? error.message : 'Failed to create note');
      process.exit(1);
    }
  });

// List command
program
  .command('list')
  .description('List all notes (most recent first)')
  .option('--tags <tags>', 'Filter by comma-separated tags (shows notes with ALL specified tags)')
  .action(async (options) => {
    try {
      let notes;
      if (options.tags) {
        const tags = parseTags(options.tags);
        notes = await noteManager.filterNotesByTags(tags);
        if (notes.length === 0) {
          displayInfo(`No notes found with tags: ${tags.join(', ')}`);
          return;
        }
        displayInfo(`Showing notes with tags: ${tags.join(', ')}`);
      } else {
        notes = await noteManager.listNotes();
      }
      displayNoteList(notes);
    } catch (error) {
      displayError(error instanceof Error ? error.message : 'Failed to list notes');
      process.exit(1);
    }
  });

// View command
program
  .command('view <id>')
  .description('View a single note by ID')
  .action(async (id: string) => {
    try {
      const note = await noteManager.getNote(id);
      if (!note) {
        displayError(`Note with ID "${id}" not found`);
        process.exit(1);
      }
      displayNote(note);
    } catch (error) {
      displayError(error instanceof Error ? error.message : 'Failed to view note');
      process.exit(1);
    }
  });

// Search command
program
  .command('search <query>')
  .description('Search notes by title or body')
  .action(async (query: string) => {
    try {
      const notes = await noteManager.searchNotes(query);
      if (notes.length === 0) {
        displayInfo(`No notes found matching "${query}"`);
      } else {
        displayInfo(`Found ${notes.length} note(s) matching "${query}"`);
        displayNoteList(notes);
      }
    } catch (error) {
      displayError(error instanceof Error ? error.message : 'Failed to search notes');
      process.exit(1);
    }
  });

// Update command
program
  .command('update <id>')
  .description('Update an existing note')
  .option('-t, --title <title>', 'New title')
  .option('-b, --body <body>', 'New body')
  .option('--tags <tags>', 'New comma-separated tags')
  .action(async (id: string, options) => {
    try {
      // Ensure at least one field is being updated
      if (!options.title && !options.body && !options.tags) {
        displayError('Please provide at least one field to update (--title, --body, or --tags)');
        process.exit(1);
      }

      const updates: { title?: string; body?: string; tags?: string[] } = {};
      if (options.title) updates.title = options.title;
      if (options.body) updates.body = options.body;
      if (options.tags) updates.tags = parseTags(options.tags);

      const updatedNote = await noteManager.updateNote(id, updates);
      if (!updatedNote) {
        displayError(`Note with ID "${id}" not found`);
        process.exit(1);
      }
      displaySuccess(`Note updated: ${id}`);
      displayNote(updatedNote);
    } catch (error) {
      displayError(error instanceof Error ? error.message : 'Failed to update note');
      process.exit(1);
    }
  });

// Delete command
program
  .command('delete <id>')
  .description('Delete a note by ID')
  .action(async (id: string) => {
    try {
      const success = await noteManager.deleteNote(id);
      if (!success) {
        displayError(`Note with ID "${id}" not found`);
        process.exit(1);
      }
      displaySuccess(`Note deleted: ${id}`);
    } catch (error) {
      displayError(error instanceof Error ? error.message : 'Failed to delete note');
      process.exit(1);
    }
  });

// Tags command
program
  .command('tags')
  .description('List all tags used in notes')
  .action(async () => {
    try {
      const tags = await noteManager.getAllTags();
      if (tags.length === 0) {
        displayInfo('No tags found');
      } else {
        displayInfo(`Available tags (${tags.length}):`);
        tags.forEach(tag => console.log(`  - ${tag}`));
      }
    } catch (error) {
      displayError(error instanceof Error ? error.message : 'Failed to list tags');
      process.exit(1);
    }
  });

// Parse CLI arguments
program.parse();

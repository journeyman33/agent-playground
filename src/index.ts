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
  .action(async () => {
    try {
      const notes = await noteManager.listNotes();
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

// Parse CLI arguments
program.parse();

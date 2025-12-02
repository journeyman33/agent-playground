import chalk from 'chalk';
import type { Note } from './types.js';
import { formatTimestamp, truncate } from './utils.js';

/**
 * Display a list of notes in table format
 */
export function displayNoteList(notes: Note[]): void {
  if (notes.length === 0) {
    console.log(chalk.yellow('No notes found.'));
    return;
  }

  console.log(chalk.bold('\nNotes:\n'));

  notes.forEach(note => {
    const tags = note.tags.length > 0
      ? chalk.cyan(`[${note.tags.join(', ')}]`)
      : '';

    console.log(chalk.green(`ID: ${note.id}`));
    console.log(chalk.bold(`Title: ${note.title}`));
    console.log(`Body: ${truncate(note.body, 100)}`);
    console.log(`Created: ${formatTimestamp(note.createdAt)}`);
    if (tags) console.log(`Tags: ${tags}`);
    console.log(''); // Empty line separator
  });

  console.log(chalk.gray(`Total: ${notes.length} note(s)\n`));
}

/**
 * Display a single note with full details
 */
export function displayNote(note: Note): void {
  console.log('');
  console.log(chalk.green(`ID: ${note.id}`));
  console.log(chalk.bold.white(`Title: ${note.title}`));
  console.log('');
  console.log(note.body);
  console.log('');
  console.log(chalk.gray(`Created: ${formatTimestamp(note.createdAt)}`));
  console.log(chalk.gray(`Updated: ${formatTimestamp(note.updatedAt)}`));

  if (note.tags.length > 0) {
    console.log(chalk.cyan(`Tags: ${note.tags.join(', ')}`));
  }
  console.log('');
}

/**
 * Display success message
 */
export function displaySuccess(message: string): void {
  console.log(chalk.green(`✓ ${message}`));
}

/**
 * Display error message
 */
export function displayError(message: string): void {
  console.error(chalk.red(`✗ Error: ${message}`));
}

/**
 * Display info message
 */
export function displayInfo(message: string): void {
  console.log(chalk.blue(`ℹ ${message}`));
}

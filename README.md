# CLI Notes

A simple, fast command-line note-taking application built with TypeScript and Node.js.

## Features

- 📝 Create, view, search, and delete notes from the command line
- 🏷️ Tag support for organizing notes
- 🔍 Full-text search across titles and bodies
- 💾 Local JSON storage (no external database required)
- 🎨 Color-coded terminal output
- ⚡ Fast and lightweight

## Installation

### From Source (Development)

1. Clone this repository:
```bash
git clone <repository-url>
cd cli-notes
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Link the CLI globally:
```bash
npm link
```

Now you can use the `notes` command from anywhere!

### From npm (When Published)

```bash
npm install -g cli-notes
```

## Usage

### Create a Note

```bash
# Basic note
notes add -t "Meeting Notes" -b "Discussed project roadmap"

# With tags
notes add -t "Code Snippet" -b "Array.map() example" --tags "javascript,tutorial"
```

### List All Notes

```bash
notes list
```

Shows all notes, sorted by most recent first.

### View a Specific Note

```bash
notes view <note-id>
```

Example:
```bash
notes view a1b2c3d4-5678-90ab-cdef-1234567890ab
```

### Search Notes

```bash
notes search <query>
```

Searches in both titles and bodies:
```bash
notes search "javascript"
notes search "meeting"
```

### Update a Note

```bash
notes update <note-id> [options]
```

Update one or more fields of an existing note:
```bash
# Update title only
notes update a1b2c3d4-5678-90ab-cdef-1234567890ab -t "New Title"

# Update body only
notes update a1b2c3d4-5678-90ab-cdef-1234567890ab -b "Updated content"

# Update tags
notes update a1b2c3d4-5678-90ab-cdef-1234567890ab --tags "updated,revised"

# Update multiple fields
notes update a1b2c3d4-5678-90ab-cdef-1234567890ab -t "New Title" -b "New Body" --tags "new"
```

### Filter Notes by Tags

```bash
notes list --tags <tags>
```

Show only notes that have ALL specified tags:
```bash
# Notes with 'javascript' tag
notes list --tags "javascript"

# Notes with both 'javascript' AND 'tutorial' tags
notes list --tags "javascript,tutorial"
```

### List All Tags

```bash
notes tags
```

Shows all unique tags used across all notes, sorted alphabetically.

### Delete a Note

```bash
notes delete <note-id>
```

### Help

```bash
notes --help
notes <command> --help
```

## Storage

Notes are stored in a JSON file at `~/.notes/notes.json`. This file is created automatically on first use.

## Development

### Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Watch mode for development
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run coverage` - Generate test coverage report
- `npm run type-check` - Type check without emitting files
- `npm run clean` - Remove build artifacts

### Project Structure

```
.
├── src/
│   ├── index.ts       # CLI entry point
│   ├── types.ts       # TypeScript interfaces
│   ├── storage.ts     # JSON storage layer
│   ├── notes.ts       # Business logic
│   ├── display.ts     # Terminal output formatting
│   └── utils.ts       # Utility functions
├── __tests__/
│   ├── utils.test.ts
│   ├── storage.test.ts
│   └── notes.test.ts
├── dist/              # Compiled JavaScript (generated)
└── package.json
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run coverage
```

## Architecture

The application follows a clean, layered architecture:

1. **CLI Layer** (`index.ts`): Commander.js interface, argument parsing
2. **Business Logic** (`notes.ts`): Core note operations (CRUD)
3. **Storage Layer** (`storage.ts`): JSON file persistence
4. **Presentation** (`display.ts`): Terminal output formatting
5. **Utilities** (`utils.ts`): Shared helper functions

## Future Enhancements

Potential features for future versions:

- 📱 Cloud sync (Dropbox, Google Drive)
- 🔐 Encryption for sensitive notes
- 📊 Export to Markdown, PDF, or HTML
- 🔄 Import from other note-taking apps
- 🏷️ Advanced tag filtering and management
- ⭐ Favorite/pin important notes
- 📅 Due dates and reminders
- 🔗 Note linking and backlinks

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

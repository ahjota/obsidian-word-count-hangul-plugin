# Daily Character Count

An Obsidian plugin that tracks characters added today across all vault files with real-time updates as you type.

## Features

- **Real-time character counting**: Updates instantly as you type in any open editor
- Displays daily character count in the status bar
- Tracks characters incrementally across all files (no full vault scans)
- Set a daily goal with a congratulations message when reached
- Persists counts across sessions
- Handles file creates, deletes, and renames
- Optimized performance with intelligent update throttling

## Commands

- **Show character count** - Display today's character count in a notice
- **Recalculate file counts** - Rebuild file counts from scratch

## Settings

- **Daily goal** - Set a daily character count goal (default: 500)

## Technical Details

This plugin uses Obsidian's editor extension API with CodeMirror 6 to provide real-time character counting:

- **Editor Extensions**: Uses `EditorView.updateListener` to monitor changes across all open editors
- **Efficient Updates**: Only processes actual document changes (`docChanged` events)
- **File Mapping**: Associates editor changes with their corresponding vault files
- **Performance**: Throttled data persistence to minimize disk I/O during rapid typing
- **Compatibility**: Maintains backward compatibility with file-based event tracking

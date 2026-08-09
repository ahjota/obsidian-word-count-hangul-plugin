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

## Development

This project supports development in a devcontainer, so you can build and lint without installing Node or any npm packages on your host machine.

### Devcontainer

A `.devcontainer/` configuration is included for use with VS Code Dev Containers, GitHub Codespaces, or any remote Docker host. The container provides Node 20 LTS, npm, and the project's dev dependencies automatically.

1. Open the repository in VS Code with the Dev Containers extension, or create a Codespace on GitHub.
2. The container builds and runs `npm install` automatically on first open.
3. Build the plugin:
   ```bash
   npm run build
   ```
   This runs `tsc` for type checking and `esbuild` to bundle `src/` into `main.js`.
4. Lint:
   ```bash
   npm run lint
   ```

### Deploying to a vault

After building, copy the release artifacts (`main.js`, `manifest.json`, `styles.css`) into your Obsidian vault's plugin folder. A shell script automates this with no Node dependency:

```bash
./scripts/copy-to-vault.sh
```

The script auto-discovers your vaults from Obsidian's config (`~/Library/Application Support/obsidian/obsidian.json` on macOS). If you have multiple vaults, it lists them sorted by most recently opened and prompts you to pick. Vaults that already have the plugin folder are marked with "(plugin folder exists)".

To skip the prompt, set the vault path explicitly:

```bash
OBSIDIAN_VAULT_PATH=/path/to/vault ./scripts/copy-to-vault.sh
```

The plugin folder must already exist at `<vault>/.obsidian/plugins/word-count-hangul/`. If it doesn't, the script will tell you the exact `mkdir -p` command to run.

After copying, reload Obsidian and enable the plugin in **Settings → Community plugins**.

### Full workflow

1. **Devcontainer**: edit source, run `npm run build` to produce `main.js`
2. **Host**: run `./scripts/copy-to-vault.sh` to copy artifacts into your vault
3. **Obsidian**: reload and enable the plugin to test

## Technical Details

This plugin uses Obsidian's editor extension API with CodeMirror 6 to provide real-time character counting:

- **Editor Extensions**: Uses `EditorView.updateListener` to monitor changes across all open editors
- **Efficient Updates**: Only processes actual document changes (`docChanged` events)
- **File Mapping**: Associates editor changes with their corresponding vault files
- **Performance**: Throttled data persistence to minimize disk I/O during rapid typing
- **Compatibility**: Maintains backward compatibility with file-based event tracking

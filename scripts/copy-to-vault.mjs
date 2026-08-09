#!/usr/bin/env node
/**
 * Copy built plugin artifacts (main.js, manifest.json, styles.css)
 * into an Obsidian vault's plugin folder.
 *
 * Usage:
 *   OBSIDIAN_VAULT_PATH=/path/to/vault npm run copy:vault
 *
 * The plugin folder must already exist at:
 *   <vault>/.obsidian/plugins/word-count-hangul/
 *
 * This script does NOT build. Run "npm run deploy" for build + copy,
 * or "npm run build" then "npm run copy:vault" for copy-only.
 */

import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

const PLUGIN_ID = "word-count-hangul";
const ARTIFACTS = ["main.js", "manifest.json", "styles.css"];

const vaultPath = process.env.OBSIDIAN_VAULT_PATH;

if (!vaultPath) {
	console.error(
		"Error: OBSIDIAN_VAULT_PATH is not set.\n" +
			"Set it to your vault path, e.g.:\n" +
			"  OBSIDIAN_VAULT_PATH=/path/to/vault npm run copy:vault",
	);
	process.exit(1);
}

if (!existsSync(vaultPath)) {
	console.error(`Error: vault path does not exist: ${vaultPath}`);
	process.exit(1);
}

const pluginDir = join(vaultPath, ".obsidian", "plugins", PLUGIN_ID);

if (!existsSync(pluginDir)) {
	console.error(
		`Error: plugin folder does not exist:\n  ${pluginDir}\n` +
			`Create it first, e.g.:\n  mkdir -p "${pluginDir}"`,
	);
	process.exit(1);
}

const repoRoot = process.cwd();
let copied = 0;
let skipped = 0;

for (const artifact of ARTIFACTS) {
	const src = join(repoRoot, artifact);

	if (!existsSync(src)) {
		console.warn(`  skip: ${artifact} not found at repo root`);
		skipped++;
		continue;
	}

	const dest = join(pluginDir, artifact);
	copyFileSync(src, dest);
	console.log(`  copied: ${artifact} -> ${dest}`);
	copied++;
}

if (copied === 0) {
	console.error("Error: no artifacts were copied. Run 'npm run build' first.");
	process.exit(1);
}

console.log(
	`\nDone: ${copied} file(s) copied, ${skipped} skipped.` +
		"\nReload Obsidian and enable the plugin in Settings → Community plugins.",
);

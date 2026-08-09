#!/usr/bin/env node
/**
 * Copy built plugin artifacts (main.js, manifest.json, styles.css)
 * into an Obsidian vault's plugin folder.
 *
 * Usage:
 *   npm run copy:vault                      # auto-discover, pick from list
 *   OBSIDIAN_VAULT_PATH=/path/to/vault npm run copy:vault   # skip prompt
 *
 * Vault discovery reads ~/Library/Application Support/obsidian/obsidian.json
 * (macOS). If OBSIDIAN_VAULT_PATH is set, it is used directly without prompting.
 *
 * The plugin folder must already exist at:
 *   <vault>/.obsidian/plugins/word-count-hangul/
 *
 * This script does NOT build. Run "npm run deploy" for build + copy,
 * or "npm run build" then "npm run copy:vault" for copy-only.
 */

import {
	copyFileSync,
	existsSync,
	readFileSync,
	readlinkSync,
	statSync,
} from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import process from "node:process";

const PLUGIN_ID = "word-count-hangul";
const ARTIFACTS = ["main.js", "manifest.json", "styles.css"];

// ── Vault path resolution ────────────────────────────────────────────

/**
 * Read Obsidian's obsidian.json and return registered vault paths.
 * Returns [] if the file is missing or unreadable (e.g. non-macOS,
 * Obsidian not installed, running inside a container).
 */
function discoverVaults() {
	const configPath = join(
		homedir(),
		"Library",
		"Application Support",
		"obsidian",
		"obsidian.json",
	);

	if (!existsSync(configPath)) {
		return [];
	}

	try {
		const config = JSON.parse(readFileSync(configPath, "utf-8"));
		if (!config.vaults || typeof config.vaults !== "object") {
			return [];
		}

		return Object.values(config.vaults)
			.filter((v) => v && typeof v.path === "string")
			.filter((v) => existsSync(v.path))
			.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0)) // most recently opened first
			.map((v) => v.path);
	} catch {
		return [];
	}
}

async function resolveVaultPath() {
	// 1. Env var override — use directly, no prompt
	const envPath = process.env.OBSIDIAN_VAULT_PATH;
	if (envPath) {
		if (!existsSync(envPath)) {
			console.error(`Error: OBSIDIAN_VAULT_PATH does not exist: ${envPath}`);
			process.exit(1);
		}
		return envPath;
	}

	// 2. Auto-discover from Obsidian config
	const vaults = discoverVaults();

	if (vaults.length === 0) {
		console.error(
			"Error: could not discover any Obsidian vaults.\n" +
				"Set OBSIDIAN_VAULT_PATH manually, e.g.:\n" +
				"  OBSIDIAN_VAULT_PATH=/path/to/vault npm run copy:vault",
		);
		process.exit(1);
	}

	if (vaults.length === 1) {
		return vaults[0];
	}

	// 3. Multiple vaults — let user pick
	console.log("Multiple Obsidian vaults found:\n");
	vaults.forEach((path, i) => {
		const marker = existsSync(join(path, ".obsidian", "plugins", PLUGIN_ID))
			? " (plugin folder exists)"
			: "";
		console.log(`  ${i + 1}. ${path}${marker}`);
	});
	console.log();

	const rl = readline.createInterface({ input, output });
	try {
		const answer = await rl.question("Pick a vault (number): ");
		const idx = parseInt(answer, 10) - 1;
		if (isNaN(idx) || idx < 0 || idx >= vaults.length) {
			console.error("Error: invalid selection.");
			process.exit(1);
		}
		return vaults[idx];
	} finally {
		rl.close();
	}
}

// ── Main ─────────────────────────────────────────────────────────────

const vaultPath = await resolveVaultPath();
console.log(`\nTarget vault: ${vaultPath}`);

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

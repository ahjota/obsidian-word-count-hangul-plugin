import { App, TFile } from 'obsidian';
import { countCharacters } from './counter';

export async function getFileCharacterCount(file: TFile, app: App): Promise<number> {
	const content = await app.vault.read(file);
	return countCharacters(content);
}

export async function scanVault(app: App): Promise<Record<string, number>> {
	const files = app.vault.getMarkdownFiles();
	const snapshots: Record<string, number> = {};
	
	for (const file of files) {
		snapshots[file.path] = await getFileCharacterCount(file, app);
	}
	
	return snapshots;
}

import {TAbstractFile, TFile, Vault} from 'obsidian';
import {PluginData, getTodayDate} from './storage';
import {countCharacters} from './utils/counter';

export class CharacterTracker {
	private data: PluginData;
	private vault: Vault;
	private onUpdate: () => void;
	private debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

	constructor(vault: Vault, data: PluginData, onUpdate: () => void) {
		this.vault = vault;
		this.data = data;
		this.onUpdate = onUpdate;
	}

	getData(): PluginData {
		return this.data;
	}

	getTodayCount(): number {
		this.checkDayRollover();
		return this.data.todayCount;
	}

	private checkDayRollover(): void {
		const today = getTodayDate();
		if (this.data.todayDate !== today) {
			this.data.todayCount = 0;
			this.data.todayDate = today;
			this.onUpdate();
		}
	}

	async handleModify(file: TAbstractFile): Promise<void> {
		if (!(file instanceof TFile) || file.extension !== 'md') return;

		const existingTimer = this.debounceTimers.get(file.path);
		if (existingTimer) {
			clearTimeout(existingTimer);
		}

		const timer = setTimeout(() => {
			this.debounceTimers.delete(file.path);
			void this.processModify(file);
		}, 300);

		this.debounceTimers.set(file.path, timer);
	}

	private async processModify(file: TFile): Promise<void> {
		this.checkDayRollover();

		const content = await this.vault.cachedRead(file);
		const newCount = countCharacters(content);
		const oldCount = this.data.fileCounts[file.path] ?? 0;
		const delta = newCount - oldCount;

		this.data.fileCounts[file.path] = newCount;

		if (delta > 0) {
			this.data.todayCount += delta;
		}

		this.onUpdate();
	}

	handleDelete(file: TAbstractFile): void {
		if (!(file instanceof TFile) || file.extension !== 'md') return;

		const timer = this.debounceTimers.get(file.path);
		if (timer) {
			clearTimeout(timer);
			this.debounceTimers.delete(file.path);
		}

		delete this.data.fileCounts[file.path];
		this.onUpdate();
	}

	handleRename(file: TAbstractFile, oldPath: string): void {
		if (!(file instanceof TFile) || file.extension !== 'md') return;

		const timer = this.debounceTimers.get(oldPath);
		if (timer) {
			clearTimeout(timer);
			this.debounceTimers.delete(oldPath);
		}

		const oldCount = this.data.fileCounts[oldPath];
		if (oldCount !== undefined) {
			this.data.fileCounts[file.path] = oldCount;
			delete this.data.fileCounts[oldPath];
			this.onUpdate();
		}
	}

	async handleCreate(file: TAbstractFile): Promise<void> {
		if (!(file instanceof TFile) || file.extension !== 'md') return;
		if (file.path in this.data.fileCounts) return;

		this.checkDayRollover();

		const content = await this.vault.cachedRead(file);
		const count = countCharacters(content);

		this.data.fileCounts[file.path] = count;
		if (count > 0) {
			this.data.todayCount += count;
		}

		this.onUpdate();
	}

	async recalculateFileCounts(): Promise<void> {
		this.data.fileCounts = {};

		const files = this.vault.getMarkdownFiles();
		for (const file of files) {
			const content = await this.vault.cachedRead(file);
			this.data.fileCounts[file.path] = countCharacters(content);
		}

		this.onUpdate();
	}

	clearTimers(): void {
		for (const timer of this.debounceTimers.values()) {
			clearTimeout(timer);
		}
		this.debounceTimers.clear();
	}
}

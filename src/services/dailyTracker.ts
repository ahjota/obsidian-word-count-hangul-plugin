import { App, TFile, TAbstractFile } from 'obsidian';
import { DailyStats, PluginData } from '../types';
import { getFileCharacterCount, scanVault } from '../utils/vaultScanner';

export class DailyTracker {
	private app: App;
	private data: PluginData;
	private onUpdate: (total: number) => void;

	constructor(app: App, data: PluginData, onUpdate: (total: number) => void) {
		this.app = app;
		this.data = data;
		this.onUpdate = onUpdate;
	}

	async initialize() {
		const today = new Date().toISOString().split('T')[0] ?? '';
		if (this.data.stats.date !== today) {
			await this.resetForNewDay(today);
		}
		this.updateTotal();
	}

	async resetForNewDay(date: string) {
		const baselines = await scanVault(this.app);
		this.data.stats = {
			date,
			baselines
		};
		this.updateTotal();
	}

	async updateFile(file: TFile) {
		const today = new Date().toISOString().split('T')[0] ?? '';
		if (this.data.stats.date !== today) {
			await this.resetForNewDay(today);
			return;
		}

		// If we don't have a baseline for this file (e.g. newly created today)
		// we assume the baseline is 0 characters.
		if (!(file.path in this.data.stats.baselines)) {
			this.data.stats.baselines[file.path] = 0;
		}
		
		this.updateTotal();
	}

	async handleRename(file: TAbstractFile, oldPath: string) {
		if (file instanceof TFile && oldPath in this.data.stats.baselines) {
			const oldBaseline = this.data.stats.baselines[oldPath];
			if (oldBaseline !== undefined) {
				this.data.stats.baselines[file.path] = oldBaseline;
				delete this.data.stats.baselines[oldPath];
			}
		}
	}

	async handleDelete(file: TAbstractFile) {
		if (file.path in this.data.stats.baselines) {
			delete this.data.stats.baselines[file.path];
			this.updateTotal();
		}
	}

	private async updateTotal() {
		const currentCounts = await scanVault(this.app);
		let total = 0;

		for (const path in currentCounts) {
			const current = currentCounts[path] ?? 0;
			const baseline = this.data.stats.baselines[path] ?? 0;
			total += (current - baseline);
		}

		this.onUpdate(total);
	}

	getDailyTotal(): number {
		return 0;
	}

	async getCalculatedTotal(): Promise<number> {
		const currentCounts = await scanVault(this.app);
		let total = 0;
		for (const path in currentCounts) {
			const current = currentCounts[path] ?? 0;
			const baseline = this.data.stats.baselines[path] ?? 0;
			total += Math.max(0, current - baseline); 
		}
		return total;
	}
}

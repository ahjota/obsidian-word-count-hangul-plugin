import {Notice, Plugin} from 'obsidian';
import {PluginData, mergeData} from './storage';
import {CharacterTracker} from './tracker';

export default class DailyCharacterCountPlugin extends Plugin {
	private statusBarItemEl: HTMLElement;
	private tracker: CharacterTracker;
	private data: PluginData;

	async onload() {
		const saved = await this.loadData() as Partial<PluginData> | null;
		this.data = mergeData(saved);

		this.tracker = new CharacterTracker(
			this.app.vault,
			this.data,
			() => this.handleUpdate()
		);

		this.statusBarItemEl = this.addStatusBarItem();
		this.updateStatusBar();

		if (Object.keys(this.data.fileCounts).length === 0) {
			await this.tracker.recalculateFileCounts();
		}

		this.registerEvent(
			this.app.vault.on('modify', (file) => this.tracker.handleModify(file))
		);

		this.registerEvent(
			this.app.vault.on('delete', (file) => this.tracker.handleDelete(file))
		);

		this.registerEvent(
			this.app.vault.on('rename', (file, oldPath) => this.tracker.handleRename(file, oldPath))
		);

		this.registerEvent(
			this.app.vault.on('create', (file) => this.tracker.handleCreate(file))
		);

		this.tracker.setInitialized();

		this.addCommand({
			id: 'show-daily-character-count',
			name: 'Show character count',
			callback: () => {
				const count = this.tracker.getTodayCount();
				new Notice(`${count} characters added today`);
			}
		});

		this.addCommand({
			id: 'recalculate-file-counts',
			name: 'Recalculate file counts',
			callback: async () => {
				await this.tracker.recalculateFileCounts();
				new Notice('File counts recalculated');
			}
		});
	}

	onunload() {
		this.tracker.clearTimers();
	}

	private handleUpdate(): void {
		this.updateStatusBar();
		void this.saveData(this.data);
	}

	private updateStatusBar(): void {
		const count = this.tracker.getTodayCount();
		this.statusBarItemEl.setText(`${count} chars today`);
	}
}

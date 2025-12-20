import {Notice, Plugin, TFile, debounce} from 'obsidian';
import {DailyTracker} from './services/dailyTracker';
import {DEFAULT_DATA, PluginData} from './types';

export default class KoreanCharacterCountPlugin extends Plugin {
	private statusBarItemEl: HTMLElement;
	private tracker: DailyTracker;
	private data: PluginData;

	async onload() {
		this.data = Object.assign({}, DEFAULT_DATA, await this.loadData());
		
		this.statusBarItemEl = this.addStatusBarItem();
		this.statusBarItemEl.setText('Today: 0');

		this.tracker = new DailyTracker(
			this.app, 
			this.data, 
			(total) => {
				this.statusBarItemEl.setText(`Today: ${total}`);
				this.saveData(this.data);
			}
		);

		await this.tracker.initialize();

		const debouncedUpdate = debounce(async (file: TFile) => {
			await this.tracker.updateFile(file);
		}, 1000, true);

		this.registerEvent(
			this.app.vault.on('modify', (file) => {
				if (file instanceof TFile) {
					debouncedUpdate(file);
				}
			})
		);

		this.registerEvent(
			this.app.vault.on('delete', (file) => {
				this.tracker.handleDelete(file);
			})
		);

		this.registerEvent(
			this.app.vault.on('rename', (file, oldPath) => {
				this.tracker.handleRename(file, oldPath);
			})
		);

		this.addCommand({
			id: 'show-daily-character-count',
			name: 'Show daily character count',
			callback: async () => {
				const total = await this.tracker.getCalculatedTotal();
				new Notice(`You have written ${total} characters today in this vault`);
			}
		});
	}

	onunload() {
	}
}

import { Notice, Plugin } from "obsidian";
import { PluginData, mergeData } from "./storage";
import { CharacterTracker } from "./tracker";
import { DailyCharacterCountSettingTab } from "./settings";

export default class DailyCharacterCountPlugin extends Plugin {
	private statusBarItemEl: HTMLElement;
	private tracker: CharacterTracker;
	data: PluginData;
	private saveTimeout: ReturnType<typeof setTimeout> | null = null;

	async onload() {
		const saved = (await this.loadData()) as Partial<PluginData> | null;
		this.data = mergeData(saved);

		this.tracker = new CharacterTracker(this.app.vault, this.data, () =>
			this.handleUpdate(),
		);

		this.statusBarItemEl = this.addStatusBarItem();
		this.updateStatusBar();

		this.registerEvent(
			this.app.vault.on("modify", (file) =>
				this.tracker.handleModify(file),
			),
		);

		this.registerEvent(
			this.app.vault.on("delete", (file) =>
				this.tracker.handleDelete(file),
			),
		);

		this.registerEvent(
			this.app.vault.on("rename", (file, oldPath) =>
				this.tracker.handleRename(file, oldPath),
			),
		);

		this.app.workspace.onLayoutReady(() => {
			this.registerEvent(
				this.app.vault.on("create", (file) =>
					this.tracker.handleCreate(file),
				),
			);
		});

		if (Object.keys(this.data.fileCounts).length === 0) {
			setTimeout(() => {
				void this.tracker.recalculateFileCounts();
			}, 0);
		}

		this.addCommand({
			id: "show-daily-character-count",
			name: "Show character count",
			callback: () => {
				const count = this.tracker.getTodayCount();
				new Notice(`${count} characters added today`);
			},
		});

		this.addCommand({
			id: "recalculate-file-counts",
			name: "Recalculate file counts",
			callback: async () => {
				await this.tracker.recalculateFileCounts();
				new Notice("File counts recalculated");
			},
		});

		this.addCommand({
			id: "reset-daily-count",
			name: "Reset daily count to zero",
			callback: () => {
				this.tracker.resetTodayCount();
				new Notice("Daily count reset to 0");
			},
		});

		this.addCommand({
			id: "recalculate-daily-count",
			name: "Recalculate daily count",
			callback: () => {
				this.tracker.recalculateTodayCount();
				const count = this.tracker.getTodayCount();
				new Notice(`Daily count recalculated: ${count} characters`);
			},
		});

		this.addSettingTab(new DailyCharacterCountSettingTab(this.app, this));
	}

	onunload() {
		if (this.saveTimeout) {
			clearTimeout(this.saveTimeout);
			this.saveTimeout = null;
		}
	}

	private handleUpdate(): void {
		this.updateStatusBar();
		this.debouncedSave();
	}

	private debouncedSave(): void {
		if (this.saveTimeout) {
			clearTimeout(this.saveTimeout);
		}
		this.saveTimeout = setTimeout(() => {
			this.saveTimeout = null;
			void this.saveData(this.data);
		}, 1000);
	}

	private updateStatusBar(): void {
		const count = this.tracker.getTodayCount();
		if (count >= this.data.dailyGoal) {
			this.statusBarItemEl.setText(`${count} chars today, great job 바봉이`);
		} else {
			this.statusBarItemEl.setText(`${count} chars today`);
		}
	}

	refreshStatusBar(): void {
		this.updateStatusBar();
	}
}

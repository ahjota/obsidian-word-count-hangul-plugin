import { Notice, Plugin, editorInfoField, TFile } from "obsidian";
import { EditorView, ViewUpdate } from "@codemirror/view";
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

		// Register editor extension for real-time character tracking across all editors
		this.registerEditorExtension(
			EditorView.updateListener.of((update) => {
				if (update.docChanged) {
					this.handleEditorUpdate(update);
				}
			}),
		);

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

		this.addSettingTab(new DailyCharacterCountSettingTab(this.app, this));
	}

	onunload() {
		if (this.saveTimeout) {
			clearTimeout(this.saveTimeout);
			this.saveTimeout = null;
		}
	}

	private handleEditorUpdate(update: ViewUpdate): void {
		// Get the file associated with this editor
		const file = this.getFileForEditor(update.view);
		if (!file || file.extension !== "md") return;

		this.checkDayRollover();

		// Get current content from editor
		const content = update.view.state.doc.toString();
		const newCount = this.tracker.countCharacters(content);

		// Get previous count for this file
		const oldCount = this.data.fileCounts[file.path] ?? 0;
		const delta = newCount - oldCount;

		// Update counts
		this.data.fileCounts[file.path] = newCount;
		this.data.todayCount += delta;

		if (this.data.todayCount < 0) {
			this.data.todayCount = 0;
		}

		this.updateStatusBar();
		this.debouncedSave();
	}

	private getFileForEditor(view: EditorView): TFile | null {
		// Try to get the file from the editor's state
		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
			const file = (view.state.field as any)(editorInfoField)?.file as TFile | null;
			if (file) return file;
		} catch {
			// Field not available, fallback below
		}

		// Fallback: try to get active file from workspace
		return this.app.workspace.getActiveFile();
	}

	private checkDayRollover(): void {
		const today = this.getTodayDate();
		if (this.data.todayDate !== today) {
			this.data.todayCount = 0;
			this.data.todayDate = today;
		}
	}

	private getTodayDate(): string {
		// obsidian provides moment.js, but that is overkill for this.
		// use luxon.js if you need to do more with dates.
		const now = new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
	}

	private handleUpdate(): void {
		this.updateStatusBar();
		this.debouncedSave();
	}

	private debouncedSave(): void {
		if (this.saveTimeout) {
			clearTimeout(this.saveTimeout);
		}
		// Increased delay for rapid typing to reduce disk I/O
		this.saveTimeout = setTimeout(() => {
			this.saveTimeout = null;
			void this.saveData(this.data);
		}, 2000);
	}

	private updateStatusBar(): void {
		const count = this.tracker.getTodayCount();
		if (count >= this.data.dailyGoal) {
			this.statusBarItemEl.setText(
				`${count} chars today, great job 바봉이`,
			);
		} else {
			this.statusBarItemEl.setText(`${count} chars today`);
		}
	}

	refreshStatusBar(): void {
		this.updateStatusBar();
	}
}

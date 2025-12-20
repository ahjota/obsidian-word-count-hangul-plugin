import { TAbstractFile, TFile, Vault } from "obsidian";
import { PluginData, getTodayDate } from "./storage";
import { countCharacters } from "./utils/counter";

export class CharacterTracker {
	private data: PluginData;
	private vault: Vault;
	private onUpdate: () => void;

	constructor(vault: Vault, data: PluginData, onUpdate: () => void) {
		this.vault = vault;
		this.data = data;
		this.onUpdate = onUpdate;
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
		}
	}

	async handleModify(file: TAbstractFile): Promise<void> {
		if (!(file instanceof TFile) || file.extension !== "md") return;
		this.checkDayRollover();

		let content: string;
		try {
			content = await this.vault.cachedRead(file);
		} catch {
			return;
		}

		const newCount = countCharacters(content);
		const oldCount = this.data.fileCounts[file.path] ?? 0;
		const delta = newCount - oldCount;

		this.data.fileCounts[file.path] = newCount;
		this.data.todayCount += delta;

		if (this.data.todayCount < 0) {
			this.data.todayCount = 0;
		}

		this.onUpdate();
	}

	handleDelete(file: TAbstractFile): void {
		if (!(file instanceof TFile) || file.extension !== "md") return;
		delete this.data.fileCounts[file.path];
		this.onUpdate();
	}

	handleRename(file: TAbstractFile, oldPath: string): void {
		if (!(file instanceof TFile)) return;

		const oldWasMd = oldPath.endsWith(".md");
		const newIsMd = file.extension === "md";

		if (oldWasMd && !newIsMd) {
			delete this.data.fileCounts[oldPath];
			this.onUpdate();
		} else if (!oldWasMd && newIsMd) {
			void this.handleCreate(file);
		} else if (oldWasMd && newIsMd) {
			const oldCount = this.data.fileCounts[oldPath];
			if (oldCount !== undefined) {
				this.data.fileCounts[file.path] = oldCount;
				delete this.data.fileCounts[oldPath];
				this.onUpdate();
			}
		}
	}

	async handleCreate(file: TAbstractFile): Promise<void> {
		if (!(file instanceof TFile) || file.extension !== "md") return;
		if (file.path in this.data.fileCounts) return;

		this.checkDayRollover();

		let content: string;
		try {
			content = await this.vault.cachedRead(file);
		} catch {
			return;
		}

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
			try {
				const content = await this.vault.cachedRead(file);
				this.data.fileCounts[file.path] = countCharacters(content);
			} catch {
				// File may have been deleted, skip it
			}
		}

		this.onUpdate();
	}

}

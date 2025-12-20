import {MarkdownView, Notice, Plugin} from 'obsidian';
import {countCharacters} from './utils/counter';

export default class KoreanCharacterCountPlugin extends Plugin {
	private statusBarItemEl: HTMLElement;

	async onload() {
		this.statusBarItemEl = this.addStatusBarItem();
		this.statusBarItemEl.setText('Characters: 0');

		this.registerEvent(
			this.app.workspace.on('editor-change', () => {
				this.updateCharacterCount();
			})
		);

		this.registerEvent(
			this.app.workspace.on('active-leaf-change', () => {
				this.updateCharacterCount();
			})
		);

		this.addCommand({
			id: 'show-character-count',
			name: 'Show character count',
			callback: () => {
				const count = this.getCurrentCharacterCount();
				new Notice(`Current document has ${count} characters`);
			}
		});

		this.updateCharacterCount();
	}

	onunload() {
	}

	private updateCharacterCount(): void {
		const count = this.getCurrentCharacterCount();
		this.statusBarItemEl.setText(`Characters: ${count}`);
	}

	private getCurrentCharacterCount(): number {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView) {
			return 0;
		}

		const editor = activeView.editor;
		const content = editor.getValue();
		return countCharacters(content);
	}
}

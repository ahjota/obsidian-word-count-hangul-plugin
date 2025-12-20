import { App, PluginSettingTab, Setting } from "obsidian";
import type DailyCharacterCountPlugin from "./main";

export class DailyCharacterCountSettingTab extends PluginSettingTab {
	plugin: DailyCharacterCountPlugin;

	constructor(app: App, plugin: DailyCharacterCountPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Daily goal")
			.setDesc("Daily character count goal")
			.addText((text) =>
				text
					.setPlaceholder("500")
					.setValue(String(this.plugin.data.dailyGoal))
					.onChange(async (value) => {
						const num = parseInt(value, 10);
						if (!isNaN(num) && num > 0) {
							this.plugin.data.dailyGoal = num;
							await this.plugin.saveData(this.plugin.data);
							this.plugin.refreshStatusBar();
						}
					})
			);
	}
}

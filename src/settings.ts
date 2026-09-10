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
					}),
			);

		new Setting(containerEl)
			.setName("Daily reset time")
			.setDesc("Hour of day (0-23) when daily stats reset (in your local timezone)")
			.addText((text) =>
				text
					.setPlaceholder("0")
					.setValue(String(this.plugin.data.dailyResetHour))
					.onChange(async (value) => {
						const num = parseInt(value, 10);
						if (!isNaN(num) && num >= 0 && num <= 23) {
							this.plugin.data.dailyResetHour = num;
							await this.plugin.saveData(this.plugin.data);
							this.plugin.refreshStatusBar();
						}
					}),
			);

		new Setting(containerEl)
			.setName("Feedback")
			.setDesc(
				"Report bugs or request features on GitHub. If you do not have a GitHub account, find the developer and insert cookie to continue.",
			)
			.addButton((button) =>
				button.setButtonText("Open issues").onClick(() => {
					window.open(
						"https://github.com/ahjota/obsidian-word-count-hangul-plugin/issues",
						"_blank",
					);
				}),
			);
	}
}

export interface FileSnapshot {
	[path: string]: number;
}

export interface DailyStats {
	date: string; // YYYY-MM-DD
	baselines: FileSnapshot;
}

export interface PluginData {
	stats: DailyStats;
}

export const DEFAULT_DATA: PluginData = {
	stats: {
		date: "",
		baselines: {}
	}
};

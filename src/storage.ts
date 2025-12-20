export interface PluginData {
	fileCounts: Record<string, number>;
	todayCount: number;
	todayDate: string;
}

export const DEFAULT_DATA: PluginData = {
	fileCounts: {},
	todayCount: 0,
	todayDate: getTodayDate(),
};

export function getTodayDate(): string {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function mergeData(saved: Partial<PluginData> | null): PluginData {
	const data: PluginData = {
		fileCounts: saved?.fileCounts ?? {},
		todayCount: saved?.todayCount ?? 0,
		todayDate: saved?.todayDate ?? getTodayDate(),
	};

	const today = getTodayDate();
	if (data.todayDate !== today) {
		data.todayCount = 0;
		data.todayDate = today;
	}

	return data;
}

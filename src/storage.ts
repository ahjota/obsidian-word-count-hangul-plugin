export interface PluginData {
	fileCounts: Record<string, number>;
	todayCount: number;
	todayDate: string;
	dailyGoal: number;
	dailyResetHour: number;  // Add this field
}

export function getTodayDate(resetHour: number = 0): string {
	const now = new Date();
	let checkDate = new Date(now);
	
	// Adjust the date based on reset hour
	// If current hour is before reset hour, we're still in "yesterday"
	if (now.getHours() < resetHour) {
		checkDate.setDate(checkDate.getDate() - 1);
	}
	
	return `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
}

export function mergeData(saved: Partial<PluginData> | null): PluginData {
	const data: PluginData = {
		fileCounts: saved?.fileCounts ?? {},
		todayCount: saved?.todayCount ?? 0,
		todayDate: saved?.todayDate ?? getTodayDate(),
		dailyGoal: saved?.dailyGoal ?? 500,
		dailyResetHour: saved?.dailyResetHour ?? 0,  // Add this line
	};

	const today = getTodayDate(data.dailyResetHour);
	if (data.todayDate !== today) {
		data.todayCount = 0;
		data.todayDate = today;
	}

	return data;
}

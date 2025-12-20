export function countCharacters(text: string): number {
	if (!text) return 0;
	
	// Simply count all characters including Korean syllables, English, spaces, and punctuation
	// Each character (including Korean syllable blocks) counts as 1
	let count = 0;
	for (const char of text) {
		count++;
	}
	
	return count;
}

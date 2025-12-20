# Character Count Test Results

## Test Cases

### Test 1: Korean Text
Text: "안녕하세요"
Expected: 5 characters
Actual: [To be tested in Obsidian]

### Test 2: English Text
Text: "Hello"
Expected: 5 characters
Actual: [To be tested in Obsidian]

### Test 3: Mixed Text
Text: "안녕 Hello!"
Expected: 9 characters (5 Korean + 1 space + 5 English + 1 punctuation = 12, but "Hello!" is 6)
Actually: "안녕 Hello!" = 2 Korean syllables + 1 space + 5 letters + 1 exclamation = 9 characters
Actual: [To be tested in Obsidian]

### Test 4: Spaces and Punctuation
Text: "   ... !!!"
Expected: 10 characters
Actual: [To be tested in Obsidian]

## Installation Instructions for Testing

1. Copy these files to your Obsidian vault:
   ```
   <YourVault>/.obsidian/plugins/word-count-hangul/
   ├── main.js
   ├── manifest.json
   └── styles.css
   ```

2. Reload Obsidian

3. Enable "Korean Character Count" plugin in Settings → Community plugins

4. Open a markdown file and type the test cases above

5. Check the status bar for "Characters: X"

6. Run command "Show character count" (Cmd/Ctrl+P)

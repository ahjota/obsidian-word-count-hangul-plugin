# Testing Guide: Daily Character Count Plugin

This document describes how to test the Daily Character Count plugin across different scenarios and environments.

## Quick Start: Manual Testing

### Prerequisites
- Obsidian vault created and opened
- Plugin built: `npm run build`
- Plugin installed in vault: `.obsidian/plugins/word-count-hangul/`

### Installation for Testing

1. **Copy build artifacts to vault:**
   ```bash
   # From the plugin project root
   mkdir -p ~/.obsidian/plugins/word-count-hangul
   cp main.js manifest.json styles.css ~/.obsidian/plugins/word-count-hangul/
   ```

2. **Reload Obsidian**
   - Use Cmd/Ctrl+P → "Reload app without saving"
   - Or restart Obsidian completely

3. **Enable the plugin**
   - Settings → Community plugins → Look for "Daily Character Count"
   - Toggle it on (or click the toggle if already visible)

4. **Verify installation**
   - You should see "0 chars today" in the status bar (bottom right)
   - Check Settings → Community plugins → Options (gear icon) for "Daily goal" setting

---

## Test Scenarios

### 1. Basic Character Counting

**Objective:** Verify the plugin correctly counts characters in real-time.

**Steps:**
1. Create a new markdown file
2. Type: `Hello`
3. Observe status bar → should show "5 chars today"
4. Add a space and type: `World`
5. Observe status bar → should show "11 chars today" (5 + 1 space + 5)

**Expected Behavior:**
- Status bar updates instantly as you type
- Count increases by 1 for each character typed
- Spaces and punctuation count as 1 character each

**Pass/Fail:** _____

---

### 2. Korean Text Support

**Objective:** Verify Korean characters (Hangul) are counted correctly.

**Steps:**
1. Create a new markdown file
2. Type: `안녕하세요` (5 Korean syllables)
3. Observe status bar → should show "5 chars today"
4. Add: ` World` (space + 5 English letters)
5. Observe status bar → should show "11 chars today"

**Expected Behavior:**
- Korean syllables count as 1 character each (not bytes)
- Mixed Korean/English text counts correctly
- Spacing is preserved

**Pass/Fail:** _____

---

### 3. Whitespace Trimming

**Objective:** Verify leading and trailing whitespace is excluded from counts.

**Steps:**
1. Create a new markdown file
2. Type: `   Hello   ` (3 spaces before, 3 spaces after, "Hello" in middle)
3. Observe status bar → should show "5 chars today"
4. Delete leading/trailing spaces, type normally
5. Confirm count remains "5 chars today"

**Expected Behavior:**
- Only content characters are counted
- Leading/trailing whitespace is trimmed
- Internal spaces count normally

**Pass/Fail:** _____

---

### 4. Multi-File Tracking

**Objective:** Verify character counts accumulate across multiple files edited in the same day.

**Steps:**
1. Create File A, type: `Hello` (5 chars)
2. Observe status bar → "5 chars today"
3. Create File B, type: `World` (5 chars)
4. Observe status bar → "10 chars today"
5. Switch back to File A, add: ` Test` (5 more chars)
6. Observe status bar → "15 chars today"

**Expected Behavior:**
- Each file contributes to the daily total
- Switching between files maintains accurate count
- Count is cumulative across all open files

**Pass/Fail:** _____

---

### 5. Daily Goal Achievement

**Objective:** Verify congratulations message appears when daily goal is reached.

**Steps:**
1. Go to Settings → Community plugins → "Daily Character Count" (gear icon)
2. Set "Daily goal" to 5
3. Create a new markdown file
4. Type: `Hello` (5 characters)
5. Observe status bar

**Expected Behavior:**
- Status bar shows: `5 chars today, great job 바봉이`
- Message only appears when count ≥ daily goal
- Count still updates normally after reaching goal

**Pass/Fail:** _____

---

### 6. File Operations

#### 6a. File Creation

**Steps:**
1. Create a new markdown file with content: `Test content`
2. Observe status bar

**Expected Behavior:**
- New file's content is counted immediately
- File appears in plugin's internal tracking

**Pass/Fail:** _____

#### 6b. File Deletion

**Steps:**
1. Create a file with: `Delete me` (9 chars)
2. Note the count in status bar
3. Delete the file from Obsidian
4. Observe status bar

**Expected Behavior:**
- Count is reduced by the deleted file's character count
- Deletion is handled gracefully (no errors)

**Pass/Fail:** _____

#### 6c. File Rename

**Steps:**
1. Create a file: `file1.md` with content `Hello`
2. Note count: 5 chars
3. Rename to `file2.md` (no content change)
4. Observe status bar and plugin data

**Expected Behavior:**
- Character count remains the same
- File is tracked under new name
- Old filename is no longer tracked

**Pass/Fail:** _____

#### 6d. Format Change (MD to non-MD)

**Steps:**
1. Create a file: `test.md` with `Hello`
2. Note count: 5 chars
3. Rename to `test.txt`
4. Observe status bar

**Expected Behavior:**
- Count decreases by 5 (file excluded from tracking)
- Only `.md` files are counted
- Can rename back to `.md` and count is restored

**Pass/Fail:** _____

---

### 7. Day Rollover

**Objective:** Verify counts reset at midnight.

**Steps:**
1. Create a file with: `Today's work` (12 chars, not counting trimmed spaces)
2. Note the count and system time
3. Change system clock to next day (or wait until midnight)
4. Return to Obsidian or reload the app
5. Observe status bar

**Expected Behavior:**
- After midnight, count resets to 0
- Previous day's data is not lost (stored in plugin data)
- New day starts fresh

**Pass/Fail:** _____

---

### 8. Session Persistence

**Objective:** Verify data persists across Obsidian restarts.

**Steps:**
1. Create a file with: `Persistent` (10 chars)
2. Note count: 10 chars today
3. Close Obsidian completely
4. Reopen Obsidian
5. Observe status bar

**Expected Behavior:**
- Count still shows "10 chars today"
- Data is loaded from saved state
- Plugin state is preserved

**Pass/Fail:** _____

---

### 9. Recalculation Command

**Objective:** Verify manual recalculation rebuilds file counts.

**Steps:**
1. Create two files:
   - File A: `Hello` (5 chars)
   - File B: `World` (5 chars)
2. Note count: 10 chars
3. Run command: Cmd/Ctrl+P → "Recalculate file counts"
4. Observe status bar and console

**Expected Behavior:**
- Command completes without error
- Count remains accurate (10 chars)
- Useful for fixing corrupted state
- No UI disruption during recalculation

**Pass/Fail:** _____

---

### 10. Show Count Command

**Objective:** Verify the "Show character count" command displays count correctly.

**Steps:**
1. Create a file with: `Test` (4 chars)
2. Run command: Cmd/Ctrl+P → "Show character count"
3. Observe notice popup

**Expected Behavior:**
- Notice displays: "4 characters added today"
- Notice appears at the top center of Obsidian
- Notice disappears after ~3 seconds (or on click)

**Pass/Fail:** _____

---

### 11. Settings Persistence

**Objective:** Verify daily goal setting is saved and restored.

**Steps:**
1. Go to Settings → Community plugins → "Daily Character Count"
2. Set "Daily goal" to 100
3. Close settings
4. Close and reopen Obsidian
5. Go back to settings

**Expected Behavior:**
- Daily goal shows 100 (not default 500)
- Setting persists across restarts
- Congratulations message triggers at 100+ chars

**Pass/Fail:** _____

---

### 12. Performance: Rapid Typing

**Objective:** Verify plugin handles rapid character input smoothly.

**Steps:**
1. Create a new markdown file
2. Hold down a key to rapidly type many characters (50+)
3. Observe status bar and Obsidian responsiveness

**Expected Behavior:**
- Status bar updates smoothly (may throttle updates)
- No noticeable lag or freezing
- All characters counted accurately
- No errors in developer console

**Pass/Fail:** _____

---

### 13. Empty Files

**Objective:** Verify empty files are handled correctly.

**Steps:**
1. Create a markdown file but leave it empty
2. Observe status bar
3. Add a space: ` `
4. Observe status bar

**Expected Behavior:**
- Empty file shows 0 chars
- Single space (after trimming) shows 0 chars
- File exists in tracking but contributes 0 to count

**Pass/Fail:** _____

---

## Automated Testing (Unit Tests)

Currently, the plugin does not have automated unit tests. To add testing infrastructure, see the [Unit Testing Setup](#unit-testing-setup) section below.

### Testing the Counter Function

The core counting logic is in `src/utils/counter.ts`:

```typescript
export function countCharacters(text: string): number {
  return text.trim().length;
}
```

**Manual verification:**
- `countCharacters("")` → 0
- `countCharacters("   ")` → 0 (trimmed)
- `countCharacters("Hello")` → 5
- `countCharacters("  Hello  ")` → 5 (trimmed)
- `countCharacters("안녕")` → 2
- `countCharacters("안녕 Hello")` → 8

---

## Unit Testing Setup

### Install Testing Framework

Choose one:

#### Option A: Vitest (Recommended for Vite-based projects)

```bash
npm install --save-dev vitest @vitest/ui happy-dom
```

#### Option B: Jest

```bash
npm install --save-dev jest @types/jest ts-jest
npx jest --init
```

### Example Test File

Create `src/utils/__tests__/counter.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { countCharacters } from "../counter";

describe("countCharacters", () => {
  it("counts simple English text", () => {
    expect(countCharacters("Hello")).toBe(5);
  });

  it("counts Korean text", () => {
    expect(countCharacters("안녕하세요")).toBe(5);
  });

  it("trims leading and trailing whitespace", () => {
    expect(countCharacters("   Hello   ")).toBe(5);
  });

  it("returns 0 for empty string", () => {
    expect(countCharacters("")).toBe(0);
  });

  it("returns 0 for whitespace only", () => {
    expect(countCharacters("   ")).toBe(0);
  });

  it("counts mixed Korean and English", () => {
    expect(countCharacters("안녕 Hello")).toBe(8);
  });

  it("preserves internal spaces", () => {
    expect(countCharacters("Hello World")).toBe(11);
  });
});
```

### Run Tests

```bash
# Vitest
npm test

# Jest
npm test
```

---

## Developer Console Testing

### Check Plugin State

Open Developer Console (Cmd/Ctrl+Shift+I) and run:

```javascript
// Check if plugin is loaded
console.log(app.plugins.getPlugin("word-count-hangul"));

// Check plugin data
const plugin = app.plugins.getPlugin("word-count-hangul");
console.log(plugin.data);

// Expected output:
// {
//   todayDate: "2026-05-06",
//   todayCount: 42,
//   dailyGoal: 500,
//   fileCounts: {
//     "path/to/file1.md": 15,
//     "path/to/file2.md": 27
//   }
// }
```

### Check Editor State

```javascript
// Get active editor
const editor = app.workspace.activeEditor?.editor;
console.log(editor?.getValue()); // Current content
console.log(editor?.getValue().trim().length); // Character count
```

---

## CI/CD Testing

### Build Verification

```bash
# TypeScript compilation
npm run build

# Should complete without errors
# Outputs: main.js, manifest.json, styles.css
```

### Linting

```bash
# Check code quality
npm run lint

# Should have 0 errors
```

### Pre-commit Testing

Check `.github/workflows/` for automated CI workflows.

---

## Debugging Tips

### Enable Debug Logging

Add to `src/main.ts`:

```typescript
// In onload()
console.log("[DailyCharacterCount] Plugin loaded", this.data);

// In handleEditorUpdate()
console.log("[DailyCharacterCount] Editor update:", { file: file.path, delta });
```

### Check Plugin Manifest

```bash
cat manifest.json
# Verify:
# - id: "word-count-hangul"
# - version matches package.json
# - minAppVersion is compatible
```

### Monitor File Events

```javascript
// In DevTools console
app.vault.on('create', (file) => console.log('Created:', file.path));
app.vault.on('modify', (file) => console.log('Modified:', file.path));
app.vault.on('delete', (file) => console.log('Deleted:', file.path));
app.vault.on('rename', (file, oldPath) => console.log('Renamed:', oldPath, '→', file.path));
```

---

## Known Limitations & Edge Cases

1. **Network files**: Obsidian does not support network-mounted vaults reliably. Test on local vault only.
2. **Very large files**: Performance may degrade with files >10MB. Test with realistic file sizes.
3. **Symbolic links**: Obsidian treats symlinked files as separate; may double-count. Avoid symlinking vault files.
4. **Special characters**: CJK (Chinese, Japanese, Korean) characters count as 1 each. Emoji behavior depends on Obsidian's handling.
5. **YAML frontmatter**: Currently counted as regular characters. If this should be excluded, modify `counter.ts`.

---

## Test Coverage Checklist

Use this checklist to track testing progress:

```markdown
## Character Counting
- [ ] English text
- [ ] Korean text (Hangul)
- [ ] Mixed text
- [ ] Whitespace trimming
- [ ] Empty strings
- [ ] Punctuation

## Multi-File
- [ ] Multiple open files
- [ ] File creation
- [ ] File deletion
- [ ] File rename (same extension)
- [ ] File format change (.md to .txt)

## Daily Cycle
- [ ] Day rollover at midnight
- [ ] Data persistence across restarts
- [ ] Daily goal display

## UI/Commands
- [ ] Status bar updates
- [ ] Congratulations message
- [ ] "Show character count" command
- [ ] "Recalculate file counts" command
- [ ] Settings save/load

## Performance
- [ ] Rapid typing (no lag)
- [ ] Large file edits
- [ ] Many open files
- [ ] Long sessions (memory usage)

## Edge Cases
- [ ] No files created yet
- [ ] All files deleted
- [ ] System clock manipulation
- [ ] Large undo/redo chains
```

---

## Submitting Test Results

When reporting issues or submitting PRs, include:

1. **Environment**
   - Obsidian version: `Settings → About`
   - OS: macOS / Windows / Linux
   - Plugin version: Check `manifest.json`

2. **Steps to Reproduce**
   - Exact actions taken
   - File content (if applicable)
   - Expected vs. actual behavior

3. **Logs**
   - Developer console output
   - Plugin data state (see [Developer Console Testing](#developer-console-testing))

4. **Test Cases**
   - Which tests from this guide passed/failed
   - Any new edge cases discovered

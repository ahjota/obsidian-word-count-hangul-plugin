#!/bin/sh
# Copy built plugin artifacts (main.js, manifest.json, styles.css)
# into an Obsidian vault's plugin folder.
#
# Usage:
#   ./scripts/copy-to-vault.sh                         # auto-discover, pick
#   OBSIDIAN_VAULT_PATH=/path/to/vault ./scripts/copy-to-vault.sh
#
# Vault discovery reads ~/Library/Application Support/obsidian/obsidian.json
# (macOS). If OBSIDIAN_VAULT_PATH is set, it is used directly.
#
# The plugin folder must already exist at:
#   <vault>/.obsidian/plugins/word-count-hangul/
#
# This script does NOT build. Run the build in the devcontainer first,
# then run this script on the host to copy artifacts into your vault.
#
# Requires: sh, cp, grep, sed, mkdir, ls. Uses jq if available for
# robust JSON parsing; falls back to grep/sed extraction otherwise.

set -eu

PLUGIN_ID="word-count-hangul"
ARTIFACTS="main.js manifest.json styles.css"
CONFIG_PATH="${HOME}/Library/Application Support/obsidian/obsidian.json"

repo_root=$(pwd)
vault_path=""

# ── Vault path resolution ────────────────────────────────────────────

# Extract vault paths from obsidian.json.
# Uses jq if available, otherwise falls back to grep/sed.
# Outputs one path per line, most recently opened first.
discover_vaults() {
    [ -f "$CONFIG_PATH" ] || return 0

    if command -v jq >/dev/null 2>&1; then
        jq -r '
            .vaults | to_entries
            | map(.value.path as $p | {path: $p, ts: (.value.ts // 0)})
            | sort_by(.ts) | reverse
            | .[].path
        ' "$CONFIG_PATH" 2>/dev/null || return 0
    else
        # Fallback: extract "path":"..." values via grep/sed.
        # This is fragile but works for the simple obsidian.json format.
        grep -o '"path":"[^"]*"' "$CONFIG_PATH" 2>/dev/null \
            | sed 's/"path":"//; s/"//' || return 0
    fi
}

# Filter to only existing paths, collect into a list.
# Returns newline-separated paths in $VAULT_LIST and count in $VAULT_COUNT.
gather_existing_vaults() {
    VAULT_LIST=""
    VAULT_COUNT=0

    raw_vaults=$(discover_vaults)
    [ -z "$raw_vaults" ] && return 0

    # If jq is available, paths are already sorted by ts desc.
    # If not, we just take them in file order.
    for path in $raw_vaults; do
        if [ -d "$path" ]; then
            if [ -z "$VAULT_LIST" ]; then
                VAULT_LIST="$path"
            else
                VAULT_LIST="$VAULT_LIST
$path"
            fi
            VAULT_COUNT=$((VAULT_COUNT + 1))
        fi
    done
}

resolve_vault_path() {
    # 1. Env var override
    if [ -n "${OBSIDIAN_VAULT_PATH:-}" ]; then
        if [ ! -d "$OBSIDIAN_VAULT_PATH" ]; then
            echo "Error: OBSIDIAN_VAULT_PATH does not exist: $OBSIDIAN_VAULT_PATH" >&2
            exit 1
        fi
        vault_path="$OBSIDIAN_VAULT_PATH"
        return
    fi

    # 2. Auto-discover from Obsidian config
    gather_existing_vaults

    if [ "$VAULT_COUNT" -eq 0 ]; then
        echo "Error: could not discover any Obsidian vaults." >&2
        echo "Set OBSIDIAN_VAULT_PATH manually, e.g.:" >&2
        echo "  OBSIDIAN_VAULT_PATH=/path/to/vault $0" >&2
        exit 1
    fi

    if [ "$VAULT_COUNT" -eq 1 ]; then
        vault_path="$VAULT_LIST"
        return
    fi

    # 3. Multiple vaults — let user pick
    printf "Multiple Obsidian vaults found:\n\n"
    idx=0
    # Use a subshell to iterate over newline-separated list
    echo "$VAULT_LIST" | while IFS= read -r path; do
        idx=$((idx + 1))
        marker=""
        if [ -d "$path/.obsidian/plugins/$PLUGIN_ID" ]; then
            marker=" (plugin folder exists)"
        fi
        printf "  %d. %s%s\n" "$idx" "$path" "$marker"
    done
    printf "\n"

    printf "Pick a vault (number): "
    read -r selection

    # Validate selection
    case "$selection" in
        ''|*[!0-9]*)
            echo "Error: invalid selection." >&2
            exit 1
            ;;
    esac

    if [ "$selection" -lt 1 ] || [ "$selection" -gt "$VAULT_COUNT" ]; then
        echo "Error: selection out of range." >&2
        exit 1
    fi

    # Extract the selected vault path
    vault_path=$(echo "$VAULT_LIST" | sed -n "${selection}p")
}

# ── Main ─────────────────────────────────────────────────────────────

resolve_vault_path

printf "\nTarget vault: %s\n" "$vault_path"

plugin_dir="$vault_path/.obsidian/plugins/$PLUGIN_ID"

if [ ! -d "$plugin_dir" ]; then
    echo "Error: plugin folder does not exist:" >&2
    echo "  $plugin_dir" >&2
    echo "Create it first, e.g.:" >&2
    echo "  mkdir -p \"$plugin_dir\"" >&2
    exit 1
fi

copied=0
skipped=0

for artifact in $ARTIFACTS; do
    src="$repo_root/$artifact"

    if [ ! -f "$src" ]; then
        echo "  skip: $artifact not found at repo root"
        skipped=$((skipped + 1))
        continue
    fi

    dest="$plugin_dir/$artifact"
    cp "$src" "$dest"
    printf "  copied: %s -> %s\n" "$artifact" "$dest"
    copied=$((copied + 1))
done

if [ "$copied" -eq 0 ]; then
    echo "Error: no artifacts were copied. Run the build first." >&2
    exit 1
fi

printf "\nDone: %d file(s) copied, %d skipped.\n" "$copied" "$skipped"
echo "Reload Obsidian and enable the plugin in Settings → Community plugins."

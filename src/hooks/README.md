# Gen Z Hooks

These hooks are bundled with the Gen Z plugin and installed by `bin/install.js`
for Claude Code when standalone hook wiring is enabled.

## Files

| File | Purpose |
|---|---|
| `genz-activate.js` | SessionStart hook. Writes `.genz-active` and injects the full ruleset. |
| `genz-mode-tracker.js` | UserPromptSubmit hook. Tracks `/genz*` commands and reinforces active mode. |
| `genz-stats.js` | Reads Claude Code session logs and prints real token usage/savings. |
| `genz-config.js` | Shared config, symlink-safe flag IO, and history helpers. |

## Modes

`genz-config.js` accepts:

- `off`
- `lite`
- `full`
- `max`
- `commit`
- `review`
- `compress`

Only `lite`, `full`, and `max` receive per-turn style reinforcement. The
one-shot modes have their own skills and should not inherit base Gen Z wording.

## Commands

| Command | Hook behavior |
|---|---|
| `/genz` | activate configured default |
| `/genz lite` | activate lite |
| `/genz full` | activate full |
| `/genz max` | activate max |
| `/genz off` | remove active flag |
| `/genz-commit` | mark commit helper mode |
| `/genz-review` | mark review helper mode |
| `/genz-compress` | mark compress helper mode |
| `/genz-stats` | block prompt and return stats output |

Natural language triggers include "talk like Gen Z", "turn on genz",
"stop genz", and "normal mode".

## State Files

Default base: `$CLAUDE_CONFIG_DIR` or `~/.claude`.

| File | Purpose |
|---|---|
| `.genz-active` | current mode |
| `.genz-history.jsonl` | stats snapshots |
| `.genz-statusline-suffix` | compact lifetime savings suffix |

All predictable writes go through `safeWriteFlag()` or `appendFlag()` to avoid
symlink-clobber issues.

## Install

```bash
node bin/install.js --only claude --with-hooks
```

## Uninstall

```bash
node bin/install.js --uninstall
```

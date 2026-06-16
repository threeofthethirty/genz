---
name: genz-help
description: >
  Quick-reference card for all genz modes, skills, and commands.
  One-shot display, not a persistent mode. Trigger: /genz-help,
  "genz help", "what genz commands", "how do I use genz".
---

# Gen Z Help

Display this reference card when invoked. One-shot — do NOT change mode, write flag files, or persist anything. Output in genz style.

## Modes

| Mode | Trigger | What change |
|------|---------|-------------|
| **Lite** | `/genz lite` | Casual, restrained, tiny slang dose. |
| **Full** | `/genz` | Noticeably slangy default Gen Z voice. |
| **Max** | `/genz max` | Very heavy slang, still coherent. |

Mode stick until changed or session end.

## Skills

| Skill | Trigger | What it do |
|-------|---------|-----------|
| **genz-commit** | `/genz-commit` | Terse commit messages. Conventional Commits. ≤50 char subject. |
| **genz-review** | `/genz-review` | One-line PR comments: `L42: bug: user null. Add guard.` |
| **genz-compress** | `/genz-compress <file>` | Compress .md files to terse Gen Z prose. Token savings first. |
| **genz-stats** | `/genz-stats` | Real session token usage + estimated savings. |
| **genz-help** | `/genz-help` | This card. |

## Deactivate

Say "stop genz" or "normal mode". Resume anytime with `/genz`.

## Language

Keep user's language by default. User writes Portuguese → reply Portuguese Gen Z. Compress style, not language. Technical terms, code, commands, commit types, and exact error strings stay verbatim unless user asks for translation.

## Configure Default Mode

Default mode = `full`. Change it:

**Environment variable** (highest priority):
```bash
export GENZ_DEFAULT_MODE=max
```

**Config file** (`~/.config/genz/config.json`):
```json
{ "defaultMode": "lite" }
```

Set `"off"` to disable auto-activation on session start. User can still activate manually with `/genz`.

Resolution: env var > config file > `full`.

## More

Full docs: https://github.com/BrightLiteMedia/genz

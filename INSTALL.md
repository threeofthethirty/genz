# Install genz

`genz` installs a concise Gen Z communication mode for AI coding agents.
Goal: natural Gen Z voice, technical accuracy, low token use.

## Quick Install

Local clone:

```bash
node bin/install.js
```

Remote install:

```bash
npx -y github:jasonelguapo/genz -- --only claude
```

Dry run:

```bash
node bin/install.js --dry-run --list
```

## Main Commands

| Command | What |
|---|---|
| `/genz` | Activate default `full` mode |
| `/genz lite` | Restrained, professional Gen Z voice |
| `/genz full` | Noticeably slangy default Gen Z voice |
| `/genz max` | Very heavy slang, still coherent |
| `/genz off` | Deactivate |
| `/genz-commit` | Terse Conventional Commit message |
| `/genz-review` | One-line review findings |
| `/genz-compress <file>` | Compress markdown/text memory files |
| `/genz-stats` | Real token usage and estimated savings |
| `/genz-help` | Quick reference |

Natural language also works: "talk like Gen Z", "turn on genz", "stop genz",
or "normal mode".

## Supported Agents

The installer detects common tools and installs the best available integration.

```bash
node bin/install.js --list
node bin/install.js --only claude
node bin/install.js --only opencode
node bin/install.js --only codex
```

For agents installed through the Skills CLI, use:

```bash
npx skills add jasonelguapo/genz -a codex
```

Replace `codex` with the target profile.

## Claude Code

Claude Code gets:

- plugin install when available
- `genz-activate.js`
- `genz-mode-tracker.js`
- `genz-stats.js`
- `genz-config.js`

The hooks store state in `$CLAUDE_CONFIG_DIR/.genz-active` and reinforce the
mode each turn. `/genz-stats` reads the active session log and reports real
usage.

## opencode

opencode gets:

- native plugin files
- `genz` commands
- `genz` skills
- `AGENTS.md` bootstrap text
- `opencode.json` plugin entry

## Always-On Repo Rule

Write per-repo rule files for Cursor, Windsurf, Cline, Copilot, opencode, and
`AGENTS.md`:

```bash
node src/tools/genz-init.js --dry-run
node src/tools/genz-init.js --force
```

The source rule is [src/rules/genz-activate.md](/Users/jasonelguapo/Documents/Projects/genz/src/rules/genz-activate.md).

## Configuration

Default mode resolution:

1. `GENZ_DEFAULT_MODE`
2. repo config: `.genz/config.json` or `.genz.json`
3. user config: `~/.config/genz/config.json`
4. `full`

Example:

```json
{ "defaultMode": "lite" }
```

Valid values: `off`, `lite`, `full`, `max`.

## Uninstall

```bash
node bin/install.js --uninstall
```

This removes Gen Z hook files, installer-managed settings, opencode plugin
files, and generated rule blocks where the installer owns them.

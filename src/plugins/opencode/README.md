# genz opencode plugin

Native opencode integration for Gen Z mode.

## Installed Layout

The installer copies:

| Source | Target |
|---|---|
| `src/plugins/opencode/commands/genz*.md` | `~/.config/opencode/commands/` |
| `skills/genz*/` | `~/.config/opencode/skills/` |
| plugin runtime | `~/.config/opencode/plugins/genz/` |
| bootstrap rules | `~/.config/opencode/AGENTS.md` |

It also patches `~/.config/opencode/opencode.json` with the plugin entry.

## Behavior

- session start activates the configured Gen Z default
- prompt hook detects `/genz`, `/genz lite`, `/genz full`, `/genz max`, and
  `/genz off`
- helper commands route to `genz-commit`, `genz-review`, `genz-compress`,
  `genz-stats`, and `genz-help`
- bootstrap text keeps token-minimal Gen Z behavior visible to the model

opencode does not expose a plugin-writable statusline, so no badge is shown.

## Design Rule

Token savings first. Slang is allowed only when it adds signal or requested
tone without making the answer longer or less clear.

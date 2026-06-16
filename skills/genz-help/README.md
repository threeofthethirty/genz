# genz-help

Quick-reference card. One shot, no mode change.

## What it does

Prints a cheat sheet of all genz modes, sibling skills, deactivation triggers, and how to set the default mode via env var or config file. One-shot display — does not flip the active mode, write flag files, or persist anything. Use when you forget the slash commands.

## How to invoke

```
/genz-help
```

Also triggers on "genz help", "what genz commands", "how do I use genz".

## Example output

```
Modes:
  /genz              full (default)
  /genz lite         lighter
  /genz max          heavier slang

Skills:
  /genz-commit       terse Conventional Commits
  /genz-review       one-line PR comments
  /genz-compress     compress markdown/text memory
  /genz-stats        session token savings

Deactivate:
  "stop genz" or "normal mode"
```

## See also

- [`SKILL.md`](./SKILL.md) — full reference card
- [Gen Z README](../../README.md) — repo overview

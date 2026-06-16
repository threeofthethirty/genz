# genz Maintainer Notes

`genz` is an AI-agent skill suite for concise Gen Z communication.

Core principle: **low token use first, Gen Z voice second, technical accuracy
always.**

## Active Product Surface

| Area | Source |
|---|---|
| Base mode | `skills/genz/SKILL.md` |
| Commit helper | `skills/genz-commit/SKILL.md` |
| Review helper | `skills/genz-review/SKILL.md` |
| Markdown compression | `skills/genz-compress/SKILL.md` |
| Compression scripts | `skills/genz-compress/scripts/` |
| Stats hook | `src/hooks/genz-stats.js` |
| Mode hooks | `src/hooks/genz-activate.js`, `src/hooks/genz-mode-tracker.js` |
| Config helpers | `src/hooks/genz-config.js` |
| Per-repo rule writer | `src/tools/genz-init.js` |
| Per-repo rule body | `src/rules/genz-activate.md` |
| opencode commands | `src/plugins/opencode/commands/genz*.md` |
| Installer | `bin/install.js` |

Legacy pre-migration paths are compatibility surfaces during migration. Do not add
new behavior there unless the same change is implemented in the active `genz*`
surface.

## Commands

| Command | Behavior |
|---|---|
| `/genz` | activate default `full` mode |
| `/genz lite` | restrained casual voice |
| `/genz full` | noticeably slangy default Gen Z voice |
| `/genz max` | very heavy slang, still clear |
| `/genz off` | deactivate |
| `/genz-commit` | formal terse Conventional Commit message |
| `/genz-review` | one-line actionable review findings |
| `/genz-compress <file>` | compress markdown/text memory files |
| `/genz-stats` | read real Claude Code token usage |
| `/genz-help` | quick reference |

## Runtime Model

Claude Code hooks:

1. `genz-activate.js` runs at session start, writes `.genz-active`, and injects
   the full skill rules.
2. `genz-mode-tracker.js` watches user prompts for `/genz*` commands and
   natural-language activation/deactivation.
3. `genz-stats.js` handles `/genz-stats` by reading the active JSONL session
   log and returning formatted usage.

Mode state lives in `$CLAUDE_CONFIG_DIR/.genz-active`.

Stats history lives in `$CLAUDE_CONFIG_DIR/.genz-history.jsonl`.

All predictable writes must use `safeWriteFlag()` or `appendFlag()` from
`genz-config.js`.

## Compression Rules

`genz-compress` may rewrite prose only. It must preserve exactly:

- fenced code blocks
- inline code
- URLs
- file paths
- commands
- headings
- markdown structure
- YAML frontmatter
- dates, versions, and numeric values

It must refuse source/config/secret files and `*.original.md` backups.

## Voice Rules

- Open direct.
- Keep output concise.
- Use common slang only when natural and useful.
- Do not add slang as decoration.
- Keep technical names exact.
- Drop Gen Z style for security, legal, medical, financial, destructive,
  commit, PR, changelog, and formal-doc contexts.

## Install Notes

Local:

```bash
node bin/install.js
```

List targets:

```bash
node bin/install.js --list
```

Always-on repo rules:

```bash
node src/tools/genz-init.js --dry-run
node src/tools/genz-init.js --force
```

## Checks

Focused checks:

```bash
node tests/test_genz_init.js
python3 -m compileall skills/genz-compress/scripts
node -e "require('./src/hooks/genz-config'); require('./src/hooks/genz-stats'); require('./src/tools/genz-init'); console.log('ok')"
```

Full suite:

```bash
npm test
```

Some installer tests may still name legacy compatibility paths until migration
is complete. Update tests alongside any renamed runtime surface.

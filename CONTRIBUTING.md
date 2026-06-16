# Contributing

`genz` is a token-minimal Gen Z communication mode for AI coding agents.
Keep contributions focused on three things:

- accurate Gen Z wording
- low token use
- exact technical preservation

## Source Of Truth

| Area | Edit |
|---|---|
| Base mode | `skills/genz/SKILL.md` |
| Commit helper | `skills/genz-commit/SKILL.md` |
| Review helper | `skills/genz-review/SKILL.md` |
| File compression | `skills/genz-compress/SKILL.md` and `skills/genz-compress/scripts/` |
| Stats | `src/hooks/genz-stats.js` |
| Hooks | `src/hooks/genz-*.js` |
| Per-repo rule | `src/rules/genz-activate.md` |
| Installer | `bin/install.js` |
| opencode commands | `src/plugins/opencode/commands/genz*.md` |

Legacy pre-migration files may still exist during migration. Do not add new
features there. Add or update the `genz*` equivalent instead.

## Style Rules

- Token savings first.
- Use slang only when it adds signal or tone without bloating output.
- Keep code, commands, API names, env vars, paths, and exact errors unchanged.
- Drop Gen Z voice for security, legal, medical, financial, destructive,
  commit, PR, changelog, and formal-doc contexts.
- Keep docs concrete. Avoid marketing filler.

## Checks

Run the focused checks before opening a PR:

```bash
node tests/test_genz_init.js
python3 -m compileall skills/genz-compress/scripts
node -e "require('./src/hooks/genz-config'); require('./src/hooks/genz-stats'); require('./src/tools/genz-init'); console.log('ok')"
```

Run full installer tests when changing `bin/install.js` or integrations:

```bash
npm test
```

Some legacy tests may still reference old names until the migration is
fully complete. Update those tests when moving a surface to Gen Z.

## Slang Index

Refresh local slang data:

```bash
node scripts/pull-genz-dictionary.mjs
```

Use indexed meanings. Do not invent or guess slang meanings.

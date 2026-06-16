# genz

AI agent skill that makes replies sound like natural Gen Z communication while
keeping technical accuracy intact.

The skill ships with a local slang reference index generated from:

https://www.generationzslang.com/the-complete-gen-z-slang-dictionary/

## Install

```bash
# local clone
bash install.sh

# or with Node directly
node bin/install.js
```

Trigger it with `/genz` or say `talk like Gen Z`.

Stop with `normal mode` or `stop genz`.

## Modes

| Command | Behavior |
|---|---|
| `/genz lite` | Casual but restrained |
| `/genz full` | Noticeably slangy default Gen Z voice |
| `/genz max` | Very heavy slang for examples, captions, and social copy |

## Sibling Skills

| Command | Behavior |
|---|---|
| `/genz-commit` | Terse Conventional Commit message |
| `/genz-review` | One-line review findings |
| `/genz-compress <file>` | Compress markdown/text memory files |
| `/genz-stats` | Real session token usage and estimated savings |
| `/genz-help` | Quick reference |

## Slang Index

The generated index lives at:

```text
skills/genz/data/genz-slang-index.json
```

Refresh it from the source page:

```bash
node scripts/pull-genz-dictionary.mjs
```

Push the same index into Firebase Firestore:

```bash
FIREBASE_PROJECT_ID="your-project" \
FIREBASE_AUTH_TOKEN="$(gcloud auth print-access-token)" \
node scripts/pull-genz-dictionary.mjs --firebase
```

Optional: set `FIREBASE_COLLECTION`, default `genz_slang`.

## Guardrails

The skill keeps code, commands, exact errors, security warnings, legal/medical/
financial guidance, destructive confirmations, commits, PRs, changelogs, and
formal docs in normal clear language.

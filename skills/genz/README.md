# genz

Gen Z communication mode for AI agents.

Use `/genz` or say "talk like Gen Z" to switch replies into a casual Gen Z voice.
The skill uses a local slang index generated from the public Gen Z slang
dictionary source, so terms like `no cap`, `bet`, `mid`, `rizz`, `valid`, and
`W` are used with the right meaning.

## Modes

| Mode | Use |
|---|---|
| `/genz lite` | Casual but still professional |
| `/genz full` | Noticeably slangy default Gen Z voice |
| `/genz max` | Very heavy slang for captions, examples, and social copy |

Stop with `normal mode` or `stop genz`.

## Refresh the Dictionary

```bash
node scripts/pull-genz-dictionary.mjs
```

To also push the index into Firebase Firestore:

```bash
FIREBASE_PROJECT_ID="your-project" \
FIREBASE_AUTH_TOKEN="$(gcloud auth print-access-token)" \
node scripts/pull-genz-dictionary.mjs --firebase
```

Optional: set `FIREBASE_COLLECTION`, default `genz_slang`.

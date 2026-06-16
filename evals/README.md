# Gen Z Evals

Evals measure token savings and quality for `genz` skills.

## Goals

- compare normal output vs Gen Z low-token output
- track response-token savings
- verify code, paths, commands, URLs, and exact errors stay unchanged
- catch slang misuse or overuse

## Run

```bash
uv run python evals/measure.py
```

LLM-backed run:

```bash
GENZ_EVAL_MODEL=claude-haiku-4-5 uv run python evals/llm_run.py
```

## Inputs

Prompts live in `evals/prompts/`.

Snapshots live in `evals/snapshots/`.

## What Good Looks Like

- shorter than baseline
- technically equivalent
- no decorative slang padding
- no slang in code blocks, commands, formal docs, or safety-sensitive text

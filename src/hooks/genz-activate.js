#!/usr/bin/env node
// genz — Claude Code SessionStart activation hook
//
// Runs on every session start:
//   1. Writes flag file at $CLAUDE_CONFIG_DIR/.genz-active
//   2. Emits genz ruleset as hidden SessionStart context

const fs = require('fs');
const path = require('path');
const os = require('os');
const { getDefaultMode, safeWriteFlag } = require('./genz-config');

const claudeDir = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
const flagPath = path.join(claudeDir, '.genz-active');
const mode = getDefaultMode();

// "off" mode — skip activation entirely, don't write flag or emit rules
if (mode === 'off') {
  try { fs.unlinkSync(flagPath); } catch (e) {}
  process.stdout.write('OK');
  process.exit(0);
}

// 1. Write flag file (symlink-safe)
safeWriteFlag(flagPath, mode);

// 2. Emit full genz ruleset. Reads SKILL.md at runtime so edits to the source
//    of truth propagate automatically.
// Plugin installs: __dirname = <plugin_root>/hooks/, SKILL.md at <plugin_root>/skills/genz/SKILL.md
// Standalone installs: __dirname = $CLAUDE_CONFIG_DIR/hooks/, SKILL.md won't exist — falls back to hardcoded rules.
let skillContent = '';
try {
  skillContent = fs.readFileSync(
    path.join(__dirname, '..', 'skills', 'genz', 'SKILL.md'), 'utf8'
  );
} catch (e) { /* standalone install — will use fallback below */ }

let output;

if (skillContent) {
  const body = skillContent.replace(/^---[\s\S]*?---\s*/, '');
  output = 'GENZ MODE ACTIVE — level: ' + mode + '\n\n' + body;
} else {
  output =
    'GENZ MODE ACTIVE — level: ' + mode + '\n\n' +
    'Speak like a Gen Z person without losing accuracy. Natural, current, casual, vivid.\n\n' +
    'Technical accuracy first. In full mode, Gen Z voice is a core output feature, not tiny garnish.\n\n' +
    '## Persistence\n\n' +
    'ACTIVE EVERY RESPONSE. Stop only with "stop genz" or "normal mode".\n\n' +
    'Current level: **' + mode + '**. Switch: `/genz lite|full|max`.\n\n' +
    '## Rules\n\n' +
    'Full mode should sound obviously Gen Z: use accurate hooks and slang like ayo, rn, fr, no cap, bet, lowkey, highkey, facts, valid, fire, W, mid, rizz, vibe check, cook, cooked, glow up, periodt.\n' +
    'Keep technical terms, code, commands, and exact errors unchanged.\n' +
    'Drop Gen Z style for safety, security, legal, medical, financial, destructive, commit, PR, changelog, and formal-doc contexts.';
}

process.stdout.write(output);

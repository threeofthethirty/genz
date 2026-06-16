#!/usr/bin/env node
// genz — UserPromptSubmit hook to track which genz mode is active
// Inspects user input for /genz commands and writes mode to flag file

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const { getDefaultMode, safeWriteFlag, readFlag, VALID_MODES } = require('./genz-config');

// Modes handled by their own slash commands; base /genz reinforcement should
// not override these one-shot skills.
const INDEPENDENT_MODES = new Set(['commit', 'review', 'compress']);

const claudeDir = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
const flagPath = path.join(claudeDir, '.genz-active');

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const prompt = (data.prompt || '').trim().toLowerCase();

    // Natural language activation.
    if (/\b(activate|enable|turn on|start|talk like)\b.*\bgenz\b/i.test(prompt) ||
        /\bgenz\b.*\b(mode|activate|enable|turn on|start)\b/i.test(prompt) ||
        /\bgen z\b.*\b(mode|voice|slang)\b/i.test(prompt) ||
        /\b(talk|speak|write)\b.*\bgen z\b/i.test(prompt)) {
      if (!/\b(stop|disable|turn off|deactivate)\b/i.test(prompt)) {
        const mode = getDefaultMode();
        if (mode !== 'off') {
          safeWriteFlag(flagPath, mode);
        }
      }
    }

    // /genz-stats [--share|--all|--since Nd/Nh] — block prompt and inject
    // real stats from active session log.
    const statsMatch = /^\/genz(?::genz)?-stats(?:\s+(.*))?$/.exec(prompt);
    if (statsMatch) {
      const tailArgs = (statsMatch[1] || '').trim().split(/\s+/).filter(Boolean);
      try {
        const statsPath = path.join(__dirname, 'genz-stats.js');
        const argv = [statsPath];
        if (data.transcript_path) argv.push('--session-file', data.transcript_path);
        if (tailArgs.includes('--share')) argv.push('--share');
        if (tailArgs.includes('--all')) argv.push('--all');
        const sinceIdx = tailArgs.indexOf('--since');
        if (sinceIdx !== -1 && tailArgs[sinceIdx + 1]) {
          argv.push('--since', tailArgs[sinceIdx + 1]);
        }
        const out = execFileSync(process.execPath, argv, { encoding: 'utf8', timeout: 5000 });
        process.stdout.write(JSON.stringify({ decision: 'block', reason: out.trim() }));
      } catch (e) {
        process.stdout.write(JSON.stringify({
          decision: 'block',
          reason: 'genz-stats: could not run stats script.\nTry manually: node hooks/genz-stats.js'
        }));
      }
      return;
    }

    // Match /genz commands
    if (prompt.startsWith('/genz')) {
      const parts = prompt.split(/\s+/);
      const cmd = parts[0];
      const arg = parts[1] || '';

      let mode = null;

      if (cmd === '/genz-commit') {
        mode = 'commit';
      } else if (cmd === '/genz-review') {
        mode = 'review';
      } else if (cmd === '/genz-compress' || cmd === '/genz:genz-compress') {
        mode = 'compress';
      } else if (cmd === '/genz' || cmd === '/genz:genz') {
        // Bare /genz → activate at configured default
        if (!arg) {
          mode = getDefaultMode();
        } else if (arg === 'off' || arg === 'stop' || arg === 'disable') {
          mode = 'off';
        } else if (VALID_MODES.includes(arg)) {
          mode = arg;
        }
        // Unknown arg → mode stays null, flag untouched (no silent overwrite)
      }

      if (mode && mode !== 'off') {
        safeWriteFlag(flagPath, mode);
      } else if (mode === 'off') {
        try { fs.unlinkSync(flagPath); } catch (e) {}
      }
    }

    // Detect deactivation — natural language and slash commands
    if (/\b(stop|disable|deactivate|turn off)\b.*\bgenz\b/i.test(prompt) ||
        /\bgenz\b.*\b(stop|disable|deactivate|turn off)\b/i.test(prompt) ||
        /\b(stop|disable|deactivate|turn off)\b.*\bgen z\b/i.test(prompt) ||
        /\bnormal mode\b/i.test(prompt)) {
      try { fs.unlinkSync(flagPath); } catch (e) {}
    }

    // Per-turn reinforcement: emit a structured reminder when genz is active.
    // The SessionStart hook injects the full ruleset once, but models lose it
    // when other plugins inject competing style instructions every turn.
    // This keeps genz visible in the model's attention on every user message.
    //
    // readFlag enforces symlink-safe read + size cap + VALID_MODES whitelist.
    // If the flag is missing, corrupted, oversized, or a symlink pointing at
    // something like ~/.ssh/id_rsa, readFlag returns null and we emit nothing
    // — never inject untrusted bytes into model context.
    const activeMode = readFlag(flagPath);
    if (activeMode && !INDEPENDENT_MODES.has(activeMode)) {
      process.stdout.write(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "UserPromptSubmit",
          additionalContext: "GENZ MODE ACTIVE (" + activeMode + "). " +
            "Use natural Gen Z voice with accurate slang from skills/genz/data/genz-slang-index.json. " +
            "Full mode should be noticeably slangy and casual; lite stays restrained, max goes heavier. " +
            "Keep code, commands, exact errors, safety, security, commits, PRs, and formal docs normal."
        }
      }));
    }
  } catch (e) {
    // Silent fail
  }
});

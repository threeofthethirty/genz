#!/usr/bin/env node
// Tests for repo-local config resolution in getDefaultMode().
// Covers the resolution-order contract:
//   env GENZ_DEFAULT_MODE → repo-local (.genz/config.json or .genz.json,
//   walking up to filesystem root) → user config → 'full'.
//
// Run: node tests/test_repo_local_config.js

const fs = require('fs');
const path = require('path');
const os = require('os');
const assert = require('assert');

// Isolate from the host's real user config: point XDG_CONFIG_HOME at a tmp dir
// before requiring the module so getConfigPath() never reads the developer's
// own ~/.config/genz/config.json.
const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'genz-userhome-'));
process.env.XDG_CONFIG_HOME = tmpHome;
delete process.env.GENZ_DEFAULT_MODE;

const { getDefaultMode, findRepoConfigPath } = require('../src/hooks/genz-config');

let passed = 0;
let failed = 0;

function test(name, fn) {
  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'genz-repocfg-'));
  const origCwd = process.cwd();
  const origEnv = process.env.GENZ_DEFAULT_MODE;
  try {
    fn(tmpBase);
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failed++;
    console.error(`  ✗ ${name}`);
    console.error(`    ${e.message}`);
  } finally {
    process.chdir(origCwd);
    if (origEnv === undefined) delete process.env.GENZ_DEFAULT_MODE;
    else process.env.GENZ_DEFAULT_MODE = origEnv;
    fs.rmSync(tmpBase, { recursive: true, force: true });
  }
}

console.log('repo-local config resolution tests\n');

test('returns "full" when no env, no repo config, no user config', (tmp) => {
  process.chdir(tmp);
  assert.strictEqual(getDefaultMode(), 'full');
});

test('reads .genz/config.json in cwd', (tmp) => {
  fs.mkdirSync(path.join(tmp, '.genz'));
  fs.writeFileSync(path.join(tmp, '.genz', 'config.json'),
    JSON.stringify({ defaultMode: 'lite' }));
  process.chdir(tmp);
  assert.strictEqual(getDefaultMode(), 'lite');
});

test('reads .genz.json in cwd', (tmp) => {
  fs.writeFileSync(path.join(tmp, '.genz.json'),
    JSON.stringify({ defaultMode: 'max' }));
  process.chdir(tmp);
  assert.strictEqual(getDefaultMode(), 'max');
});

test('.genz/config.json wins over .genz.json at same level', (tmp) => {
  fs.mkdirSync(path.join(tmp, '.genz'));
  fs.writeFileSync(path.join(tmp, '.genz', 'config.json'),
    JSON.stringify({ defaultMode: 'lite' }));
  fs.writeFileSync(path.join(tmp, '.genz.json'),
    JSON.stringify({ defaultMode: 'max' }));
  process.chdir(tmp);
  assert.strictEqual(getDefaultMode(), 'lite');
});

test('walks up from nested cwd to find repo config', (tmp) => {
  fs.mkdirSync(path.join(tmp, '.genz'));
  fs.writeFileSync(path.join(tmp, '.genz', 'config.json'),
    JSON.stringify({ defaultMode: 'wenyan-lite' }));
  const nested = path.join(tmp, 'a', 'b', 'c');
  fs.mkdirSync(nested, { recursive: true });
  process.chdir(nested);
  assert.strictEqual(getDefaultMode(), 'wenyan-lite');
});

test('env var beats repo-local config', (tmp) => {
  fs.mkdirSync(path.join(tmp, '.genz'));
  fs.writeFileSync(path.join(tmp, '.genz', 'config.json'),
    JSON.stringify({ defaultMode: 'lite' }));
  process.chdir(tmp);
  process.env.GENZ_DEFAULT_MODE = 'max';
  assert.strictEqual(getDefaultMode(), 'max');
});

test('repo-local config beats user config', (tmp) => {
  // user config at XDG_CONFIG_HOME points to 'commit'
  fs.mkdirSync(path.join(tmpHome, 'genz'), { recursive: true });
  fs.writeFileSync(path.join(tmpHome, 'genz', 'config.json'),
    JSON.stringify({ defaultMode: 'commit' }));
  // repo-local points to 'lite'
  fs.mkdirSync(path.join(tmp, '.genz'));
  fs.writeFileSync(path.join(tmp, '.genz', 'config.json'),
    JSON.stringify({ defaultMode: 'lite' }));
  process.chdir(tmp);
  try {
    assert.strictEqual(getDefaultMode(), 'lite');
  } finally {
    fs.rmSync(path.join(tmpHome, 'genz'), { recursive: true, force: true });
  }
});

test('falls through to user config when repo config absent', (tmp) => {
  fs.mkdirSync(path.join(tmpHome, 'genz'), { recursive: true });
  fs.writeFileSync(path.join(tmpHome, 'genz', 'config.json'),
    JSON.stringify({ defaultMode: 'review' }));
  process.chdir(tmp);
  try {
    assert.strictEqual(getDefaultMode(), 'review');
  } finally {
    fs.rmSync(path.join(tmpHome, 'genz'), { recursive: true, force: true });
  }
});

test('invalid mode in repo config falls through to default', (tmp) => {
  fs.writeFileSync(path.join(tmp, '.genz.json'),
    JSON.stringify({ defaultMode: 'definitely-not-a-mode' }));
  process.chdir(tmp);
  assert.strictEqual(getDefaultMode(), 'full');
});

test('malformed JSON in repo config falls through to default', (tmp) => {
  fs.mkdirSync(path.join(tmp, '.genz'));
  fs.writeFileSync(path.join(tmp, '.genz', 'config.json'), '{ not json');
  process.chdir(tmp);
  assert.strictEqual(getDefaultMode(), 'full');
});

test('refuses symlinked .genz.json (symmetric with readFlag policy)', (tmp) => {
  const real = path.join(tmp, 'real-config.json');
  fs.writeFileSync(real, JSON.stringify({ defaultMode: 'max' }));
  try {
    fs.symlinkSync(real, path.join(tmp, '.genz.json'));
  } catch (e) {
    // Skip on platforms without symlink perms
    console.log('    (skipped: symlink not permitted)');
    return;
  }
  process.chdir(tmp);
  assert.strictEqual(getDefaultMode(), 'full');
});

test('findRepoConfigPath returns null outside any repo', (tmp) => {
  process.chdir(tmp);
  assert.strictEqual(findRepoConfigPath(tmp), null);
});

console.log(`\n${passed} passed, ${failed} failed`);
fs.rmSync(tmpHome, { recursive: true, force: true });
process.exit(failed === 0 ? 0 : 1);

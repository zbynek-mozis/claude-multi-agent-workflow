#!/usr/bin/env node
// PostToolUse hook: lint the JavaScript file Claude just wrote or edited with
// the project's own ESLint. Lint errors exit with code 2, which Claude Code
// feeds back to Claude so it fixes them. Anything that isn't a lintable JS file
// in a project with ESLint installed is skipped silently.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const JS_FILE = /\.(c|m)?jsx?$/;
const CONFIG_FILES = [
  'eslint.config.js',
  'eslint.config.cjs',
  'eslint.config.mjs',
  'eslint.config.ts',
];

function readStdin() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch {
    return null;
  }
}

// Walk up from the edited file to the nearest directory with a flat ESLint config.
function findProjectDir(file) {
  let dir = path.dirname(file);
  for (;;) {
    if (CONFIG_FILES.some((name) => fs.existsSync(path.join(dir, name)))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

// Resolve the project's locally installed ESLint; never download one.
function findEslintBin(projectDir) {
  try {
    const pkgPath = require.resolve('eslint/package.json', { paths: [projectDir] });
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const bin = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin && pkg.bin.eslint;
    return bin ? path.join(path.dirname(pkgPath), bin) : null;
  } catch {
    return null;
  }
}

function main() {
  const input = readStdin();
  const toolInput = (input && input.tool_input) || {};
  const file = toolInput.file_path;
  if (!file || !JS_FILE.test(file) || !fs.existsSync(file)) return 0;

  const projectDir = findProjectDir(path.resolve(file));
  if (!projectDir) return 0;
  const eslintBin = findEslintBin(projectDir);
  if (!eslintBin) return 0;

  const result = spawnSync(
    process.execPath,
    [eslintBin, '--no-warn-ignored', '--format', 'stylish', path.resolve(file)],
    { cwd: projectDir, encoding: 'utf8' },
  );
  const output = `${result.stdout || ''}${result.stderr || ''}`.trim();

  if (result.status === 0) return 0;
  if (result.status === 1) {
    process.stderr.write(`ESLint found errors in ${path.relative(projectDir, file)}. Fix them before continuing:\n${output}\n`);
    return 2;
  }
  // ESLint itself failed (bad config, crash): tell the user, don't block Claude.
  process.stderr.write(`api-quality lint hook: ESLint could not run (exit ${result.status}).\n${output}\n`);
  return 1;
}

process.exit(main());

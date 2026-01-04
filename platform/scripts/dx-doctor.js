#!/usr/bin/env node

/**
 * WARIS DevEx Doctor Script
 * Diagnoses and fixes common development issues
 */

import { execSync } from 'child_process';
import { existsSync, rmSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as readline from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function run(command, options = {}) {
  try {
    return execSync(command, { stdio: 'pipe', cwd: ROOT, ...options }).toString();
  } catch (e) {
    return null;
  }
}

async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

const issues = [];

function addIssue(name, description, fix, autoFix = null) {
  issues.push({ name, description, fix, autoFix });
}

async function diagnose() {
  log('');
  log('🔬 WARIS Doctor - Diagnosing Issues', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

  // Check 1: Node modules
  log('\n🔍 Checking dependencies...', 'gray');

  if (!existsSync(resolve(ROOT, 'node_modules'))) {
    addIssue(
      'Missing node_modules',
      'Node dependencies are not installed',
      'Run: npm install',
      () => {
        log('  Installing dependencies...', 'gray');
        run('npm install');
      }
    );
  }

  // Check 2: Lock file sync
  const packageJson = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf-8'));
  const lockFile = resolve(ROOT, 'package-lock.json');

  if (!existsSync(lockFile)) {
    addIssue(
      'Missing package-lock.json',
      'Lock file is missing, dependencies may be inconsistent',
      'Run: npm install',
      () => run('npm install')
    );
  }

  // Check 3: Git hooks
  log('🔍 Checking Git hooks...', 'gray');

  const huskyDir = resolve(ROOT, '.husky');
  if (!existsSync(huskyDir)) {
    addIssue(
      'Git hooks not installed',
      'Husky hooks are not set up',
      'Run: npx husky',
      () => run('npx husky')
    );
  }

  // Check 4: Environment file
  log('🔍 Checking environment...', 'gray');

  if (!existsSync(resolve(ROOT, '.env'))) {
    addIssue(
      'Missing .env file',
      'Environment configuration is missing',
      'Copy .env.example to .env and configure it',
      null
    );
  }

  // Check 5: TypeScript errors
  log('🔍 Checking TypeScript...', 'gray');

  const tsResult = run('npx tsc --noEmit 2>&1', { cwd: resolve(ROOT, 'apps/web') });
  if (tsResult && tsResult.includes('error')) {
    const errorCount = (tsResult.match(/error TS/g) || []).length;
    addIssue(
      'TypeScript errors',
      `Found ${errorCount} TypeScript error(s)`,
      'Run: npm run typecheck to see details',
      null
    );
  }

  // Check 6: ESLint errors
  log('🔍 Checking ESLint...', 'gray');

  const eslintResult = run('npx eslint apps/web --max-warnings=0 2>&1');
  if (eslintResult && eslintResult.includes('error')) {
    addIssue(
      'ESLint errors',
      'Found linting errors in the codebase',
      'Run: npm run lint:fix to auto-fix',
      () => run('npm run lint:fix')
    );
  }

  // Check 7: Outdated dependencies
  log('🔍 Checking for outdated packages...', 'gray');

  const outdated = run('npm outdated --json 2>/dev/null');
  if (outdated) {
    try {
      const outdatedPkgs = JSON.parse(outdated);
      const outdatedCount = Object.keys(outdatedPkgs).length;
      if (outdatedCount > 5) {
        addIssue(
          'Outdated dependencies',
          `${outdatedCount} packages have updates available`,
          'Run: npm update',
          null
        );
      }
    } catch {}
  }

  // Check 8: Cache issues
  log('🔍 Checking caches...', 'gray');

  const cacheSize = run('du -sh node_modules/.cache .turbo .next 2>/dev/null | head -3');
  if (cacheSize && cacheSize.includes('G')) {
    addIssue(
      'Large cache',
      'Build caches may be too large',
      'Run: npm run clean',
      () => {
        rmSync(resolve(ROOT, 'node_modules/.cache'), { recursive: true, force: true });
        rmSync(resolve(ROOT, '.turbo'), { recursive: true, force: true });
      }
    );
  }

  // Check 9: Python environment
  log('🔍 Checking Python...', 'gray');

  const pythonVersion = run('python3 --version');
  if (!pythonVersion || !pythonVersion.includes('3.12')) {
    addIssue(
      'Python version',
      'Python 3.12+ is recommended',
      'Install Python 3.12 or later',
      null
    );
  }

  // Display results
  console.log('');
  log('━━━ Diagnosis Results ━━━', 'cyan');
  console.log('');

  if (issues.length === 0) {
    log('✅ No issues found! Your environment is healthy.', 'green');
    return;
  }

  log(`Found ${issues.length} issue(s):`, 'yellow');
  console.log('');

  for (let i = 0; i < issues.length; i++) {
    const issue = issues[i];
    log(`${i + 1}. ${issue.name}`, 'yellow');
    log(`   ${issue.description}`, 'gray');
    log(`   Fix: ${issue.fix}`, 'cyan');
    if (issue.autoFix) {
      log(`   [Auto-fixable]`, 'green');
    }
    console.log('');
  }

  // Offer to auto-fix
  const autoFixable = issues.filter((i) => i.autoFix);
  if (autoFixable.length > 0) {
    const shouldFix = await prompt(
      `\n${colors.yellow}Would you like to auto-fix ${autoFixable.length} issue(s)? (y/N) ${colors.reset}`
    );

    if (shouldFix) {
      log('\n🔧 Applying fixes...', 'cyan');
      for (const issue of autoFixable) {
        log(`  Fixing: ${issue.name}...`, 'gray');
        issue.autoFix();
        log(`  ✅ Fixed: ${issue.name}`, 'green');
      }
      log('\n✅ Auto-fixes applied!', 'green');
      log('Run "npm run dx:check" to verify.', 'gray');
    }
  }

  console.log('');
}

diagnose().catch(console.error);
